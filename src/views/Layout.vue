<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useUserStore } from "../stores/user";
import {
  Odometer,
  User,
  Folder,
  Document,
  UserFilled,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

interface MenuItem {
  path: string;
  title: string;
  icon: any;
  permission: string;
}

const menuItems: MenuItem[] = [
  {
    path: "/dashboard",
    title: "仪表盘",
    icon: Odometer,
    permission: "dashboard",
  },
  { path: "/users", title: "用户管理", icon: User, permission: "user" },
  { path: "/projects", title: "项目管理", icon: Folder, permission: "project" },
  {
    path: "/templates",
    title: "卡密模板",
    icon: Document,
    permission: "template",
  },
  { path: "/roles", title: "角色管理", icon: UserFilled, permission: "role" },
];

const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => userStore.hasPermission(item.permission));
});

const activeMenu = computed(() => {
  return route.path;
});

const handleMenuSelect = (index: string) => {
  router.push(index);
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.logout();
      ElMessage.success("已退出登录");
      router.push("/login");
    })
    .catch(() => {});
};
</script>

<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside width="220px" class="layout-aside">
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
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <!-- Header -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
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
                userStore.currentUser?.username || "用户"
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
}

.sidebar-menu {
  border-right: none;
}

.layout-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
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
  padding: 20px;
}
</style>
