import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAppStore } from '@/store'
import { DemandStatusMap } from '@/types'
import { getDaysRemaining, formatBudget } from '@/utils'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const DemandDetailPage = () => {
  const demands = useAppStore(state => state.demands)
  const reviewItems = useAppStore(state => state.reviewItems)
  const currentDemand = useAppStore(state => state.currentDemand)
  const setCurrentDemand = useAppStore(state => state.setCurrentDemand)

  const [demand, setDemand] = useState<any>(null)
  const [demandId, setDemandId] = useState<string | null>(null)

  useDidShow(() => {
    const params = Taro.getCurrentInstance().router?.params
    const id = params?.id

    let targetDemand: any = null

    if (currentDemand && (!id || currentDemand.id === id)) {
      targetDemand = currentDemand
    } else if (id) {
      targetDemand = demands.find(d => d.id === id) || null
    }

    if (targetDemand && targetDemand.id !== demandId) {
      setDemand(targetDemand)
      setDemandId(targetDemand.id)
      setCurrentDemand(targetDemand)
    } else if (!targetDemand && demand) {
      setDemand(null)
      setDemandId(null)
    }
  })

  if (!demand) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyLoading}>
          <Text style={{ fontSize: 64, marginBottom: 24 }}>📋</Text>
          <Text style={{ fontSize: 28, color: '#86909c' }}>加载中...</Text>
        </View>
      </ScrollView>
    )
  }

  const statusInfo = DemandStatusMap[demand.status] || DemandStatusMap.draft
  const relatedReviews = reviewItems.filter(r => r.demandId === demand.id)
  const matchedCount = demand.matchedCount || 0
  const respondedCount = relatedReviews.length || (demand.responseCount || 0)
  const shortlistedCount = relatedReviews.filter(r => r.reviewStatus === 'shortlisted').length

  const handleGoMatch = () => {
    Taro.switchTab({ url: '/pages/match/index' })
  }

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerBanner}>
        <View className={styles.statusRow}>
          <Text className={styles.demandCode}>需求编号：{demand.id}</Text>
          <StatusTag label={statusInfo.label} color={statusInfo.color} size="small" />
        </View>
        <Text className={styles.titleText}>{demand.title}</Text>
        <View className={styles.metaRow}>
          <View className={styles.metaItem}>📅 发布于 {demand.createdAt}</View>
          <View className={styles.metaItem}>⏰ 剩余 {getDaysRemaining(demand.deadline)} 天</View>
          <Text className={styles.budgetBadge}>💰 {formatBudget(demand.budgetMin, demand.budgetMax)}</Text>
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>需求描述</Text>
          </View>
          <Text className={styles.descText}>{demand.description}</Text>
        </View>

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>需求规格</Text>
          </View>
          <View className={styles.infoGrid}>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>所属行业</Text>
              <Text className={styles.infoValue}>{demand.industry}</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>覆盖地域</Text>
              <Text className={styles.infoValue}>{demand.region}</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>更新频率</Text>
              <Text className={styles.infoValue}>{demand.updateFrequency}</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>样本范围</Text>
              <Text className={styles.infoValue}>{demand.sampleScope}</Text>
            </View>
          </View>
        </View>

        {demand.supplements && demand.supplements.length > 0 && (
          <View className={styles.card}>
            <View className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              <Text>补充说明文件</Text>
            </View>
            <View className={styles.fileList}>
              {demand.supplements.map((file, idx) => (
                <View key={idx} className={styles.fileItem}>
                  <View className={styles.fileIcon}>📄</View>
                  <View className={styles.fileInfo}>
                    <Text className={styles.fileName}>{file.name}</Text>
                    <Text className={styles.fileMeta}>{file.size} · 上传于 {file.uploadTime}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>匹配进度</Text>
          </View>
          <View className={styles.matchSummary}>
            <View className={styles.matchStat}>
              <Text className={styles.statNum}>{matchedCount}</Text>
              <Text className={styles.statLabel}>匹配供应方</Text>
            </View>
            <View className={styles.matchStat}>
              <Text className={`${styles.statNum} ${styles.statNumPurple}`}>{respondedCount}</Text>
              <Text className={styles.statLabel}>已响应</Text>
            </View>
            <View className={styles.matchStat}>
              <Text className={styles.statNum} style={{ color: '#ff7d00' }}>{shortlistedCount}</Text>
              <Text className={styles.statLabel}>已入围</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.sectionTitle}>
            <View className={styles.titleDot} />
            <Text>操作日志</Text>
          </View>
          <View className={styles.timeline}>
            <View className={styles.timelineItem}>
              <View className={styles.timelineDot}>✓</View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>需求创建成功</Text>
                <Text className={styles.timelineTime}>{demand.createdAt} 10:30</Text>
              </View>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.timelineDot}>✓</View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>需求发布，开始智能匹配</Text>
                <Text className={styles.timelineTime}>{demand.createdAt} 10:35</Text>
              </View>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.timelineDot}>✓</View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>已匹配 {matchedCount} 家供应方</Text>
                <Text className={styles.timelineTime}>{demand.createdAt} 14:20</Text>
              </View>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.timelineDot}>✓</View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>收到 {respondedCount} 份响应报价</Text>
                <Text className={styles.timelineTime}>{demand.createdAt} 16:45</Text>
              </View>
            </View>
            <View className={styles.timelineItem}>
              <View className={`${styles.timelineDot} ${styles.timelineDotGray}`}>·</View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineTitle}>预计截止日期</Text>
                <Text className={styles.timelineTime}>{demand.deadline}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnGhost} onClick={handleEdit}>
          <Text>编辑需求</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleGoMatch}>
          <Text>查看匹配结果</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default DemandDetailPage
