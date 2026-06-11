import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import StatusTag from '@/components/StatusTag'
import type { DataSupplier } from '@/types'
import { formatPrice, generateStars, getMatchScoreColor } from '@/utils'
import { useAppStore } from '@/store'
import classnames from 'classnames'

interface SupplierCardProps {
  supplier: DataSupplier
  showActions?: boolean
}

const SupplierCard: React.FC<SupplierCardProps> = ({ supplier, showActions = true }) => {
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  const setCurrentSupplier = useAppStore(state => state.setCurrentSupplier)
  const scoreColor = getMatchScoreColor(supplier.matchScore)
  const stars = generateStars(supplier.rating)

  const handleClick = () => {
    setCurrentSupplier(supplier)
    Taro.navigateTo({ url: `/pages/supplier-detail/index?id=${supplier.id}` })
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(supplier.id)
    Taro.showToast({
      title: supplier.isFavorite ? '已取消收藏' : '已加入收藏',
      icon: 'none'
    })
  }

  const handleConsult = (e: React.MouseEvent) => {
    e.stopPropagation()
    const conversations = useAppStore.getState().conversations
    const existingConv = conversations.find(c => c.supplierId === supplier.id)
    if (existingConv) {
      Taro.showToast({ title: '已有该供应方的会话', icon: 'none' })
      setTimeout(() => Taro.switchTab({ url: '/pages/communication/index' }), 800)
    } else {
      const activeDemand = useAppStore.getState().demands[0]
      useAppStore.getState().addConversation({
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
      Taro.showToast({ title: '已发起咨询', icon: 'success' })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.left}>
          <Text className={styles.supplierName}>{supplier.name}</Text>
          <View className={styles.rating}>
            <View className={styles.stars}>
              {stars.map((type, i) => (
                <Text key={i} className={classnames(styles.star, styles[`star${type}`])}>★</Text>
              ))}
            </View>
            <Text className={styles.ratingValue}>{supplier.rating}</Text>
            <Text className={styles.dealCount}>成交{supplier.dealCount}次</Text>
          </View>
        </View>
        <View className={styles.matchScore} style={{ color: scoreColor }}>
          <Text className={styles.matchScoreValue}>{supplier.matchScore}</Text>
          <Text className={styles.matchScoreLabel}>匹配度</Text>
        </View>
      </View>

      <View className={styles.productInfo}>
        <Text className={styles.productName}>{supplier.productName}</Text>
        <Text className={styles.productDesc}>{supplier.productDesc}</Text>
      </View>

      <View className={styles.tagsRow}>
        {supplier.tags.slice(0, 3).map((tag, i) => (
          <View key={i} className={styles.tag}>
            <Text className={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {supplier.certifications.slice(0, 2).map((cert, i) => (
          <View key={`cert-${i}`} className={classnames(styles.tag, styles.certTag)}>
            <Text className={styles.certText}>{cert}</Text>
          </View>
        ))}
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>行业</Text>
          <Text className={styles.infoValue}>{supplier.industry}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>地域</Text>
          <Text className={styles.infoValue}>{supplier.region}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>数据量</Text>
          <Text className={styles.infoValue}>{supplier.dataVolume}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>报价</Text>
          <Text className={styles.priceValue}>{formatPrice(supplier.price)}</Text>
          <Text className={styles.priceUnit}>{supplier.priceUnit}</Text>
        </View>
        <View className={styles.deliveryMethod}>
          <StatusTag label={supplier.deliveryMethod} color='#722ED1' size='sm' />
        </View>
      </View>

      {showActions && (
        <View className={styles.actions}>
          <View
            className={classnames(styles.actionBtn, styles.favoriteBtn, supplier.isFavorite && styles.favorited)}
            onClick={handleFavorite}
          >
            <Text className={classnames(styles.actionIcon, supplier.isFavorite && styles.iconFavorited)}>
              {supplier.isFavorite ? '❤' : '♡'}
            </Text>
            <Text className={styles.actionText}>{supplier.isFavorite ? '已收藏' : '收藏'}</Text>
          </View>
          <View className={styles.actionBtn} onClick={handleConsult}>
            <Text className={styles.actionIcon}>💬</Text>
            <Text className={styles.actionText}>咨询</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default SupplierCard
