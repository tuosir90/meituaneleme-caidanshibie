'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarkupSelectorProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const PRESET_VALUES = [0, 10, 20, 30, 35, 50]

export function MarkupSelector({ value, onChange, className }: MarkupSelectorProps) {
  return (
    <div className={cn('glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-primary/5', className)}>
      <div>
        <h3 className="text-xl font-bold text-foreground">自定义溢价比例</h3>
        <p className="text-muted-foreground text-sm">调整溢价百分比以更新第四列价格</p>
      </div>

      <div className="flex items-center gap-3 bg-background p-2 rounded-2xl shadow-sm border border-border overflow-x-auto max-w-full">
        {PRESET_VALUES.map((val) => (
          <Button
            key={val}
            variant={value === val ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(val)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
              value === val && 'shadow-lg shadow-primary/20 scale-105'
            )}
          >
            {val === 0 ? '原价' : `+${val}%`}
          </Button>
        ))}

        <div className="h-6 w-[1px] bg-border mx-2 flex-shrink-0" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-16 text-center font-bold text-primary"
          />
          <span className="text-muted-foreground font-medium">%</span>
        </div>
      </div>
    </div>
  )
}
