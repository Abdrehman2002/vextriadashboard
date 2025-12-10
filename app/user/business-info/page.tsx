'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BusinessInfo {
  name: string
  industry: string
  location: string
  phone: string
  email: string
  website: string
  timezone: string
  description: string
}

const defaultInfo: BusinessInfo = {
  name: 'CLARIO',
  industry: 'AI Calling & Booking Services',
  location: 'United States',
  phone: '+1 (956) 305-4194',
  email: 'clarioai1@gmail.com',
  website: 'https://clarioai.site',
  timezone: 'America/Chicago',
  description: 'Always on. Always professional. CLARIO provides AI-powered calling and booking solutions for businesses.',
}

export default function UserBusinessInfo() {
  const [info, setInfo] = useState<BusinessInfo>(defaultInfo)

  useEffect(() => {
    const saved = localStorage.getItem('clario_business_info')
    if (saved) {
      setInfo(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Business Info</h1>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Mode: User – read-only
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start mb-8">
            <Image
              src="/assets/favicon.svg"
              alt="CLARIO Logo"
              width={120}
              height={120}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Business Name</p>
                <p className="text-base">{info.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                <p className="text-base">{info.industry}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                <p className="text-base">{info.location}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                <a href={`tel:${info.phone}`} className="text-base text-accent hover:underline">
                  {info.phone}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${info.email}`} className="text-base text-accent hover:underline">
                  {info.email}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Website</p>
                <a
                  href={info.website.startsWith('http') ? info.website : `https://${info.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-accent hover:underline"
                >
                  {info.website}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Timezone</p>
                <p className="text-base">{info.timezone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-base">{info.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
