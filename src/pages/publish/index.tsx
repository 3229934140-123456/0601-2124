import React, { useState, useCallback } from 'react'
import { View, Text, Input, Textarea, ScrollView, Picker, Button, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import type { DataDemand, SupplementFile } from '@/types'
import { IndustryOptions, RegionOptions, FrequencyOptions, SampleScopeOptions, BudgetRanges } from '@/types'
import { useAppStore } from '@/store'
import dayjs from 'dayjs'

const PublishPage: React.FC = () => {
  const addDemand = useAppStore(state => state.addDemand)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    region: '',
    updateFrequency: '',
    sampleScope: '',
    budgetMin: 0,
    budgetMax: 0,
    deadline: '',
    reminderEnabled: true
  })

  const [supplements, setSupplements] = useState<SupplementFile[]>([])
  const [industryIndex, setIndustryIndex] = useState(0)
  const [regionIndex, setRegionIndex] = useState(0)
  const [freqIndex, setFreqIndex] = useState(0)
  const [sampleIndex, setSampleIndex] = useState(0)
  const [budgetIndex, setBudgetIndex] = useState<number | null>(null)

  const updateField = useCallback(<K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleIndustryChange = (e) => {
    const idx = Number(e.detail.value)
    setIndustryIndex(idx)
    updateField('industry', IndustryOptions[idx])
  }

  const handleRegionChange = (e) => {
    const idx = Number(e.detail.value)
    setRegionIndex(idx)
    updateField('region', RegionOptions[idx])
  }

  const handleFreqChange = (e) => {
    const idx = Number(e.detail.value)
    setFreqIndex(idx)
    updateField('updateFrequency', FrequencyOptions[idx])
  }

  const handleSampleChange = (e) => {
    const idx = Number(e.detail.value)
    setSampleIndex(idx)
    updateField('sampleScope', SampleScopeOptions[idx])
  }

  const handleBudgetSelect = (idx: number) => {
    setBudgetIndex(idx)
    updateField('budgetMin', BudgetRanges[idx].min)
    updateField('budgetMax', BudgetRanges[idx].max)
  }

  const handleDateChange = (e) => {
    updateField('deadline', e.detail.value)
  }

  const handleUpload = () => {
    Taro.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        const newFiles: SupplementFile[] = res.tempFiles.map((f, i) => ({
          id: `FILE_${Date.now()}_${i}`,
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(1)}MB`,
          uploadTime: dayjs().format('YYYY-MM-DD HH:mm')
        }))
        setSupplements(prev => [...prev, ...newFiles])
        Taro.showToast({ title: `已添加${newFiles.length}个文件`, icon: 'none' })
      },
      fail: () => {
        const mockFile: SupplementFile = {
          id: `FILE_${Date.now()}`,
          name: '数据需求说明文档.pdf',
          size: '2.5MB',
          uploadTime: dayjs().format('YYYY-MM-DD HH:mm')
        }
        setSupplements(prev => [...prev, mockFile])
        Taro.showToast({ title: '文件已添加', icon: 'none' })
      }
    })
  }

  const handleDeleteFile = (fileId: string) => {
    setSupplements(prev => prev.filter(f => f.id !== fileId))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入需求标题', icon: 'none' })
      return false
    }
    if (!formData.description.trim()) {
      Taro.showToast({ title: '请输入需求描述', icon: 'none' })
      return false
    }
    if (!formData.industry) {
      Taro.showToast({ title: '请选择所属行业', icon: 'none' })
      return false
    }
    if (!formData.region) {
      Taro.showToast({ title: '请选择地域范围', icon: 'none' })
      return false
    }
    if (!formData.updateFrequency) {
      Taro.showToast({ title: '请选择更新频率', icon: 'none' })
      return false
    }
    if (!formData.sampleScope) {
      Taro.showToast({ title: '请选择样本范围', icon: 'none' })
      return false
    }
    if (formData.budgetMin <= 0 || formData.budgetMax <= 0) {
      Taro.showToast({ title: '请设置预算区间', icon: 'none' })
      return false
    }
    if (!formData.deadline) {
      Taro.showToast({ title: '请设置截止日期', icon: 'none' })
      return false
    }
    return true
  }

  const handleSaveDraft = () => {
    const newDemand: DataDemand = {
      id: `DEM_${Date.now()}`,
      title: formData.title || '未命名需求',
      description: formData.description || '暂无描述',
      industry: formData.industry || '未选择',
      region: formData.region || '未选择',
      updateFrequency: formData.updateFrequency || '未选择',
      sampleScope: formData.sampleScope || '未选择',
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      deadline: formData.deadline || dayjs().add(7, 'day').format('YYYY-MM-DD'),
      createdAt: dayjs().format('YYYY-MM-DD'),
      status: 'draft',
      matchedCount: 0,
      responseCount: 0,
      supplements
    }
    addDemand(newDemand)
    Taro.showToast({ title: '草稿已保存', icon: 'success' })
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/mine/index' })
    }, 1000)
  }

  const handlePublish = () => {
    if (!validateForm()) return
    const newDemand: DataDemand = {
      id: `DEM_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      industry: formData.industry,
      region: formData.region,
      updateFrequency: formData.updateFrequency,
      sampleScope: formData.sampleScope,
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      deadline: formData.deadline,
      createdAt: dayjs().format('YYYY-MM-DD'),
      status: 'published',
      matchedCount: Math.floor(Math.random() * 15) + 5,
      responseCount: Math.floor(Math.random() * 8) + 2,
      supplements
    }
    addDemand(newDemand)
    Taro.showModal({
      title: '发布成功',
      content: `需求已发布！已为您匹配到${newDemand.matchedCount}家潜在供应方，是否立即查看？`,
      confirmText: '查看匹配',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/match/index' })
        }
      }
    })
  }

  useDidShow(() => {
    console.log('[Publish] Page showed')
  })

  return (
    <ScrollView scrollY className={styles.page} enhanced showScrollbar={false}>
      <View className={styles.headerBanner}>
        <Text className={styles.bannerTitle}>📋 发布数据采购需求</Text>
        <Text className={styles.bannerDesc}>填写需求信息，系统将为您智能匹配合格的数据供应商，全流程跟进响应。</Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <View className={styles.cardTitleBadge} />
          <Text className={styles.cardTitleText}>基本信息</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>需求标题
          </Text>
          <Input
            className={styles.formInput}
            placeholder='请输入简明扼要的需求标题，如：电商用户消费行为数据采购'
            value={formData.title}
            onInput={(e) => updateField('title', e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>详细描述
          </Text>
          <Textarea
            className={styles.formTextarea}
            placeholder='请详细描述您的数据需求，包括用途、字段要求、数据来源偏好等信息...'
            value={formData.description}
            onInput={(e) => updateField('description', e.detail.value)}
            maxlength={1000}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <View className={styles.cardTitleBadge} />
          <Text className={styles.cardTitleText}>需求属性</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>所属行业
          </Text>
          <Picker mode='selector' range={IndustryOptions} value={industryIndex} onChange={handleIndustryChange}>
            <View className={styles.pickerWrapper}>
              <Text className={formData.industry ? styles.pickerValue : styles.pickerPlaceholder}>
                {formData.industry || '请选择所属行业'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>地域范围
          </Text>
          <Picker mode='selector' range={RegionOptions} value={regionIndex} onChange={handleRegionChange}>
            <View className={styles.pickerWrapper}>
              <Text className={formData.region ? styles.pickerValue : styles.pickerPlaceholder}>
                {formData.region || '请选择数据覆盖的地域范围'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>更新频率
          </Text>
          <Picker mode='selector' range={FrequencyOptions} value={freqIndex} onChange={handleFreqChange}>
            <View className={styles.pickerWrapper}>
              <Text className={formData.updateFrequency ? styles.pickerValue : styles.pickerPlaceholder}>
                {formData.updateFrequency || '请选择数据更新频率'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>样本范围
          </Text>
          <Picker mode='selector' range={SampleScopeOptions} value={sampleIndex} onChange={handleSampleChange}>
            <View className={styles.pickerWrapper}>
              <Text className={formData.sampleScope ? styles.pickerValue : styles.pickerPlaceholder}>
                {formData.sampleScope || '请选择样本范围要求'}
              </Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <View className={styles.cardTitleBadge} />
          <Text className={styles.cardTitleText}>预算与时间</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>预算区间（元）
          </Text>
          <View className={styles.optionsGrid} style={{ marginBottom: '$spacing-md' }}>
            {BudgetRanges.map((range, i) => (
              <View
                key={i}
                className={classnames(styles.optionChip, budgetIndex === i && styles.optionChipActive)}
                onClick={() => handleBudgetSelect(i)}
              >
                {range.label}
              </View>
            ))}
          </View>
          <View className={styles.budgetRange}>
            <Input
              className={styles.budgetInput}
              type='digit'
              placeholder='最低'
              value={formData.budgetMin ? String(formData.budgetMin) : ''}
              onInput={(e) => {
                updateField('budgetMin', Number(e.detail.value))
                setBudgetIndex(null)
              }}
            />
            <Text className={styles.budgetSeparator}>至</Text>
            <Input
              className={styles.budgetInput}
              type='digit'
              placeholder='最高'
              value={formData.budgetMax ? String(formData.budgetMax) : ''}
              onInput={(e) => {
                updateField('budgetMax', Number(e.detail.value))
                setBudgetIndex(null)
              }}
            />
            <Text className={styles.budgetUnit}>元</Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>响应截止日期
          </Text>
          <View className={styles.deadlineRow}>
            <Picker
              mode='date'
              start={dayjs().format('YYYY-MM-DD')}
              end={dayjs().add(1, 'year').format('YYYY-MM-DD')}
              value={formData.deadline}
              onChange={handleDateChange}
              style={{ flex: 1 }}
            >
              <View className={styles.pickerWrapper}>
                <Text className={formData.deadline ? styles.pickerValue : styles.pickerPlaceholder}>
                  {formData.deadline || '请选择截止日期'}
                </Text>
                <Text className={styles.pickerArrow}>📅</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.reminderSwitch}>
            <Text className={styles.reminderText}>
              🔔 截止前3天接收提醒通知
            </Text>
            <View className={classnames(styles.switchBox, formData.reminderEnabled && styles.switchActive)}
              onClick={() => updateField('reminderEnabled', !formData.reminderEnabled)}>
              <View className={styles.switchDot} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <View className={styles.cardTitleBadge} />
          <Text className={styles.cardTitleText}>补充说明（可选）</Text>
        </View>
        <View className={styles.formItem}>
          <View className={styles.uploadArea} onClick={handleUpload}>
            <Text className={styles.uploadIcon}>📎</Text>
            <Text className={styles.uploadText}>点击上传补充说明文件</Text>
            <Text className={styles.uploadHint}>支持PDF/Word/Excel，单个不超过20MB，最多5个</Text>
          </View>
          {supplements.length > 0 && (
            <View className={styles.fileList}>
              {supplements.map(file => (
                <View key={file.id} className={styles.fileItem}>
                  <View className={styles.fileInfo}>
                    <Text className={styles.fileIcon}>📄</Text>
                    <View className={styles.fileMeta}>
                      <Text className={styles.fileName}>{file.name}</Text>
                      <Text className={styles.fileSize}>{file.size} · {file.uploadTime}</Text>
                    </View>
                  </View>
                  <View className={styles.fileDelete} onClick={() => handleDeleteFile(file.id)}>✕</View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={{ height: '120rpx' }} />

      <View className={styles.bottomBar}>
        <Button className={styles.btnSecondary} onClick={handleSaveDraft}>保存草稿</Button>
        <Button className={styles.btnPrimary} onClick={handlePublish}>立即发布</Button>
      </View>
    </ScrollView>
  )
}

export default PublishPage
