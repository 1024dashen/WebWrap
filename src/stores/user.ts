import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import api from '../utils/api'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref<User | null>(null)
    const token = ref<string>(localStorage.getItem('token') || '')
    const users = ref<User[]>([])
    const userPermissions = ref<string[]>([])

    const isLoggedIn = computed(() => !!token.value)

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { token: newToken, user } = response.data

            currentUser.value = user
            token.value = newToken
            localStorage.setItem('token', newToken)

            // Fetch permissions
            await fetchPermissions()

            return true
        } catch (error: any) {
            return false
        }
    }

    const register = async (
        email: string,
        username: string,
        password: string,
    ): Promise<boolean> => {
        try {
            const response = await api.post('/auth/register', {
                email,
                username,
                password,
            })
            const { token: newToken, user } = response.data

            currentUser.value = user
            token.value = newToken
            localStorage.setItem('token', newToken)

            // Fetch permissions
            await fetchPermissions()

            return true
        } catch (error: any) {
            return false
        }
    }

    const logout = () => {
        currentUser.value = null
        token.value = ''
        userPermissions.value = []
        localStorage.removeItem('token')
    }

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users')
            users.value = response.data.users
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/auth/me')
            currentUser.value = response.data.user
            userPermissions.value = response.data.permissions || []
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
            throw error
        }
    }

    const addUser = async (
        user: Omit<User, 'id' | 'createdAt'> & { password: string },
    ) => {
        try {
            const response = await api.post('/users', user)
            await fetchUsers()
            return response.data
        } catch (error) {
            console.error('Failed to add user:', error)
            throw error
        }
    }

    const updateUser = async (id: string, data: Partial<User>) => {
        try {
            await api.put(`/users/${id}`, data)
            await fetchUsers()
        } catch (error) {
            console.error('Failed to update user:', error)
            throw error
        }
    }

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/users/${id}`)
            await fetchUsers()
        } catch (error) {
            console.error('Failed to delete user:', error)
            throw error
        }
    }

    const hasPermission = (code: string) => {
        return userPermissions.value.includes(code)
    }

    return {
        currentUser,
        token,
        users,
        isLoggedIn,
        userPermissions,
        login,
        register,
        logout,
        fetchUsers,
        fetchPermissions,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
    }
})
