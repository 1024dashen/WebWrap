import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardKey } from '../types'
import { mockCardKeys } from '../mock'

export const useCardKeyStore = defineStore('cardkey', () => {
  const cardKeys = ref<CardKey[]>([...mockCardKeys])

  const getCardKeysByProjectId = (projectId: string) => {
    return computed(() => cardKeys.value.filter(ck => ck.projectId === projectId))
  }

  const addCardKey = (cardKey: Omit<CardKey, 'id' | 'createdAt'>) => {
    const newCardKey: CardKey = {
      ...cardKey,
      id: String(cardKeys.value.length + 1),
      createdAt: new Date().toISOString().split('T')[0]
    }
    cardKeys.value.push(newCardKey)
  }

  const updateCardKey = (id: string, data: Partial<CardKey>) => {
    const index = cardKeys.value.findIndex(ck => ck.id === id)
    if (index !== -1) {
      cardKeys.value[index] = { ...cardKeys.value[index], ...data }
    }
  }

  const deleteCardKey = (id: string) => {
    cardKeys.value = cardKeys.value.filter(ck => ck.id !== id)
  }

  const batchAddCardKeys = (projectId: string, type: CardKey['type'], count: number) => {
    for (let i = 0; i < count; i++) {
      const key = generateKey()
      addCardKey({
        projectId,
        key,
        type,
        status: 'unused'
      })
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
    getCardKeysByProjectId,
    addCardKey,
    updateCardKey,
    deleteCardKey,
    batchAddCardKeys,
    generateKey
  }
})
