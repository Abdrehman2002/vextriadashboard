'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

export default function AdminBusinessInfo() {
  const [info, setInfo] = useState<BusinessInfo>(defaultInfo)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('clario_business_info')
    if (saved) {
      setInfo(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('clario_business_info', JSON.stringify(info))
    setIsEditing(false)
    alert('Business info updated successfully!')
  }

  const handleCancel = () => {
    const saved = localStorage.getItem('clario_business_info')
    if (saved) {
      setInfo(JSON.parse(saved))
    } else {
      setInfo(defaultInfo)
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Business Info</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Edit</Button>
        )}
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

          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={info.name}
                    onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={info.industry}
                    onChange={(e) => setInfo({ ...info, industry: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={info.location}
                    onChange={(e) => setInfo({ ...info, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={info.email}
                    onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={info.website}
                    onChange={(e) => setInfo({ ...info, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={info.timezone}
                    onChange={(e) => setInfo({ ...info, timezone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={info.description}
                  onChange={(e) => setInfo({ ...info, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
