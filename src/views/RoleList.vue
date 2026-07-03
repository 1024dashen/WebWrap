<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "../utils/api";
import type { Role, Permission } from "../types";
import { ArrowRight } from "@element-plus/icons-vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const roles = ref<Role[]>([]);
const allPermissions = ref<Permission[]>([]);

// Permission dialog state
const permDialogVisible = ref(false);
const currentRole = ref<Role | null>(null);
const selectedPermissions = ref<string[]>([]);
const expandedMenus = ref<Set<string>>(new Set());

// Role form dialog state
const roleDialogVisible = ref(false);
const roleDialogTitle = ref("新增角色");
const editingRole = ref<Role | null>(null);
const roleForm = reactive({
  name: "",
  description: "",
});

// Group permissions by menu
const menuPermissions = computed(() => {
  return allPermissions.value.filter((p) => p.type === "menu");
});

const getButtonPermissions = (menuId: string) => {
  return allPermissions.value.filter(
    (p) => p.type === "button" && p.parentId === menuId,
  );
};

const fetchRoles = async () => {
  try {
    const response = await api.get("/roles");
    roles.value = response.data.roles;
  } catch (error) {
    console.error("Failed to fetch roles:", error);
  }
};

const fetchPermissions = async () => {
  try {
    const response = await api.get("/permissions");
    allPermissions.value = response.data.permissions;
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
};

// ===== Role CRUD =====
const handleAddRole = () => {
  editingRole.value = null;
  roleForm.name = "";
  roleForm.description = "";
  roleDialogTitle.value = "新增角色";
  roleDialogVisible.value = true;
};

const handleEditRole = (role: Role) => {
  editingRole.value = role;
  roleForm.name = role.name;
  roleForm.description = role.description;
  roleDialogTitle.value = "编辑角色";
  roleDialogVisible.value = true;
};

const handleDeleteRole = (role: Role) => {
  ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delete(`/roles/${role.id}`);
        await fetchRoles();
        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

const handleRoleSubmit = async () => {
  if (!roleForm.name) {
    ElMessage.warning("请填写角色名称");
    return;
  }

  try {
    if (editingRole.value) {
      await api.put(`/roles/${editingRole.value.id}`, {
        name: roleForm.name,
        description: roleForm.description,
      });
      ElMessage.success("角色更新成功");
    } else {
      await api.post("/roles", {
        name: roleForm.name,
        description: roleForm.description,
        permissions: [],
      });
      ElMessage.success("角色创建成功");
    }
    await fetchRoles();
    roleDialogVisible.value = false;
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// ===== Permission Config =====
const handleConfigPermission = (role: Role) => {
  currentRole.value = role;
  selectedPermissions.value = [...role.permissions];
  expandedMenus.value = new Set();
  permDialogVisible.value = true;
};

const toggleExpand = (menuId: string) => {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId);
  } else {
    expandedMenus.value.add(menuId);
  }
};

const isExpanded = (menuId: string) => {
  return expandedMenus.value.has(menuId);
};

const expandAll = () => {
  expandedMenus.value = new Set(menuPermissions.value.map((m) => m.id));
};

const collapseAll = () => {
  expandedMenus.value = new Set();
};

const handleMenuChange = (menu: Permission, checked: boolean) => {
  const buttons = getButtonPermissions(menu.id);
  if (checked) {
    if (!selectedPermissions.value.includes(menu.code)) {
      selectedPermissions.value.push(menu.code);
    }
    buttons.forEach((b) => {
      if (!selectedPermissions.value.includes(b.code)) {
        selectedPermissions.value.push(b.code);
      }
    });
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(
      (code) => code !== menu.code && !buttons.some((b) => b.code === code),
    );
  }
};

const handleButtonChange = (
  menu: Permission,
  code: string,
  checked: boolean,
) => {
  if (checked) {
    if (!selectedPermissions.value.includes(code)) {
      selectedPermissions.value.push(code);
    }
    if (!selectedPermissions.value.includes(menu.code)) {
      selectedPermissions.value.push(menu.code);
    }
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(
      (c) => c !== code,
    );
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

const handleSavePermission = async () => {
  if (!currentRole.value) return;

  try {
    await api.put(`/roles/${currentRole.value.id}`, {
      permissions: selectedPermissions.value,
    });
    await fetchRoles();
    ElMessage.success("权限配置已保存");
    permDialogVisible.value = false;
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

onMounted(() => {
  fetchRoles();
  fetchPermissions();
});
</script>

<template>
  <div class="role-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button
            v-if="userStore.hasPermission('role:add')"
            type="primary"
            @click="handleAddRole"
            >新增角色</el-button
          >
        </div>
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
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button
              v-if="userStore.hasPermission('role:config')"
              size="small"
              type="primary"
              link
              @click="handleConfigPermission(row)"
            >
              权限配置
            </el-button>
            <el-button
              v-if="userStore.hasPermission('role:edit')"
              size="small"
              type="warning"
              link
              @click="handleEditRole(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPermission('role:delete')"
              size="small"
              type="danger"
              link
              @click="handleDeleteRole(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Role Form Dialog -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Permission Config Dialog -->
    <el-dialog
      v-model="permDialogVisible"
      :title="`权限配置 - ${currentRole?.name}`"
      width="600px"
    >
      <div class="permission-toolbar">
        <el-button size="small" @click="expandAll">全部展开</el-button>
        <el-button size="small" @click="collapseAll">全部折叠</el-button>
      </div>
      <div class="permission-tree">
        <div
          v-for="menu in menuPermissions"
          :key="menu.id"
          class="permission-group"
        >
          <div class="permission-menu-row">
            <el-icon
              class="expand-icon"
              :class="{ expanded: isExpanded(menu.id) }"
              @click="toggleExpand(menu.id)"
            >
              <ArrowRight />
            </el-icon>
            <el-checkbox
              :model-value="selectedPermissions.includes(menu.code)"
              @change="(val: boolean) => handleMenuChange(menu, val)"
            >
              <span class="menu-label">{{ menu.name }}</span>
              <el-tag size="small" type="info">{{ menu.code }}</el-tag>
            </el-checkbox>
          </div>
          <div v-show="isExpanded(menu.id)" class="permission-button-row">
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
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-toolbar {
  margin-bottom: 12px;
}

.permission-tree {
  max-height: 450px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  cursor: pointer;
  transition: transform 0.2s;
  color: #909399;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-icon:hover {
  color: #409eff;
}

.menu-label {
  font-weight: 600;
  margin-right: 8px;
}

.permission-button-row {
  padding-left: 48px;
  padding-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.permission-button-row .el-checkbox {
  margin-right: 0;
}
</style>
