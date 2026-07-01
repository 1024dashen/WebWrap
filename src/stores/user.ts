import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { mockUsers, mockRoles } from '../mock'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const users = ref<User[]>([...mockUsers])

  const isLoggedIn = computed(() => !!token.value)
  
  const userPermissions = computed(() => {
    if (!currentUser.value) return []
    const role = mockRoles.find(r => r.name === currentUser.value!.role)
    return role?.permissions || []
  })

  const login = (email: string, _password: string) => {
    const user = users.value.find(u => u.email === email)
    if (user) {
      currentUser.value = user
      token.value = 'mock-token-' + user.id
      localStorage.setItem('token', token.value)
      return true
    }
    if (email === 'admin@example.com') {
      currentUser.value = users.value[0]
      token.value = 'mock-token-1'
      localStorage.setItem('token', token.value)
      return true
    }
    return false
  }

  const register = (email: string, username: string, _password: string) => {
    const newUser: User = {
      id: String(users.value.length + 1),
      email,
      username,
      role: '运营人员',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser)
    return true
  }

  const logout = () => {
    currentUser.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: String(users.value.length + 1),
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser)
  }

  const updateUser = (id: string, data: Partial<User>) => {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...data }
    }
  }

  const deleteUser = (id: string) => {
    users.value = users.value.filter(u => u.id !== id)
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
    addUser,
    updateUser,
    deleteUser,
    hasPermission
  }
})
