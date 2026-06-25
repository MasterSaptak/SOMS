"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, X, ShieldCheck, Zap, Award, GraduationCap, Briefcase } from 'lucide-react'
import { verifySkillAction, verifyCertificationAction, verifyEducationAction, verifyExperienceAction } from '@/app/actions/employee.actions'
import { useRouter } from 'next/navigation'

const itemVars = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function VerificationCenterClient({ pendingData }: { pendingData: any }) {
  const router = useRouter()
  const [data, setData] = useState(pendingData)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleVerify = async (entityType: string, recordId: string, empId: string, status: 'verified' | 'rejected') => {
    setProcessingId(recordId)
    try {
      let res
      if (entityType === 'skill') res = await verifySkillAction(empId, recordId, status)
      else if (entityType === 'certification') res = await verifyCertificationAction(empId, recordId, status)
      else if (entityType === 'education') res = await verifyEducationAction(empId, recordId, status)
      else if (entityType === 'experience') res = await verifyExperienceAction(empId, recordId, status)
      
      if (!res?.success) throw new Error(res?.error?.message || 'Verification failed')
      
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        [entityType + 's']: prev[entityType + 's'].filter((item: any) => item.id !== recordId)
      }))
      
      router.refresh()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
    setProcessingId(null)
  }

  const renderList = (items: any[], type: string, icon: React.ElementType, renderDetails: (item: any) => React.ReactNode) => {
    if (!items || items.length === 0) {
      return (
        <div className="py-12 text-center border border-dashed border-border/50 rounded-xl bg-muted/10">
          <div className="bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-primary/50" />
          </div>
          <p className="text-muted-foreground font-medium">No pending {type} verifications</p>
          <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div key={item.id} variants={itemVars} initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.95 }} layout>
              <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="p-4 bg-muted/20 md:w-64 border-b md:border-b-0 md:border-r border-border/50 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-border/50 shadow-sm">
                        <AvatarImage src={item.employee?.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {item.employee?.full_name?.substring(0, 2).toUpperCase() || 'EMP'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate max-w-[150px]" title={item.employee?.full_name}>{item.employee?.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 py-0.5 rounded w-fit mt-0.5">
                          ID: {item.employee?.id?.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 bg-primary/10 p-2 rounded-lg shrink-0">
                        {React.createElement(icon, { className: "w-4 h-4 text-primary" })}
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden w-full">
                        {renderDetails(item)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                        onClick={() => handleVerify(type, item.id, item.employee_id, 'rejected')}
                        disabled={processingId === item.id}
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                        onClick={() => handleVerify(type, item.id, item.employee_id, 'verified')}
                        disabled={processingId === item.id}
                      >
                        <Check className="w-3.5 h-3.5" /> Verify
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  const totalPending = data.skills.length + data.certifications.length + data.education.length + data.experience.length

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Verification Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review and approve pending professional records submitted by employees across the organization.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm shadow-sm flex items-center gap-2 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {totalPending} Pending {totalPending === 1 ? 'Action' : 'Actions'}
        </div>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b border-border/50 rounded-none w-full justify-start h-auto p-0 gap-6 overflow-x-auto no-scrollbar flex-nowrap">
          <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-2 gap-2 transition-colors">
            <Zap className="w-4 h-4" /> Skills
            {data.skills.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.skills.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="certifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-2 gap-2 transition-colors">
            <Award className="w-4 h-4" /> Certifications
            {data.certifications.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.certifications.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="education" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-2 gap-2 transition-colors">
            <GraduationCap className="w-4 h-4" /> Education
            {data.education.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.education.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-3 pt-2 gap-2 transition-colors">
            <Briefcase className="w-4 h-4" /> Experience
            {data.experience.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{data.experience.length}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderList(data.skills, 'skill', Zap, (item) => (
            <>
              <span className="font-semibold text-sm truncate">{item.skill?.name || 'Unknown Skill'}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="capitalize px-1.5 py-0.5 bg-muted rounded font-medium">{item.proficiency}</span>
                {item.years_of_experience > 0 && <span>• {item.years_of_experience} yrs</span>}
                {item.certification && <span className="truncate max-w-[200px]" title={item.certification}>• {item.certification}</span>}
              </div>
              {item.notes && <span className="text-xs text-muted-foreground/80 italic mt-1 line-clamp-2">"{item.notes}"</span>}
            </>
          ))}
        </TabsContent>

        <TabsContent value="certifications" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderList(data.certifications, 'certification', Award, (item) => (
            <>
              <span className="font-semibold text-sm truncate">{item.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">{item.issuing_authority}</span>
                {(item.issue_date || item.expiry_date) && <span>• {item.issue_date ? new Date(item.issue_date).toLocaleDateString() : 'N/A'} - {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'No Expiry'}</span>}
              </div>
              {item.credential_id && (
                <a href={item.credential_id} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 w-fit">
                  View Credential
                </a>
              )}
            </>
          ))}
        </TabsContent>

        <TabsContent value="education" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderList(data.education, 'education', GraduationCap, (item) => (
            <>
              <span className="font-semibold text-sm truncate">{item.degree} in {item.field_of_study}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground truncate">{item.school}</span>
                <span>• {new Date(item.start_date).getFullYear()} - {item.end_date ? new Date(item.end_date).getFullYear() : 'Present'}</span>
              </div>
              {item.cgpa && <span className="text-xs text-muted-foreground mt-1">CGPA: {item.cgpa}</span>}
            </>
          ))}
        </TabsContent>

        <TabsContent value="experience" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          {renderList(data.experience, 'experience', Briefcase, (item) => (
            <>
              <span className="font-semibold text-sm truncate">{item.title}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground truncate">{item.company_name}</span>
                <span>• {new Date(item.start_date).toLocaleDateString(undefined, {month:'short', year:'numeric'})} - {item.end_date ? new Date(item.end_date).toLocaleDateString(undefined, {month:'short', year:'numeric'}) : 'Present'}</span>
                {item.location && <span className="truncate max-w-[150px]">• {item.location}</span>}
              </div>
              {item.description && <span className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{item.description}</span>}
            </>
          ))}
        </TabsContent>

      </Tabs>
    </div>
  )
}
