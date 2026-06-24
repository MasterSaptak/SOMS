import { NextResponse } from 'next/server'
import { APP_VERSION, BUILD_DATE, BUILD_ID, ENVIRONMENT } from '@/lib/system/version'

export async function GET() {
  return NextResponse.json({
    version: APP_VERSION,
    buildId: BUILD_ID,
    buildDate: BUILD_DATE,
    environment: ENVIRONMENT
  })
}
