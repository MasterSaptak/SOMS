"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_ROOMS, MOCK_BOOKINGS, MOCK_EMPLOYEES, getFullName } from '@/lib/mock-data'
import { useAuthStore } from '@/store/use-auth-store'
import { DoorOpen, Users, Tv, Mic, Video, PenLine, Calendar, Clock, X, Plus, Check, MapPin } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Projector': <Tv className="w-3 h-3" />,
  'TV Screen': <Tv className="w-3 h-3" />,
  'Whiteboard': <PenLine className="w-3 h-3" />,
  'Video Conf': <Video className="w-3 h-3" />,
  'Sound System': <Mic className="w-3 h-3" />,
  'Recording': <Mic className="w-3 h-3" />,
}

function BookRoomDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 bg-card rounded-2xl border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-lg font-semibold">Book a Room</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
        </div>
        <form className="p-6 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onClose() }}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Meeting Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sprint Planning" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Room</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
              <option value="">Select room...</option>
              {MOCK_ROOMS.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Start</label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">End</label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Book Room</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function RoomsPage() {
  const [showBookDialog, setShowBookDialog] = useState(false)

  const todayBookings = MOCK_BOOKINGS.filter(b => b.status === 'confirmed')

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting Rooms</h1>
          <p className="text-muted-foreground mt-1">{MOCK_ROOMS.filter(r => r.isActive).length} rooms available · {todayBookings.length} bookings today</p>
        </div>
        <Button onClick={() => setShowBookDialog(true)} className="gap-1.5"><Plus className="w-4 h-4" />Book Room</Button>
      </motion.div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_ROOMS.map(room => {
          const roomBookings = MOCK_BOOKINGS.filter(b => b.roomId === room.id && b.status === 'confirmed')
          const isOccupied = roomBookings.some(b => {
            const now = new Date()
            return new Date(b.startTime) <= now && new Date(b.endTime) >= now
          })

          return (
            <motion.div key={room.id} variants={itemVars}>
              <Card className={`hover:border-primary/20 transition-all ${!room.isActive ? 'opacity-50' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOccupied ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <DoorOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />{room.floor}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isOccupied ? 'text-red-500 border-red-200' : room.isActive ? 'text-emerald-500 border-emerald-200' : 'text-muted-foreground'}`}>
                      {!room.isActive ? 'Inactive' : isOccupied ? 'Occupied' : 'Available'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>Capacity: {room.capacity}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities.map(amenity => (
                      <span key={amenity} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {amenityIcons[amenity] || <Check className="w-3 h-3" />}
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Today's schedule */}
                  {roomBookings.length > 0 && (
                    <div className="border-t border-border/40 pt-3">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today&apos;s Schedule</p>
                      {roomBookings.map(booking => {
                        const booker = MOCK_EMPLOYEES.find(e => e.id === booking.bookedBy)
                        return (
                          <div key={booking.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span>{new Date(booking.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} — {new Date(booking.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                            <span className="text-muted-foreground truncate max-w-[80px]">{booker ? booker.firstName : '—'}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {showBookDialog && <BookRoomDialog onClose={() => setShowBookDialog(false)} />}
    </motion.div>
  )
}
