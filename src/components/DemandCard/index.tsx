import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import StatusTag from '@/components/StatusTag'
import type { DataDemand } from '@/types'
import { DemandStatusMap } from '@/types'
import { formatBudget, formatDate, getDaysRemaining } from '@/utils'
import { useAppStore } from '@/store'

interface DemandCardProps {
  demand: DataDemand
}

const DemandCard: React.FC<DemandCardProps> = ({ demand }) => {
  const setCurrentDemand = useAppStore(state => state.setCurrentDemand)
  const statusInfo = DemandStatusMap[demand.status]
  const daysRemaining = getDaysRemaining(demand.deadline)

  const handleClick = () => {
    setCurrentDemand(demand)
    Taro.navigateTo({ url: `/pages/demand-detail/index?id=${demand.id}` })
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.title}>{demand.title}</Text>
          <StatusTag label={statusInfo.label} color={statusInfo.color} size='sm' />
        </View>
        <Text className={styles.id}>需求编号：{demand.id}</Text>
      </View>

      <Text className={styles.desc}>{demand.description}</Text>

      <View className={styles.tagsRow}>
        <View className={styles.tag} style={{ backgroundColor: '$color-tag-industry' }}>
          <Text className={styles.tagText}>{demand.industry}</Text>
        </View>
        <View className={styles.tag} style={{ backgroundColor: '$color-tag-region' }}>
          <Text className={styles.tagText}>{demand.region}</Text>
        </View>
        <View className={styles.tag} style={{ backgroundColor: '$color-tag-freq' }}>
          <Text className={styles.tagText}>{demand.updateFrequency}</Text>
        </View>
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>预算</Text>
          <Text className={styles.infoValueBudget}>{formatBudget(demand.budgetMin, demand.budgetMax)}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>样本</Text>
          <Text className={styles.infoValue}>{demand.sampleScope}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{demand.matchedCount}</Text>
            <Text className={styles.statLabel}>已匹配</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{demand.responseCount}</Text>
            <Text className={styles.statLabel}>已响应</Text>
          </View>
        </View>
        <View className={styles.rightInfo}>
          {daysRemaining >= 0 && (
            <Text className={styles.deadline}>
              {daysRemaining === 0 ? '今日截止' : `还剩${daysRemaining}天`}
            </Text>
          )}
          <Text className={styles.createTime}>{formatDate(demand.createdAt)}</Text>
        </View>
      </View>
    </View>
  )
}

export default DemandCard
