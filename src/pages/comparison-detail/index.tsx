import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mockSuppliers, mockReviews } from '../../data/mock'
import { formatPrice, getMatchScoreColor } from '../../utils'
import styles from './index.module.scss'

const ComparisonDetailPage = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { key: 'all', label: '全部维度' },
    { key: 'price', label: '价格对比' },
    { key: 'quality', label: '质量维度' },
    { key: 'service', label: '服务能力' },
  ]

  const shortlisted = mockReviews.filter(r => r.status !== 'eliminated' && r.status !== 'pending')
  const comparisonData = shortlisted.map(review => {
    const supplier = mockSuppliers.find(s => s.id === review.supplierId) || mockSuppliers[0]
    return {
      id: review.id,
      supplierId: review.supplierId,
      name: supplier.name,
      logo: supplier.logo,
      matchScore: review.matchScore,
      price: review.quoteAmount,
      deliveryMethod: review.deliveryMethod,
      deliveryCycle: review.deliveryCycle,
      rating: supplier.rating,
      responseTime: supplier.responseTime,
      deliveryRate: supplier.deliveryRate,
      transactionCount: supplier.transactionCount,
      tags: supplier.tags,
      reviewNote: review.reviewNote,
    }
  }).sort((a, b) => b.matchScore - a.matchScore)

  const minPrice = Math.min(...comparisonData.map(c => c.price))
  const highestScore = Math.max(...comparisonData.map(c => c.matchScore))

  const handleExport = () => {
    Taro.showToast({ title: '比对表已导出到邮箱', icon: 'success' })
  }

  const handleGoReview = () => {
    Taro.switchTab({ url: '/pages/review/index' })
  }

  const renderProgress = (value, max, color) => {
    const percent = (value / max) * 100
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
        <Text className={styles.demandTitle}>用户行为分析数据集采购需求</Text>
        <View className={styles.demandMeta}>
          <Text className={styles.metaBadge}>🏢 互联网</Text>
          <Text className={styles.metaBadge}>📍 全国</Text>
          <Text className={styles.metaBadge}>📊 样本量2000万+</Text>
          <Text className={styles.metaBadge}>💰 预算 20-50万</Text>
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
          基于多维综合评分，建议优先选择「{comparisonData[0]?.name || '数智洞察科技'}」。
          该供应商匹配度最高{highestScore}分，报价{formatPrice(comparisonData[0]?.price)}在预算范围内，
          历史成交{comparisonData[0]?.transactionCount || 168}笔，按时交付率达{comparisonData[0]?.deliveryRate || 99}%，综合表现最优。
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
                style={{ background: `linear-gradient(135deg, ${getMatchScoreColor(item.matchScore)} 0%, ${getMatchScoreColor(item.matchScore * 0.8)} 100%)` }}
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
                {renderProgress(item.matchScore, 100, `linear-gradient(90deg, ${getMatchScoreColor(item.matchScore * 0.6)}, ${getMatchScoreColor(item.matchScore)})`)}
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>交付方式</Text>
                <Text className={styles.rowValue}>{item.deliveryMethod}</Text>
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
                <Text className={styles.rowLabel}>响应时间</Text>
                <Text className={`${styles.rowValue} ${styles.highlightWarn}`}>{item.responseTime}</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>按时交付率</Text>
                {renderProgress(item.deliveryRate, 100, 'linear-gradient(90deg, #73d13d, #389e0d)')}
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>历史成交</Text>
                <Text className={`${styles.rowValue} ${styles.highlight}`}>{item.transactionCount}笔</Text>
              </View>

              <View className={styles.compareRow}>
                <Text className={styles.rowLabel}>数据标签</Text>
                <View className={styles.tagsRow}>
                  {item.tags?.slice(0, 5).map((tag, i) => (
                    <Text key={i} className={`${styles.valueTag} ${i < 2 ? styles.valueTagBlue : ''}`}>{tag}</Text>
                  ))}
                </View>
              </View>

              {item.reviewNote && (
                <View className={styles.compareRow}>
                  <Text className={styles.rowLabel}>评审备注</Text>
                  <Text className={`${styles.rowValue}`} style={{ lineHeight: 1.7, color: '#595959' }}>
                    {item.reviewNote}
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
