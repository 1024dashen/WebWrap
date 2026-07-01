<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "../stores/user";
import { mockRoles } from "../mock";
import type { User } from "../types";

const userStore = useUserStore();

const searchQuery = ref("");
const dialogVisible = ref(false);
const dialogTitle = ref("新增用户");
const editingUser = ref<User | null>(null);

const form = reactive({
  email: "",
  username: "",
  role: "",
  status: "active" as "active" | "disabled",
  password: "",
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) return userStore.users;
  const query = searchQuery.value.toLowerCase();
  return userStore.users.filter(
    (u) =>
      u.email.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query),
  );
});

const roleOptions = mockRoles.map((r) => r.name);

const resetForm = () => {
  form.email = "";
  form.username = "";
  form.role = "";
  form.status = "active";
  form.password = "";
  editingUser.value = null;
};

const handleAdd = () => {
  resetForm();
  dialogTitle.value = "新增用户";
  dialogVisible.value = true;
};

const handleEdit = (row: User) => {
  editingUser.value = row;
  dialogTitle.value = "编辑用户";
  form.email = row.email;
  form.username = row.username;
  form.role = row.role;
  form.status = row.status;
  form.password = "";
  dialogVisible.value = true;
};

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.deleteUser(row.id);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

const handleSubmit = () => {
  if (!form.email || !form.username || !form.role) {
    ElMessage.warning("请填写完整信息");
    return;
  }

  if (editingUser.value) {
    userStore.updateUser(editingUser.value.id, {
      email: form.email,
      username: form.username,
      role: form.role,
      status: form.status,
    });
    ElMessage.success("更新成功");
  } else {
    if (!form.password) {
      ElMessage.warning("请输入密码");
      return;
    }
    userStore.addUser({
      email: form.email,
      username: form.username,
      role: form.role,
      status: form.status,
    });
    ElMessage.success("添加成功");
  }
  dialogVisible.value = false;
};

const handleToggleStatus = (row: User) => {
  const newStatus = row.status === "active" ? "disabled" : "active";
  userStore.updateUser(row.id, { status: newStatus });
  ElMessage.success(`已${newStatus === "active" ? "启用" : "禁用"}用户`);
};
</script>

<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户..."
              style="width: 200px"
              clearable
            />
            <el-button
              v-if="userStore.hasPermission('user:add')"
              type="primary"
              @click="handleAdd"
            >
              新增用户
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredUsers" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === "active" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建日期" width="120" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="userStore.hasPermission('user:edit')"
              size="small"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="userStore.hasPermission('user:edit')"
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === "active" ? "禁用" : "启用" }}
            </el-button>
            <el-button
              v-if="userStore.hasPermission('user:delete')"
              size="small"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="form.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role"
              :label="role"
              :value="role"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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

.header-actions {
  display: flex;
  gap: 12px;
}
</style>
