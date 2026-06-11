// 数据需求类型
export interface DataDemand {
  id: string
  title: string
  description: string
  industry: string
  region: string
  updateFrequency: string
  sampleScope: string
  budgetMin: number
  budgetMax: number
  deadline: string
  createdAt: string
  status: DemandStatus
  matchedCount: number
  responseCount: number
  supplements?: SupplementFile[]
}

export type DemandStatus = 'draft' | 'published' | 'matching' | 'reviewing' | 'negotiating' | 'closed' | 'completed'

export const DemandStatusMap: Record<DemandStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: '#86909C' },
  published: { label: '已发布', color: '#165DFF' },
  matching: { label: '匹配中', color: '#722ED1' },
  reviewing: { label: '评审中', color: '#0FC6C2' },
  negotiating: { label: '商谈中', color: '#FF7D00' },
  closed: { label: '已关闭', color: '#86909C' },
  completed: { label: '已成交', color: '#00B42A' }
}

export interface SupplementFile {
  id: string
  name: string
  size: string
  uploadTime: string
}

// 数据产品/供应方类型
export interface DataSupplier {
  id: string
  name: string
  productName: string
  productDesc: string
  industry: string
  region: string
  matchScore: number
  isFavorite: boolean
  dataVolume: string
  updateFrequency: string
  samplePreview: string
  price: number
  priceUnit: string
  deliveryMethod: string
  contactPerson: string
  contactPhone: string
  rating: number
  dealCount: number
  certifications: string[]
  tags: string[]
}

// 沟通记录类型
export interface Conversation {
  id: string
  supplierId: string
  supplierName: string
  avatarId: number
  demandId: string
  demandTitle: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  sender: 'me' | 'supplier'
  content: string
  type: 'text' | 'file' | 'image'
  timestamp: string
}

// 评审类型
export interface ReviewItem {
  id: string
  demandId: string
  demandTitle: string
  supplierId: string
  supplierName: string
  productName: string
  matchScore: number
  quotePrice: number
  deliveryMethod: string
  deliveryCycle: string
  reviewStatus: ReviewStatus
  reviewNotes: string
  createdAt: string
  contractStatus?: 'pending' | 'signed' | 'rejected'
}

export type ReviewStatus = 'pending' | 'shortlisted' | 'rejected' | 'negotiating' | 'won'

export const ReviewStatusMap: Record<ReviewStatus, { label: string; color: string }> = {
  pending: { label: '待评审', color: '#86909C' },
  shortlisted: { label: '入围', color: '#165DFF' },
  rejected: { label: '淘汰', color: '#F53F3F' },
  negotiating: { label: '商谈中', color: '#FF7D00' },
  won: { label: '中标', color: '#00B42A' }
}

// 满意度评价类型
export interface SatisfactionRating {
  id: string
  demandId: string
  demandTitle: string
  supplierId: string
  supplierName: string
  overallRating: number
  dataQuality: number
  deliveryTimeliness: number
  serviceQuality: number
  priceReasonableness: number
  comment: string
  createdAt: string
}

// 选项枚举类型
export const IndustryOptions = [
  '金融服务', '电子商务', '医疗健康', '教育培训', '物流运输',
  '零售消费', '制造业', '房地产', '文化传媒', '能源环保',
  '政务数据', '农业农村', '人工智能', '其他'
]

export const RegionOptions = [
  '全国', '华东地区', '华南地区', '华北地区', '华中地区',
  '西南地区', '西北地区', '东北地区', '北京市', '上海市',
  '广东省', '江苏省', '浙江省', '其他省份'
]

export const FrequencyOptions = [
  '实时更新', '每日更新', '每周更新', '每月更新', '每季度更新',
  '每半年更新', '每年更新', '一次性数据'
]

export const SampleScopeOptions = [
  '全量数据', '抽样10%', '抽样25%', '抽样50%', '抽样75%',
  '指定区域样本', '自定义范围'
]

export const BudgetRanges = [
  { min: 0, max: 10000, label: '1万以下' },
  { min: 10000, max: 50000, label: '1万-5万' },
  { min: 50000, max: 100000, label: '5万-10万' },
  { min: 100000, max: 500000, label: '10万-50万' },
  { min: 500000, max: 1000000, label: '50万-100万' },
  { min: 1000000, max: 99999999, label: '100万以上' }
]

export const DeliveryMethodOptions = [
  'API接口调用', '数据文件下载', '数据库直连', 'SaaS平台访问',
  '定制化开发', '私有化部署'
]
