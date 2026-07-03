<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "../stores/user";
import api from "../utils/api";

const userStore = useUserStore();

const hasOverviewPermission = computed(() =>
  userStore.hasPermission("dashboard:overview"),
);
const hasRecentProjectsPermission = computed(() =>
  userStore.hasPermission("dashboard:recent"),
);
const hasSystemInfoPermission = computed(() =>
  userStore.hasPermission("dashboard:system"),
);

const stats = ref({
  totalUsers: 0,
  totalProjects: 0,
  totalCardKeys: 0,
  unusedCardKeys: 0,
});

const recentProjects = ref<any[]>([]);

const fetchDashboardData = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    stats.value = response.data.stats;
    recentProjects.value = response.data.recentProjects || [];
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="dashboard">
    <h2>欢迎回来，{{ userStore.currentUser?.username }}</h2>

    <el-row v-if="hasOverviewPermission" :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalUsers }}</p>
              <p class="stat-label">总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon projects">
              <el-icon :size="32"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalProjects }}</p>
              <p class="stat-label">总项目数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon keys">
              <el-icon :size="32"><Key /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.totalCardKeys }}</p>
              <p class="stat-label">总卡密数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon unused">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-value">{{ stats.unusedCardKeys }}</p>
              <p class="stat-label">未使用卡密</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col v-if="hasRecentProjectsPermission" :span="12">
        <el-card>
          <template #header>
            <span>最近项目</span>
          </template>
          <el-table :data="recentProjects.slice(0, 5)" style="width: 100%">
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="cardKeyCount" label="卡密数量" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === "active" ? "活跃" : "已归档" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col v-if="hasSystemInfoPermission" :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="当前用户">{{
              userStore.currentUser?.email
            }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">{{
              userStore.currentUser?.role
            }}</el-descriptions-item>
            <el-descriptions-item label="权限数量">{{
              userStore.userPermissions.length
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { User, Folder, Key, CircleCheck } from "@element-plus/icons-vue";
export default {
  components: { User, Folder, Key, CircleCheck },
};
</script>

<style scoped>
.dashboard h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.stat-icon.projects {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}
.stat-icon.keys {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}
.stat-icon.unused {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin: 4px 0 0 0;
}
</style>
