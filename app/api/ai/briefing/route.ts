import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set')
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    // Build the context from mock data
    const context = {
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      totalEmployees: 10,
      activeToday: 8,
      onLeave: 1, // Arjun Nair on medical leave
      pendingLeaveRequests: 2, // l1 (John, casual) and l7 (Neha, casual)
      overdueTasks: 1, // t6 Database Migration is blocked/overdue
      criticalTasks: 2,
      burnoutRisk: ['Bob Martinez (5 consecutive 9h+ days)'],
      teamHighlights: ['Alice Wong completed 12 tasks this week (+40% above average)'],
      departments: ['Engineering (4 members)', 'Design (2 members)', 'HR (1 member)', 'Marketing (1 member)', 'Operations (1 member)'],
    }

    const prompt = `You are the AI Office Manager for SOMS Enterprise. Generate a concise, professional daily briefing for the office administrator.

Organization context for ${context.date}:
- Total employees: ${context.totalEmployees}, Active today: ${context.activeToday}
- ${context.onLeave} employee on medical leave (Arjun Nair - Backend team)
- ${context.pendingLeaveRequests} pending leave requests need approval
- ${context.overdueTasks} blocked task needs immediate attention (Database Migration Script)
- Burnout alerts: ${context.burnoutRisk.join(', ')}
- Team highlights: ${context.teamHighlights.join(', ')}

Write a 2-3 sentence executive briefing in a helpful, professional tone. Start with a greeting. Be specific about the key priorities for today. End with one strategic recommendation.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    const briefing = response.text ?? 'Unable to generate briefing at this time.'
    return NextResponse.json({ briefing, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('[AI Briefing] Error:', error)
    // Fallback briefing if API fails
    const fallback = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}. Today you have 8 employees active, 2 leave requests pending approval, and 1 blocked task in Engineering that needs your attention. Recommend prioritizing the database migration unblock to keep the sprint on track.`
    return NextResponse.json({ briefing: fallback, generatedAt: new Date().toISOString(), isFallback: true })
  }
}
