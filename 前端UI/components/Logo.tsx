
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <div className="overflow-hidden">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
          <span className="text-indigo-600">美团饿了么</span>菜单整理批量上架
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">外卖商家助手 · 高端数字化工具</p>
      </div>
    </div>
  );
};

export default Logo;
