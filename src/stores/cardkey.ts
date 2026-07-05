import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardKey } from '../types'
import api from '../utils/api'

export const useCardKeyStore = defineStore('cardkey', () => {
    const cardKeys = ref<CardKey[]>([])
    const total = ref(0)

    const fetchCardKeys = async () => {
        try {
            const response = await api.get('/cardkeys')
            cardKeys.value = response.data.cardKeys
        } catch (error) {
            console.error('Failed to fetch card keys:', error)
        }
    }

    const fetchCardKeysByProjectId = async (
        projectId: string,
        page = 1,
        pageSize = 10,
    ) => {
        try {
            const response = await api.get(`/cardkeys/project/${projectId}`, {
                params: { page, pageSize },
            })
            cardKeys.value = response.data.cardKeys
            total.value = response.data.total
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

    const batchDeleteCardKeys = async (ids: string[]) => {
        try {
            await api.post('/cardkeys/batch-delete', { ids })
        } catch (error) {
            console.error('Failed to batch delete card keys:', error)
            throw error
        }
    }

    const batchAddCardKeys = async (
        projectId: string,
        type: CardKey['type'],
        count: number,
        status: CardKey['status'] = 'unused',
        duration?: number,
        remark?: string,
        oneDeviceOneCode?: boolean,
    ) => {
        try {
            const response = await api.post('/cardkeys/batch', {
                projectId,
                type,
                count,
                status,
                duration,
                remark,
                oneDeviceOneCode,
            })
            return response.data
        } catch (error) {
            console.error('Failed to batch add card keys:', error)
            throw error
        }
    }

    const generateKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 18; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    return {
        cardKeys,
        total,
        fetchCardKeys,
        fetchCardKeysByProjectId,
        addCardKey,
        updateCardKey,
        deleteCardKey,
        batchDeleteCardKeys,
        batchAddCardKeys,
        generateKey,
    }
})
