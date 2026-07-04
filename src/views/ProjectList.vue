<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectStore } from '../stores/project'
import { useUserStore } from '../stores/user'
import { useTemplateStore } from '../stores/template'
import type { Project } from '../types'

const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()
const templateStore = useTemplateStore()

const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('新增项目')
const editingProject = ref<Project | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const form = reactive({
    name: '',
    url: '',
    status: 'active' as 'active' | 'archived',
    template_id: null as number | null,
})

const loadProjects = () => {
    projectStore.fetchProjects(currentPage.value, pageSize.value)
}

const handlePageChange = (page: number) => {
    currentPage.value = page
    loadProjects()
}

const handleSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    loadProjects()
}

const filteredProjects = computed(() => {
    if (!searchQuery.value) return projectStore.projects
    const query = searchQuery.value.toLowerCase()
    return projectStore.projects.filter(
        (p) =>
            p.name.toLowerCase().includes(query) ||
            p.url.toLowerCase().includes(query),
    )
})

const resetForm = () => {
    form.name = ''
    form.url = ''
    form.status = 'active'
    form.template_id = null
    editingProject.value = null
}

const handleAdd = () => {
    resetForm()
    dialogTitle.value = '新增项目'
    dialogVisible.value = true
}

const handleEdit = (row: Project, event: Event) => {
    event.stopPropagation()
    editingProject.value = row
    dialogTitle.value = '编辑项目'
    form.name = row.name
    form.url = row.url
    form.status = row.status
    form.template_id = (row as any).template_id || null
    dialogVisible.value = true
}

const handleDelete = (row: Project, event: Event) => {
    event.stopPropagation()
    ElMessageBox.confirm(
        `确定要删除项目 "${row.name}" 吗？该项目下的所有卡密也将被一并删除，此操作不可恢复。`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        },
    )
        .then(async () => {
            try {
                await projectStore.deleteProject(row.id)
                ElMessage.success('删除成功')
                loadProjects()
            } catch (error) {
                ElMessage.error('删除失败')
            }
        })
        .catch(() => {})
}

const handleSubmit = async () => {
    if (!form.name || !form.url) {
        ElMessage.warning('请填写完整信息')
        return
    }

    try {
        if (editingProject.value) {
            await projectStore.updateProject(editingProject.value.id, {
                name: form.name,
                url: form.url,
                status: form.status,
                template_id: form.template_id,
            })
            ElMessage.success('更新成功')
        } else {
            await projectStore.addProject({
                name: form.name,
                url: form.url,
                status: form.status,
                template_id: form.template_id,
            })
            ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadProjects()
    } catch (error) {
        ElMessage.error('操作失败')
    }
}

const getCardKeyLink = (project: Project) => {
    if (!project.template_id) return ''
    return `http://localhost:3000/api/templates/preview/${project.template_id}/${project.id}`
}

const handleCopyLink = (project: Project, event: Event) => {
    event.stopPropagation()
    const link = getCardKeyLink(project)
    if (!link) return
    navigator.clipboard
        .writeText(link)
        .then(() => {
            ElMessage.success('链接已复制到剪贴板')
        })
        .catch(() => {
            ElMessage.error('复制失败')
        })
}

const handleEnterProject = (project: Project) => {
    router.push(`/projects/${project.id}/cardkeys`)
}

onMounted(() => {
    loadProjects()
    templateStore.fetchTemplates()
})
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

            <el-table
                :data="filteredProjects"
                style="width: 100%"
                @row-click="handleEnterProject"
                class="project-table"
            >
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="name" label="项目名称" min-width="150">
                    <template #default="{ row }">
                        <el-link type="primary">{{ row.name }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="url" label="项目URL" min-width="200">
                    <template #default="{ row }">
                        <span class="url-text">{{ row.url }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="卡密链接" min-width="200">
                    <template #default="{ row }">
                        <template v-if="getCardKeyLink(row)">
                            <el-link
                                type="success"
                                :href="getCardKeyLink(row)"
                                target="_blank"
                                @click.stop
                                class="cardkey-link"
                            >
                                查看
                            </el-link>
                            <el-button
                                type="success"
                                link
                                @click.stop="handleCopyLink(row, $event)"
                            >
                                复制
                            </el-button>
                        </template>
                        <span v-else class="no-link">-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag
                            :type="row.status === 'active' ? 'success' : 'info'"
                        >
                            {{ row.status === 'active' ? '活跃' : '已归档' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="cardKeyCount"
                    label="卡密数量"
                    width="100"
                >
                    <template #default="{ row }">
                        <el-tag type="info">{{ row.cardKeyCount }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="created_at"
                    label="创建日期"
                    width="120"
                />
                <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                        <el-button
                            v-if="userStore.hasPermission('project:edit')"
                            size="small"
                            type="primary"
                            link
                            @click.stop="handleEdit(row, $event)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            v-if="userStore.hasPermission('project:delete')"
                            size="small"
                            type="danger"
                            link
                            @click.stop="handleDelete(row, $event)"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrap">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50]"
                    :total="projectStore.total"
                    layout="total, sizes, prev, pager, next"
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                />
            </div>
        </el-card>

        <!-- Dialog -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
            <el-form :model="form" label-width="100px">
                <el-form-item label="项目名称">
                    <el-input
                        v-model="form.name"
                        placeholder="请输入项目名称"
                    />
                </el-form-item>
                <el-form-item label="项目URL">
                    <el-input
                        v-model="form.url"
                        placeholder="请输入项目URL地址"
                    />
                </el-form-item>
                <el-form-item label="卡密模板">
                    <el-select
                        v-model="form.template_id"
                        placeholder="请选择卡密模板（可选）"
                        clearable
                        style="width: 100%"
                    >
                        <el-option
                            v-for="template in templateStore.templates"
                            :key="template.id"
                            :label="template.name"
                            :value="Number(template.id)"
                        />
                    </el-select>
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

.project-table {
    cursor: pointer;
}

.project-table :deep(.el-table__body tr) {
    cursor: pointer;
}

.project-table :deep(.el-table__body tr:hover > td) {
    background-color: #f5f7fa;
}

.url-text {
    font-size: 13px;
    color: #666;
}

.cardkey-link {
    margin-right: 4px;
}

.no-link {
    color: #ccc;
}

.pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}
</style>
