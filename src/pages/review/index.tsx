import { useState, useMemo } from 'react'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import { ReviewStatusMap, FrequencyOptions } from '@/types'
import { formatPrice, formatBudget, generateStars, getDaysRemaining } from '@/utils'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const ReviewPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const demands = useAppStore(state => state.demands)
  const suppliers = useAppStore(state => state.suppliers)
  const updateReviewStatus = useAppStore(state => state.updateReviewStatus)
  const updateReviewQuote = useAppStore(state => state.updateReviewQuote)
  const setCurrentDemand = useAppStore(state => state.setCurrentDemand)

  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [quoteModalVisible, setQuoteModalVisible] = useState(false)
  const [currentReview, setCurrentReview] = useState<any>(null)
  const [targetStatus, setTargetStatus] = useState<string>('')
  const [statusNote, setStatusNote] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDeliveryMethod, setEditDeliveryMethod] = useState('')
  const [editDeliveryCycle, setEditDeliveryCycle] = useState('')

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待评审' },
    { key: 'shortlisted', label: '已入围' },
    { key: 'negotiating', label: '商谈中' },
    { key: 'won', label: '已中标' },
    { key: 'rejected', label: '已淘汰' },
  ]

  const groupedReviews = useMemo(() => {
    const groups: Record<string, any[]> = {}
    reviewItems.forEach(r => {
      if (!groups[r.demandId]) groups[r.demandId] = []
      groups[r.demandId].push(r)
    })
    return groups
  }, [reviewItems])

  const demandList = useMemo(() => {
    return Object.keys(groupedReviews).map(demandId => {
      const demand = demands.find(d => d.id === demandId)
      const reviews = groupedReviews[demandId]
      const stats = {
        total: reviews.length,
        pending: reviews.filter(r => r.reviewStatus === 'pending').length,
        shortlisted: reviews.filter(r => r.reviewStatus === 'shortlisted').length,
        negotiating: reviews.filter(r => r.reviewStatus === 'negotiating').length,
        won: reviews.filter(r => r.reviewStatus === 'won').length,
        rejected: reviews.filter(r => r.reviewStatus === 'rejected').length,
      }
      return { demand, reviews, stats }
    }).filter(item => item.demand)
  }, [groupedReviews, demands])

  const currentDemand = useMemo(() =>
    demands.find(d => d.id === selectedDemandId) || null,
    [demands, selectedDemandId]
  )

  const currentReviews = useMemo(() => {
    if (!selectedDemandId) return []
    let list = groupedReviews[selectedDemandId] || []
    if (statusFilter !== 'all') {
      list = list.filter(r => r.reviewStatus === statusFilter)
    }
    return list.sort((a, b) => b.matchScore - a.matchScore)
  }, [selectedDemandId, groupedReviews, statusFilter])

  const shortlistedCount = useMemo(() => {
    if (!selectedDemandId) return 0
    return (groupedReviews[selectedDemandId] || []).filter(r =>
      ['shortlisted', 'negotiating', 'won'].includes(r.reviewStatus)
    ).length
  }, [selectedDemandId, groupedReviews])

  const backToGroups = () => {
    setSelectedDemandId(null)
    setStatusFilter('all')
  }

  const goToDetail = (demand: any) => {
    setCurrentDemand(demand)
    Taro.navigateTo({ url: `/pages/demand-detail/index?id=${demand.id}` })
  }

  const goToSupplier = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    if (supplier) {
      const setSupplier = useAppStore.getState().setCurrentSupplier
      setSupplier(supplier)
    }
    Taro.navigateTo({ url: `/pages/supplier-detail/index?id=${supplierId}` })
  }

  const openStatusModal = (review: any, status: string) => {
    setCurrentReview(review)
    setTargetStatus(status)
    setStatusNote('')
    setStatusModalVisible(true)
  }

  const handleStatusConfirm = () => {
    if (!currentReview || !targetStatus) return
    updateReviewStatus(currentReview.id, targetStatus as any, statusNote)
    setStatusModalVisible(false)
    Taro.showToast({ title: '状态已更新', icon: 'success' })
  }

  const openQuoteModal = (review: any) => {
    setCurrentReview(review)
    setEditPrice(String(review.quotePrice || ''))
    setEditDeliveryMethod(review.deliveryMethod || '')
    setEditDeliveryCycle(review.deliveryCycle || '')
    setQuoteModalVisible(true)
  }

  const handleQuoteConfirm = () => {
    if (!currentReview) return
    const price = parseFloat(editPrice) || 0
    updateReviewQuote(currentReview.id, price, editDeliveryMethod, editDeliveryCycle)
    setQuoteModalVisible(false)
    Taro.showToast({ title: '报价已更新', icon: 'success' })
  }

  const generateComparison = () => {
    if (shortlistedCount < 2) {
      Taro.showToast({ title: '至少2家入围供应方可生成比对表', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: `/pages/comparison-detail/index?demandId=${selectedDemandId}` })
  }

  const goSatisfaction = (review: any) => {
    Taro.navigateTo({
      url: `/pages/satisfaction/index?reviewId=${review.id}&demandId=${review.demandId}&supplierId=${review.supplierId}`
    })
  }

  const GroupView = () => (
    <View>
      <View className={styles.summaryCards}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{demandList.length}</Text>
          <Text className={styles.summaryLabel}>评审需求</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={`${styles.summaryValue} ${styles.summaryValueOrange}`}>
            {reviewItems.filter(r => r.reviewStatus === 'pending').length}
          </Text>
          <Text className={styles.summaryLabel}>待评审</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={`${styles.summaryValue} ${styles.summaryValuePurple}`}>
            {reviewItems.filter(r => ['shortlisted', 'negotiating'].includes(r.reviewStatus)).length}
          </Text>
          <Text className={styles.summaryLabel}>入围中</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={`${styles.summaryValue} ${styles.summaryValueGreen}`}>
            {reviewItems.filter(r => r.reviewStatus === 'won').length}
          </Text>
          <Text className={styles.summaryLabel}>已成交</Text>
        </View>
      </View>

      <View className={styles.sectionSubtitle}>
        <Text className={styles.sectionSubtitleText}>按需求分组</Text>
        <Text className={styles.sectionSubtitleHint}>点击查看该需求下的供应方评审</Text>
      </View>

      {demandList.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyTitle}>暂无评审项</Text>
          <Text className={styles.emptyDesc}>去供应匹配页面找到合适的供应方，加入评审清单吧</Text>
          <View className={styles.emptyBtn} onClick={() => Taro.switchTab({ url: '/pages/match/index' })}>
            <Text>去寻找供应方</Text>
          </View>
        </View>
      ) : (
        demandList.map(({ demand, stats }) => (
          <View key={demand!.id} className={styles.demandGroupCard} onClick={() => setSelectedDemandId(demand!.id)}>
            <View className={styles.demandGroupHeader}>
              <View className={styles.demandGroupTitleRow}>
                <Text className={styles.demandGroupTitle}>{demand!.title}</Text>
                <Text className={styles.demandGroupArrow}>→</Text>
              </View>
              <View className={styles.demandGroupMeta}>
                <StatusTag label={ReviewStatusMap[demand!.status]?.label || '进行中'} color={ReviewStatusMap[demand!.status]?.color || '#165dff'} size="small" />
                <Text className={styles.demandGroupCode}>{demand!.id}</Text>
              </View>
            </View>

            <View className={styles.demandGroupInfo}>
              <View className={styles.demandGroupInfoItem}>
                <Text className={styles.demandGroupInfoLabel}>行业</Text>
                <Text className={styles.demandGroupInfoValue}>{demand!.industry}</Text>
              </View>
              <View className={styles.demandGroupInfoItem}>
                <Text className={styles.demandGroupInfoLabel}>预算</Text>
                <Text className={styles.demandGroupInfoValue}>{formatBudget(demand!.budgetMin, demand!.budgetMax)}</Text>
              </View>
              <View className={styles.demandGroupInfoItem}>
                <Text className={styles.demandGroupInfoLabel}>截止</Text>
                <Text className={styles.demandGroupInfoValue}>{getDaysRemaining(demand!.deadline)}天后</Text>
              </View>
            </View>

            <View className={styles.demandGroupStats}>
              <View className={styles.demandGroupStat}>
                <Text className={styles.demandGroupStatNum} style={{ color: '#165dff' }}>{stats.total}</Text>
                <Text className={styles.demandGroupStatLabel}>候选</Text>
              </View>
              <View className={styles.demandGroupStat}>
                <Text className={styles.demandGroupStatNum} style={{ color: '#ff7d00' }}>{stats.pending}</Text>
                <Text className={styles.demandGroupStatLabel}>待评审</Text>
              </View>
              <View className={styles.demandGroupStat}>
                <Text className={styles.demandGroupStatNum} style={{ color: '#722ed1' }}>{stats.shortlisted + stats.negotiating}</Text>
                <Text className={styles.demandGroupStatLabel}>入围</Text>
              </View>
              <View className={styles.demandGroupStat}>
                <Text className={styles.demandGroupStatNum} style={{ color: '#00b42a' }}>{stats.won}</Text>
                <Text className={styles.demandGroupStatLabel}>中标</Text>
              </View>
            </View>

            {stats.shortlisted + stats.negotiating >= 2 && (
              <View className={styles.demandGroupCompareHint}>
                <Text className={styles.demandGroupCompareText}>💡 已有 {stats.shortlisted + stats.negotiating} 家入围，可生成比对表</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  )

  const DetailView = () => (
    <View>
      <View className={styles.detailBackRow} onClick={backToGroups}>
        <Text className={styles.detailBackIcon}>←</Text>
        <Text className={styles.detailBackText}>返回需求列表</Text>
      </View>

      <View className={styles.detailDemandCard}>
        <View className={styles.detailDemandTitle} onClick={() => goToDetail(currentDemand)}>
          <Text>{currentDemand?.title}</Text>
          <Text className={styles.detailDemandLink}>查看需求详情 →</Text>
        </View>
        <View className={styles.detailDemandMeta}>
          <Text className={styles.detailDemandMetaItem}>🏢 {currentDemand?.industry}</Text>
          <Text className={styles.detailDemandMetaItem}>📍 {currentDemand?.region}</Text>
          <Text className={styles.detailDemandMetaItem}>💰 {formatBudget(currentDemand?.budgetMin || 0, currentDemand?.budgetMax || 0)}</Text>
        </View>
        <View className={styles.detailDemandStats}>
          <View className={styles.detailDemandStat}>
            <Text className={styles.detailDemandStatNum}>{currentReviews.length}</Text>
            <Text className={styles.detailDemandStatLabel}>候选供应方</Text>
          </View>
          <View className={styles.detailDemandStat}>
            <Text className={styles.detailDemandStatNum} style={{ color: '#722ed1' }}>{shortlistedCount}</Text>
            <Text className={styles.detailDemandStatLabel}>已入围</Text>
          </View>
          <View className={styles.detailDemandStat}>
            <Text className={styles.detailDemandStatNum} style={{ color: '#00b42a' }}>
              {currentReviews.filter(r => r.reviewStatus === 'won').length}
            </Text>
            <Text className={styles.detailDemandStatLabel}>已中标</Text>
          </View>
        </View>

        <View className={styles.generateCompareBtn} onClick={generateComparison}>
          <Text>📊 生成需求比对表</Text>
          <Text className={styles.generateCompareHint}>{shortlistedCount >= 2 ? `(${shortlistedCount}家入围)` : '(需至少2家入围)'}</Text>
        </View>
      </View>

      <View className={styles.tabsRow}>
        {statusTabs.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tabChip} ${statusFilter === tab.key ? styles.tabChipActive : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {currentReviews.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔍</Text>
          <Text className={styles.emptyTitle}>暂无该状态的评审</Text>
          <Text className={styles.emptyDesc}>切换其他状态标签查看</Text>
        </View>
      ) : (
        currentReviews.map(review => {
          const statusInfo = ReviewStatusMap[review.reviewStatus] || ReviewStatusMap.pending
          const supplier = suppliers.find(s => s.id === review.supplierId)
          return (
            <View key={review.id} className={styles.reviewCard}>
              <View className={styles.reviewHeader}>
                <View className={styles.reviewDemand}>
                  <Text className={styles.reviewDemandTitle} onClick={() => goToSupplier(review.supplierId)}>
                    {review.supplierName}
                  </Text>
                  <Text className={styles.reviewDemandSub}>{review.productName}</Text>
                </View>
                <View className={styles.reviewMatchScore}>
                  <Text className={styles.reviewScoreValue}>{review.matchScore}</Text>
                  <Text className={styles.reviewScoreLabel}>匹配分</Text>
                </View>
              </View>

              <View className={styles.quoteRow}>
                <View className={styles.quoteItem}>
                  <Text className={styles.quoteLabel}>报价金额</Text>
                  <Text className={`${styles.quoteValue} ${styles.quotePrice}`}>¥{formatPrice(review.quotePrice)}</Text>
                </View>
                <View className={styles.quoteItem}>
                  <Text className={styles.quoteLabel}>交付方式</Text>
                  <Text className={styles.quoteValue}>{review.deliveryMethod}</Text>
                </View>
                <View className={styles.quoteItem}>
                  <Text className={styles.quoteLabel}>交付周期</Text>
                  <Text className={styles.quoteValue}>{review.deliveryCycle}</Text>
                </View>
              </View>

              {review.reviewNotes && (
                <View className={styles.reviewNotes}>
                  <Text className={styles.notesLabel}>评审备注</Text>
                  <Text className={styles.notesText}>{review.reviewNotes}</Text>
                </View>
              )}

              <View className={styles.statusActions}>
                {review.reviewStatus === 'pending' && (
                  <>
                    <View className={`${styles.statusBtn} ${styles.statusBtnShortlisted}`} onClick={() => openStatusModal(review, 'shortlisted')}>
                      <Text>入围</Text>
                    </View>
                    <View className={`${styles.statusBtn} ${styles.statusBtnRejected}`} onClick={() => openStatusModal(review, 'rejected')}>
                      <Text>淘汰</Text>
                    </View>
                  </>
                )}
                {review.reviewStatus === 'shortlisted' && (
                  <>
                    <View className={`${styles.statusBtn} ${styles.statusBtnNegotiating}`} onClick={() => openStatusModal(review, 'negotiating')}>
                      <Text>商谈</Text>
                    </View>
                    <View className={`${styles.statusBtn} ${styles.statusBtnRejected}`} onClick={() => openStatusModal(review, 'rejected')}>
                      <Text>淘汰</Text>
                    </View>
                  </>
                )}
                {review.reviewStatus === 'negotiating' && (
                  <>
                    <View className={`${styles.statusBtn} ${styles.statusBtnWon}`} onClick={() => openStatusModal(review, 'won')}>
                      <Text>中标</Text>
                    </View>
                    <View className={`${styles.statusBtn} ${styles.statusBtnRejected}`} onClick={() => openStatusModal(review, 'rejected')}>
                      <Text>淘汰</Text>
                    </View>
                  </>
                )}
                {review.reviewStatus === 'won' && (
                  <View className={`${styles.statusBtn} ${styles.statusBtnWon}`}>
                    <Text>✓ 已中标</Text>
                  </View>
                )}
                {review.reviewStatus === 'rejected' && (
                  <View className={`${styles.statusBtn} ${styles.statusBtnRejected}`}>
                    <Text>✗ 已淘汰</Text>
                  </View>
                )}
              </View>

              <View className={styles.actionRow}>
                <View className={styles.actionBtn} onClick={() => openQuoteModal(review)}>
                  <Text>编辑报价</Text>
                </View>
                {review.reviewStatus === 'won' ? (
                  <View className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => goSatisfaction(review)}>
                    <Text>满意度评价</Text>
                  </View>
                ) : (
                  <View className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => goToSupplier(review.supplierId)}>
                    <Text>查看供应方</Text>
                  </View>
                )}
              </View>
            </View>
          )
        })
      )}
    </View>
  )

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>评审清单</Text>
        <Text className={styles.pageSubtitle}>数据采购决策工作台</Text>
      </View>

      {selectedDemandId ? <DetailView /> : <GroupView />}

      {statusModalVisible && (
        <View className={styles.modalMask} onClick={() => setStatusModalVisible(false)}>
          <View className={styles.modalContent} onClick={(e: any) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {targetStatus === 'shortlisted' && '标记为入围'}
              {targetStatus === 'negotiating' && '标记为商谈中'}
              {targetStatus === 'won' && '标记为中标'}
              {targetStatus === 'rejected' && '标记为淘汰'}
            </Text>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>供应方</Text>
              <Text className={styles.modalValue}>{currentReview?.supplierName}</Text>
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>
                {targetStatus === 'rejected' ? '淘汰原因' : '评审备注'} <Text style={{ color: '#c9cdd4' }}>（选填）</Text>
              </Text>
              <Textarea
                className={styles.modalInput}
                placeholder={targetStatus === 'rejected' ? '请输入淘汰原因，便于后续复盘总结' : '请输入评审备注信息'}
                placeholderStyle="color: #c9cdd4"
                value={statusNote}
                onInput={(e: any) => setStatusNote(e.detail.value)}
                maxlength={200}
              />
            </View>
            <View className={styles.modalActions}>
              <View className={styles.modalBtnCancel} onClick={() => setStatusModalVisible(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalBtnConfirm} onClick={handleStatusConfirm}>
                <Text>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {quoteModalVisible && (
        <View className={styles.modalMask} onClick={() => setQuoteModalVisible(false)}>
          <View className={styles.modalContent} onClick={(e: any) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>编辑报价信息</Text>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>报价金额（元）</Text>
              <Textarea
                className={styles.modalInput}
                style={{ minHeight: 80 }}
                type="digit"
                placeholder="请输入报价金额"
                placeholderStyle="color: #c9cdd4"
                value={editPrice}
                onInput={(e: any) => setEditPrice(e.detail.value)}
              />
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>交付方式</Text>
              <View className={styles.selectorRow}>
                {['API接口', '离线数据包', '数据库同步', 'SaaS账户', '定制化服务', '混合模式'].map(opt => (
                  <View
                    key={opt}
                    className={`${styles.selectorChip} ${editDeliveryMethod === opt ? styles.selectorChipActive : ''}`}
                    onClick={() => setEditDeliveryMethod(opt)}
                  >
                    <Text>{opt}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>交付周期</Text>
              <Textarea
                className={styles.modalInput}
                style={{ minHeight: 80 }}
                placeholder="如：3-5工作日"
                placeholderStyle="color: #c9cdd4"
                value={editDeliveryCycle}
                onInput={(e: any) => setEditDeliveryCycle(e.detail.value)}
              />
            </View>
            <View className={styles.modalActions}>
              <View className={styles.modalBtnCancel} onClick={() => setQuoteModalVisible(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalBtnConfirm} onClick={handleQuoteConfirm}>
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default ReviewPage
