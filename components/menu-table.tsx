'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef
} from '@tanstack/react-table'
import { Printer, Copy, Check, FileSpreadsheet } from 'lucide-react'
import { MenuTableItem } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { exportMenuToExcel, exportMeituanExcel } from '@/lib/export-excel'
import { copyToClipboard } from '@/lib/tauri-clipboard-utils'

interface MenuTableProps {
  data: MenuTableItem[]
  markupPercent: number
  className?: string
}

type ColumnKey = 'category' | 'name' | 'originalPrice' | 'markupPrice' | 'currentStock' | 'dailyStock' | 'autoReplenish'

export function MenuTable({ data, markupPercent, className }: MenuTableProps) {
  const [copiedColumn, setCopiedColumn] = useState<ColumnKey | null>(null)

  const getColumnData = useCallback((columnKey: ColumnKey): string => {
    switch (columnKey) {
      case 'category':
        return data.map(() => '新品上线').join('\n')
      case 'name':
        return data.map(item => item.name).join('\n')
      case 'originalPrice':
        return data.map(item => item.originalPrice.toFixed(2)).join('\n')
      case 'markupPrice':
        return data.map(item => item.markupPrice.toFixed(2)).join('\n')
      case 'currentStock':
        return data.map(() => '50').join('\n')
      case 'dailyStock':
        return data.map(() => '50').join('\n')
      case 'autoReplenish':
        return data.map(() => '1').join('\n')
      default:
        return ''
    }
  }, [data])

  const handleCopyColumn = useCallback(async (columnKey: ColumnKey) => {
    const columnData = getColumnData(columnKey)
    try {
      const success = await copyToClipboard(columnData)
      if (success) {
        setCopiedColumn(columnKey)
        setTimeout(() => setCopiedColumn(null), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [getColumnData])

  const CopyColumnButton = ({ columnKey }: { columnKey: ColumnKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-primary/10 ml-1"
      onClick={(e) => {
        e.stopPropagation()
        handleCopyColumn(columnKey)
      }}
      title="复制整列"
    >
      {copiedColumn === columnKey ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
      )}
    </Button>
  )

  const columns = useMemo<ColumnDef<MenuTableItem>[]>(
    () => [
      {
        id: 'category',
        header: () => (
          <div className="flex items-center">
            <span>分类名称</span>
            <CopyColumnButton columnKey="category" />
          </div>
        ),
        cell: () => (
          <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
            新品上线
          </Badge>
        )
      },
      {
        accessorKey: 'name',
        header: () => (
          <div className="flex items-center">
            <span>菜品名称</span>
            <CopyColumnButton columnKey="name" />
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {row.original.name}
          </span>
        )
      },
      {
        accessorKey: 'originalPrice',
        header: () => (
          <div className="flex items-center">
            <span>基础价格</span>
            <CopyColumnButton columnKey="originalPrice" />
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            ¥{row.original.originalPrice.toFixed(2)}
          </span>
        )
      },
      {
        accessorKey: 'markupPrice',
        header: () => (
          <div className="flex items-center text-primary">
            <span>溢价后价格 ({markupPercent}%)</span>
            <CopyColumnButton columnKey="markupPrice" />
          </div>
        ),
        cell: ({ row }) => {
          const markupPrice = row.original.markupPrice
          const originalPrice = row.original.originalPrice
          const diff = markupPrice - originalPrice

          return (
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-primary min-w-[80px]">
                ¥{markupPrice.toFixed(2)}
              </span>
              {diff > 0 && (
                <Badge variant="success" className="text-[10px]">
                  +¥{diff.toFixed(2)}
                </Badge>
              )}
            </div>
          )
        }
      },
      {
        id: 'currentStock',
        header: () => (
          <div className="flex items-center">
            <span>当前库存</span>
            <CopyColumnButton columnKey="currentStock" />
          </div>
        ),
        cell: () => <span className="text-foreground font-medium">50</span>
      },
      {
        id: 'dailyStock',
        header: () => (
          <div className="flex items-center">
            <span>每日库存</span>
            <CopyColumnButton columnKey="dailyStock" />
          </div>
        ),
        cell: () => <span className="text-foreground font-medium">50</span>
      },
      {
        id: 'autoReplenish',
        header: () => (
          <div className="flex items-center justify-end">
            <span>自动补足库存</span>
            <CopyColumnButton columnKey="autoReplenish" />
          </div>
        ),
        cell: () => <span className="text-foreground font-medium text-right block">1</span>
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markupPercent, copiedColumn]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn('bg-card rounded-3xl shadow-2xl border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
        <h3 className="font-bold text-foreground">识别到的菜品 ({data.length})</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportMeituanExcel(data)}
            className="text-primary hover:text-primary/80"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            导出美团Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="text-primary hover:text-primary/80"
          >
            <Printer className="w-4 h-4 mr-2" />
            打印
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-background hover:bg-background">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-[11px] uppercase tracking-widest font-bold text-muted-foreground',
                      header.id === 'markupPrice' && 'bg-primary/5'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="group hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-5',
                        cell.column.id === 'markupPrice' && 'bg-primary/5'
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground italic"
                >
                  未在图片中检测到任何项目。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 px-8 py-4 border-t border-border">
        <span className="text-muted-foreground text-sm">结果显示完毕</span>
      </div>
    </div>
  )
}
