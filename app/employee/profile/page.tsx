"use client"

import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, employee, updateEmployee } = useAuthStore()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    departmentId: '',
    phone: '',
    avatarUrl: '',
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designation: employee.designation || '',
        departmentId: employee.departmentId || '',
        phone: employee.phone || '',
        avatarUrl: employee.avatarUrl || '',
      })
    }
  }, [employee])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('employees')
        .update({ profile_photo: publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      updateEmployee({ avatarUrl: publicUrl })
      setMessage({ text: 'Avatar updated successfully', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setMessage({ text: '', type: '' })
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { error } = await supabase
        .from('employees')
        .update({
          full_name: fullName,
          designation: formData.designation,
          department: formData.departmentId,
          phone: formData.phone,
          profile_photo: formData.avatarUrl,
        })
        .eq('user_id', user.id)

      if (error) throw error

      updateEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        departmentId: formData.departmentId,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      })
      
      setMessage({ text: 'Profile updated successfully', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const initials = employee ? `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}` : 'U'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account details and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your avatar to be recognized by your team.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={employee?.avatarUrl} className="object-cover" />
                <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </Label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isLoading}
              />
            </div>
            {message.text && message.type === 'success' && (
              <p className="text-sm text-green-500">{message.text}</p>
            )}
            {message.text && message.type === 'error' && (
              <p className="text-sm text-destructive">{message.text}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic profile details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Designation / Role</Label>
                <Input 
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Product Designer"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input 
                  value={formData.departmentId}
                  onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Avatar Image URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.avatarUrl}
                    onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/avatar.png"
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => updateEmployee({ avatarUrl: formData.avatarUrl })}
                  >
                    Preview
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can provide a direct image URL here, or use the camera icon above to upload a file.
                </p>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full col-span-2">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
