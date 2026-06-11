import { create } from 'zustand'
import type { DataDemand, DataSupplier, Conversation, ChatMessage, ReviewItem, SatisfactionRating } from '@/types'
import { mockDemands, mockSuppliers, mockConversations, mockChatMessages, mockReviewItems, mockSatisfactionRatings } from '@/data/mock'

interface AppState {
  demands: DataDemand[]
  suppliers: DataSupplier[]
  conversations: Conversation[]
  chatMessages: ChatMessage[]
  reviewItems: ReviewItem[]
  satisfactionRatings: SatisfactionRating[]
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
  updateReviewStatus: (reviewId: string, status: ReviewItem['reviewStatus'], notes?: string) => void
  updateReviewQuote: (reviewId: string, price: number, method: string, cycle?: string) => void
  addChatMessage: (conversationId: string, content: string) => void
  addSatisfactionRating: (rating: SatisfactionRating) => void
  getMessagesByConversation: (conversationId: string) => ChatMessage[]
  getReviewsByDemand: (demandId: string) => ReviewItem[]
}

export const useAppStore = create<AppState>((set, get) => ({
  demands: mockDemands,
  suppliers: mockSuppliers,
  conversations: mockConversations,
  chatMessages: mockChatMessages,
  reviewItems: mockReviewItems,
  satisfactionRatings: mockSatisfactionRatings,
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

  updateReviewStatus: (reviewId, status, notes) => set((state) => ({
    reviewItems: state.reviewItems.map(r =>
      r.id === reviewId ? { ...r, reviewStatus: status, reviewNotes: notes ?? r.reviewNotes } : r
    )
  })),

  updateReviewQuote: (reviewId, price, method, cycle) => set((state) => ({
    reviewItems: state.reviewItems.map(r =>
      r.id === reviewId ? { ...r, quotePrice: price, deliveryMethod: method, deliveryCycle: cycle ?? r.deliveryCycle } : r
    )
  })),

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
    get().reviewItems.filter(r => r.demandId === demandId)
}))
