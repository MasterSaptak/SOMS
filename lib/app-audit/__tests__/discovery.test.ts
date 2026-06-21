import { describe, it, expect, vi } from 'vitest'
import { analyzeFileAST, runProjectDiscovery } from '../discovery'
import path from 'path'
import fs from 'fs'

describe('Project Discovery Engine (AST)', () => {

  it('should correctly parse a dummy API route and extract metadata', () => {
    // We create a temporary dummy file to parse
    const dummyPath = path.join(process.cwd(), 'app', 'api', 'dummy', 'route.ts')
    
    // Ensure dirs exist for test
    fs.mkdirSync(path.dirname(dummyPath), { recursive: true })
    
    fs.writeFileSync(dummyPath, `
      import { NextResponse } from 'next/server'
      import { myService } from '@/lib/services/myService'
      
      export async function POST(req: Request) {
        return NextResponse.json({ success: true })
      }
      
      export const GET = async () => {
        return NextResponse.json({ success: true })
      }
    `)

    try {
      const result = analyzeFileAST(dummyPath)
      
      expect(result.type).toBe('api_route')
      expect(result.exports).toContain('POST')
      expect(result.exports).toContain('GET')
      expect(result.dependencies).toContain('next/server')
      expect(result.dependencies).toContain('@/lib/services/myService')
      expect(result.confidence).toBe(100)
      expect(result.complexityScore).toBeGreaterThan(10) // Basic AST node count should be > 10
    } finally {
      fs.unlinkSync(dummyPath)
    }
  })
})
