/**
 * 格式化日期时间（UTC → 本地显示，+8h）
 * @param dateStr 数据库中的日期字符串（UTC）
 * @returns 格式化后的日期字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-'
    const date = new Date(new Date(dateStr).getTime() + 8 * 60 * 60 * 1000)
    const y = date.getFullYear()
    const M = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${M}-${d} ${h}:${m}:${s}`
}
