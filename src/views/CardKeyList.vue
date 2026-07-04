<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCardKeyStore } from '../stores/cardkey'
import { useProjectStore } from '../stores/project'
import { useUserStore } from '../stores/user'
import type { CardKey } from '../types'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const cardKeyStore = useCardKeyStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const projectId = route.params.id as string
const project = computed(() => projectStore.getProjectById(projectId))

const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const dialogVisible = ref(false)

const form = reactive({
    key: '',
    type: 'monthly' as CardKey['type'],
    status: 'unused' as CardKey['status'],
    duration: 2592000,
    remark: '月卡',
    oneDeviceOneCode: true,
    expireAt: '',
    count: 1,
})

const editingCardKey = ref<CardKey | null>(null)

const typeDurationMap: Record<CardKey['type'], number> = {
    hourly: 3600,
    daily: 86400,
    weekly: 604800,
    monthly: 2592000,
    yearly: 31536000,
    permanent: 999999999,
}

watch(
    () => form.type,
    (newType) => {
        form.duration = typeDurationMap[newType]
        form.remark = getTypeLabel(newType)
    },
    { flush: 'sync' },
)

const typeOptions = [
    { label: '1小时卡', value: 'hourly' },
    { label: '日卡', value: 'daily' },
    { label: '周卡', value: 'weekly' },
    { label: '月卡', value: 'monthly' },
    { label: '年卡', value: 'yearly' },
    { label: '永久', value: 'permanent' },
]

const statusOptions = [
    { label: '未使用', value: 'unused' },
    { label: '已使用', value: 'used' },
    { label: '已过期', value: 'expired' },
    { label: '已禁用', value: 'disabled' },
]

const filteredCardKeys = computed(() => {
    let result = cardKeyStore.cardKeys
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter((k) => k.key.toLowerCase().includes(query))
    }
    if (filterStatus.value) {
        result = result.filter((k) => k.status === filterStatus.value)
    }
    if (filterType.value) {
        result = result.filter((k) => k.type === filterType.value)
    }
    return result
})

const getTypeLabel = (type: string) => {
    const option = typeOptions.find((o) => o.value === type)
    return option?.label || type
}

const getStatusLabel = (status: string) => {
    const option = statusOptions.find((o) => o.value === status)
    return option?.label || status
}

const getStatusType = (status: string) => {
    switch (status) {
        case 'unused':
            return 'success'
        case 'used':
            return 'warning'
        case 'expired':
        case 'disabled':
            return 'danger'
        default:
            return 'info'
    }
}

const handleAdd = () => {
    editingCardKey.value = null
    form.key = ''
    form.type = 'monthly'
    form.duration = typeDurationMap['monthly']
    form.remark = getTypeLabel('monthly')
    form.oneDeviceOneCode = true
    form.status = 'unused'
    form.expireAt = ''
    form.count = 1
    dialogVisible.value = true
}

const handleCopyUrl = () => {
    if (project.value?.url) {
        navigator.clipboard.writeText(project.value.url)
        ElMessage.success('项目链接已复制到剪贴板')
    } else {
        ElMessage.warning('未找到项目链接')
    }
}

const handleEdit = (row: CardKey) => {
    editingCardKey.value = row
    form.key = row.key
    form.type = row.type
    form.duration = row.duration ?? typeDurationMap[row.type]
    form.remark = row.remark ?? getTypeLabel(row.type)
    form.oneDeviceOneCode = row.oneDeviceOneCode ?? false
    form.status = row.status
    form.expireAt = row.expireAt || ''
    dialogVisible.value = true
}

const handleDelete = (row: CardKey) => {
    ElMessageBox.confirm('确定要删除此卡密吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                await cardKeyStore.deleteCardKey(row.id)
                await cardKeyStore.fetchCardKeysByProjectId(projectId)
                ElMessage.success('删除成功')
            } catch (error) {
                ElMessage.error('删除失败')
            }
        })
        .catch(() => {})
}

