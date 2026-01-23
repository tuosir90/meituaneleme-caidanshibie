/**
 * Tauri Clipboard Utils
 * 双环境兼容的剪贴板工具库
 * 支持浏览器和 Tauri 桌面应用
 */

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' &&
         typeof (window as any).__TAURI__ !== 'undefined' &&
         typeof (window as any).__TAURI__.core !== 'undefined' &&
         typeof (window as any).__TAURI__.core.invoke === 'function';
}

/**
 * 复制文本到剪贴板 - 支持浏览器和 Tauri 双环境
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (isTauriEnvironment()) {
      // Tauri 环境 - 使用 Tauri 剪贴板 API
      console.log('📋 [Tauri] 复制到剪贴板');
      await (window as any).__TAURI__.core.invoke('plugin:clipboard-manager|write_text', {
        text
      });
      console.log('✅ [Tauri] 复制成功');
      return true;
    } else {
      // 浏览器环境 - 使用 Web API
      console.log('📋 [浏览器] 复制到剪贴板');
      await navigator.clipboard.writeText(text);
      console.log('✅ [浏览器] 复制成功');
      return true;
    }
  } catch (error) {
    console.error('复制失败:', error);

    // 降级方案：使用 execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ [降级] 复制成功');
      return true;
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError);
      return false;
    }
  }
}

/**
 * 从剪贴板读取文本 - 支持浏览器和 Tauri 双环境
 * @returns 剪贴板中的文本，失败返回空字符串
 */
export async function readFromClipboard(): Promise<string> {
  try {
    if (isTauriEnvironment()) {
      // Tauri 环境
      const text = await (window as any).__TAURI__.core.invoke('plugin:clipboard-manager|read_text');
      return text || '';
    } else {
      // 浏览器环境
      return await navigator.clipboard.readText();
    }
  } catch (error) {
    console.error('读取剪贴板失败:', error);
    return '';
  }
}
