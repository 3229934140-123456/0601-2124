import { useState } from 'react'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAppStore } from '@/store'
import { formatPrice } from '@/utils'
import styles from './index.module.scss'

const SatisfactionPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const demands = useAppStore(state => state.demands)
  const suppliers = useAppStore(state => state.suppliers)
  const addSatisfactionRating = useAppStore(state => state.addSatisfactionRating)

  const [overall, setOverall] = useState(4)
  const [dimRatings, setDimRatings] = useState({
    dataQuality: 5,
    priceReasonableness: 4,
    deliveryTimeliness: 5,
    serviceQuality: 4,
  })
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [contextLoaded, setContextLoaded] = useState(false)
  const [contextReview, setContextReview] = useState<any>(null)
  const [contextDemand, setContextDemand] = useState<any>(null)
  const [contextSupplier, setContextSupplier] = useState<any>(null)

  const dimensions = [
    { key: 'dataQuality', name: '数据质量' },
    { key: 'priceReasonableness', name: '价格合理' },
    { key: 'deliveryTimeliness', name: '交付速度' },
    { key: 'serviceQuality', name: '服务态度' },
  ]

  const quickTags = [
    '数据质量好', '交付准时', '价格公道', '响应迅速',
    '专业能力强', '沟通顺畅', '服务周到', '超出预期',
    '合规可靠', '样本量大', '性价比高', '建议改进'
  ]

  const ratingTexts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意']

  useDidShow(() => {
    if (contextLoaded) return
    const params = Taro.getCurrentInstance().router?.params
    const reviewId = params?.reviewId
    const demandId = params?.demandId
    const supplierId = params?.supplierId

    let review = reviewId ? reviewItems.find(r => r.id === reviewId) : null
    if (!review && demandId && supplierId) {
      review = reviewItems.find(r => r.demandId === demandId && r.supplierId === supplierId)
    }
    if (!review && supplierId) {
      review = reviewItems.find(r => r.supplierId === supplierId && r.reviewStatus === 'won')
    }
    if (!review) {
      review = reviewItems.find(r => r.reviewStatus === 'won')
    }

    if (review) {
      setContextReview(review)
      const demand = demands.find(d => d.id === review.demandId)
      const supplier = suppliers.find(s => s.id === review.supplierId)
      setContextDemand(demand || null)
      setContextSupplier(supplier || null)
    }
    setContextLoaded(true)
  })

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      if (tags.length >= 5) {
        Taro.showToast({ title: '最多选择5个标签', icon: 'none' })
        return
      }
      setTags([...tags, tag])
    }
  }

  const handleDimClick = (key: string, value: number) => {
    setDimRatings({ ...dimRatings, [key]: value })
  }

  const handleSubmit = () => {
    if (overall === 0) {
      Taro.showToast({ title: '请选择综合评分', icon: 'none' })
      return
    }

    const review = contextReview
    const demand = contextDemand
    const supplier = contextSupplier

    if (!review) {
      Taro.showToast({ title: '未找到评价对象', icon: 'none' })
      return
    }

    addSatisfactionRating({
      id: `SAT_${Date.now()}`,
      demandId: review.demandId,
      demandTitle: review.demandTitle || demand?.title || '',
      supplierId: review.supplierId,
      supplierName: review.supplierName || supplier?.name || '',
      overallRating: overall,
      dataQuality: dimRatings.dataQuality,
      deliveryTimeliness: dimRatings.deliveryTimeliness,
      serviceQuality: dimRatings.serviceQuality,
      priceReasonableness: dimRatings.priceReasonableness,
      comment: comment,
      createdAt: new Date().toISOString().split('T')[0],
    })
    Taro.showToast({ title: '评价提交成功！', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/mine/index' }), 1200)
  }

  const dealTitle = contextDemand?.title || contextReview?.demandTitle || '数据需求'
  const supplierName = contextSupplier?.name || contextReview?.supplierName || '供应方'
  const dealAmount = contextReview?.quotePrice || contextSupplier?.price || 0
  const dealDate = contextReview?.createdAt || ''

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.bannerCard}>
        <Text className={styles.bannerEmoji}>🎉</Text>
        <Text className={styles.bannerTitle}>交易圆满完成</Text>
        <Text className={styles.bannerDesc}>为供应方打个分吧，帮助其他采购用户决策</Text>
      </View>

      <View className={styles.dealInfo}>
        <Text className={styles.dealTitle}>📋 交易信息</Text>
        <View className={styles.dealGrid}>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>需求名称</Text>
            <Text className={styles.dealValue}>{dealTitle}</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>供应方</Text>
            <Text className={styles.dealValue}>{supplierName}</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>成交金额</Text>
            <Text className={styles.dealValue} style={{ color: '#f53f3f' }}>¥{formatPrice(dealAmount)}</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>成交日期</Text>
            <Text className={styles.dealValue}>{dealDate || '近期'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>综合评分<em>*</em></Text>
        <View className={styles.overallRating}>
          <View className={styles.overallStars}>
            {[1, 2, 3, 4, 5].map(s => (
              <Text
                key={s}
                className={`${styles.star} ${s <= overall ? styles.starActive : ''}`}
                onClick={() => setOverall(s)}
              >
                ★
              </Text>
            ))}
          </View>
          <Text className={styles.ratingText}>{overall > 0 ? `${ratingTexts[overall]} ${overall}.0分` : '请选择评分'}</Text>
          <Text className={styles.ratingDesc}>{overall >= 4 ? '感谢您的认可！' : overall > 0 ? '我们会持续改进' : '点击星星进行评分'}</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>分项评价</Text>
        <Text className={styles.subTitle}>请从以下维度为供应方打分</Text>
        <View className={styles.dimList}>
          {dimensions.map(dim => (
            <View key={dim.key} className={styles.dimItem}>
              <Text className={styles.dimName}>{dim.name}</Text>
              <View className={styles.dimStars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Text
                    key={s}
                    className={`${styles.dimStar} ${s <= dimRatings[dim.key] ? styles.dimStarActive : ''}`}
                    onClick={() => handleDimClick(dim.key, s)}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text className={styles.dimValue}>{dimRatings[dim.key]}.0</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>印象标签<em>（最多5个）</em></Text>
        <Text className={styles.subTitle}>选择符合您感受的标签</Text>
        <View className={styles.quickTags}>
          {quickTags.map(tag => (
            <View
              key={tag}
              className={`${styles.tagItem} ${tags.includes(tag) ? styles.tagItemActive : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Text>{tags.includes(tag) ? '✓ ' : ''}{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>文字评价</Text>
        <Text className={styles.subTitle}>分享您的采购体验（选填）</Text>
        <View className={styles.textareaWrap}>
          <Textarea
            className={styles.textarea}
            placeholder="聊聊数据质量、交付过程、服务体验等，您的评价将帮助更多采购者~"
            placeholderStyle="color: #c9cdd4"
            value={comment}
            onInput={(e: any) => setComment(e.detail.value)}
            maxlength={500}
          />
          <Text className={styles.wordCount}>{comment.length}/500</Text>
        </View>
        <View className={styles.uploadRow}>
          <View className={styles.uploadItem}>
            <Text className={styles.uploadPlus}>+</Text>
            <Text className={styles.uploadText}>上传凭证</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.anonymousRow}>
          <Text className={styles.anonymousLabel}>
            <Text>🙈</Text>
            <Text>匿名评价（评价将不显示您的个人信息）</Text>
          </Text>
          <View
            className={`${styles.switchBox} ${anonymous ? styles.switchBoxOn : ''}`}
            onClick={() => setAnonymous(!anonymous)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={styles.btnGhost}
          onClick={() => Taro.showModal({
            title: '提示',
            content: '确定跳过评价吗？下次可在"我的事项-已成交评价"中补评。',
            success: (res) => {
              if (res.confirm) Taro.switchTab({ url: '/pages/mine/index' })
            }
          })}
        >
          <Text>稍后评价</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleSubmit}>
          <Text>✨ 提交评价</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default SatisfactionPage
