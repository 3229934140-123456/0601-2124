import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import SupplierCard from '@/components/SupplierCard'
import type { DataSupplier } from '@/types'
import { DeliveryMethodOptions } from '@/types'

type TabType = 'all' | 'favorite'
type SortType = 'match' | 'price' | 'rating'

const MatchPage: React.FC = () => {
  const suppliers = useAppStore(state => state.suppliers)
  const demands = useAppStore(state => state.demands)
  const favorites = useAppStore(state => state.favorites)

  const [selectedDemandIndex, setSelectedDemandIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [sortType, setSortType] = useState<SortType>('match')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([])
  const [minMatchScore, setMinMatchScore] = useState<number | null>(null)

  const activeDemand = demands[selectedDemandIndex]

  const handleDemandChange = (e) => {
    setSelectedDemandIndex(Number(e.detail.value))
  }

  const displayedSuppliers = useMemo(() => {
    let list: DataSupplier[] = [...suppliers]

    if (activeDemand) {
      list = list.filter(s =>
        s.industry === activeDemand.industry ||
        s.region === activeDemand.region
      )
    }

    if (activeTab === 'favorite') {
      list = list.filter(s => favorites.includes(s.id))
    }

    if (selectedDelivery.length > 0) {
      list = list.filter(s => selectedDelivery.includes(s.deliveryMethod))
    }

    if (minMatchScore !== null) {
      list = list.filter(s => s.matchScore >= minMatchScore)
    }

    switch (sortType) {
      case 'match':
        list.sort((a, b) => b.matchScore - a.matchScore)
        break
      case 'price':
        list.sort((a, b) => a.price - b.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
    }

    return list
  }, [suppliers, favorites, activeDemand, activeTab, sortType, selectedDelivery, minMatchScore])

  const toggleDelivery = (method: string) => {
    setSelectedDelivery(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    )
  }

  const resetFilter = () => {
    setSelectedDelivery([])
    setMinMatchScore(null)
  }

  const goPublish = () => {
    Taro.switchTab({ url: '/pages/publish/index' })
  }

  useDidShow(() => {
    console.log('[Match] Page showed, total suppliers:', suppliers.length)
  })

  return (
    <ScrollView scrollY className={styles.page} enhanced showScrollbar={false}>
      <View className={styles.filterBar}>
        <Picker mode='selector' range={demands.map(d => d.title)} value={selectedDemandIndex} onChange={handleDemandChange}>
          <View className={styles.demandSelector}>
            <Text className={styles.demandSelectorText}>
              📋 {activeDemand ? activeDemand.title : '全部需求'}
            </Text>
            <Text className={styles.demandSelectorArrow}>▼</Text>
          </View>
        </Picker>
        <View
          className={classnames(styles.filterBtn, showFilter && styles.filterBtnActive)}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Text>⚙️</Text>
          <Text className={styles.filterBtnText}>筛选</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statsCard}>
          <Text className={styles.statsLabel}>已匹配供应方</Text>
          <Text className={styles.statsValue}>{displayedSuppliers.length}</Text>
          <Text className={styles.statsSub}>家数据服务商</Text>
        </View>
        <View className={classnames(styles.statsCard, styles.statsCardPurple)}>
          <Text className={classnames(styles.statsLabel, styles.statsLabelWhite)}>已收藏</Text>
          <Text className={classnames(styles.statsValue, styles.statsValueWhite)}>{favorites.length}</Text>
          <Text className={classnames(styles.statsSub, styles.statsSubWhite)}>候选供应方</Text>
        </View>
        <View className={classnames(styles.statsCard, styles.statsCardCyan)}>
          <Text className={classnames(styles.statsLabel, styles.statsLabelWhite)}>高匹配</Text>
          <Text className={classnames(styles.statsValue, styles.statsValueWhite)}>
            {suppliers.filter(s => s.matchScore >= 90).length}
          </Text>
          <Text className={classnames(styles.statsSub, styles.statsSubWhite)}>匹配度≥90分</Text>
        </View>
      </View>

      <View className={styles.tabsRow}>
        <View
          className={classnames(styles.tabItem, activeTab === 'all' && styles.tabItemActive)}
          onClick={() => setActiveTab('all')}
        >
          <Text className={styles.tabText}>全部匹配</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'favorite' && styles.tabItemActive)}
          onClick={() => setActiveTab('favorite')}
        >
          <Text className={styles.tabText}>我的收藏 ❤</Text>
        </View>
      </View>

      {showFilter && (
        <View className={styles.filterPanel}>
          <View className={styles.filterGroup}>
            <Text className={styles.filterGroupTitle}>交付方式</Text>
            <View className={styles.filterOptions}>
              {DeliveryMethodOptions.map(method => (
                <View
                  key={method}
                  className={classnames(styles.filterOption, selectedDelivery.includes(method) && styles.filterOptionActive)}
                  onClick={() => toggleDelivery(method)}
                >
                  {method}
                </View>
              ))}
            </View>
          </View>
          <View className={styles.filterGroup}>
            <Text className={styles.filterGroupTitle}>最低匹配度</Text>
            <View className={styles.filterOptions}>
              {[70, 80, 85, 90].map(score => (
                <View
                  key={score}
                  className={classnames(styles.filterOption, minMatchScore === score && styles.filterOptionActive)}
                  onClick={() => setMinMatchScore(minMatchScore === score ? null : score)}
                >
                  {score}分以上
                </View>
              ))}
            </View>
          </View>
          <View className={styles.filterActions}>
            <Button className={styles.filterResetBtn} onClick={resetFilter}>重置</Button>
            <Button className={styles.filterConfirmBtn} onClick={() => setShowFilter(false)}>确定筛选</Button>
          </View>
        </View>
      )}

      <View className={styles.sectionHeader}>
        <View className={styles.sectionTitle}>
          <Text>🎯 匹配结果</Text>
          <View className={styles.sectionBadge}>{displayedSuppliers.length}家</View>
        </View>
        <View className={styles.sectionActions}>
          <Text
            className={classnames(styles.sortOption, sortType === 'match' && styles.sortOptionActive)}
            onClick={() => setSortType('match')}
          >
            匹配度
          </Text>
          <Text
            className={classnames(styles.sortOption, sortType === 'price' && styles.sortOptionActive)}
            onClick={() => setSortType('price')}
          >
            价格
          </Text>
          <Text
            className={classnames(styles.sortOption, sortType === 'rating' && styles.sortOptionActive)}
            onClick={() => setSortType('rating')}
          >
            评分
          </Text>
        </View>
      </View>

      {displayedSuppliers.length > 0 ? (
        displayedSuppliers.map(supplier => (
          <SupplierCard key={supplier.id} supplier={supplier} showActions />
        ))
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔍</Text>
          <Text className={styles.emptyTitle}>
            {activeTab === 'favorite' ? '暂无收藏的供应方' : '暂无匹配结果'}
          </Text>
          <Text className={styles.emptyDesc}>
            {activeTab === 'favorite'
              ? '浏览匹配结果时点击爱心收藏您感兴趣的供应方'
              : '尝试调整筛选条件，或发布新的采购需求获取更多匹配'}
          </Text>
          <Button className={styles.emptyBtn} onClick={goPublish}>📋 发布需求</Button>
        </View>
      )}

      <View style={{ height: '40rpx' }} />
    </ScrollView>
  )
}

export default MatchPage
