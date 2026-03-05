import { Info } from 'lucide-react'

interface HelpTooltipProps {
  content: string
  className?: string
}

export function HelpTooltip({ content, className = "" }: HelpTooltipProps) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Info className="h-4 w-4 text-gray-400" />
      <span className="text-xs text-gray-500">{content}</span>
    </div>
  )
}