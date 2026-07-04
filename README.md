# WebWrap

基于 Vue 3 + TypeScript + Vite 构建的卡密管理系统前端项目。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 请求**: Axios

## 功能模块

- **仪表盘** - 系统数据概览
- **用户管理** - 用户增删改查、状态管理
- **项目管理** - 项目增删改查、关联模板、分页查询
- **卡密管理** - 卡密生成、批量生成、禁用/恢复、解绑、分页查询
- **卡密模板** - HTML 模板上传、预览
- **角色管理** - 角色及权限配置

## 卡密类型

| 类型    | 值          | 默认有效时长（秒） |
| ------- | ----------- | ------------------ |
| 1小时卡 | `hourly`    | 3,600              |
| 日卡    | `daily`     | 86,400             |
| 周卡    | `weekly`    | 604,800            |
| 月卡    | `monthly`   | 2,592,000          |
| 年卡    | `yearly`    | 31,536,000         |
| 永久    | `permanent` | 999,999,999        |

## 卡密状态

| 状态   | 值         | 说明             |
| ------ | ---------- | ---------------- |
| 未使用 | `unused`   | 可用状态         |
| 已使用 | `used`     | 已被绑定使用     |
| 已过期 | `expired`  | 已过有效期       |
| 已禁用 | `disabled` | 手动禁用，可恢复 |

## 卡密功能开关

- **一机一码** - 开启后该卡密只能绑定一个设备ID，默认开启

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # 公共组件
├── mock/           # Mock 数据
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
│   ├── cardkey.ts  # 卡密相关
│   ├── project.ts  # 项目相关
│   ├── template.ts # 模板相关
│   └── user.ts     # 用户/权限相关
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
├── views/          # 页面视图
│   ├── Dashboard.vue
│   ├── Login.vue
│   ├── Layout.vue
│   ├── ProjectList.vue
│   ├── CardKeyList.vue
│   ├── TemplateList.vue
│   ├── UserList.vue
│   └── RoleList.vue
├── App.vue
├── main.ts
└── style.css
```

## 默认登录账户

- 邮箱：`admin@example.com`
- 密码：`admin123`

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
