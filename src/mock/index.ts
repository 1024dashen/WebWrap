import type { User, Role, Permission, Project, CardKey, CardKeyTemplate } from '../types'

// Mock permissions
export const mockPermissions: Permission[] = [
  { id: '1', name: '仪表盘', code: 'dashboard', type: 'menu' },
  { id: '2', name: '用户管理', code: 'user', type: 'menu' },
  { id: '3', name: '用户新增', code: 'user:add', type: 'button', parentId: '2' },
  { id: '4', name: '用户编辑', code: 'user:edit', type: 'button', parentId: '2' },
  { id: '5', name: '用户删除', code: 'user:delete', type: 'button', parentId: '2' },
  { id: '6', name: '项目管理', code: 'project', type: 'menu' },
  { id: '7', name: '项目新增', code: 'project:add', type: 'button', parentId: '6' },
  { id: '8', name: '项目编辑', code: 'project:edit', type: 'button', parentId: '6' },
  { id: '9', name: '项目删除', code: 'project:delete', type: 'button', parentId: '6' },
  { id: '10', name: '卡密管理', code: 'cardkey', type: 'menu' },
  { id: '11', name: '卡密新增', code: 'cardkey:add', type: 'button', parentId: '10' },
  { id: '12', name: '卡密编辑', code: 'cardkey:edit', type: 'button', parentId: '10' },
  { id: '13', name: '卡密删除', code: 'cardkey:delete', type: 'button', parentId: '10' },
  { id: '14', name: '模板管理', code: 'template', type: 'menu' },
  { id: '15', name: '模板新增', code: 'template:add', type: 'button', parentId: '14' },
  { id: '16', name: '模板删除', code: 'template:delete', type: 'button', parentId: '14' },
  { id: '17', name: '角色管理', code: 'role', type: 'menu' },
]

// Mock roles
export const mockRoles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有所有权限',
    permissions: mockPermissions.map(p => p.code)
  },
  {
    id: '2',
    name: '普通管理员',
    description: '拥有除角色管理外的所有权限',
    permissions: ['dashboard', 'user', 'user:add', 'user:edit', 'user:delete', 'project', 'project:add', 'project:edit', 'project:delete', 'cardkey', 'cardkey:add', 'cardkey:edit', 'cardkey:delete', 'template', 'template:add', 'template:delete']
  },
  {
    id: '3',
    name: '运营人员',
    description: '只能查看和管理卡密',
    permissions: ['dashboard', 'project', 'cardkey', 'cardkey:add', 'cardkey:edit', 'cardkey:delete']
  }
]

// Mock users
export const mockUsers: User[] = [
  { id: '1', email: 'admin@example.com', username: '管理员', role: '超级管理员', status: 'active', createdAt: '2024-01-01' },
  { id: '2', email: 'manager@example.com', username: '张三', role: '普通管理员', status: 'active', createdAt: '2024-01-15' },
  { id: '3', email: 'operator@example.com', username: '李四', role: '运营人员', status: 'active', createdAt: '2024-02-01' },
  { id: '4', email: 'test@example.com', username: '测试用户', role: '运营人员', status: 'disabled', createdAt: '2024-03-01' },
]

// Mock projects
export const mockProjects: Project[] = [
  { id: '1', name: '视频会员项目', url: 'https://video.example.com', status: 'active', createdAt: '2024-01-10', cardKeyCount: 156 },
  { id: '2', name: '音乐会员项目', url: 'https://music.example.com', status: 'active', createdAt: '2024-02-15', cardKeyCount: 89 },
  { id: '3', name: '云存储项目', url: 'https://cloud.example.com', status: 'archived', createdAt: '2024-03-20', cardKeyCount: 45 },
]

// Mock card keys
export const mockCardKeys: CardKey[] = [
  { id: '1', projectId: '1', key: 'ABCD-EFGH-IJKL-0001', type: 'monthly', status: 'unused', createdAt: '2024-01-10' },
  { id: '2', projectId: '1', key: 'ABCD-EFGH-IJKL-0002', type: 'yearly', status: 'used', usedBy: 'user123', createdAt: '2024-01-11' },
  { id: '3', projectId: '1', key: 'ABCD-EFGH-IJKL-0003', type: 'daily', status: 'expired', expireAt: '2024-01-15', createdAt: '2024-01-10' },
  { id: '4', projectId: '2', key: 'MUSIC-ABCD-0001', type: 'monthly', status: 'unused', createdAt: '2024-02-15' },
  { id: '5', projectId: '2', key: 'MUSIC-ABCD-0002', type: 'permanent', status: 'unused', createdAt: '2024-02-16' },
  { id: '6', projectId: '3', key: 'CLOUD-XYZ-0001', type: 'weekly', status: 'used', usedBy: 'user456', createdAt: '2024-03-20' },
]

// Mock templates
export const mockTemplates: CardKeyTemplate[] = [
  { id: '1', name: '默认卡密模板', htmlContent: '<html><body><h1>{{cardKey}}</h1></body></html>', fileName: 'default.html', createdAt: '2024-01-05' },
  { id: '2', name: '节日卡密模板', htmlContent: '<html><body><div class="festival"><h1>{{cardKey}}</h1></div></body></html>', fileName: 'festival.html', createdAt: '2024-02-01' },
]
