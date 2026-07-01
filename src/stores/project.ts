import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '../types'
import { mockProjects } from '../mock'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([...mockProjects])

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'cardKeyCount'>) => {
    const newProject: Project = {
      ...project,
      id: String(projects.value.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
      cardKeyCount: 0
    }
    projects.value.push(newProject)
  }

  const updateProject = (id: string, data: Partial<Project>) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
    }
  }

  const deleteProject = (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
  }

  const getProjectById = (id: string) => {
    return projects.value.find(p => p.id === id)
  }

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById
  }
})
