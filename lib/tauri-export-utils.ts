/**
 * Tauri Web Export Utils
 *
 * 双环境兼容的文件导出工具库
 * 支持浏览器和 Tauri 桌面应用
 */

// ============================================================
// 类型定义
// ============================================================

/** 导出选项 */
export interface ExportOptions {
  filename?: string;
  title?: string;
  sheetName?: string;
}

/** 文件过滤器 */
interface FileFilter {
  name: string;
  extensions: string[];
}

// ============================================================
// 环境检测
// ============================================================

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' &&
         typeof (window as any).__TAURI__ !== 'undefined' &&
         typeof (window as any).__TAURI__.core !== 'undefined' &&
         typeof (window as any).__TAURI__.core.invoke === 'function';
}

// ============================================================
// Tauri API 封装
// ============================================================

/**
 * 显示保存文件对话框（仅 Tauri 环境）
 */
export async function showSaveDialog(
  defaultPath: string,
  title: string,
  filters: FileFilter[]
): Promise<string | null> {
  if (!isTauriEnvironment()) {
    throw new Error('showSaveDialog 只能在 Tauri 环境中使用');
  }

  const filePath = await (window as any).__TAURI__.core.invoke('plugin:dialog|save', {
    options: {
      defaultPath,
      title,
      filters
    }
  });

  return filePath;
}

/**
 * 写入文件（仅 Tauri 环境）
 */
export async function writeFile(filePath: string, bytes: Uint8Array): Promise<void> {
  if (!isTauriEnvironment()) {
    throw new Error('writeFile 只能在 Tauri 环境中使用');
  }

  await (window as any).__TAURI__.core.invoke(
    'plugin:fs|write_file',
    bytes,
    {
      headers: {
        path: encodeURIComponent(filePath),
        options: JSON.stringify({})
      }
    }
  );
}

/**
 * 导出二进制文件 - 支持浏览器和 Tauri 双环境
 */
export async function exportBinary(
  bytes: Uint8Array,
  options: ExportOptions = {},
  filters: FileFilter[] = [{ name: '所有文件', extensions: ['*'] }]
): Promise<boolean> {
  const {
    filename = '导出文件',
    title = '保存文件'
  } = options;

  try {
    if (!isTauriEnvironment()) {
      // 浏览器环境 - 使用 ArrayBuffer 确保类型兼容
      const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ [浏览器] 导出成功:', filename);
      return true;
    }

    // Tauri 环境
    console.log('📦 [Tauri] 开始保存文件:', filename);

    const filePath = await showSaveDialog(filename, title, filters);

    if (!filePath) {
      console.log('⚠️ [Tauri] 用户取消了保存');
      return false;
    }

    await writeFile(filePath, bytes);

    console.log('✅ [Tauri] 文件保存成功!');
    alert('文件保存成功!\n保存位置: ' + filePath);
    return true;

  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
}
