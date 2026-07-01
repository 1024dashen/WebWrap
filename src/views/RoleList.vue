<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { mockRoles, mockPermissions } from "../mock";
import { useUserStore } from "../stores/user";
import type { Role } from "../types";

const userStore = useUserStore();

const roles = ref([...mockRoles]);
const permissions = ref([...mockPermissions]);

const menuPermissions = permissions.value.filter((p) => p.type === "menu");
const buttonPermissions = permissions.value.filter((p) => p.type === "button");

const getButtonsForMenu = (menuCode: string) => {
  return buttonPermissions.filter(
    (p) =>
      p.parentId === permissions.value.find((mp) => mp.code === menuCode)?.id,
  );
};

const handleViewPermissions = (role: Role) => {
  ElMessage.info(`${role.name} 拥有 ${role.permissions.length} 个权限`);
};
</script>

<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <span>角色管理</span>
      </template>

      <el-table :data="roles" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="权限数量" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.permissions.length }} 个权限</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleViewPermissions(row)"
            >
              查看权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>权限列表</span>
      </template>

      <el-table :data="permissions" style="width: 100%" row-key="id">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="code" label="权限编码" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? 'primary' : 'success'">
              {{ row.type === "menu" ? "菜单" : "按钮" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>
