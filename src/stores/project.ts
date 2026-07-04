import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project } from '../types'
import api from '../utils/api'

export const useProjectStore = defineStore('project', () => {
    const projects = ref<Project[]>([])
    const total = ref(0)

    const fetchProjects = async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/projects', {
                params: { page, pageSize },
            })
            projects.value = response.data.projects
            total.value = response.data.total
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    }

    const addProject = async (
        project: Omit<Project, 'id' | 'createdAt' | 'cardKeyCount'>,
    ) => {
        try {
            const response = await api.post('/projects', project)
            return response.data
        } catch (error) {
            console.error('Failed to add project:', error)
            throw error
        }
    }

    const updateProject = async (id: string, data: Partial<Project>) => {
        try {
            await api.put(`/projects/${id}`, data)
        } catch (error) {
            console.error('Failed to update project:', error)
            throw error
        }
    }

    const deleteProject = async (id: string) => {
        try {
            await api.delete(`/projects/${id}`)
        } catch (error) {
            console.error('Failed to delete project:', error)
            throw error
        }
    }

    const getProjectById = (id: string) => {
        return projects.value.find((p) => String(p.id) === String(id))
    }

    return {
        projects,
        total,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
    }
})
