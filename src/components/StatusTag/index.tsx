import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'

interface StatusTagProps {
  label: string
  color?: string
  bgColor?: string
  size?: 'sm' | 'md'
}

const StatusTag: React.FC<StatusTagProps> = ({ label, color = '#165DFF', bgColor, size = 'sm' }) => {
  return (
    <View
      className={classnames(styles.tag, size === 'md' && styles.tagMd)}
      style={{ backgroundColor: bgColor || `${color}15`, color }}
    >
      <Text className={styles.dot} style={{ backgroundColor: color }} />
      <Text className={styles.text}>{label}</Text>
    </View>
  )
}

export default StatusTag
