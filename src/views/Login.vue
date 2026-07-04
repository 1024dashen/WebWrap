<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)

const loginForm = reactive({
    email: '',
    password: '',
})

const registerForm = reactive({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
})

const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
        ElMessage.warning('请填写完整信息')
        return
    }
    loading.value = true
    try {
        const success = await userStore.login(
            loginForm.email,
            loginForm.password,
        )
        if (success) {
            ElMessage.success('登录成功')
            router.push('/dashboard')
        } else {
            ElMessage.error('登录失败，请检查邮箱和密码')
        }
    } catch (error) {
        ElMessage.error('登录失败，请检查邮箱和密码')
    } finally {
        loading.value = false
    }
}

const handleRegister = async () => {
    if (
        !registerForm.email ||
        !registerForm.username ||
        !registerForm.password
    ) {
        ElMessage.warning('请填写完整信息')
        return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
        ElMessage.warning('两次密码不一致')
        return
    }
    loading.value = true
    try {
        const success = await userStore.register(
            registerForm.email,
            registerForm.username,
            registerForm.password,
        )
        if (success) {
            ElMessage.success('注册成功')
            router.push('/dashboard')
        } else {
            ElMessage.error('注册失败')
        }
    } catch (error) {
        ElMessage.error('注册失败')
    } finally {
        loading.value = false
    }
}

const toggleMode = () => {
    isLogin.value = !isLogin.value
}
</script>

<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <h1>卡密管理系统</h1>
            </div>

            <!-- Login Form -->
            <el-form
                v-if="isLogin"
                class="login-form"
                @submit.prevent="handleLogin"
            >
                <el-form-item>
                    <el-input
                        v-model="loginForm.email"
                        placeholder="邮箱地址"
                        prefix-icon="Message"
                        size="large"
                    />
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="密码"
                        prefix-icon="Lock"
                        size="large"
                        show-password
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        :loading="loading"
                        style="width: 100%"
                        native-type="submit"
                    >
                        登录
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- Register Form -->
            <el-form v-else class="login-form" @submit.prevent="handleRegister">
                <el-form-item>
                    <el-input
                        v-model="registerForm.email"
                        placeholder="邮箱地址"
                        prefix-icon="Message"
                        size="large"
                    />
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-model="registerForm.username"
                        placeholder="用户名"
                        prefix-icon="User"
                        size="large"
                    />
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="密码"
                        prefix-icon="Lock"
                        size="large"
                        show-password
                    />
                </el-form-item>
                <el-form-item>
                    <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="确认密码"
                        prefix-icon="Lock"
                        size="large"
                        show-password
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        :loading="loading"
                        style="width: 100%"
                        native-type="submit"
                    >
                        注册
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="login-footer">
                <el-button link type="primary" @click="toggleMode">
                    {{ isLogin ? '没有账户？去注册' : '已有账户？去登录' }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h1 {
    color: #333;
    font-size: 24px;
    margin: 0 0 8px 0;
}

.login-header p {
    color: #666;
    font-size: 14px;
    margin: 0;
}

.login-form {
    margin-top: 20px;
}

.login-footer {
    text-align: center;
    margin-top: 16px;
}
</style>
