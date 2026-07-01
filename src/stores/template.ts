import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CardKeyTemplate } from '../types'
import { mockTemplates } from '../mock'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<CardKeyTemplate[]>([...mockTemplates])

  const addTemplate = (template: Omit<CardKeyTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: CardKeyTemplate = {
      ...template,
      id: String(templates.value.length + 1),
      createdAt: new Date().toISOString().split('T')[0]
    }
    templates.value.push(newTemplate)
  }

  const deleteTemplate = (id: string) => {
    templates.value = templates.value.filter(t => t.id !== id)
  }

  return {
    templates,
    addTemplate,
    deleteTemplate
  }
})