const handleDisable = (row: CardKey) => {
    ElMessageBox.confirm('确定要禁用此卡密吗？禁用后将无法使用。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                await cardKeyStore.updateCardKey(row.id, { status: 'disabled' })
                await cardKeyStore.fetchCardKeysByProjectId(projectId)
                ElMessage.success('已禁用')
            } catch (error) {
                ElMessage.error('操作失败')
            }
        })
        .catch(() => {})
}

const handleRestore = (row: CardKey) => {
    ElMessageBox.confirm('确定要恢复此卡密吗？恢复后可正常使用。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
    })
        .then(async () => {
            try {
                await cardKeyStore.updateCardKey(row.id, { status: 'unused' })
                await cardKeyStore.fetchCardKeysByProjectId(projectId)
                ElMessage.success('已恢复')
            } catch (error) {
                ElMessage.error('操作失败')
            }
        })
        .catch(() => {})
}

const handleUnbind = (row: CardKey) => {
    ElMessageBox.confirm(
        '确定要解绑此卡密吗？将移除设备绑定并恢复为未使用状态。',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        },
    )
        .then(async () => {
            try {
                await cardKeyStore.updateCardKey(row.id, {
                    status: 'unused',
                    deviceId: '',
                    usedBy: '',
                })
                await cardKeyStore.fetchCardKeysByProjectId(projectId)
                ElMessage.success('解绑成功')
            } catch (error) {
                ElMessage.error('操作失败')
            }
        })
        .catch(() => {})
}

const handleSubmit = async () => {
    if (editingCardKey.value) {
        if (!form.key) {
            ElMessage.warning('请填写卡密')
            return
        }
        try {
            await cardKeyStore.updateCardKey(editingCardKey.value.id, {
                key: form.key,
                type: form.type,
                status: form.status,
                duration: form.duration,
                remark: form.remark,
                oneDeviceOneCode: form.oneDeviceOneCode,
                expireAt: form.expireAt || undefined,
            })
            ElMessage.success('更新成功')
            dialogVisible.value = false
            await cardKeyStore.fetchCardKeysByProjectId(projectId)
        } catch (error) {
            ElMessage.error('操作失败')
        }
        return
    }

    const count = form.count || 1
    try {
        if (count === 1) {
            const key = cardKeyStore.generateKey()
            await cardKeyStore.addCardKey({
                projectId,
                key,
                type: form.type,
                status: form.status,
                duration: form.duration,
                remark: form.remark,
                oneDeviceOneCode: form.oneDeviceOneCode,
                expireAt: form.expireAt || undefined,
            })
            ElMessage.success('添加成功')
        } else {
            await cardKeyStore.batchAddCardKeys(
                projectId,
                form.type,
                count,
                form.status,
                form.duration,
                form.remark,
                form.oneDeviceOneCode,
            )
            ElMessage.success(`已生成 ${count} 张卡密`)
        }
        dialogVisible.value = false
        await cardKeyStore.fetchCardKeysByProjectId(projectId)
    } catch (error) {
        ElMessage.error('操作失败')
    }
}

const handleBack = () => {
    router.push('/projects')
}

const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    ElMessage.success('卡密已复制到剪贴板')
}

onMounted(() => {
    projectStore.fetchProjects()
    cardKeyStore.fetchCardKeysByProjectId(projectId)
})
</script>

