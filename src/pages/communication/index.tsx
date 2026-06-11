import React, { useState } from 'react'
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import type { Conversation } from '@/types'
import { formatTimeFromNow, randomAvatar } from '@/utils'
import dayjs from 'dayjs'

const CommunicationPage: React.FC = () => {
  const conversations = useAppStore(state => state.conversations)
  const getMessagesByConversation = useAppStore(state => state.getMessagesByConversation)
  const addChatMessage = useAppStore(state => state.addChatMessage)
  const setCurrentConversation = useAppStore(state => state.setCurrentConversation)

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [searchText, setSearchText] = useState('')
  const [activeConversation, setActiveConv] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread' && conv.unreadCount === 0) return false
    if (searchText && !conv.supplierName.includes(searchText) && !conv.demandTitle.includes(searchText)) return false
    return true
  })

  const openChat = (conv: Conversation) => {
    setActiveConv(conv)
    setCurrentConversation(conv)
  }

  const closeChat = () => {
    setActiveConv(null)
    setCurrentConversation(null)
  }

  const handleSend = () => {
    if (!messageInput.trim() || !activeConversation) return
    addChatMessage(activeConversation.id, messageInput.trim())
    setMessageInput('')
    Taro.showToast({ title: '发送成功', icon: 'none' })
  }

  const messages = activeConversation ? getMessagesByConversation(activeConversation.id) : []

  useDidShow(() => {
    console.log('[Communication] Page showed, conversations:', conversations.length)
  })

  if (activeConversation) {
    return (
      <View className={styles.chatPage}>
        <View className={styles.chatHeader}>
          <View className={styles.backBtn} onClick={closeChat}>←</View>
          <View className={styles.chatHeaderInfo}>
            <Text className={styles.chatHeaderName}>{activeConversation.supplierName}</Text>
            <Text className={styles.chatHeaderSub}>关于：{activeConversation.demandTitle}</Text>
          </View>
          <View className={styles.chatActionBtn}>📞</View>
          <View className={styles.chatActionBtn}>⋮</View>
        </View>

        <ScrollView scrollY className={styles.chatMessages} enhanced showScrollbar={false}>
          <View className={styles.msgDateDivider}>
            <View className={styles.msgDateLine} />
            <Text className={styles.msgDateText}>2026年6月8日</Text>
            <View className={styles.msgDateLine} />
          </View>

          {messages.map(msg => (
            <View
              key={msg.id}
              className={classnames(styles.messageRow, msg.sender === 'me' && styles.messageRowMe)}
            >
              <View
                className={classnames(
                  styles.msgAvatar,
                  msg.sender === 'me' ? styles.msgAvatarMe : styles.msgAvatarOther
                )}
              >
                {msg.sender === 'me' ? '我' : activeConversation.supplierName.charAt(0)}
              </View>
              <View className={classnames(styles.msgBody, msg.sender === 'me' && styles.msgBodyMe)}>
                <View
                  className={classnames(
                    styles.msgBubble,
                    msg.sender === 'me' ? styles.msgBubbleMe : styles.msgBubbleOther
                  )}
                >
                  {msg.content}
                </View>
                <Text className={styles.msgTime}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}

          {messages.length === 0 && (
            <View className={styles.emptyChat}>
              <Text className={styles.emptyIcon}>💬</Text>
              <Text className={styles.emptyText}>开始和供应方沟通吧</Text>
            </View>
          )}
        </ScrollView>

        <View className={styles.chatInputBar}>
          <View className={styles.inputIconBtn}>➕</View>
          <View className={styles.inputIconBtn}>📷</View>
          <Input
            className={styles.chatInput}
            placeholder='请输入消息...'
            value={messageInput}
            onInput={(e) => setMessageInput(e.detail.value)}
            confirmType='send'
            onConfirm={handleSend}
          />
          <Button className={styles.sendBtn} onClick={handleSend}>发送</Button>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            placeholder='搜索供应方或需求名称'
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            style={{ flex: 1, fontSize: '24rpx', color: '#4E5969' }}
          />
        </View>
      </View>

      <View className={styles.tabsBar}>
        <View
          className={classnames(styles.tabItem, activeTab === 'all' && styles.tabItemActive)}
          onClick={() => setActiveTab('all')}
        >
          <Text className={styles.tabText}>
            全部会话
            <View className={styles.tabCount} style={{ display: 'inline-flex' }}>{conversations.length}</View>
          </Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'unread' && styles.tabItemActive)}
          onClick={() => setActiveTab('unread')}
        >
          <Text className={styles.tabText}>
            未读消息
            {totalUnread > 0 && <View className={styles.tabCount} style={{ display: 'inline-flex' }}>{totalUnread}</View>}
          </Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.conversationList} enhanced showScrollbar={false}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <View key={conv.id} className={styles.convCard} onClick={() => openChat(conv)}>
              <View className={styles.avatarWrap}>
                <View className={styles.avatar}>
                  <Image
                    className={styles.avatarImg}
                    src={randomAvatar(conv.avatarId)}
                    mode='aspectFill'
                    onError={(e) => console.error('[Img] Avatar load error:', e)}
                  />
                </View>
                {conv.unreadCount > 0 && (
                  <View className={styles.unreadBadge}>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </View>
                )}
              </View>
              <View className={styles.convContent}>
                <View className={styles.convHeader}>
                  <Text className={styles.convName}>{conv.supplierName}</Text>
                  <Text className={styles.convTime}>{formatTimeFromNow(conv.lastMessageTime)}</Text>
                </View>
                <Text className={styles.convDemand}>📋 {conv.demandTitle}</Text>
                <Text className={styles.convLastMsg}>
                  {conv.unreadCount > 0 && `[${conv.unreadCount}条] `}
                  {conv.lastMessage}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyChat}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'unread' ? '没有未读消息' : '暂无沟通记录'}
            </Text>
            <Button
              className={styles.emptyBtn}
              onClick={() => Taro.switchTab({ url: '/pages/match/index' })}
            >
              🎯 去匹配供应方
            </Button>
          </View>
        )}

        <View style={{ height: '40rpx' }} />
      </ScrollView>
    </View>
  )
}

export default CommunicationPage
