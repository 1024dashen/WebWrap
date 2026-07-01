import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardKey } from '../types'
import api from '../utils/api'

export const useCardKeyStore = defineStore('cardkey', () => {
  const cardKeys = ref<CardKey[]>([])

  const fetchCardKeys = async () => {
    try {
      const response = await api.get('/cardkeys')
      cardKeys.value = response.data.cardKeys
    } catch (error) {
      console.error('Failed to fetch card keys:', error)
    }
  }

  const fetchCardKeysByProjectId = async (projectId: string) => {
    try {
      const response = await api.get(`/cardkeys/project/${projectId}`)
      cardKeys.value = response.data.cardKeys
    } catch (error) {
      console.error('Failed to fetch card keys:', error)
    }
  }

  const addCardKey = async (cardKey: Omit<CardKey, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/cardkeys', cardKey)
      return response.data
    } catch (error) {
      console.error('Failed to add card key:', error)
      throw error
    }
  }

  const updateCardKey = async (id: string, data: Partial<CardKey>) => {
    try {
      await api.put(`/cardkeys/${id}`, data)
    } catch (error) {
      console.error('Failed to update card key:', error)
      throw error
    }
  }

  const deleteCardKey = async (id: string) => {
    try {
      await api.delete(`/cardkeys/${id}`)
    } catch (error) {
      console.error('Failed to delete card key:', error)
      throw error
    }
  }

  const batchAddCardKeys = async (projectId: string, type: CardKey['type'], count: number) => {
    try {
      const response = await api.post('/cardkeys/batch', { projectId, type, count })
      return response.data
    } catch (error) {
      console.error('Failed to batch add card keys:', error)
      throw error
    }
  }

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = 4
    const segmentLength = 4
    const result: string[] = []
    for (let s = 0; s < segments; s++) {
      let segment = ''
      for (let i = 0; i < segmentLength; i++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      result.push(segment)
    }
    return result.join('-')
  }

  return {
    cardKeys,
    fetchCardKeys,
    fetchCardKeysByProjectId,
    addCardKey,
    updateCardKey,
    deleteCardKey,
    batchAddCardKeys,
    generateKey
  }
})