<template>
    <div class="cardkey-list">
        <el-card>
            <template #header>
                <div class="card-header">
                    <div class="header-left">
                        <el-button :icon="ArrowLeft" @click="handleBack">
                            返回
                        </el-button>
                        <span class="title">
                            {{ project?.name }} - 卡密管理
                        </span>
                    </div>
                    <div class="header-actions">
                        <el-input
                            v-model="searchQuery"
                            placeholder="搜索卡密..."
                            style="width: 200px"
                            clearable
                        />
                        <el-select
                            v-model="filterStatus"
                            placeholder="状态筛选"
                            clearable
                            style="width: 120px"
                        >
                            <el-option
                                v-for="opt in statusOptions"
                                :key="opt.value"
                                :label="opt.label"
                                :value="opt.value"
                            />
                        </el-select>
                        <el-select
                            v-model="filterType"
                            placeholder="类型筛选"
                            clearable
                            style="width: 120px"
                        >
                            <el-option
                                v-for="opt in typeOptions"
                                :key="opt.value"
                                :label="opt.label"
                                :value="opt.value"
                            />
                        </el-select>
                        <el-button
                            v-if="userStore.hasPermission('cardkey:add')"
                            type="success"
                            @click="handleCopyUrl"
                        >
                            验证地址
                        </el-button>
                        <el-button
                            v-if="userStore.hasPermission('cardkey:add')"
                            type="primary"
                            @click="handleAdd"
                        >
                            新增卡密
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table :data="filteredCardKeys" style="width: 100%">
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="key" label="卡密" min-width="200">
                    <template #default="{ row }">
                        <div class="key-cell">
                            <code class="card-key">{{ row.key }}</code>
                            <el-button
                                size="small"
                                type="primary"
                                link
                                @click="handleCopyKey(row.key)"
                            >
                                复制
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="{ row }">
                        <el-tag>{{ getTypeLabel(row.type) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">{{
                            getStatusLabel(row.status)
                        }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="usedBy" label="使用者" width="120">
                    <template #default="{ row }">
                        {{ row.usedBy || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="deviceId" label="设备ID" min-width="150">
                    <template #default="{ row }">
                        {{ row.deviceId || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="createdAt"
                    label="创建日期"
                    width="120"
                />
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            v-if="userStore.hasPermission('cardkey:edit')"
                            size="small"
                            type="primary"
                            link
                            @click="handleEdit(row)"
                        >
                            编辑
                        </el-button>
                        <el-button
                            v-if="
                                userStore.hasPermission('cardkey:edit') &&
                                row.status !== 'disabled'
                            "
                            size="small"
                            type="warning"
                            link
                            @click="handleDisable(row)"
                        >
                            禁用
                        </el-button>
                        <el-button
                            v-if="
                                userStore.hasPermission('cardkey:edit') &&
                                row.status === 'disabled'
                            "
                            size="small"
                            type="success"
                            link
                            @click="handleRestore(row)"
                        >
                            恢复
                        </el-button>
                        <el-button
                            v-if="
                                userStore.hasPermission('cardkey:edit') &&
                                row.deviceId
                            "
                            size="small"
                            type="info"
                            link
                            @click="handleUnbind(row)"
                        >
                            解绑
                        </el-button>
                        <el-button
                            v-if="userStore.hasPermission('cardkey:delete')"
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

        <!-- Add/Edit Dialog -->
        <el-dialog
            v-model="dialogVisible"
            :title="editingCardKey ? '编辑卡密' : '新增卡密'"
            width="500px"
        >
            <el-form :model="form" label-width="80px">
                <el-form-item v-if="editingCardKey" label="卡密">
                    <el-input v-model="form.key" placeholder="卡密">
                        <template #append>
                            <el-button
                                @click="form.key = cardKeyStore.generateKey()"
                                >随机生成</el-button
                            >
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="form.type" style="width: 100%">
                        <el-option
                            v-for="opt in typeOptions"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="有效时长">
                    <el-input-number
                        v-model="form.duration"
                        :min="1"
                        style="width: 100%"
                    >
                        <template #suffix>秒</template>
                    </el-input-number>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="form.status" style="width: 100%">
                        <el-option
                            v-for="opt in statusOptions"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item v-if="!editingCardKey" label="数量">
                    <el-input-number
                        v-model="form.count"
                        :min="1"
                        :max="1000"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item v-if="editingCardKey" label="过期时间">
                    <el-date-picker
                        v-model="form.expireAt"
                        type="date"
                        placeholder="选择过期时间"
                        style="width: 100%"
                        value-format="YYYY-MM-DD"
                    />
                </el-form-item>
                <el-form-item label="功能开关">
                    <el-switch
                        v-model="form.oneDeviceOneCode"
                        active-text="一机一码"
                        inactive-text=""
                    />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.remark" placeholder="请输入备注" />
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
    flex-wrap: wrap;
    gap: 12px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-left .title {
    font-size: 16px;
    font-weight: bold;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.key-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.card-key {
    font-family: monospace;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 4px;
}
</style>
