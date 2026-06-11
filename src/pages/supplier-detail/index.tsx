import { useState } from 'react'
import { View, Text, ScrollView, useRouter } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useStore } from '../../store'
import { generateStars, formatPrice, getMatchScoreColor } from '../../utils'
import styles from './index.module.scss'

const SupplierDetailPage = () => {
  const router = useRouter()
  const { supplierId } = router.params
  const { suppliers, toggleFavorite, favorites, addConversation, conversations } = useStore()
  const [supplier, setSupplier] = useState<any>(null)

  useDidShow(() => {
    const found = suppliers.find(s => s.id === supplierId) || suppliers[0]
    setSupplier(found)
  })

  if (!supplier) return null

  const isFavorite = favorites.includes(supplier.id)
  const matchScore = supplier.matchScore || 92
  const scoreColor = getMatchScoreColor(matchScore)

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
      Taro.switchTab({ url: '/pages/communication/index' })
    } else {
      addConversation({
        id: `conv_${Date.now()}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierAvatar: supplier.logo,
        demandId: 'DD-20240115-001',
        demandTitle: '用户行为分析数据集采购',
        lastMessage: '您好，我对贵司的数据产品很感兴趣，想详细了解一下。',
        lastMessageTime: '刚刚',
        unreadCount: 1,
      })
      Taro.showToast({ title: '已发起咨询，请在沟通记录查看', icon: 'none' })
      setTimeout(() => Taro.switchTab({ url: '/pages/communication/index' }), 800)
    }
  }

  const handleAddReview = () => {
    Taro.showToast({ title: '已加入评审清单', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/review/index' }), 800)
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.supplierHeader}>
        <View className={styles.headerContent}>
          <View className={styles.supplierInfoRow}>
            <View className={styles.supplierLogo}>{supplier.logo}</View>
            <View className={styles.supplierNameCol}>
              <View className={styles.supplierName}>
                <Text>{supplier.name}</Text>
                {supplier.certified && <Text className={styles.authBadge}>✓ 官方认证</Text>}
                {supplier.qualifications?.length > 0 && <Text className={styles.authBadge} style={{ background: 'rgba(19,194,194,0.25)', color: '#13c2c2' }}>⭐ 优质供应商</Text>}
              </View>
              <View className={styles.scoreRow}>
                <View className={styles.scoreStars}>{generateStars(supplier.rating || 4.8)}</View>
                <Text>{supplier.rating || 4.8} 分</Text>
                <Text style={{ opacity: 0.6 }}>·</Text>
                <Text>{supplier.transactionCount || 168} 笔成交</Text>
              </View>
            </View>
          </View>
          <View className={styles.headerStats}>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{supplier.matchScore || 92}%</Text>
              <Text className={styles.statLabelSmall}>需求匹配度</Text>
            </View>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{supplier.responseTime || '2小时内'}</Text>
              <Text className={styles.statLabelSmall}>平均响应</Text>
            </View>
            <View className={styles.headerStatItem}>
              <Text className={styles.statValue}>{supplier.deliveryRate || 99}%</Text>
              <Text className={styles.statLabelSmall}>按时交付率</Text>
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
                <Text className={styles.dimValue}>95%</Text>
              </View>
              <View className={styles.matchDimension}>
                <Text className={styles.dimLabel}>地域覆盖</Text>
                <Text className={styles.dimValue}>90%</Text>
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
            <Text className={styles.productName}>{supplier.productName || '全国消费行为洞察数据集'}</Text>
            <View className={styles.productTags}>
              {supplier.tags?.slice(0, 4).map((tag, idx) => (
                <View key={idx} className={styles.productTag}>{tag}</View>
              ))}
            </View>
            <Text className={styles.productDesc}>{supplier.productDesc || '该数据集覆盖全国300+城市的用户消费行为，包含购买偏好、价格敏感度、品牌忠诚度等多维度标签，样本量超过2亿条，月度增量更新。数据经过多重脱敏处理，合规合法，可直接用于用户画像、精准营销、市场分析等场景。'}</Text>
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
                <Text>{formatPrice(supplier.price || 280000)}</Text>
                <Text style={{ fontSize: 24, fontWeight: 500 }}> 元</Text>
              </View>
              <View className={styles.quoteMeta}>
                <Text className={styles.quoteMetaItem}>交付方式：{supplier.deliveryMethod || 'API接口'}</Text>
                <Text className={styles.quoteMetaItem}>交付周期：{supplier.deliveryCycle || '3-5工作日'}</Text>
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
                <Text className={styles.infoText}>{supplier.description || '成立于2016年，是国内领先的数据智能服务商，专注于消费行为、移动应用、电商交易等领域的数据整合与分析。公司拥有完善的数据合规体系和多项自主知识产权，服务超过500家企业客户。'}</Text>
              </View>
            </View>
            <View className={styles.infoRow}>
              <View className={styles.infoIcon}>📍</View>
              <View className={styles.infoContent}>
                <Text className={styles.infoText}>{supplier.location || '上海市浦东新区张江高科技园区'}</Text>
              </View>
            </View>
            <View className={styles.infoRow}>
              <View className={styles.infoIcon}>👥</View>
              <View className={styles.infoContent}>
                <Text className={styles.infoText}>团队规模 {supplier.teamSize || '200-500人'} · 服务客户 500+ · 行业经验 8年+</Text>
              </View>
            </View>
          </View>
        </View>

        {supplier.qualifications && supplier.qualifications.length > 0 && (
          <View className={styles.card}>
            <View className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              <Text>资质认证</Text>
            </View>
            <View className={styles.qualificationList}>
              {supplier.qualifications.map((q, idx) => (
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
