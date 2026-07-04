<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTemplateStore } from '../stores/template'
import { useUserStore } from '../stores/user'
import { UploadFilled } from '@element-plus/icons-vue'

const templateStore = useTemplateStore()
const userStore = useUserStore()

const dialogVisible = ref(false)
const fileLoading = ref(false)

const form = reactive({
    name: '',
    fileName: '',
    htmlContent: '',
})

const handleAdd = () => {
    form.name = ''
    form.fileName = ''
    form.htmlContent = ''
    dialogVisible.value = true
}

const handleDelete = (id: string, name: string) => {
    ElMessageBox.confirm(`确定要删除模板 "${name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                await templateStore.deleteTemplate(id)
                ElMessage.success('删除成功')
            } catch (error) {
                ElMessage.error('删除失败')
            }
        })
        .catch(() => {})
}

const handleFileChange = (uploadFile: any) => {
    const file = uploadFile.raw
    if (!file) {
        ElMessage.warning('请选择文件')
        return false
    }
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        ElMessage.warning('请上传 HTML 文件')
        return false
    }
    form.fileName = file.name
    fileLoading.value = true
    const reader = new FileReader()
    reader.onload = (e) => {
        form.htmlContent = (e.target?.result as string) || ''
        fileLoading.value = false
    }
    reader.onerror = () => {
        ElMessage.error('文件读取失败')
        fileLoading.value = false
    }
    reader.readAsText(file)
    return false // prevent auto upload
}

const handleSubmit = async () => {
    if (!form.name) {
        ElMessage.warning('请填写模板名称')
        return
    }
    if (!form.htmlContent) {
        ElMessage.warning('请上传HTML文件')
        return
    }

    try {
        await templateStore.addTemplate({
            name: form.name,
            fileName: form.fileName,
            htmlContent: form.htmlContent,
        })
        ElMessage.success('模板创建成功')
        dialogVisible.value = false
    } catch (error) {
        ElMessage.error('创建失败')
    }
}

const handlePreview = (id: string) => {
    window.open(`http://localhost:3000/api/templates/preview/${id}`, '_blank')
}

onMounted(() => {
    templateStore.fetchTemplates()
})
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
                        <p class="template-date">
                            创建于 {{ template.createdAt }}
                        </p>
                        <div class="template-actions">
                            <el-button
                                v-if="
                                    userStore.hasPermission('template:preview')
                                "
                                size="small"
                                type="primary"
                                link
                                @click="handlePreview(template.id)"
                            >
                                预览
                            </el-button>
                            <el-button
                                v-if="
                                    userStore.hasPermission('template:delete')
                                "
                                size="small"
                                type="danger"
                                link
                                @click="
                                    handleDelete(template.id, template.name)
                                "
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
                    <el-input
                        v-model="form.name"
                        placeholder="请输入模板名称"
                    />
                </el-form-item>
                <el-form-item label="HTML文件">
                    <el-upload
                        drag
                        :auto-upload="false"
                        :show-file-list="false"
                        accept=".html,.htm"
                        :on-change="handleFileChange"
                    >
                        <el-icon class="el-icon--upload"
                            ><UploadFilled
                        /></el-icon>
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
                <el-button
                    type="primary"
                    :loading="fileLoading"
                    @click="handleSubmit"
                    >确定</el-button
                >
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Document } from '@element-plus/icons-vue'
export default {
    components: { Document },
}
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
</style>
