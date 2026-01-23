import { CirclePlus } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
        <CirclePlus className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="overflow-hidden">
        <h1 className="text-xl font-bold text-foreground tracking-tight whitespace-nowrap">
          <span className="text-primary">美团饿了么</span>菜单整理批量上架
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          外卖商家助手 · 高端数字化工具
        </p>
      </div>
    </div>
  )
}
