import { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import { formatPrice, formatBudget, getMatchScoreColor } from '@/utils'
import styles from './index.module.scss'

const ComparisonDetailPage = () => {
  const reviewItems = useAppStore(state => state.reviewItems)
  const suppliers = useAppStore(state => state.suppliers)
  const demands = useAppStore(state => state.demands)
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { key: 'all', label: '全部维度' },
    { key: 'price', label: '价格对比' },
    { key: 'quality', label: '质量维度' },
    { key: 'service', label: '服务能力' },
  ]

  const demandId = Taro.getCurrentInstance().router?.params?.demandId

  const activeDemand = useMemo(() => {
    if (demandId) return demands.find(d => d.id === demandId)
    const firstDemandId = reviewItems.find(r => ['shortlisted', 'negotiating', 'won'].includes(r.reviewStatus))?.demandId
    return demands.find(d => d.id === firstDemandId) || demands[0]
  }, [demandId, demands, reviewItems])

  const shortlisted = useMemo(() =>
    reviewItems.filter(r =>
      r.demandId === (activeDemand?.id || '') &&
      ['shortlisted', 'negotiating', 'won'].includes(r.reviewStatus)
    ),
    [reviewItems, activeDemand]
  )

  const comparisonData = useMemo(() =>
    shortlisted.map(review => {
      const supplier = suppliers.find(s => s.id === review.supplierId)
      return {
        id: review.id,
        supplierId: review.supplierId,
        name: review.supplierName,
        logo: supplier?.name?.charAt(0) || '数',
        matchScore: review.matchScore,
        price: review.quotePrice,
        deliveryMethod: review.deliveryMethod,
        deliveryCycle: review.deliveryCycle,
        rating: supplier?.rating || 4.5,
        dataVolume: supplier?.dataVolume || '-',
        updateFrequency: supplier?.updateFrequency || '-',
        dealCount: supplier?.dealCount || 0,
        tags: supplier?.tags || [],
        reviewNotes: review.reviewNotes,
        reviewStatus: review.reviewStatus,
      }
    }).sort((a, b) => b.matchScore - a.matchScore),
    [shortlisted, suppliers]
  )

  const minPrice = comparisonData.length > 0 ? Math.min(...comparisonData.map(c => c.price)) : 0
  const highestScore = comparisonData.length > 0 ? Math.max(...comparisonData.map(c => c.matchScore)) : 0

  if (comparisonData.length < 2) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.headerCard}>
          <Text className={styles.demandTitle}>需求比对表</Text>
        </View>
        <View className={styles.recommendCard}>
          <View className={styles.recommendHeader}>
            <View className={styles.recommendIcon}>⚠️</View>
            <Text className={styles.recommendTitle}>入围供应方不足</Text>
          </View>
          <Text className={styles.recommendText}>
            当前入围供应方仅{comparisonData.length}家，至少需要2家入围供应方才能生成比对表。请返回评审清单，将更多供应方标记为"入围"状态。
          </Text>
        </View>
        <View className={styles.bottomBar}>
          <View className={styles.btnPrimary} onClick={() => Taro.switchTab({ url: '/pages/review/index' })}>
            <Text>返回评审清单</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  const handleExport = () => {
    Taro.showToast({ title: '比对表已导出到邮箱', icon: 'success' })
  }

  const handleGoReview = () => {
    Taro.switchTab({ url: '/pages/review/index' })
  }

  const renderProgress = (value, max, color) => {
    const percent = Math.min((value / max) * 100, 100)
    return (
      <View className={styles.rowValue}>
        <View className={styles.progressWrap}>
          <View
            className={styles.progressBar}
            style={{ width: `${percent}%`, background: color }}
          />
        </View>
        <Text className={styles.progressText}>{value}%</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.demandTitle}>{activeDemand?.title || '需求比对表'}</Text>
        <View className={styles.demandMeta}>
          <Text className={styles.metaBadge}>🏢 {activeDemand?.industry || '-'}</Text>
          <Text className={styles.metaBadge}>📍 {activeDemand?.region || '-'}</Text>
          <Text className={styles.metaBadge}>📊 {activeDemand?.sampleScope || '-'}</Text>
          <Text className={styles.metaBadge}>💰 预算 {formatBudget(activeDemand?.budgetMin || 0, activeDemand?.budgetMax || 0)}</Text>
        </View>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{comparisonData.length}</Text>
            <Text className={styles.summaryLabel}>入围供应商</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{highestScore}</Text>
            <Text className={styles.summaryLabel}>最高匹配分</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryNum}>{formatPrice(minPrice)}</Text>
            <Text className={styles.summaryLabel}>最低报价</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filters.map(f => (
          <View
            key={f.key}
            className={`${styles.filterChip} ${activeFilter === f.key ? styles.filterChipActive : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text>{f.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.recommendCard}>
        <View className={styles.recommendHeader}>
          <View className={styles.recommendIcon}>💡</View>
          <Text className={styles.recommendTitle}>智能推荐</Text>
        </View>
        <Text className={styles.recommendText}>
          基于多维综合评分，建议优先选择「{comparisonData[0]?.name}」。
          该供应商匹配度最高{highestScore}分，报价{formatPrice(comparisonData[0]?.price)}，
          历史成交{comparisonData[0]?.dealCount}笔，综合表现最优。
        </Text>
      </View>

      <View className={styles.compareSection}>
        {comparisonData.map((item, idx) => (
          <View key={item.id} className={styles.compareCard}>
            <View className={styles.compareHeader}>
              <View className={styles.supplierShort}>
                <View className={styles.supplierLogo}>{item.logo}</View>
                <Text className={styles.supplierName}>
                  {idx + 1}. {item.name}
                </Text>
              </View>
              <View
                className={styles.scoreBadge}
                style={{ background: `linear-gradient(135deg, ${getMatchScoreColor(item.matchScore)} 0%, ${getMatchScoreColor(Math.round(item.matchScore * 0.8))} 100%)` }}
              >
                匹配 {item.matchScore}
              </View>
            </View>

            <View className={styles.compareBody}>
              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>报价金额</Text>
                <View className={styles.rowValue}>
                  <Text className={item.price === minPrice ? styles.highlightSuccess : styles.highlightDanger}>
                    ¥{formatPrice(item.price)}
                  </Text>
                  {item.price === minPrice && <Text className={styles.bestBadge}>最优价</Text>}
                </View>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>匹配度</Text>
                {renderProgress(item.matchScore, 100, `linear-gradient(90deg, ${getMatchScoreColor(Math.round(item.matchScore * 0.6))}, ${getMatchScoreColor(item.matchScore)})`)}
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>交付方式</Text>
                <Text className={`${styles.rowValue} ${styles.highlight}`}>{item.deliveryMethod}</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>交付周期</Text>
                <Text className={`${styles.rowValue} ${styles.highlight}`}>{item.deliveryCycle}</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>综合评分</Text>
                <View className={styles.rowValue}>
                  <Text style={{ color: '#ffa940' }}>★★★★★</Text>
                  <Text className={styles.highlight}>{item.rating}分</Text>
                </View>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>数据规模</Text>
                <Text className={`${styles.rowValue} ${styles.highlight}`}>{item.dataVolume}</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>历史成交</Text>
                <Text className={`${styles.rowValue} ${styles.highlight}`}>{item.dealCount}笔</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>数据标签</Text>
                <View className={styles.tagsRow}>
                  {item.tags?.slice(0, 5).map((tag, i) => (
                    <Text key={i} className={`${styles.valueTag} ${i < 2 ? styles.valueTagBlue : ''}`}>{tag}</Text>
                  ))}
                </View>
              </View>

              {item.reviewNotes && (
                <View className={styles.compareRow}>
                  <Text className={styles.rowLabel}>评审备注</Text>
                  <Text className={`${styles.rowValue}`} style={{ lineHeight: 1.7, color: '#595959' }}>
                    {item.reviewNotes}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.btnGhost} onClick={handleExport}>
          <Text>📤 导出比对表</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleGoReview}>
          <Text>继续评审决策</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ComparisonDetailPage
