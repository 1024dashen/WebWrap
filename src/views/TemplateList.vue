<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTemplateStore } from "../stores/template";
import { useUserStore } from "../stores/user";
import { UploadFilled } from "@element-plus/icons-vue";

const templateStore = useTemplateStore();
const userStore = useUserStore();

const dialogVisible = ref(false);
const previewVisible = ref(false);
const previewContent = ref("");
const previewTitle = ref("");

const form = reactive({
  name: "",
  fileName: "",
  htmlContent: "",
});

const handleAdd = () => {
  form.name = "";
  form.fileName = "";
  form.htmlContent = "";
  dialogVisible.value = true;
};

const handleDelete = (id: string, name: string) => {
  ElMessageBox.confirm(`确定要删除模板 "${name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      templateStore.deleteTemplate(id);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

const handleFileChange = (file: File) => {
  if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
    ElMessage.warning("请上传 HTML 文件");
    return false;
  }
  form.fileName = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    form.htmlContent = (e.target?.result as string) || "";
  };
  reader.readAsText(file);
  return false; // prevent auto upload
};

const handleSubmit = () => {
  if (!form.name) {
    ElMessage.warning("请填写模板名称");
    return;
  }
  if (!form.htmlContent) {
    ElMessage.warning("请上传HTML文件");
    return;
  }

  templateStore.addTemplate({
    name: form.name,
    fileName: form.fileName,
    htmlContent: form.htmlContent,
  });
  ElMessage.success("模板创建成功");
  dialogVisible.value = false;
};

const handlePreview = (name: string, content: string) => {
  previewTitle.value = name;
  previewContent.value = content;
  previewVisible.value = true;
};
</script>

<template>
  <div class="template-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>卡密模板管理</span>
          <el-button
            v-if="userStore.hasPermission('template:add')"
            type="primary"
            @click="handleAdd"
          >
            新增模板
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col
          v-for="template in templateStore.templates"
          :key="template.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card shadow="hover" class="template-card">
            <div class="template-icon">
              <el-icon :size="48"><Document /></el-icon>
            </div>
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-file">{{ template.fileName }}</p>
            <p class="template-date">创建于 {{ template.createdAt }}</p>
            <div class="template-actions">
              <el-button
                size="small"
                type="primary"
                link
                @click="handlePreview(template.name, template.htmlContent)"
              >
                预览
              </el-button>
              <el-button
                v-if="userStore.hasPermission('template:delete')"
                size="small"
                type="danger"
                link
                @click="handleDelete(template.id, template.name)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty
        v-if="templateStore.templates.length === 0"
        description="暂无模板"
      />
    </el-card>

    <!-- Add Dialog -->
    <el-dialog v-model="dialogVisible" title="新增卡密模板" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="HTML文件">
          <el-upload
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept=".html,.htm"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">仅支持 .html 文件</div>
            </template>
          </el-upload>
          <p v-if="form.fileName" class="uploaded-file">
            已选择: {{ form.fileName }}
          </p>
        </el-form-item>
        <el-form-item v-if="form.htmlContent" label="文件预览">
          <el-input
            v-model="form.htmlContent"
            type="textarea"
            :rows="6"
            readonly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      :title="previewTitle + ' - 预览'"
      width="700px"
    >
      <div class="preview-container">
        <el-tabs>
          <el-tab-pane label="渲染预览">
            <div class="preview-render" v-html="previewContent"></div>
          </el-tab-pane>
          <el-tab-pane label="源代码">
            <pre class="preview-source">{{ previewContent }}</pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Document } from "@element-plus/icons-vue";
export default {
  components: { Document },
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-card {
  margin-bottom: 20px;
  text-align: center;
}

.template-icon {
  color: #409eff;
  margin-bottom: 12px;
}

.template-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.template-file {
  font-size: 12px;
  color: #999;
  margin: 0 0 4px 0;
}

.template-date {
  font-size: 12px;
  color: #999;
  margin: 0 0 12px 0;
}

.template-actions {
  border-top: 1px solid #eee;
  padding-top: 12px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.uploaded-file {
  margin-top: 8px;
  font-size: 12px;
  color: #67c23a;
}

.preview-container {
  max-height: 500px;
  overflow: auto;
}

.preview-render {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  min-height: 200px;
}

.preview-source {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
