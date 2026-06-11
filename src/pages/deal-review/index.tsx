import { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import { formatPrice, formatBudget } from '@/utils'
import {
  ReviewStatusMap, ContractStatusMap, AcceptanceStatusMap
} from '@/types'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const DealReviewPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const satisfactionRatings = useAppStore(state => state.satisfactionRatings)
  const demands = useAppStore(state => state.demands)
  const contractFollowUps = useAppStore(state => state.contractFollowUps)
  const decisionRecords = useAppStore(state => state.decisionRecords)

  const reviewId = Taro.getCurrentInstance().router?.params?.reviewId

  const currentReview = useMemo(() =>
    reviewItems.find(r => r.id === reviewId),
    [reviewItems, reviewId]
  )

  const currentDemand = useMemo(() =>
    demands.find(d => d.id === currentReview?.demandId),
    [demands, currentReview]
  )

  const currentRating = useMemo(() =>
    satisfactionRatings.find(r => r.demandId === currentReview?.demandId && r.supplierId === currentReview?.supplierId),
    [satisfactionRatings, currentReview]
  )

  const currentContract = useMemo(() =>
    contractFollowUps.find(c => c.reviewId === reviewId),
    [contractFollowUps, reviewId]
  )

  const decisionHistory = useMemo(() =>
    decisionRecords
      .filter(r => r.demandId === currentReview?.demandId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [decisionRecords, currentReview]
  )

  const peerReviews = useMemo(() =>
    reviewItems.filter(r => r.demandId === currentReview?.demandId && r.id !== reviewId),
    [reviewItems, currentReview, reviewId]
  )

  if (!currentReview) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyState}>
          <Text style={{ fontSize: 80 }}>📋</Text>
          <Text className={styles.emptyTitle}>未找到复盘数据</Text>
          <Text className={styles.emptyDesc}>请返回我的事项重新查看</Text>
        </View>
      </ScrollView>
    )
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    return (
      <View style={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Text key={i} style={{ color: i < full ? '#ffa940' : '#e5e6eb', fontSize: 28 }}>★</Text>
        ))}
      </View>
    )
  }

  const goContractFollowup = () => {
    Taro.navigateTo({ url: `/pages/contract-followup/index?reviewId=${reviewId}` })
  }

  const paidAmount = currentContract?.paymentNodes?.filter(n => n.status === 'paid').reduce((sum, n) => sum + n.amount, 0) || 0

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerBadge}>🎉</View>
        <Text className={styles.headerTitle}>成交复盘详情</Text>
        <Text className={styles.headerSub}>全流程交易追溯与决策复盘</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>📌</Text>
          <Text className={styles.sectionTitle}>需求信息</Text>
        </View>
        <View className={styles.demandCard}>
          <Text className={styles.demandTitle}>{currentDemand?.title || currentReview.demandTitle}</Text>
          <View className={styles.metaRow}>
            <Text className={styles.metaBadge}>🏢 {currentDemand?.industry || '-'}</Text>
            <Text className={styles.metaBadge}>📍 {currentDemand?.region || '-'}</Text>
            <Text className={styles.metaBadge}>📊 {currentDemand?.sampleScope || '-'}</Text>
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>原始预算</Text>
              <Text className={styles.infoValue}>
                {formatBudget(currentDemand?.budgetMin || 0, currentDemand?.budgetMax || 0)}
              </Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>更新频率</Text>
              <Text className={styles.infoValue}>{currentDemand?.updateFrequency || '-'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>截止日期</Text>
              <Text className={styles.infoValue}>{currentDemand?.deadline || '-'}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>需求状态</Text>
              <StatusTag label="已成交" color="#00B42A" size="small" />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>🏆</Text>
          <Text className={styles.sectionTitle}>成交供应方</Text>
        </View>
        <View className={styles.dealCard}>
          <View className={styles.dealHeader}>
            <View className={styles.supplierLogo}>
              <Text>{currentReview.supplierName.charAt(0)}</Text>
            </View>
            <View className={styles.supplierInfo}>
              <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <Text className={styles.supplierName}>{currentReview.supplierName}</Text>
                <StatusTag label="已中标" color="#00B42A" size="small" />
              </View>
              <Text className={styles.productName}>{currentReview.productName}</Text>
            </View>
            <View className={styles.matchScore}>
              <Text>匹配 {currentReview.matchScore}</Text>
            </View>
          </View>

          <View className={styles.dealGrid}>
            <View className={styles.dealItemHigh}>
              <Text className={styles.dealLabel}>最终报价</Text>
              <Text className={styles.dealValueHigh}>¥{formatPrice(currentReview.quotePrice)}</Text>
            </View>
            <View className={styles.dealItem}>
              <Text className={styles.dealLabel}>交付方式</Text>
              <Text className={styles.dealValue}>{currentReview.deliveryMethod}</Text>
            </View>
            <View className={styles.dealItem}>
              <Text className={styles.dealLabel}>交付周期</Text>
              <Text className={styles.dealValue}>{currentReview.deliveryCycle}</Text>
            </View>
          </View>

          {currentReview.reviewNotes && (
            <View className={styles.noteBox}>
              <Text className={styles.noteLabel}>评审备注 / 中标说明</Text>
              <Text className={styles.noteText}>{currentReview.reviewNotes}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>📄</Text>
          <Text className={styles.sectionTitle}>合同与交付</Text>
          <View className={styles.sectionAction} onClick={goContractFollowup}>
            <Text>跟进详情 →</Text>
          </View>
        </View>
        {currentContract ? (
          <View className={styles.contractCard}>
            <View className={styles.contractRow}>
              <View className={styles.contractRowItem}>
                <Text className={styles.contractRowLabel}>合同状态</Text>
                <StatusTag
                  label={ContractStatusMap[currentContract.contractStatus].label}
                  color={ContractStatusMap[currentContract.contractStatus].color}
                  size="small"
                />
              </View>
              <View className={styles.contractRowItem}>
                <Text className={styles.contractRowLabel}>验收状态</Text>
                <StatusTag
                  label={AcceptanceStatusMap[currentContract.acceptanceStatus].label}
                  color={AcceptanceStatusMap[currentContract.acceptanceStatus].color}
                  size="small"
                />
              </View>
            </View>
            <View className={styles.contractRow2}>
              <View className={styles.contractInfoItem}>
                <Text className={styles.contractInfoLabel}>合同编号</Text>
                <Text className={styles.contractInfoValue}>{currentContract.contractNo || '-'}</Text>
              </View>
              <View className={styles.contractInfoItem}>
                <Text className={styles.contractInfoLabel}>签署日期</Text>
                <Text className={styles.contractInfoValue}>{currentContract.signDate || '-'}</Text>
              </View>
            </View>
            <View className={styles.paymentProgress}>
              <View className={styles.payProgHeader}>
                <Text className={styles.payProgLabel}>付款进度</Text>
                <Text className={styles.payProgValue}>
                  ¥{formatPrice(paidAmount)} / ¥{formatPrice(currentContract.totalAmount)}
                </Text>
              </View>
              <View className={styles.payProgBar}>
                <View
                  className={styles.payProgFill}
                  style={{ width: `${currentContract.totalAmount > 0 ? (paidAmount / currentContract.totalAmount * 100) : 0}%` }}
                />
              </View>
              <View className={styles.payNodeList}>
                {currentContract.paymentNodes.map(node => (
                  <View key={node.id} className={`${styles.payNode} ${node.status === 'paid' ? styles.payNodePaid : ''}`}>
                    <View className={styles.payNodeDot}>✓</View>
                    <View className={styles.payNodeInfo}>
                      <Text className={styles.payNodeName}>{node.name}</Text>
                      <Text className={styles.payNodeAmount}>¥{formatPrice(node.amount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            {currentContract.acceptanceResult && (
              <View className={styles.acceptanceResultBox}>
                <Text className={styles.acceptanceResultLabel}>验收结论</Text>
                <Text className={styles.acceptanceResultText}>{currentContract.acceptanceResult}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.noContract}>
            <Text className={styles.noContractText}>尚未创建合同跟进</Text>
            <View className={styles.noContractBtn} onClick={goContractFollowup}>
              <Text>创建合同跟进</Text>
            </View>
          </View>
        )}
      </View>

      {currentRating && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>⭐</Text>
            <Text className={styles.sectionTitle}>满意度评价</Text>
          </View>
          <View className={styles.ratingCard}>
            <View className={styles.ratingHeader}>
              <View className={styles.ratingLeft}>
                {renderStars(currentRating.overallRating)}
                <Text className={styles.ratingScore}>{currentRating.overallRating.toFixed(1)}分</Text>
              </View>
              <Text className={styles.ratingDate}>{currentRating.createdAt}</Text>
            </View>

            <View className={styles.ratingsGrid}>
              <View className={styles.ratingSubItem}>
                <Text className={styles.ratingSubLabel}>数据质量</Text>
                {renderStars(currentRating.dataQuality)}
                <Text className={styles.ratingSubValue}>{currentRating.dataQuality}.0</Text>
              </View>
              <View className={styles.ratingSubItem}>
                <Text className={styles.ratingSubLabel}>交付及时</Text>
                {renderStars(currentRating.deliveryTimeliness)}
                <Text className={styles.ratingSubValue}>{currentRating.deliveryTimeliness}.0</Text>
              </View>
              <View className={styles.ratingSubItem}>
                <Text className={styles.ratingSubLabel}>服务质量</Text>
                {renderStars(currentRating.serviceQuality)}
                <Text className={styles.ratingSubValue}>{currentRating.serviceQuality}.0</Text>
              </View>
              <View className={styles.ratingSubItem}>
                <Text className={styles.ratingSubLabel}>价格合理</Text>
                {renderStars(currentRating.priceReasonableness)}
                <Text className={styles.ratingSubValue}>{currentRating.priceReasonableness}.0</Text>
              </View>
            </View>

            {currentRating.comment && (
              <View className={styles.commentBox}>
                <Text className={styles.commentLabel}>评价内容</Text>
                <Text className={styles.commentText}>{currentRating.comment}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {peerReviews.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📊</Text>
            <Text className={styles.sectionTitle}>其他候选供应方（共{peerReviews.length}家）</Text>
          </View>
          {peerReviews.map(peer => {
            const statusInfo = ReviewStatusMap[peer.reviewStatus] || ReviewStatusMap.pending
            return (
              <View key={peer.id} className={styles.peerCard}>
                <View className={styles.peerRow1}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text className={styles.peerName}>{peer.supplierName}</Text>
                    <StatusTag
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                    />
                  </View>
                  <Text className={styles.peerScore}>匹配{peer.matchScore} · ¥{formatPrice(peer.quotePrice)}</Text>
                </View>
                <View className={styles.peerRow2}>
                  <Text className={styles.peerDelivery}>{peer.deliveryMethod} · {peer.deliveryCycle}</Text>
                </View>
                {peer.reviewNotes && (
                  <View className={styles.peerNote}>
                    <Text className={styles.peerNoteLabel}>
                      {peer.reviewStatus === 'rejected' ? '淘汰原因' : '评审备注'}：
                    </Text>
                    <Text className={styles.peerNoteText}>{peer.reviewNotes}</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      )}

      {decisionHistory.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionIcon}>📜</Text>
            <Text className={styles.sectionTitle}>决策历史时间线</Text>
          </View>
          <View className={styles.timelineCard}>
            {decisionHistory.map((record, idx) => {
              const statusInfo = ReviewStatusMap[record.action]
              const prevInfo = ReviewStatusMap[record.previousStatus]
              return (
                <View key={record.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot} style={{ background: statusInfo.color }} />
                  {idx < decisionHistory.length - 1 && <View className={styles.timelineLine} />}
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <Text className={styles.timelineSupplier}>{record.supplierName}</Text>
                      <StatusTag label={statusInfo.label} color={statusInfo.color} size="small" />
                    </View>
                    <Text className={styles.timelineAction}>
                      {prevInfo.label} → {statusInfo.label}
                    </Text>
                    {record.notes && (
                      <Text className={styles.timelineNote}>{record.notes}</Text>
                    )}
                    <Text className={styles.timelineTime}>
                      {record.operator} · {record.createdAt}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View className={styles.footer} />
    </ScrollView>
  )
}

export default DealReviewPage
