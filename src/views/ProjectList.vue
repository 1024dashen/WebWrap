<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProjectStore } from "../stores/project";
import { useUserStore } from "../stores/user";
import type { Project } from "../types";

const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();

const searchQuery = ref("");
const dialogVisible = ref(false);
const dialogTitle = ref("新增项目");
const editingProject = ref<Project | null>(null);

const form = reactive({
  name: "",
  url: "",
  status: "active" as "active" | "archived",
});

const filteredProjects = computed(() => {
  if (!searchQuery.value) return projectStore.projects;
  const query = searchQuery.value.toLowerCase();
  return projectStore.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.url.toLowerCase().includes(query),
  );
});

const resetForm = () => {
  form.name = "";
  form.url = "";
  form.status = "active";
  editingProject.value = null;
};

const handleAdd = () => {
  resetForm();
  dialogTitle.value = "新增项目";
  dialogVisible.value = true;
};

const handleEdit = (row: Project, event: Event) => {
  event.stopPropagation();
  editingProject.value = row;
  dialogTitle.value = "编辑项目";
  form.name = row.name;
  form.url = row.url;
  form.status = row.status;
  dialogVisible.value = true;
};

const handleDelete = (row: Project, event: Event) => {
  event.stopPropagation();
  ElMessageBox.confirm(`确定要删除项目 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      projectStore.deleteProject(row.id);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

const handleSubmit = () => {
  if (!form.name || !form.url) {
    ElMessage.warning("请填写完整信息");
    return;
  }

  if (editingProject.value) {
    projectStore.updateProject(editingProject.value.id, {
      name: form.name,
      url: form.url,
      status: form.status,
    });
    ElMessage.success("更新成功");
  } else {
    projectStore.addProject({
      name: form.name,
      url: form.url,
      status: form.status,
    });
    ElMessage.success("添加成功");
  }
  dialogVisible.value = false;
};

const handleEnterProject = (project: Project) => {
  router.push(`/projects/${project.id}/cardkeys`);
};
</script>

<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索项目..."
              style="width: 200px"
              clearable
            />
            <el-button
              v-if="userStore.hasPermission('project:add')"
              type="primary"
              @click="handleAdd"
            >
              新增项目
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col
          v-for="project in filteredProjects"
          :key="project.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card
            shadow="hover"
            class="project-card"
            @click="handleEnterProject(project)"
          >
            <div class="project-icon">
              <el-icon :size="48"><Folder /></el-icon>
            </div>
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-url">{{ project.url }}</p>
            <div class="project-info">
              <el-tag
                :type="project.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ project.status === "active" ? "活跃" : "已归档" }}
              </el-tag>
              <span class="cardkey-count">{{ project.cardKeyCount }} 卡密</span>
            </div>
            <div class="project-actions" @click.stop>
              <el-button
                v-if="userStore.hasPermission('project:edit')"
                size="small"
                type="primary"
                link
                @click="handleEdit(project, $event)"
              >
                编辑
              </el-button>
              <el-button
                v-if="userStore.hasPermission('project:delete')"
                size="small"
                type="danger"
                link
                @click="handleDelete(project, $event)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredProjects.length === 0" description="暂无项目" />
    </el-card>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目URL">
          <el-input v-model="form.url" placeholder="请输入项目URL地址" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="active">活跃</el-radio>
            <el-radio value="archived">归档</el-radio>
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

<script lang="ts">
import { Folder } from "@element-plus/icons-vue";
export default {
  components: { Folder },
};
</script>

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

.project-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
  text-align: center;
}

.project-card:hover {
  transform: translateY(-5px);
}

.project-icon {
  color: #409eff;
  margin-bottom: 12px;
}

.project-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.project-url {
  font-size: 12px;
  color: #999;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cardkey-count {
  font-size: 12px;
  color: #666;
}

.project-actions {
  border-top: 1px solid #eee;
  padding-top: 12px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
