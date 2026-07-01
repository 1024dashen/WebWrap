import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer', permission: 'dashboard' }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('../views/UserList.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'user' }
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: () => import('../views/ProjectList.vue'),
        meta: { title: '项目管理', icon: 'Folder', permission: 'project' }
      },
      {
        path: 'projects/:id/cardkeys',
        name: 'CardKeyList',
        component: () => import('../views/CardKeyList.vue'),
        meta: { title: '卡密管理', icon: 'Key', permission: 'cardkey', hidden: true }
      },
      {
        path: 'templates',
        name: 'TemplateList',
        component: () => import('../views/TemplateList.vue'),
        meta: { title: '卡密模板', icon: 'Document', permission: 'template' }
      },
      {
        path: 'roles',
        name: 'RoleList',
        component: () => import('../views/RoleList.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', permission: 'role' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // If token exists but permissions not loaded (e.g., page reload), fetch them
  if (userStore.token && userStore.userPermissions.length === 0) {
    try {
      await userStore.fetchPermissions()
    } catch (error) {
      // If fetch fails, token might be invalid
      userStore.logout()
      return next('/login')
    }
  }
  
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
