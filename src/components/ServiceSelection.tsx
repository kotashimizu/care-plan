'use client'

import { ServiceType } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ServiceSelectionProps {
  onSelect: (serviceType: ServiceType) => void;
  selectedService: ServiceType | null;
}

export default function ServiceSelection({ onSelect, selectedService }: ServiceSelectionProps) {
  const services = [
    {
      type: 'employment-a' as ServiceType,
      title: '就労継続支援A型',
      description: '雇用契約に基づく就労支援サービス',
      features: ['雇用契約あり', '最低賃金保障', '労働法適用']
    },
    {
      type: 'employment-b' as ServiceType,
      title: '就労継続支援B型',
      description: '雇用契約によらない就労支援サービス',
      features: ['雇用契約なし', '工賃支払い', '柔軟な働き方']
    },
    {
      type: 'daily-care' as ServiceType,
      title: '生活介護',
      description: '日常生活支援と創作活動等のサービス',
      features: ['日常生活支援', '創作活動', '機能訓練']
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>事業区分の選択</CardTitle>
        <p className="text-sm text-gray-600">
          支援計画を作成する事業区分を選択してください
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div
            key={service.type}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedService === service.type 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(service.type)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{service.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {service.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedService === service.type
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedService === service.type && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {selectedService && (
          <div className="flex justify-center pt-4">
            <Button size="lg" className="px-8">
              次へ進む
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}