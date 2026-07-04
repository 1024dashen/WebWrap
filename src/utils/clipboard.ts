/**
 * 复制到剪贴板（兼容 HTTP 非安全上下文）
 * 优先使用 navigator.clipboard API，不可用时回退到 execCommand
 */
export async function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return
    }

    // Fallback: 创建临时 textarea 执行复制
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
        document.execCommand('copy')
    } finally {
        document.body.removeChild(textarea)
    }
}
