// User related types
export interface User {
  id: string
  email: string
  username: string
  role: string
  status: 'active' | 'disabled'
  createdAt: string
}

// Role types
export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

// Permission types
export interface Permission {
  id: string
  name: string
  code: string
  type: 'menu' | 'button'
  parentId?: string
}

// Project types
export interface Project {
  id: string
  name: string
  url: string
  status: 'active' | 'archived'
  template_id?: number | null
  createdAt: string
  cardKeyCount: number
}

// CardKey types
export interface CardKey {
  id: string
  projectId: string
  key: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'permanent'
  status: 'unused' | 'used' | 'expired'
  expireAt?: string
  usedBy?: string
  createdAt: string
}

// Template types
export interface CardKeyTemplate {
  id: string
  name: string
  htmlContent: string
  fileName: string
  createdAt: string
}

// Menu types
export interface MenuItem {
  path: string
  title: string
  icon?: string
  permission?: string
  children?: MenuItem[]
}
