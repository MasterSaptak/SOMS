import { useContext } from 'react'
import { DeviceContext } from '@/components/providers/device-provider'

export function useDevice() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}
