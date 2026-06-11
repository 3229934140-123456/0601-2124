import dayjs from 'dayjs'

export const formatPrice = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString()
}

export const formatBudget = (min: number, max: number): string => {
  if (max >= 99999999) {
    return `${formatPrice(min)}以上`
  }
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export const getDaysRemaining = (deadline: string): number => {
  const now = dayjs()
  const end = dayjs(deadline)
  return end.diff(now, 'day')
}

export const formatFileSize = (size: string): string => {
  return size
}

export const getMatchScoreColor = (score: number): string => {
  if (score >= 90) return '#00B42A'
  if (score >= 80) return '#165DFF'
  if (score >= 70) return '#FF7D00'
  return '#86909C'
}

export const generateStars = (rating: number): string[] => {
  const stars: string[] = []
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  for (let i = 0; i < full; i++) stars.push('full')
  if (half) stars.push('half')
  while (stars.length < 5) stars.push('empty')
  return stars
}

export const formatTimeFromNow = (time: string): string => {
  const now = dayjs()
  const target = dayjs(time)
  const diffMin = now.diff(target, 'minute')
  const diffHour = now.diff(target, 'hour')
  const diffDay = now.diff(target, 'day')

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  return target.format('MM-DD')
}

export const randomAvatar = (id: number): string => {
  const ids = [1, 2, 3, 6, 8, 9, 119, 160, 201]
  const avatarId = ids[id % ids.length] || 1
  return `https://picsum.photos/id/${avatarId}/200/200`
}
