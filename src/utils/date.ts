/**
 * 格式化日期时间（数据库已存储东八区时间，直接解析显示）
 * @param dateStr 数据库中的日期字符串（东八区）
 * @returns 格式化后的日期字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const y = date.getFullYear()
    const M = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${M}-${d} ${h}:${m}:${s}`
}
