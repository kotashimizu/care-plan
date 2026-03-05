'use client'

import { ServiceType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface SelectedServiceDisplayProps {
  serviceType: ServiceType;
}

export default function SelectedServiceDisplay({ serviceType }: SelectedServiceDisplayProps) {
  const getServiceInfo = (type: ServiceType) => {
    switch (type) {
      case 'employment-a':
        return {
          title: '就労継続支援A型',
          description: '雇用契約に基づく就労支援サービス'
        }
      case 'employment-b':
        return {
          title: '就労継続支援B型',
          description: '雇用契約によらない就労支援サービス'
        }
      case 'daily-care':
        return {
          title: '生活介護',
          description: '日常生活支援と創作活動等のサービス'
        }
      default:
        return { title: '', description: '' }
    }
  }

  const serviceInfo = getServiceInfo(serviceType)

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">{serviceInfo.title}</h3>
            <p className="text-sm text-green-600">{serviceInfo.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}