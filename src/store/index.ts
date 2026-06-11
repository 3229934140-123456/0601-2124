import { create } from 'zustand'
import type {
  DataDemand, DataSupplier, Conversation, ChatMessage,
  ReviewItem, SatisfactionRating, DecisionRecord,
  ContractFollowUp, PaymentNode
} from '@/types'
import {
  mockDemands, mockSuppliers, mockConversations,
  mockChatMessages, mockReviewItems, mockSatisfactionRatings
} from '@/data/mock'

interface AppState {
  demands: DataDemand[]
  suppliers: DataSupplier[]
  conversations: Conversation[]
  chatMessages: ChatMessage[]
  reviewItems: ReviewItem[]
  satisfactionRatings: SatisfactionRating[]
  decisionRecords: DecisionRecord[]
  contractFollowUps: ContractFollowUp[]
  currentDemand: DataDemand | null
  currentSupplier: DataSupplier | null
  currentConversation: Conversation | null
  favorites: string[]

  setCurrentDemand: (demand: DataDemand | null) => void
  setCurrentSupplier: (supplier: DataSupplier | null) => void
  setCurrentConversation: (conv: Conversation | null) => void
  addDemand: (demand: DataDemand) => void
  updateDemand: (id: string, updates: Partial<DataDemand>) => void
  toggleFavorite: (supplierId: string) => void
  isFavorite: (supplierId: string) => boolean
  addConversation: (conv: Conversation) => void
  addReviewItem: (review: ReviewItem) => void
  updateReviewStatus: (reviewId: string, status: ReviewItem['reviewStatus'], notes?: string) => void
  updateReviewQuote: (reviewId: string, price: number, method: string, cycle?: string) => void
  addChatMessage: (conversationId: string, content: string) => void
  addSatisfactionRating: (rating: SatisfactionRating) => void
  getMessagesByConversation: (conversationId: string) => ChatMessage[]
  getReviewsByDemand: (demandId: string) => ReviewItem[]
  addDecisionRecord: (record: Omit<DecisionRecord, 'id' | 'createdAt' | 'operator'> & { operator?: string }) => void
  getDecisionRecordsByReview: (reviewId: string) => DecisionRecord[]
  getDecisionRecordsByDemand: (demandId: string) => DecisionRecord[]
  addContractFollowUp: (followUp: Omit<ContractFollowUp, 'id' | 'createdAt'>) => void
  updateContractFollowUp: (id: string, updates: Partial<ContractFollowUp>) => void
  getContractByReview: (reviewId: string) => ContractFollowUp | undefined
  updatePaymentNode: (contractId: string, nodeId: string, status: 'pending' | 'paid') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  demands: mockDemands,
  suppliers: mockSuppliers,
  conversations: mockConversations,
  chatMessages: mockChatMessages,
  reviewItems: mockReviewItems,
  satisfactionRatings: mockSatisfactionRatings,
  decisionRecords: [],
  contractFollowUps: [],
  currentDemand: null,
  currentSupplier: null,
  currentConversation: null,
  favorites: mockSuppliers.filter(s => s.isFavorite).map(s => s.id),

  setCurrentDemand: (demand) => set({ currentDemand: demand }),
  setCurrentSupplier: (supplier) => set({ currentSupplier: supplier }),
  setCurrentConversation: (conv) => set({ currentConversation: conv }),

  addDemand: (demand) => set((state) => ({
    demands: [demand, ...state.demands]
  })),

  updateDemand: (id, updates) => set((state) => ({
    demands: state.demands.map(d => d.id === id ? { ...d, ...updates } : d)
  })),

  toggleFavorite: (supplierId) => set((state) => {
    const exists = state.favorites.includes(supplierId)
    return {
      favorites: exists
        ? state.favorites.filter(id => id !== supplierId)
        : [...state.favorites, supplierId],
      suppliers: state.suppliers.map(s =>
        s.id === supplierId ? { ...s, isFavorite: !s.isFavorite } : s
      )
    }
  }),

  isFavorite: (supplierId) => get().favorites.includes(supplierId),

  addConversation: (conv) => set((state) => {
    const exists = state.conversations.find(c => c.supplierId === conv.supplierId && c.demandId === conv.demandId)
    if (exists) return state
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const newConv: Conversation = {
      id: conv.id || `CONV_${Date.now()}`,
      supplierId: conv.supplierId,
      supplierName: conv.supplierName,
      avatarId: conv.avatarId || Math.floor(Math.random() * 9) + 1,
      demandId: conv.demandId,
      demandTitle: conv.demandTitle,
      lastMessage: conv.lastMessage || '您好，我对贵司的数据产品很感兴趣，想详细了解一下。',
      lastMessageTime: conv.lastMessageTime || now,
      unreadCount: conv.unreadCount ?? 1,
    }
    const newMsg: ChatMessage = {
      id: `MSG_${Date.now()}`,
      conversationId: newConv.id,
      sender: 'me',
      content: newConv.lastMessage,
      type: 'text',
      timestamp: newConv.lastMessageTime,
    }
    return {
      conversations: [newConv, ...state.conversations],
      chatMessages: [...state.chatMessages, newMsg],
    }
  }),

