import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardKeyTemplate } from '../types'
import api from '../utils/api'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<CardKeyTemplate[]>([])

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates')
      templates.value = response.data.templates
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const addTemplate = async (template: Omit<CardKeyTemplate, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/templates', template)
      await fetchTemplates()
      return response.data
    } catch (error) {
      console.error('Failed to add template:', error)
      throw error
    }
  }

  const deleteTemplate = async (id: string) => {
    try {
      await api.delete(`/templates/${id}`)
      await fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  return {
    templates,
    fetchTemplates,
    addTemplate,
    deleteTemplate
  }
})
