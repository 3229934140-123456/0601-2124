import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import { DemandStatusMap, ReviewStatusMap, ContractStatusMap, AcceptanceStatusMap } from '@/types'
import StatusTag from '@/components/StatusTag'
import { formatPrice } from '@/utils'

const MinePage: React.FC = () => {
  const demands = useAppStore(state => state.demands)
  const reviewItems = useAppStore(state => state.reviewItems)
  const satisfactionRatings = useAppStore(state => state.satisfactionRatings)
  const favorites = useAppStore(state => state.favorites)
  const conversations = useAppStore(state => state.conversations)
  const contractFollowUps = useAppStore(state => state.contractFollowUps)

  const stats = useMemo(() => {
    const totalDemands = demands.length
    const activeDemands = demands.filter(d => !['completed', 'closed'].includes(d.status)).length
    const completedDemands = demands.filter(d => d.status === 'completed').length
    const pendingReviews = reviewItems.filter(r => r.reviewStatus === 'pending').length
    const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0)
    const pendingContracts = contractFollowUps.filter(c => c.contractStatus !== 'signed').length
    return { totalDemands, activeDemands, completedDemands, pendingReviews, unreadMessages, favoritesCount: favorites.length, pendingContracts }
  }, [demands, reviewItems, favorites, conversations, contractFollowUps])

  const myRecentDemands = useMemo(() => demands.slice(0, 3), [demands])
  const pendingReviewList = useMemo(() => reviewItems.filter(r => r.reviewStatus === 'pending').slice(0, 2), [reviewItems])
  const completedDeals = useMemo(() => reviewItems.filter(r => r.reviewStatus === 'won'), [reviewItems])

  const handleNavigate = (tab?: string, path?: string) => {
    if (tab) {
      Taro.switchTab({ url: `/pages/${tab}/index` })
    } else if (path) {
      Taro.navigateTo({ url: path })
    }
  }

  useDidShow(() => {
    console.log('[Mine] Page showed, demands:', demands.length)
  })

  return (
    <ScrollView scrollY className={styles.page} enhanced showScrollbar={false}>
      <View className={styles.headerSection}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>李</View>
          <View className={styles.userDetails}>
            <Text className={styles.userName}>李明轩</Text>
            <Text className={styles.userCompany}>🏢 某科技有限公司 · 采购部</Text>
            <View className={styles.userRole}>认证企业采购 · V2会员</View>
          </View>
        </View>
        <View className={styles.statsBanner}>
          <View className={styles.statsBannerItem}>
            <Text className={styles.statsBannerValue}>{stats.totalDemands}</Text>
            <Text className={styles.statsBannerLabel}>发布需求</Text>
          </View>
          <View className={styles.statsBannerItem}>
            <Text className={styles.statsBannerValue}>{stats.activeDemands}</Text>
            <Text className={styles.statsBannerLabel}>进行中</Text>
          </View>
          <View className={styles.statsBannerItem}>
            <Text className={styles.statsBannerValue}>{stats.completedDemands}</Text>
            <Text className={styles.statsBannerLabel}>已成交</Text>
          </View>
          <View className={styles.statsBannerItem}>
            <Text className={styles.statsBannerValue}>{stats.favoritesCount}</Text>
            <Text className={styles.statsBannerLabel}>收藏</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={() => handleNavigate('publish')}>
          <Text className={styles.actionIcon}>📋</Text>
          <Text className={styles.actionText}>发布需求</Text>
        </View>
        <View className={styles.actionCard} onClick={() => handleNavigate('match')}>
          <Text className={styles.actionIcon}>🎯</Text>
          <Text className={styles.actionText}>供应匹配</Text>
          {stats.pendingReviews > 0 && <View className={styles.actionBadge}>{stats.pendingReviews}</View>}
        </View>
        <View className={styles.actionCard} onClick={() => handleNavigate('communication')}>
          <Text className={styles.actionIcon}>💬</Text>
          <Text className={styles.actionText}>沟通记录</Text>
          {stats.unreadMessages > 0 && <View className={styles.actionBadge}>{stats.unreadMessages}</View>}
        </View>
        <View className={styles.actionCard} onClick={() => handleNavigate('review')}>
          <Text className={styles.actionIcon}>⚖️</Text>
          <Text className={styles.actionText}>评审清单</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📑</Text>
            我的需求列表
          </View>
          <View className={styles.sectionMore} onClick={() => handleNavigate('match')}>
            查看全部 <Text>›</Text>
          </View>
        </View>
        <View className={styles.sectionContent}>
          {myRecentDemands.map(demand => {
            const statusInfo = DemandStatusMap[demand.status]
            return (
              <View
                key={demand.id}
                className={styles.menuItem}
                onClick={() => Taro.navigateTo({ url: `/pages/demand-detail/index?id=${demand.id}` })}
              >
                <View className={classnames(styles.menuIcon, styles.menuIconOrange)}>📄</View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{demand.title}</Text>
                  <Text className={styles.menuSubtitle}>
                    {demand.industry} · {demand.region} · 预算{demand.budgetMin >= 10000 ? `${(demand.budgetMin/10000).toFixed(0)}万起` : `${demand.budgetMin}元起`}
                  </Text>
                </View>
                <View className={styles.menuBadge} style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}>
                  {statusInfo.label}
                </View>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⏰</Text>
            待办事项
          </View>
          <View className={styles.sectionMore} onClick={() => handleNavigate('review')}>
            处理 <Text>›</Text>
          </View>
        </View>
        <View className={styles.reviewMiniList}>
          {pendingReviewList.length > 0 ? (
            pendingReviewList.map(review => (
              <View
                key={review.id}
                className={styles.reviewMiniItem}
                onClick={() => handleNavigate('review')}
              >
                <View className={styles.reviewMiniLeft}>
                  <Text className={styles.reviewMiniTitle}>{review.supplierName}</Text>
                  <Text className={styles.reviewMiniSub}>
                    <Text>{review.demandTitle}</Text>
                  </Text>
                </View>
                <View className={classnames(styles.menuBadge, styles.menuBadgeOrange)}>待评审</View>
              </View>
            ))
          ) : (
            <View className={styles.emptyNotice}>🎉 暂无待办事项，去看看新的匹配结果吧</View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📄</Text>
            合同跟进
          </View>
          <View className={styles.sectionMore} onClick={() => handleNavigate('review')}>
            全部跟进 <Text>›</Text>
          </View>
        </View>
        <View className={styles.sectionContent}>
          {contractFollowUps.length > 0 ? (
            contractFollowUps.slice(0, 3).map(contract => {
              const statusInfo = ContractStatusMap[contract.contractStatus]
              const pendingPayments = contract.paymentNodes.filter(n => n.status === 'pending').length
              return (
                <View
                  key={contract.id}
                  className={styles.contractItem}
                  onClick={() => Taro.navigateTo({ url: `/pages/contract-followup/index?reviewId=${contract.reviewId}` })}
                >
                  <View className={styles.contractItemLeft}>
                    <View className={styles.contractIcon}>📄</View>
                    <View className={styles.contractItemInfo}>
                      <Text className={styles.contractItemTitle}>{contract.demandTitle}</Text>
                      <Text className={styles.contractItemSub}>{contract.supplierName}</Text>
                      <View className={styles.contractItemTags}>
                        <StatusTag label={statusInfo.label} color={statusInfo.color} size="small" />
                        {contract.acceptanceStatus === 'pending' && contract.contractStatus === 'signed' && (
                          <StatusTag label="待验收" color="#FF7D00" size="small" />
                        )}
                        {pendingPayments > 0 && (
                          <StatusTag label={`${pendingPayments}笔待付款`} color="#FF7D00" size="small" />
                        )}
                      </View>
                    </View>
                  </View>
                  <View className={styles.contractItemRight}>
                    <Text className={styles.contractItemAmount}>¥{formatPrice(contract.totalAmount)}</Text>
                    <Text className={styles.contractItemArrow}>›</Text>
                  </View>
                </View>
              )
            })
          ) : (
            <View className={styles.emptyNotice}>📄 暂无合同跟进项，中标后可创建合同</View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⭐</Text>
            已成交评价
          </View>
          <View className={styles.sectionMore}>
            共{completedDeals.length}单 <Text>›</Text>
          </View>
        </View>
        <View className={styles.sectionContent}>
          {satisfactionRatings.length > 0 ? (
            satisfactionRatings.map(rating => {
              const dealReview = reviewItems.find(r =>
                r.demandId === rating.demandId && r.supplierId === rating.supplierId
              )
              const handleGoReview = () => {
                if (dealReview) {
                  Taro.navigateTo({ url: `/pages/deal-review/index?reviewId=${dealReview.id}` })
                }
              }
              return (
                <View key={rating.id} className={styles.ratingFullCard} onClick={handleGoReview}>
                  <View className={styles.ratingFullHeader}>
                    <View className={styles.ratingSupplierInfo}>
                      <Text className={styles.ratingSupplierName}>{rating.supplierName}</Text>
                      <View className={styles.ratingStarsRow}>
                        <View className={styles.ratingStars}>
                          {[1,2,3,4,5].map(i => (
                            <Text key={i} className={styles.starFull}>{i <= rating.overallRating ? '★' : '☆'}</Text>
                          ))}
                        </View>
                        <Text className={styles.ratingScore}>{rating.overallRating}.0</Text>
                      </View>
                    </View>
                    <Text className={styles.ratingDate}>{rating.createdAt}</Text>
                  </View>

                  <View className={styles.ratingDemandRow}>
                    <Text className={styles.ratingDemandLabel}>需求</Text>
                    <Text className={styles.ratingDemandValue}>{rating.demandTitle}</Text>
                  </View>

                  <View className={styles.ratingMetaRow}>
                    <View className={styles.ratingMetaItem}>
                      <Text className={styles.ratingMetaLabel}>成交金额</Text>
                      <Text className={styles.ratingMetaPrice}>¥{formatPrice(dealReview?.quotePrice || 0)}</Text>
                    </View>
                    <View className={styles.ratingMetaItem}>
                      <Text className={styles.ratingMetaLabel}>交付方式</Text>
                      <Text className={styles.ratingMetaValue}>{dealReview?.deliveryMethod || '-'}</Text>
                    </View>
                    <View className={styles.ratingMetaItem}>
                      <Text className={styles.ratingMetaLabel}>数据质量</Text>
                      <Text className={styles.ratingMetaValue}>{rating.dataQuality}分</Text>
                    </View>
                  </View>

                  {rating.comment && (
                    <View className={styles.ratingCommentBox}>
                      <Text className={styles.ratingCommentText}>{rating.comment}</Text>
                    </View>
                  )}

                  <View className={styles.ratingReviewBtn} onClick={(e: any) => { e.stopPropagation(); handleGoReview() }}>
                    <Text>📋 查看复盘详情 →</Text>
                  </View>
                </View>
              )
            })
          ) : null}

          {completedDeals.filter(d => !satisfactionRatings.find(r => r.demandId === d.demandId && r.supplierId === d.supplierId)).length > 0 && (
            <View style={{ padding: satisfactionRatings.length > 0 ? '0 24rpx 24rpx' : '0' }}>
              {satisfactionRatings.length > 0 && <Text className={styles.ratingSectionDivider}>待评价（{completedDeals.filter(d => !satisfactionRatings.find(r => r.demandId === d.demandId && r.supplierId === d.supplierId)).length}）</Text>}
              {completedDeals
                .filter(d => !satisfactionRatings.find(r => r.demandId === d.demandId && r.supplierId === d.supplierId))
                .slice(0, 3)
                .map(deal => (
                  <View
                    key={deal.id}
                    className={styles.pendingRatingItem}
                    onClick={() => Taro.navigateTo({
                      url: `/pages/satisfaction/index?reviewId=${deal.id}&demandId=${deal.demandId}&supplierId=${deal.supplierId}`
                    })}
                  >
                    <View className={styles.pendingRatingInfo}>
                      <Text className={styles.pendingRatingTitle}>{deal.supplierName}</Text>
                      <Text className={styles.pendingRatingSub}>{deal.demandTitle}</Text>
                    </View>
                    <View className={styles.pendingRatingRight}>
                      <Text className={styles.pendingRatingPrice}>¥{formatPrice(deal.quotePrice)}</Text>
                      <View className={styles.pendingRatingBtn}>去评价</View>
                    </View>
                  </View>
                ))}
            </View>
          )}

          {satisfactionRatings.length === 0 && completedDeals.filter(d => !satisfactionRatings.find(r => r.demandId === d.demandId && r.supplierId === d.supplierId)).length === 0 && (
            <View className={styles.menuItem} onClick={() => handleNavigate('review')}>
              <View className={classnames(styles.menuIcon, styles.menuIconGreen)}>✅</View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>暂无成交评价</Text>
                <Text className={styles.menuSubtitle}>完成采购后可对供应方进行评价</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚙️</Text>
            更多服务
          </View>
        </View>
        <View className={styles.sectionContent}>
          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.menuIconPurple)}>📊</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>采购数据分析</Text>
              <Text className={styles.menuSubtitle}>查看采购趋势和成本分析报告</Text>
            </View>
            <View className={classnames(styles.menuBadge, styles.menuBadgeGreen)}>新功能</View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.menuIconCyan)}>📜</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>合同管理</Text>
              <Text className={styles.menuSubtitle}>采购合同归档和电子签署</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.menuIconOrange)}>🛡️</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>数据合规咨询</Text>
              <Text className={styles.menuSubtitle}>专业团队助力数据采购合规审查</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={classnames(styles.menuIcon, styles.menuIconRed)}>🎧</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>联系客服</Text>
              <Text className={styles.menuSubtitle}>7x24小时专业服务支持</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View style={{ textAlign: 'center', padding: '32rpx', fontSize: '22rpx', color: '#86909C' }}>
        数据要素流通平台 v1.0.0
      </View>
    </ScrollView>
  )
}

export default MinePage
