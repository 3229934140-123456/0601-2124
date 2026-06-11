import { useState } from 'react'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useStore } from '../../store'
import styles from './index.module.scss'

const SatisfactionPage = () => {
  const { satisfactionRatings, addSatisfactionRating } = useStore()
  const [overall, setOverall] = useState(4)
  const [dimRatings, setDimRatings] = useState({
    dataQuality: 5,
    priceReasonable: 4,
    deliverySpeed: 5,
    serviceAttitude: 4,
    afterSales: 5,
  })
  const [tags, setTags] = useState<string[]>(['数据质量好', '交付准时'])
  const [comment, setComment] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const dimensions = [
    { key: 'dataQuality', name: '数据质量' },
    { key: 'priceReasonable', name: '价格合理' },
    { key: 'deliverySpeed', name: '交付速度' },
    { key: 'serviceAttitude', name: '服务态度' },
    { key: 'afterSales', name: '售后支持' },
  ]

  const quickTags = [
    '数据质量好', '交付准时', '价格公道', '响应迅速',
    '专业能力强', '沟通顺畅', '服务周到', '超出预期',
    '合规可靠', '样本量大', '性价比高', '建议改进'
  ]

  const ratingTexts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意']

  useDidShow(() => {
    if (satisfactionRatings.length > 0) {
      const sr = satisfactionRatings[0]
      setOverall(sr.overallRating)
      setDimRatings(sr.dimensions || dimRatings)
      setTags(sr.tags || tags)
      setComment(sr.comment || '')
    }
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
    addSatisfactionRating({
      id: `sr_${Date.now()}`,
      demandId: 'DD-20240115-001',
      demandTitle: '用户行为分析数据集采购需求',
      supplierId: 'SUP001',
      supplierName: '数智洞察科技有限公司',
      dealAmount: 268000,
      dealDate: '2024-02-15',
      overallRating: overall,
      dimensions: dimRatings,
      tags,
      comment,
      anonymous,
      images: [],
      createdAt: new Date().toISOString().split('T')[0],
    })
    Taro.showToast({ title: '评价提交成功！', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/mine/index' }), 1200)
  }

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
            <Text className={styles.dealValue}>用户行为分析数据集</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>供应方</Text>
            <Text className={styles.dealValue}>数智洞察科技</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>成交金额</Text>
            <Text className={styles.dealValue} style={{ color: '#f53f3f' }}>¥268,000</Text>
          </View>
          <View className={styles.dealCell}>
            <Text className={styles.dealLabel}>成交日期</Text>
            <Text className={styles.dealValue}>2024-02-15</Text>
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
