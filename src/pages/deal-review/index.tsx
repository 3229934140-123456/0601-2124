import { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import { formatPrice, formatBudget } from '@/utils'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const DealReviewPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const satisfactionRatings = useAppStore(state => state.satisfactionRatings)
  const demands = useAppStore(state => state.demands)

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
          {peerReviews.map(peer => (
            <View key={peer.id} className={styles.peerCard}>
              <View className={styles.peerRow1}>
                <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text className={styles.peerName}>{peer.supplierName}</Text>
                  <StatusTag
                    label={peer.reviewStatus === 'rejected' ? '淘汰' : peer.reviewStatus === 'shortlisted' ? '入围' : '商谈中'}
                    color={peer.reviewStatus === 'rejected' ? '#F53F3F' : peer.reviewStatus === 'shortlisted' ? '#165DFF' : '#FF7D00'}
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
                  <Text className={styles.peerNoteLabel}>{peer.reviewStatus === 'rejected' ? '淘汰原因' : '评审备注'}：</Text>
                  <Text className={styles.peerNoteText}>{peer.reviewNotes}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View className={styles.footer} />
    </ScrollView>
  )
}

export default DealReviewPage
