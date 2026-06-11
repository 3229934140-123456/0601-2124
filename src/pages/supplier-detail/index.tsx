import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAppStore } from '@/store'
import { generateStars, formatPrice, getMatchScoreColor } from '@/utils'
import styles from './index.module.scss'

const SupplierDetailPage = () => {
  const suppliers = useAppStore(state => state.suppliers)
  const currentSupplier = useAppStore(state => state.currentSupplier)
  const favorites = useAppStore(state => state.favorites)
  const demands = useAppStore(state => state.demands)
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  const addConversation = useAppStore(state => state.addConversation)
  const addReviewItem = useAppStore(state => state.addReviewItem)
  const conversations = useAppStore(state => state.conversations)
  const [supplier, setSupplier] = useState(currentSupplier)

  useDidShow(() => {
    if (currentSupplier) {
      setSupplier(currentSupplier)
      return
    }
    const params = Taro.getCurrentInstance().router?.params
    const id = params?.id
    if (id) {
      const found = suppliers.find(s => s.id === id)
      if (found) setSupplier(found)
    }
  })

  if (!supplier) return null

  const isFavorite = favorites.includes(supplier.id)
  const matchScore = supplier.matchScore
  const scoreColor = getMatchScoreColor(matchScore)
  const activeDemand = demands[0]

  const handleToggleFavorite = () => {
    toggleFavorite(supplier.id)
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '收藏成功',
      icon: 'none',
    })
  }

  const handleConsult = () => {
    const existingConv = conversations.find(c => c.supplierId === supplier.id)
    if (existingConv) {
      Taro.showToast({ title: '已有该供应方的会话，请在沟通记录查看', icon: 'none' })
      setTimeout(() => Taro.switchTab({ url: '/pages/communication/index' }), 800)
    } else {
      addConversation({
        id: `CONV_${Date.now()}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        avatarId: Math.floor(Math.random() * 9) + 1,
        demandId: activeDemand?.id || 'DEM001',
        demandTitle: activeDemand?.title || '数据需求',
        lastMessage: '您好，我对贵司的数据产品很感兴趣，想详细了解一下。',
        lastMessageTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
        unreadCount: 1,
      })
      Taro.showToast({ title: '已发起咨询，请在沟通记录查看', icon: 'success' })
    }
  }

  const handleAddReview = () => {
    const existingReview = useAppStore.getState().reviewItems.find(
      r => r.supplierId === supplier.id && r.demandId === (activeDemand?.id || 'DEM001')
    )
    if (existingReview) {
      Taro.showToast({ title: '该供应方已在评审清单中', icon: 'none' })
      setTimeout(() => Taro.switchTab({ url: '/pages/review/index' }), 800)
    } else {
      addReviewItem({
        id: `REV_${Date.now()}`,
        demandId: activeDemand?.id || 'DEM001',
        demandTitle: activeDemand?.title || '数据需求',
        supplierId: supplier.id,
        supplierName: supplier.name,
        productName: supplier.productName,
        matchScore: supplier.matchScore,
        quotePrice: supplier.price,
        deliveryMethod: supplier.deliveryMethod,
        deliveryCycle: '待确认',
        reviewStatus: 'pending',
        reviewNotes: '',
        createdAt: new Date().toISOString().split('T')[0],
      })
      Taro.showToast({ title: '已加入评审清单', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/review/index' }), 800)
    }
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.supplierHeader}>
        <View className={styles.headerContent}>
          <View className={styles.supplierInfoRow}>
            <View className={styles.supplierLogo}>{supplier.name.charAt(0)}</View>
            <View className={styles.supplierNameCol}>
              <View className={styles.supplierName}>
                <Text>{supplier.name}</Text>
                {supplier.certifications.length > 0 && <Text className={styles.authBadge}>✓ 官方认证</Text>}
              </View>
              <View className={styles.scoreRow}>
                <View className={styles.scoreStars}>{generateStars(supplier.rating).map((type, i) => (
                  <Text key={i} style={{ color: type === 'full' || type === 'half' ? '#ffd700' : '#e5e6eb' }}>★</Text>
                ))}</View>
                <Text>{supplier.rating} 分</Text>
                <Text style={{ opacity: 0.6 }}>·</Text>
                <Text>{supplier.dealCount} 笔成交</Text>
              </View>
            </View>
          </View>
          <View className={styles.headerStats}>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{matchScore}%</Text>
              <Text className={styles.statLabelSmall}>需求匹配度</Text>
            </View>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{supplier.updateFrequency}</Text>
              <Text className={styles.statLabelSmall}>更新频率</Text>
            </View>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{supplier.dataVolume}</Text>
              <Text className={styles.statLabelSmall}>数据规模</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={`${styles.card} ${styles.matchScoreCard}`}>
          <View className={styles.matchScoreRow}>
            <View className={styles.matchScoreCircle}>
              <Text className={styles.matchScoreNum} style={{ color: scoreColor }}>{matchScore}</Text>
              <Text className={styles.matchScoreLabel}>匹配分</Text>
            </View>
            <View className={styles.matchScoreInfo}>
              <Text className={styles.matchScoreTitle}>需求契合度评估</Text>
              <View className={styles.matchDimension}>
                <Text className={styles.dimLabel}>行业匹配</Text>
                <Text className={styles.dimValue}>{supplier.industry === activeDemand?.industry ? '95%' : '75%'}</Text>
              </View>
              <View className={styles.matchDimension}>
                <Text className={styles.dimLabel}>地域覆盖</Text>
                <Text className={styles.dimValue}>{supplier.region === activeDemand?.region ? '90%' : '70%'}</Text>
              </View>
              <View className={styles.matchDimension}>
                <Text className={styles.dimLabel}>数据规模</Text>
                <Text className={styles.dimValue}>88%</Text>
              </View>
              <View className={styles.matchDimension}>
                <Text className={styles.dimLabel}>预算符合</Text>
                <Text className={styles.dimValue}>93%</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>数据产品</Text>
          </View>
          <View className={styles.productInfo}>
            <Text className={styles.productName}>{supplier.productName}</Text>
            <View className={styles.productTags}>
              {supplier.tags.slice(0, 4).map((tag, idx) => (
                <View key={idx} className={styles.productTag}>{tag}</View>
              ))}
            </View>
            <Text className={styles.productDesc}>{supplier.productDesc}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>报价信息</Text>
          </View>
          <View className={styles.quoteRow}>
            <View className={styles.quoteInfo}>
              <Text className={styles.quoteLabel}>套餐价格</Text>
              <View className={styles.quotePrice}>
                <Text>{formatPrice(supplier.price)}</Text>
                <Text style={{ fontSize: 24, fontWeight: 500 }}> {supplier.priceUnit}</Text>
              </View>
              <View className={styles.quoteMeta}>
                <Text className={styles.quoteMetaItem}>交付方式：{supplier.deliveryMethod}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>公司简介</Text>
          </View>
          <View className={styles.infoList}>
            <View className={styles.infoRow}>
              <View className={styles.infoIcon}>🏢</View>
              <View className={styles.infoContent}>
                <Text className={styles.infoText}>行业：{supplier.industry} · 覆盖地域：{supplier.region}</Text>
              </View>
            </View>
            <View className={styles.infoRow}>
              <View className={styles.infoIcon}>�</View>
              <View className={styles.infoContent}>
                <Text className={styles.infoText}>数据量 {supplier.dataVolume} · 更新频率 {supplier.updateFrequency}</Text>
              </View>
            </View>
            <View className={styles.infoRow}>
              <View className={styles.infoIcon}>👥</View>
              <View className={styles.infoContent}>
                <Text className={styles.infoText}>历史成交 {supplier.dealCount}笔 · 评分 {supplier.rating}分</Text>
              </View>
            </View>
          </View>
        </View>

        {supplier.certifications.length > 0 && (
          <View className={styles.card}>
            <View className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              <Text>资质认证</Text>
            </View>
            <View className={styles.qualificationList}>
              {supplier.certifications.map((q, idx) => (
                <View key={idx} className={styles.qualItem}>
                  <Text>✓</Text>
                  <Text>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnIcon} onClick={handleToggleFavorite}>
          <Text className={styles.btnIconEmoji}>{isFavorite ? '❤️' : '🤍'}</Text>
          <Text className={styles.btnIconText}>{isFavorite ? '已收藏' : '收藏'}</Text>
        </View>
        <View className={styles.btnSecondary} onClick={handleAddReview}>
          <Text>加入评审</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleConsult}>
          <Text>💬 立即咨询</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default SupplierDetailPage
