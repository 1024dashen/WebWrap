<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import {
    Odometer,
    User,
    Folder,
    Document,
    UserFilled,
    Fold,
    Expand,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isMobile = ref(false)
const sidebarVisible = ref(false)
const isCollapsed = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value) {
        sidebarVisible.value = false
    }
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

interface MenuItem {
    path: string
    title: string
    icon: any
    permission: string
}

const menuItems: MenuItem[] = [
    {
        path: '/dashboard',
        title: '仪表盘',
        icon: Odometer,
        permission: 'dashboard',
    },
    { path: '/users', title: '用户管理', icon: User, permission: 'user' },
    {
        path: '/projects',
        title: '项目管理',
        icon: Folder,
        permission: 'project',
    },
    {
        path: '/templates',
        title: '卡密模板',
        icon: Document,
        permission: 'template',
    },
    { path: '/roles', title: '角色管理', icon: UserFilled, permission: 'role' },
]

const filteredMenuItems = computed(() => {
    return menuItems.filter((item) => userStore.hasPermission(item.permission))
})

const activeMenu = computed(() => {
    return route.path
})

const handleMenuSelect = (index: string) => {
    router.push(index)
    if (isMobile.value) {
        sidebarVisible.value = false
    }
}

const toggleSidebar = () => {
    if (isMobile.value) {
        sidebarVisible.value = !sidebarVisible.value
    } else {
        isCollapsed.value = !isCollapsed.value
    }
}

const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            userStore.logout()
            ElMessage.success('已退出登录')
            router.push('/login')
        })
        .catch(() => {})
}
</script>

<template>
    <el-container class="layout-container">
        <!-- Mobile overlay -->
        <div
            v-if="isMobile && sidebarVisible"
            class="sidebar-overlay"
            @click="sidebarVisible = false"
        />

        <!-- Sidebar -->
        <el-aside
            v-if="!isMobile"
            :width="isCollapsed ? '64px' : '220px'"
            class="layout-aside"
        >
            <div class="logo">
                <h2 v-if="!isCollapsed">卡密管理</h2>
                <h2 v-else class="logo-mini">卡</h2>
            </div>
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapsed"
                class="sidebar-menu"
                background-color="#304156"
                text-color="#bfcbd9"
                active-text-color="#409EFF"
                @select="handleMenuSelect"
            >
                <el-menu-item
                    v-for="item in filteredMenuItems"
                    :key="item.path"
                    :index="item.path"
                >
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <template #title>{{ item.title }}</template>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- Mobile drawer -->
        <el-drawer
            v-if="isMobile"
            v-model="sidebarVisible"
            direction="ltr"
            :show-close="false"
            :with-header="false"
            size="220px"
            class="mobile-drawer"
        >
            <div class="drawer-sidebar">
                <div class="logo">
                    <h2>卡密管理</h2>
                </div>
                <el-menu
                    :default-active="activeMenu"
                    class="sidebar-menu"
                    background-color="#304156"
                    text-color="#bfcbd9"
                    active-text-color="#409EFF"
                    @select="handleMenuSelect"
                >
                    <el-menu-item
                        v-for="item in filteredMenuItems"
                        :key="item.path"
                        :index="item.path"
                    >
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.title }}</span>
                    </el-menu-item>
                </el-menu>
            </div>
        </el-drawer>

        <!-- Main Content -->
        <el-container>
            <!-- Header -->
            <el-header class="layout-header">
                <div class="header-left">
                    <el-icon class="menu-toggle" @click="toggleSidebar">
                        <Fold v-if="!isMobile && !isCollapsed" />
                        <Expand v-else />
                    </el-icon>
                    <el-breadcrumb separator="/" class="header-breadcrumb">
                        <el-breadcrumb-item :to="{ path: '/dashboard' }"
                            >首页</el-breadcrumb-item
                        >
                        <el-breadcrumb-item v-if="route.meta.title">{{
                            route.meta.title
                        }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-right">
                    <el-dropdown>
                        <span class="user-info">
                            <el-icon><User /></el-icon>
                            <span class="username">{{
                                userStore.currentUser?.username || '用户'
                            }}</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item disabled>
                                    角色: {{ userStore.currentUser?.role }}
                                </el-dropdown-item>
                                <el-dropdown-item divided @click="handleLogout">
                                    退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <!-- Page Content -->
            <el-main class="layout-main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<style scoped>
.layout-container {
    height: 100vh;
}

.layout-aside {
    background-color: #304156;
    overflow-y: auto;
    transition: width 0.3s;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #263445;
}

.logo h2 {
    color: #fff;
    margin: 0;
    font-size: 18px;
    white-space: nowrap;
}

.logo-mini {
    font-size: 20px !important;
}

.sidebar-menu {
    border-right: none;
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 998;
}

.drawer-sidebar {
    background-color: #304156;
    height: 100%;
}

.drawer-sidebar .sidebar-menu {
    border-right: none;
}

.layout-header {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
}

.menu-toggle {
    font-size: 20px;
    cursor: pointer;
    color: #606266;
    flex-shrink: 0;
}

.menu-toggle:hover {
    color: #409eff;
}

.header-breadcrumb {
    white-space: nowrap;
}

.header-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #333;
}

.username {
    font-size: 14px;
}

.layout-main {
    background: #f0f2f5;
    padding: 16px;
}

/* Mobile */
@media (max-width: 767px) {
    .layout-main {
        padding: 12px;
    }

    .header-breadcrumb {
        font-size: 13px;
    }

    .username {
        font-size: 13px;
    }
}
</style>

<style>
.mobile-drawer .el-drawer__body {
    padding: 0;
}
</style>