  addReviewItem: (review) => set((state) => {
    const exists = state.reviewItems.find(r => r.supplierId === review.supplierId && r.demandId === review.demandId)
    if (exists) return state
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const newReview: ReviewItem = {
      id: review.id || `REV_${Date.now()}`,
      demandId: review.demandId,
      demandTitle: review.demandTitle,
      supplierId: review.supplierId,
      supplierName: review.supplierName,
      productName: review.productName,
      matchScore: review.matchScore,
      quotePrice: review.quotePrice,
      deliveryMethod: review.deliveryMethod,
      deliveryCycle: review.deliveryCycle,
      reviewStatus: review.reviewStatus || 'pending',
      reviewNotes: review.reviewNotes || '',
      createdAt: review.createdAt || now,
      updatedAt: review.updatedAt || now,
    }
    return {
      reviewItems: [newReview, ...state.reviewItems],
    }
  }),

  updateReviewStatus: (reviewId, status, notes) => set((state) => {
    const review = state.reviewItems.find(r => r.id === reviewId)
    if (!review) return state
    const previousStatus = review.reviewStatus
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    if (previousStatus === status) {
      return {
        reviewItems: state.reviewItems.map(r =>
          r.id === reviewId ? { ...r, reviewNotes: notes ?? r.reviewNotes, updatedAt: now } : r
        )
      }
    }
    const newRecord: DecisionRecord = {
      id: `DEC_${Date.now()}`,
      reviewId,
      demandId: review.demandId,
      demandTitle: review.demandTitle,
      supplierId: review.supplierId,
      supplierName: review.supplierName,
      action: status,
      previousStatus,
      notes: notes || '',
      operator: '李明轩',
      createdAt: now,
    }
    return {
      reviewItems: state.reviewItems.map(r =>
        r.id === reviewId ? { ...r, reviewStatus: status, reviewNotes: notes ?? r.reviewNotes, updatedAt: now } : r
      ),
      decisionRecords: [...state.decisionRecords, newRecord],
    }
  }),

  updateReviewQuote: (reviewId, price, method, cycle) => set((state) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    return {
      reviewItems: state.reviewItems.map(r =>
        r.id === reviewId ? { ...r, quotePrice: price, deliveryMethod: method, deliveryCycle: cycle ?? r.deliveryCycle, updatedAt: now } : r
      )
    }
  }),

  addChatMessage: (conversationId, content) => set((state) => {
    const newMessage: ChatMessage = {
      id: `MSG_${Date.now()}`,
      conversationId,
      sender: 'me',
      content,
      type: 'text',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }
    return {
      chatMessages: [...state.chatMessages, newMessage],
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, lastMessage: content, lastMessageTime: newMessage.timestamp } : c
      )
    }
  }),

  addSatisfactionRating: (rating) => set((state) => ({
    satisfactionRatings: [...state.satisfactionRatings, rating]
  })),

  getMessagesByConversation: (conversationId) =>
    get().chatMessages.filter(m => m.conversationId === conversationId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),

  getReviewsByDemand: (demandId) =>
    get().reviewItems.filter(r => r.demandId === demandId),

  addDecisionRecord: (record) => set((state) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const newRecord: DecisionRecord = {
      id: `DEC_${Date.now()}`,
      reviewId: record.reviewId,
      demandId: record.demandId,
      demandTitle: record.demandTitle,
      supplierId: record.supplierId,
      supplierName: record.supplierName,
      action: record.action,
      previousStatus: record.previousStatus,
      notes: record.notes,
      operator: record.operator || '李明轩',
      createdAt: now,
    }
    return {
      decisionRecords: [...state.decisionRecords, newRecord],
    }
  }),

  getDecisionRecordsByReview: (reviewId) =>
    get().decisionRecords.filter(r => r.reviewId === reviewId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  getDecisionRecordsByDemand: (demandId) =>
    get().decisionRecords.filter(r => r.demandId === demandId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  addContractFollowUp: (followUp) => set((state) => {
    const exists = state.contractFollowUps.find(c => c.reviewId === followUp.reviewId)
    if (exists) return state
    const now = new Date().toISOString().split('T')[0]
    const newContract: ContractFollowUp = {
      id: `CTR_${Date.now()}`,
      reviewId: followUp.reviewId,
      demandId: followUp.demandId,
      demandTitle: followUp.demandTitle,
      supplierId: followUp.supplierId,
      supplierName: followUp.supplierName,
      contractStatus: followUp.contractStatus || 'pending',
      contractNo: followUp.contractNo || '',
      signDate: followUp.signDate || '',
      totalAmount: followUp.totalAmount || 0,
      paymentNodes: followUp.paymentNodes || [],
      acceptanceStatus: followUp.acceptanceStatus || 'pending',
      acceptanceDate: followUp.acceptanceDate || '',
      acceptanceResult: followUp.acceptanceResult || '',
      createdAt: now,
    }
    return {
      contractFollowUps: [...state.contractFollowUps, newContract],
    }
  }),

  updateContractFollowUp: (id, updates) => set((state) => ({
    contractFollowUps: state.contractFollowUps.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  getContractByReview: (reviewId) =>
    get().contractFollowUps.find(c => c.reviewId === reviewId),

  updatePaymentNode: (contractId, nodeId, status) => set((state) => ({
    contractFollowUps: state.contractFollowUps.map(c =>
      c.id === contractId ? {
        ...c,
        paymentNodes: c.paymentNodes.map(n =>
          n.id === nodeId ? { ...n, status } : n
        )
      } : c
    )
  })),
}))
