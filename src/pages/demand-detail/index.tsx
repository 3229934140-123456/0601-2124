import { useState } from 'react'
import { View, Text, ScrollView, useRouter } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useStore } from '../../store'
import { mockReviews } from '../../data/mock'
import { getDaysRemaining, formatBudget, formatPrice } from '../../utils'
import StatusTag from '../../components/StatusTag'
import styles from './index.module.scss'

const DemandDetailPage = () => {
  const router = useRouter()
  const { demandId } = router.params
  const { demands, suppliers, reviews } = useStore()
  const [demand, setDemand] = useState<any>(null)

  useDidShow(() => {
    const found = demands.find(d => d.id === demandId) || demands[0]
    setDemand(found)
  })

  if (!demand) return null

  const matchedCount = suppliers.filter(s => {
    if (demand.industry && s.industries?.includes(demand.industry)) return true
    return Math.random() > 0.4
  }).length || 5

  const relatedReviews = reviews.filter(r => r.demandId === demand.id) || mockReviews.filter(r => r.demandId === demand.id)
  const respondedCount = relatedReviews.length || 3

  const statusTagMap: Record<string, { label: string; color: string; bgColor: string }> = {
    draft: { label: '草稿', color: '#86909c', bgColor: 'rgba(134,144,156,0.1)' },
    published: { label: '已发布', color: '#165dff', bgColor: 'rgba(22,93,255,0.1)' },
    matching: { label: '匹配中', color: '#722ed1', bgColor: 'rgba(114,46,209,0.1)' },
    reviewing: { label: '评审中', color: '#ff7d00', bgColor: 'rgba(255,125,0,0.1)' },
    negotiating: { label: '商谈中', color: '#13c2c2', bgColor: 'rgba(19,194,194,0.1)' },
    completed: { label: '已成交', color: '#00b42a', bgColor: 'rgba(0,180,42,0.1)' },
    expired: { label: '已过期', color: '#f53f3f', bgColor: 'rgba(245,63,63,0.1)' },
  }
  const statusInfo = statusTagMap[demand.status] || statusTagMap.draft

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
          <Text className={styles.demandCode}>需求编号：{demand.code}</Text>
          <StatusTag label={statusInfo.label} color={statusInfo.color} bgColor={statusInfo.bgColor} size="small" />
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
              <Text className={styles.infoValue}>{demand.frequency}</Text>
            </View>
            <View className={styles.infoCell}>
              <Text className={styles.infoLabel}>样本范围</Text>
              <Text className={styles.infoValue}>{demand.sampleScope}</Text>
            </View>
          </View>
          <View className={styles.tagsWrap} style={{ marginTop: 24 }}>
            {demand.tags?.map((tag, idx) => (
              <View key={idx} className={styles.tagItem}>{tag}</View>
            ))}
          </View>
        </View>

        {demand.files && demand.files.length > 0 && (
          <View className={styles.card}>
            <View className={styles.sectionTitle}>
              <View className={styles.titleDot} />
              <Text>补充说明文件</Text>
            </View>
            <View className={styles.fileList}>
              {demand.files.map((file, idx) => (
                <View key={idx} className={styles.fileItem}>
                  <View className={styles.fileIcon}>📄</View>
                  <View className={styles.fileInfo}>
                    <Text className={styles.fileName}>{file.name}</Text>
                    <Text className={styles.fileMeta}>{file.size} · 上传于 {file.uploadedAt}</Text>
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
              <Text className={styles.statNum} style={{ color: '#ff7d00' }}>{relatedReviews.filter(r => r.status === 'shortlisted').length || 2}</Text>
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
