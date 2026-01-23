
import React, { useState, useCallback, useMemo } from 'react';
import { MenuItem, ProcessingStatus } from './types';
import { extractMenuFromImages } from './services/geminiService';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [markupPercent, setMarkupPercent] = useState<number>(35);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      setFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const processMenu = async () => {
    if (previews.length === 0) return;
    
    setStatus(ProcessingStatus.ANALYZING);
    setError(null);
    
    try {
      const result = await extractMenuFromImages(previews);
      setMenuItems(result.items);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "发生意外错误");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setMenuItems([]);
    setStatus(ProcessingStatus.IDLE);
    setError(null);
  };

  const tableData = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      markupPrice: item.originalPrice * (1 + markupPercent / 100)
    }));
  }, [menuItems, markupPercent]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between py-3">
          <Logo />
          {status !== ProcessingStatus.IDLE && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              开始新分析
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* 引导文案 */}
        {status === ProcessingStatus.IDLE && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">秒级完成菜单数字化</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              上传菜单截图或照片。我们的 AI 将准确提取所有菜品名称和价格，
              并支持自定义设置溢价比例，即时生成结果。
            </p>
          </div>
        )}

        {/* 上传区域 */}
        {status === ProcessingStatus.IDLE && (
          <div className="glass-card rounded-3xl p-8 shadow-2xl shadow-indigo-100 border-indigo-50">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl py-16 hover:border-indigo-400 transition-all cursor-pointer bg-white group" onClick={() => document.getElementById('file-upload')?.click()}>
              <input 
                id="file-upload"
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-700">点击或拖拽上传菜单图片</p>
              <p className="text-slate-400 text-sm mt-1">支持 PNG, JPG 或 WebP (最大 10MB)</p>
            </div>

            {previews.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">已选图片 ({previews.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-md">
                      <img src={src} alt="预览" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={processMenu}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    立即开始 AI 提取
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 处理中状态 */}
        {status === ProcessingStatus.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">AI 正在努力分析菜单...</h3>
            <p className="text-slate-500 mt-2">正在精确转录菜品并提取价格信息。</p>
          </div>
        )}

        {/* 错误提示 */}
        {status === ProcessingStatus.ERROR && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-rose-900 mb-2">提取失败</h3>
            <p className="text-rose-700 mb-6">{error}</p>
            <button 
              onClick={reset}
              className="bg-rose-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-rose-700 transition-colors"
            >
              重试一次
            </button>
          </div>
        )}

        {/* 结果显示 */}
        {status === ProcessingStatus.SUCCESS && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 设置区域 */}
            <div className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">自定义溢价比例</h3>
                <p className="text-slate-500 text-sm">调整溢价百分比以更新第四列价格</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
                {[0, 10, 20, 30, 35, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMarkupPercent(val)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      markupPercent === val 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {val === 0 ? '原价' : `+${val}%`}
                  </button>
                ))}
                <div className="h-6 w-[1px] bg-slate-200 mx-2 flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-shrink-0">
                   <input 
                    type="number" 
                    value={markupPercent} 
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-16 p-2 rounded-lg border border-slate-200 text-center font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400 font-medium">%</span>
                </div>
              </div>
            </div>

            {/* 数据表格 */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">识别到的菜品 ({menuItems.length})</h3>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  导出数据
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">分类名称</th>
                      <th className="px-6 py-4">菜品名称</th>
                      <th className="px-6 py-4">基础价格</th>
                      <th className="px-6 py-4 bg-indigo-50/30 text-indigo-600">溢价后价格 ({markupPercent}%)</th>
                      <th className="px-6 py-4">当前库存</th>
                      <th className="px-6 py-4 text-right">每日库存</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tableData.length > 0 ? tableData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            新品上线
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {item.name}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-slate-500">
                            ¥{item.originalPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-5 bg-indigo-50/10">
                          <div className="flex items-center gap-3">
                             <span className="font-mono font-bold text-indigo-600 min-w-[80px]">
                              ¥{item.markupPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                              +¥{(item.markupPrice - item.originalPrice).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-slate-600 font-medium">50</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-slate-600 font-medium">50</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">
                          未在图片中检测到任何项目。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 px-8 py-4 flex justify-between items-center border-t border-slate-100">
                <span className="text-slate-400 text-sm">结果显示完毕</span>
                <div className="text-right">
                   <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">总计溢价后金额</p>
                   <p className="text-slate-900 font-black text-xl">¥{tableData.reduce((acc, curr) => acc + curr.markupPrice, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-20 border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-slate-400 text-sm">© 2024 美团饿了么菜单助手. 基于 Gemini 3 技术驱动。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
