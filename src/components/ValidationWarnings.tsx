'use client'

import { ValidationResult } from '@/lib/validation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface ValidationWarningsProps {
  validationResult: ValidationResult
}

export default function ValidationWarnings({ validationResult }: ValidationWarningsProps) {
  if (validationResult.warnings.length === 0) {
    return null
  }

  const highWarnings = validationResult.warnings.filter(w => w.severity === 'high')
  const mediumWarnings = validationResult.warnings.filter(w => w.severity === 'medium')
  const lowWarnings = validationResult.warnings.filter(w => w.severity === 'low')

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }


  return (
    <Card className={`${highWarnings.length > 0 ? 'border-red-200 bg-red-50' : 
                     mediumWarnings.length > 0 ? 'border-yellow-200 bg-yellow-50' : 
                     'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getIcon(highWarnings.length > 0 ? 'high' : mediumWarnings.length > 0 ? 'medium' : 'low')}
          入力データの確認事項
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highWarnings.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">【重要】以下の項目に問題があります：</h4>
              <ul className="space-y-1">
                {highWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 mt-1 flex-shrink-0" />
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {mediumWarnings.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">【注意】以下の情報が不足している可能性があります：</h4>
              <ul className="space-y-1">
                {mediumWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-yellow-600">
                    <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {lowWarnings.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-2">【推奨】以下の点を改善すると、より質の高い計画書が生成されます：</h4>
              <ul className="space-y-1">
                {lowWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-600">
                    <Info className="h-3 w-3 mt-1 flex-shrink-0" />
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-white rounded border-l-4 border-gray-400">
            <p className="text-sm text-gray-600">
              <strong>※ 注意：</strong> 上記の項目が不足していても支援計画書の生成は可能ですが、
              より詳細な情報があることで、実用的で質の高い計画書が作成されます。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}