import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Textarea, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import StatusTag from '@/components/StatusTag'
import type { ReviewItem, ReviewStatus } from '@/types'
import { ReviewStatusMap, DeliveryMethodOptions } from '@/types'
import { formatPrice } from '@/utils'

type FilterTab = 'all' | ReviewStatus

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待评审' },
  { key: 'shortlisted', label: '已入围' },
  { key: 'negotiating', label: '商谈中' },
  { key: 'won', label: '已中标' },
  { key: 'rejected', label: '已淘汰' }
]

const ReviewPage: React.FC = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const updateReviewStatus = useAppStore(state => state.updateReviewStatus)
  const updateReviewQuote = useAppStore(state => state.updateReviewQuote)

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)
  const [statusNotes, setStatusNotes] = useState('')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotePrice, setQuotePrice] = useState('')
  const [quoteMethod, setQuoteMethod] = useState(DeliveryMethodOptions[0])
  const [quoteCycle, setQuoteCycle] = useState('')

  const summary = useMemo(() => ({
    total: reviewItems.length,
    pending: reviewItems.filter(r => r.reviewStatus === 'pending').length,
    shortlisted: reviewItems.filter(r => r.reviewStatus === 'shortlisted').length,
    negotiating: reviewItems.filter(r => r.reviewStatus === 'negotiating').length,
    won: reviewItems.filter(r => r.reviewStatus === 'won').length,
    rejected: reviewItems.filter(r => r.reviewStatus === 'rejected').length
  }), [reviewItems])

  const filteredReviews = useMemo(() => {
    if (activeTab === 'all') return reviewItems
    return reviewItems.filter(r => r.reviewStatus === activeTab)
  }, [reviewItems, activeTab])

  const handleUpdateStatus = (review: ReviewItem, status: ReviewStatus) => {
    setSelectedReview(review)
    setStatusNotes(review.reviewNotes)
    setShowStatusModal(true)
    // Store the status to apply
    ;(window as any).__pendingStatus = status
  }

  const confirmStatusUpdate = () => {
    if (!selectedReview) return
    const status = (window as any).__pendingStatus as ReviewStatus
    updateReviewStatus(selectedReview.id, status, statusNotes)
    Taro.showToast({ title: `已标记为${ReviewStatusMap[status].label}`, icon: 'success' })
    setShowStatusModal(false)
    setSelectedReview(null)
  }

  const handleEditQuote = (review: ReviewItem) => {
    setSelectedReview(review)
    setQuotePrice(String(review.quotePrice))
    setQuoteMethod(review.deliveryMethod)
    setQuoteCycle(review.deliveryCycle)
    setShowQuoteModal(true)
  }

  const confirmQuoteUpdate = () => {
    if (!selectedReview || !quotePrice) {
      Taro.showToast({ title: '请填写报价', icon: 'none' })
      return
    }
    updateReviewQuote(selectedReview.id, Number(quotePrice), quoteMethod, quoteCycle)
    Taro.showToast({ title: '报价已更新', icon: 'success' })
    setShowQuoteModal(false)
    setSelectedReview(null)
  }

  const generateComparison = () => {
    const shortlisted = reviewItems.filter(r => ['shortlisted', 'negotiating', 'won'].includes(r.reviewStatus))
    if (shortlisted.length < 2) {
      Taro.showToast({ title: '至少2家入围供应方可生成比对表', icon: 'none' })
      return
    }
    const demandId = shortlisted[0].demandId
    Taro.navigateTo({ url: `/pages/comparison-detail/index?demandId=${demandId}` })
  }

  const goSatisfaction = (review: ReviewItem) => {
    Taro.navigateTo({
      url: `/pages/satisfaction/index?reviewId=${review.id}&demandId=${review.demandId}&supplierId=${review.supplierId}`
    })
  }

  useDidShow(() => {
    console.log('[Review] Page showed, total reviews:', reviewItems.length)
  })

  return (
    <ScrollView scrollY className={styles.page} enhanced showScrollbar={false}>
      <View className={styles.summaryCards}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.total}</Text>
          <Text className={styles.summaryLabel}>评审总数</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueOrange)}>{summary.pending}</Text>
          <Text className={styles.summaryLabel}>待评审</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValuePurple)}>{summary.shortlisted}</Text>
          <Text className={styles.summaryLabel}>已入围</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueGreen)}>{summary.won}</Text>
          <Text className={styles.summaryLabel}>已中标</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.tabsRow} enhanced showScrollbar={false}>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabChip, activeTab === tab.key && styles.tabChipActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </ScrollView>

      <Button className={styles.generateCompareBtn} onClick={generateComparison}>
        📊 生成需求比对表
      </Button>

      {filteredReviews.length > 0 ? (
        filteredReviews.map(review => {
          const statusInfo = ReviewStatusMap[review.reviewStatus]
          return (
            <View key={review.id} className={styles.reviewCard}>
              <View className={styles.reviewHeader}>
                <View className={styles.reviewDemand}>
                  <Text className={styles.reviewDemandTitle}>{review.demandTitle}</Text>
                  <Text className={styles.reviewDemandSub}>创建于 {review.createdAt}</Text>
                </View>
                <View className={styles.reviewMatchScore}>
                  <Text className={styles.reviewScoreValue}>{review.matchScore}</Text>
                  <Text className={styles.reviewScoreLabel}>匹配度</Text>
                </View>
              </View>

              <View className={styles.supplierInfo}>
                <View className={styles.supplierNameRow}>
                  <Text className={styles.supplierName}>{review.supplierName}</Text>
                  <StatusTag label={statusInfo.label} color={statusInfo.color} size='sm' />
                </View>
                <Text className={styles.productName}>📦 {review.productName}</Text>
              </View>

              <View className={styles.quoteRow}>
                <View className={styles.quoteItem}>
                  <Text className={styles.quoteLabel}>报价</Text>
                  <Text className={classnames(styles.quoteValue, styles.quotePrice)}>
                    ¥{formatPrice(review.quotePrice)}
                  </Text>
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
                  <Text className={styles.notesLabel}>📝 评审备注</Text>
                  <Text className={styles.notesText}>{review.reviewNotes}</Text>
                </View>
              )}

              <View className={styles.statusActions}>
                {review.reviewStatus !== 'shortlisted' && review.reviewStatus !== 'won' && review.reviewStatus !== 'rejected' && (
                  <View
                    className={classnames(styles.statusBtn, styles.statusBtnShortlisted)}
                    onClick={() => handleUpdateStatus(review, 'shortlisted')}
                  >
                    标记入围
                  </View>
                )}
                {review.reviewStatus !== 'negotiating' && review.reviewStatus !== 'won' && review.reviewStatus !== 'rejected' && (
                  <View
                    className={classnames(styles.statusBtn, styles.statusBtnNegotiating)}
                    onClick={() => handleUpdateStatus(review, 'negotiating')}
                  >
                    商谈中
                  </View>
                )}
                {review.reviewStatus !== 'won' && review.reviewStatus !== 'rejected' && (
                  <View
                    className={classnames(styles.statusBtn, styles.statusBtnWon)}
                    onClick={() => handleUpdateStatus(review, 'won')}
                  >
                    确认中标
                  </View>
                )}
                {review.reviewStatus !== 'rejected' && (
                  <View
                    className={classnames(styles.statusBtn, styles.statusBtnRejected)}
                    onClick={() => handleUpdateStatus(review, 'rejected')}
                  >
                    淘汰
                  </View>
                )}
              </View>

              <View className={styles.actionRow}>
                <View className={styles.actionBtn} onClick={() => handleEditQuote(review)}>
                  ✏️ 编辑报价
                </View>
                {review.reviewStatus === 'won' && (
                  <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={() => goSatisfaction(review)}>
                    ⭐ 满意度评价
                  </View>
                )}
                {review.reviewStatus !== 'won' && (
                  <View
                    className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={() => Taro.switchTab({ url: '/pages/communication/index' })}
                  >
                    💬 去沟通
                  </View>
                )}
              </View>
            </View>
          )
        })
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyTitle}>暂无评审数据</Text>
          <Text className={styles.emptyDesc}>在供应匹配页面收藏供应方后，系统会自动将其加入评审清单</Text>
          <Button
            className={styles.emptyBtn}
            onClick={() => Taro.switchTab({ url: '/pages/match/index' })}
          >
            🎯 去匹配供应方
          </Button>
        </View>
      )}

      {showStatusModal && selectedReview && (
        <View className={styles.modalMask} onClick={() => setShowStatusModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>更新评审状态</Text>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>供应方：{selectedReview.supplierName}</Text>
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>添加评审备注（可选）</Text>
              <Textarea
                className={styles.modalInput}
                placeholder='请输入评审备注，如：数据维度匹配度高、报价合理等...'
                value={statusNotes}
                onInput={(e) => setStatusNotes(e.detail.value)}
                maxlength={500}
              />
            </View>
            <View className={styles.modalActions}>
              <Button className={styles.modalBtnCancel} onClick={() => setShowStatusModal(false)}>取消</Button>
              <Button className={styles.modalBtnConfirm} onClick={confirmStatusUpdate}>确认更新</Button>
            </View>
          </View>
        </View>
      )}

      {showQuoteModal && selectedReview && (
        <View className={styles.modalMask} onClick={() => setShowQuoteModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>编辑报价信息</Text>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>报价（元）</Text>
              <Input
                className={styles.modalInput}
                style={{ minHeight: '80rpx' }}
                type='digit'
                placeholder='请输入报价金额'
                value={quotePrice}
                onInput={(e) => setQuotePrice(e.detail.value)}
              />
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>交付方式</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
                {DeliveryMethodOptions.map(method => (
                  <View
                    key={method}
                    className={classnames(styles.statusBtn, quoteMethod === method && styles.statusBtnShortlisted)}
                    onClick={() => setQuoteMethod(method)}
                  >
                    {method}
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>交付周期</Text>
              <Input
                className={styles.modalInput}
                style={{ minHeight: '80rpx' }}
                placeholder='如：合同签署后7个工作日'
                value={quoteCycle}
                onInput={(e) => setQuoteCycle(e.detail.value)}
              />
            </View>
            <View className={styles.modalActions}>
              <Button className={styles.modalBtnCancel} onClick={() => setShowQuoteModal(false)}>取消</Button>
              <Button className={styles.modalBtnConfirm} onClick={confirmQuoteUpdate}>保存</Button>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: '40rpx' }} />
    </ScrollView>
  )
}

export default ReviewPage
