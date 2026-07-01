<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { mockRoles, mockPermissions } from "../mock";
import type { Role, Permission } from "../types";

const roles = ref<Role[]>([...mockRoles]);
const allPermissions = ref<Permission[]>([...mockPermissions]);

// Dialog state
const dialogVisible = ref(false);
const currentRole = ref<Role | null>(null);
const selectedPermissions = ref<string[]>([]);

// Group permissions by menu
const menuPermissions = computed(() => {
  return allPermissions.value.filter((p) => p.type === "menu");
});

const getButtonPermissions = (menuId: string) => {
  return allPermissions.value.filter(
    (p) => p.type === "button" && p.parentId === menuId,
  );
};

// Open permission dialog
const handleConfigPermission = (role: Role) => {
  currentRole.value = role;
  selectedPermissions.value = [...role.permissions];
  dialogVisible.value = true;
};

// Check if a menu is fully checked (all buttons + itself)
const isMenuFullyChecked = (menu: Permission) => {
  if (!selectedPermissions.value.includes(menu.code)) return false;
  const buttons = getButtonPermissions(menu.id);
  return buttons.every((b) => selectedPermissions.value.includes(b.code));
};

// Check if a menu is partially checked
const isMenuPartialChecked = (menu: Permission) => {
  const buttons = getButtonPermissions(menu.id);
  const checkedButtons = buttons.filter((b) =>
    selectedPermissions.value.includes(b.code),
  ).length;
  return checkedButtons > 0 && checkedButtons < buttons.length;
};

// Toggle menu permission (menu + all its buttons)
const handleMenuChange = (menu: Permission, checked: boolean) => {
  const buttons = getButtonPermissions(menu.id);
  if (checked) {
    // Add menu and all buttons
    if (!selectedPermissions.value.includes(menu.code)) {
      selectedPermissions.value.push(menu.code);
    }
    buttons.forEach((b) => {
      if (!selectedPermissions.value.includes(b.code)) {
        selectedPermissions.value.push(b.code);
      }
    });
  } else {
    // Remove menu and all buttons
    selectedPermissions.value = selectedPermissions.value.filter(
      (code) => code !== menu.code && !buttons.some((b) => b.code === code),
    );
  }
};

// Toggle button permission
const handleButtonChange = (
  menu: Permission,
  code: string,
  checked: boolean,
) => {
  if (checked) {
    if (!selectedPermissions.value.includes(code)) {
      selectedPermissions.value.push(code);
    }
    // Auto-check parent menu
    if (!selectedPermissions.value.includes(menu.code)) {
      selectedPermissions.value.push(menu.code);
    }
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(
      (c) => c !== code,
    );
    // Auto-uncheck parent menu if no buttons checked
    const buttons = getButtonPermissions(menu.id);
    const hasChecked = buttons.some((b) =>
      selectedPermissions.value.includes(b.code),
    );
    if (!hasChecked) {
      selectedPermissions.value = selectedPermissions.value.filter(
        (c) => c !== menu.code,
      );
    }
  }
};

// Save permissions
const handleSave = () => {
  if (!currentRole.value) return;
  const index = roles.value.findIndex((r) => r.id === currentRole.value!.id);
  if (index !== -1) {
    roles.value[index].permissions = [...selectedPermissions.value];
    ElMessage.success("权限配置已保存");
  }
  dialogVisible.value = false;
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
              @click="handleConfigPermission(row)"
            >
              权限配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Permission Config Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="`权限配置 - ${currentRole?.name}`"
      width="600px"
    >
      <div class="permission-tree">
        <div
          v-for="menu in menuPermissions"
          :key="menu.id"
          class="permission-group"
        >
          <div class="permission-menu-row">
            <el-checkbox
              :model-value="selectedPermissions.includes(menu.code)"
              @change="(val: boolean) => handleMenuChange(menu, val)"
            >
              <span class="menu-label">{{ menu.name }}</span>
              <el-tag size="small" type="info">{{ menu.code }}</el-tag>
            </el-checkbox>
          </div>
          <div class="permission-button-row">
            <el-checkbox
              v-for="btn in getButtonPermissions(menu.id)"
              :key="btn.id"
              :model-value="selectedPermissions.includes(btn.code)"
              @change="
                (val: boolean) => handleButtonChange(menu, btn.code, val)
              "
            >
              {{ btn.name }}
              <el-tag size="small" type="info">{{ btn.code }}</el-tag>
            </el-checkbox>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.permission-tree {
  max-height: 500px;
  overflow-y: auto;
}

.permission-group {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.permission-group:last-child {
  margin-bottom: 0;
}

.permission-menu-row {
  margin-bottom: 8px;
}

.menu-label {
  font-weight: 600;
  margin-right: 8px;
}

.permission-button-row {
  padding-left: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-button-row .el-checkbox {
  margin-right: 0;
}
</style>
