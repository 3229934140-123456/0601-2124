import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Textarea, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import { ContractStatusMap, AcceptanceStatusMap } from '@/types'
import { formatPrice } from '@/utils'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const ContractFollowupPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const contractFollowUps = useAppStore(state => state.contractFollowUps)
  const addContractFollowUp = useAppStore(state => state.addContractFollowUp)
  const updateContractFollowUp = useAppStore(state => state.updateContractFollowUp)
  const updatePaymentNode = useAppStore(state => state.updatePaymentNode)

  const reviewId = Taro.getCurrentInstance().router?.params?.reviewId
  const currentReview = useMemo(() => reviewItems.find(r => r.id === reviewId), [reviewItems, reviewId])
  const contract = useMemo(() => contractFollowUps.find(c => c.reviewId === reviewId), [contractFollowUps, reviewId])

  const [editMode, setEditMode] = useState(false)
  const [contractNo, setContractNo] = useState(contract?.contractNo || '')
  const [signDate, setSignDate] = useState(contract?.signDate || '')
  const [acceptanceResult, setAcceptanceResult] = useState(contract?.acceptanceResult || '')

  const initContract = () => {
    if (!currentReview) return
    addContractFollowUp({
      reviewId: currentReview.id,
      demandId: currentReview.demandId,
      demandTitle: currentReview.demandTitle,
      supplierId: currentReview.supplierId,
      supplierName: currentReview.supplierName,
      contractStatus: 'signing',
      contractNo: `HT-${Date.now().toString().slice(-8)}`,
      signDate: new Date().toISOString().split('T')[0],
      totalAmount: currentReview.quotePrice,
      paymentNodes: [
        { id: 'PAY_1', name: '预付款（30%）', amount: Math.round(currentReview.quotePrice * 0.3), deadline: '签约后3个工作日', status: 'pending' },
        { id: 'PAY_2', name: '验收款（60%）', amount: Math.round(currentReview.quotePrice * 0.6), deadline: '验收通过后5个工作日', status: 'pending' },
        { id: 'PAY_3', name: '质保金（10%）', amount: Math.round(currentReview.quotePrice * 0.1), deadline: '验收通过后3个月', status: 'pending' },
      ],
      acceptanceStatus: 'pending',
      acceptanceDate: '',
      acceptanceResult: '',
    })
    Taro.showToast({ title: '合同已创建', icon: 'success' })
  }

  const handleSaveContract = () => {
    if (!contract) return
    updateContractFollowUp(contract.id, {
      contractNo,
      signDate,
      acceptanceResult,
    })
    setEditMode(false)
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  const handleStatusChange = (status: 'signing' | 'signed' | 'rejected') => {
    if (!contract) return
    updateContractFollowUp(contract.id, { contractStatus: status })
    const labels = { signing: '签署中', signed: '已签署', rejected: '已驳回' }
    Taro.showToast({ title: `状态更新为${labels[status]}`, icon: 'success' })
  }

  const handleAcceptanceChange = (status: 'pending' | 'accepted' | 'rejected') => {
    if (!contract) return
    updateContractFollowUp(contract.id, {
      acceptanceStatus: status,
      acceptanceDate: status !== 'pending' ? new Date().toISOString().split('T')[0] : '',
    })
    const labels = { pending: '待验收', accepted: '已验收', rejected: '验收不通过' }
    Taro.showToast({ title: `验收${labels[status]}`, icon: 'success' })
  }

  const handlePaymentToggle = (nodeId: string, currentStatus: 'pending' | 'paid') => {
    if (!contract) return
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    updatePaymentNode(contract.id, nodeId, newStatus)
    Taro.showToast({ title: newStatus === 'paid' ? '已标记为已付款' : '已恢复待付款', icon: 'success' })
  }

  const handleGoReview = () => {
    Taro.redirectTo({ url: `/pages/deal-review/index?reviewId=${reviewId}` })
  }

  const paidAmount = useMemo(() =>
    contract?.paymentNodes?.filter(n => n.status === 'paid').reduce((sum, n) => sum + n.amount, 0) || 0,
    [contract]
  )
  const pendingAmount = useMemo(() =>
    contract?.paymentNodes?.filter(n => n.status === 'pending').reduce((sum, n) => sum + n.amount, 0) || 0,
    [contract]
  )

  if (!currentReview) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyState}>
          <Text style={{ fontSize: 80 }}>📄</Text>
          <Text className={styles.emptyTitle}>未找到合同信息</Text>
          <Text className={styles.emptyDesc}>请返回我的事项重新查看</Text>
        </View>
      </ScrollView>
    )
  }

  if (!contract) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.headerCard}>
          <Text className={styles.headerTitle}>合同跟进</Text>
          <Text className={styles.headerSub}>{currentReview.demandTitle}</Text>
        </View>
        <View className={styles.noContractCard}>
          <View className={styles.noContractIcon}>📄</View>
          <Text className={styles.noContractTitle}>尚未创建合同</Text>
          <Text className={styles.noContractDesc}>该项目已中标，可创建合同启动跟进流程</Text>
          <View className={styles.noContractBtn} onClick={initContract}>
            <Text>创建合同并启动跟进</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  const statusInfo = ContractStatusMap[contract.contractStatus]
  const acceptInfo = AcceptanceStatusMap[contract.acceptanceStatus]

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>合同跟进</Text>
        <Text className={styles.headerSub}>{contract.demandTitle}</Text>
        <View className={styles.headerInfoRow}>
          <View className={styles.headerInfoItem}>
            <Text className={styles.headerInfoLabel}>供应方</Text>
            <Text className={styles.headerInfoValue}>{contract.supplierName}</Text>
          </View>
          <View className={styles.headerInfoItem}>
            <Text className={styles.headerInfoLabel}>合同状态</Text>
            <StatusTag label={statusInfo.label} color={statusInfo.color} size="small" />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>📋</Text>
          <Text className={styles.sectionTitle}>合同状态进度</Text>
        </View>
        <View className={styles.statusSteps}>
          {['待发起', '签署中', '已签署'].map((label, idx) => {
            const statuses = ['pending', 'signing', 'signed']
            const currentIdx = statuses.indexOf(contract.contractStatus)
            const isDone = idx <= currentIdx
            const isCurrent = idx === currentIdx
            return (
              <View key={label} className={styles.stepItem}>
                <View className={`${styles.stepDot} ${isDone ? styles.stepDotDone : ''} ${isCurrent ? styles.stepDotCurrent : ''}`}>
                  {isDone && idx < currentIdx ? '✓' : idx + 1}
                </View>
                <Text className={`${styles.stepLabel} ${isDone ? styles.stepLabelDone : ''}`}>{label}</Text>
                {idx < 2 && <View className={`${styles.stepLine} ${isDone && idx < currentIdx ? styles.stepLineDone : ''}`} />}
              </View>
            )
          })}
        </View>
        {contract.contractStatus !== 'signed' && (
          <View className={styles.statusActions}>
            {contract.contractStatus === 'pending' && (
              <View className={styles.statusBtnPrimary} onClick={() => handleStatusChange('signing')}>
                <Text>发起签署</Text>
              </View>
            )}
            {contract.contractStatus === 'signing' && (
              <>
                <View className={styles.statusBtnGhost} onClick={() => handleStatusChange('rejected')}>
                  <Text>驳回</Text>
                </View>
                <View className={styles.statusBtnPrimary} onClick={() => handleStatusChange('signed')}>
                  <Text>确认已签署</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>📝</Text>
          <Text className={styles.sectionTitle}>合同基本信息</Text>
          <View className={styles.editBtn} onClick={() => setEditMode(!editMode)}>
            <Text>{editMode ? '取消' : '编辑'}</Text>
          </View>
        </View>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>合同编号</Text>
            {editMode ? (
              <Input
                className={styles.infoInput}
                value={contractNo}
                onInput={(e: any) => setContractNo(e.detail.value)}
                placeholder="请输入合同编号"
              />
            ) : (
              <Text className={styles.infoValue}>{contract.contractNo || '-'}</Text>
            )}
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>签署日期</Text>
            {editMode ? (
              <Input
                className={styles.infoInput}
                value={signDate}
                onInput={(e: any) => setSignDate(e.detail.value)}
                placeholder="如：2025-01-15"
              />
            ) : (
              <Text className={styles.infoValue}>{contract.signDate || '-'}</Text>
            )}
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>合同总金额</Text>
            <Text className={styles.infoValueHighlight}>¥{formatPrice(contract.totalAmount)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>成交报价</Text>
            <Text className={styles.infoValue}>¥{formatPrice(currentReview.quotePrice)}</Text>
          </View>
          {editMode && (
            <View className={styles.saveBtn} onClick={handleSaveContract}>
              <Text>保存信息</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>💰</Text>
          <Text className={styles.sectionTitle}>付款节点</Text>
        </View>
        <View className={styles.paymentSummary}>
          <View className={styles.paySumItem}>
            <Text className={styles.paySumLabel}>已付款</Text>
            <Text className={styles.paySumValuePaid}>¥{formatPrice(paidAmount)}</Text>
          </View>
          <View className={styles.paySumItem}>
            <Text className={styles.paySumLabel}>待付款</Text>
            <Text className={styles.paySumValuePending}>¥{formatPrice(pendingAmount)}</Text>
          </View>
          <View className={styles.paySumItem}>
            <Text className={styles.paySumLabel}>总计</Text>
            <Text className={styles.paySumValueTotal}>¥{formatPrice(contract.totalAmount)}</Text>
          </View>
        </View>
        <View className={styles.paymentList}>
          {contract.paymentNodes.map((node, idx) => (
            <View key={node.id} className={styles.paymentItem}>
              <View className={styles.paymentLeft}>
                <View className={`${styles.paymentDot} ${node.status === 'paid' ? styles.paymentDotPaid : ''}`}>
                  {idx + 1}
                </View>
                <View className={styles.paymentInfo}>
                  <Text className={styles.paymentName}>{node.name}</Text>
                  <Text className={styles.paymentDeadline}>截止：{node.deadline}</Text>
                </View>
              </View>
              <View className={styles.paymentRight}>
                <Text className={styles.paymentAmount}>¥{formatPrice(node.amount)}</Text>
                <View
                  className={`${styles.paymentToggle} ${node.status === 'paid' ? styles.paymentTogglePaid : ''}`}
                  onClick={() => handlePaymentToggle(node.id, node.status)}
                >
                  <Text>{node.status === 'paid' ? '✓ 已付款' : '标记付款'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>✅</Text>
          <Text className={styles.sectionTitle}>交付验收</Text>
        </View>
        <View className={styles.acceptanceCard}>
          <View className={styles.acceptanceHeader}>
            <Text className={styles.acceptanceLabel}>验收状态</Text>
            <StatusTag label={acceptInfo.label} color={acceptInfo.color} size="small" />
          </View>
          {contract.acceptanceDate && (
            <View className={styles.acceptanceRow}>
              <Text className={styles.acceptanceSubLabel}>验收日期</Text>
              <Text className={styles.acceptanceValue}>{contract.acceptanceDate}</Text>
            </View>
          )}
          <View className={styles.acceptanceRow}>
            <Text className={styles.acceptanceSubLabel}>验收结论</Text>
            {editMode ? (
              <Textarea
                className={styles.acceptanceInput}
                value={acceptanceResult}
                onInput={(e: any) => setAcceptanceResult(e.detail.value)}
                placeholder="请输入验收结论或交付说明"
                maxlength={300}
              />
            ) : (
              <Text className={styles.acceptanceValue}>
                {contract.acceptanceResult || '暂无验收结论'}
              </Text>
            )}
          </View>
          {contract.acceptanceStatus === 'pending' && (
            <View className={styles.acceptanceActions}>
              <View className={styles.acceptBtnReject} onClick={() => handleAcceptanceChange('rejected')}>
                <Text>验收不通过</Text>
              </View>
              <View className={styles.acceptBtnPass} onClick={() => handleAcceptanceChange('accepted')}>
                <Text>确认验收通过</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomBtnGhost} onClick={handleGoReview}>
          <Text>查看复盘详情</Text>
        </View>
        <View className={styles.bottomBtnPrimary} onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}>
          <Text>返回我的事项</Text>
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  )
}

export default ContractFollowupPage
