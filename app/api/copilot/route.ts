import { NextRequest } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const SYSTEM_PROMPT = `You are SOMS Copilot — an AI assistant embedded inside the Smart Office Management System (SOMS Enterprise). You help employees, managers, and HR personnel with workplace queries.

You have access to the following application context:
- Employee profiles with names, departments, designations, and status
- Task management with statuses (pending, in_progress, blocked, completed, overdue) and priorities
- Attendance records with clock-in/out times, work hours, and streak data
- Leave management with requests, balances, and approval workflows
- Meeting room bookings and availability
- Asset assignments (laptops, monitors, phones)
- Announcements and company events
- Productivity scores and AI-generated insights
- Rewards and achievement systems

When answering questions:
1. Be concise and professional but friendly
2. Use data from the provided context to give specific answers
3. Format responses with markdown for readability
4. If you don't have specific data, explain what information would be needed
5. Suggest actionable next steps when appropriate
6. For questions about specific employees, reference their names and departments
7. Use bullet points and bold text for clarity

Current system data snapshot:
- Employees: Admin User (System Admin, Engineering), Priya Sharma (HR Manager, HR), John Doe (Product Designer, Design), Sarah Chen (Design Lead, Design), Mike Johnson (Engineering Manager, Engineering), Lisa Park (Front Desk, Operations), Alice Wong (Frontend Engineer, Engineering), Bob Martinez (Backend Engineer, Engineering)
- Active departments: Engineering (4 members), Design (2 members), HR (1 member), Operations (1 member), Marketing (0 members)
- Task statuses across team: 4 in_progress, 3 pending, 1 blocked, 2 completed
- Common leave types: Casual (12 days/yr), Medical (6 days/yr), Emergency (3 days/yr), WFH (unlimited)
- Meeting rooms: Apollo (10 cap), Gemini (6 cap), Orion (20 cap), Nova (4 cap), Zenith (8 cap, inactive)
`

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!apiKey) {
      // Return a helpful mock response when no API key is configured
      return new Response(
        getMockResponse(message),
        {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const contextPrompt = context
      ? `\n\nCurrent user context:\n- Page: ${context.currentPage || 'Unknown'}\n- Employee: ${context.employeeName || 'Unknown'}\n- Role: ${context.role || 'employee'}`
      : ''

    const conversationHistory = (history || [])
      .filter((m: { role: string; content: string }) => m.content && m.role !== 'system')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT + contextPrompt,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    })

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('Copilot API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('workload') || lowerMessage.includes('highest')) {
    return `Based on the current task distribution:\n\n**Highest Workload:**\n- **John Doe** (Product Designer) — 4 active tasks including 1 critical priority\n- **Alice Wong** (Frontend Engineer) — 2 active tasks with 1 critical "API Integration Testing"\n\n**Recommendation:** Consider redistributing tasks from John to team members with lower loads. Bob Martinez has a blocked task that may benefit from unblocking first.`
  }

  if (lowerMessage.includes('attendance') || lowerMessage.includes('checked in')) {
    return `**Today's Attendance Summary:**\n\n✅ **Checked In:** 6 of 8 employees\n- Admin User — 08:00 AM\n- Priya Sharma — 08:30 AM\n- John Doe — 09:00 AM\n- Sarah Chen — 08:45 AM\n- Alice Wong — 09:15 AM\n- Lisa Park — 07:55 AM\n\n⚠️ **Not Checked In:**\n- Mike Johnson (last seen yesterday 5:00 PM)\n- Bob Martinez (last seen yesterday 6:00 PM)\n\n📊 **Attendance Rate:** 75% (6/8)`
  }

  if (lowerMessage.includes('overdue') || lowerMessage.includes('late')) {
    return `**Overdue Tasks:**\n\n🔴 **Database Migration Script** — Assigned to Bob Martinez\n- Due: Jun 18 (2 days overdue)\n- Status: Blocked\n- Blocker: Schema approval from DBA team\n\n🟡 **Weekly Sync Prep** — Assigned to John Doe\n- Due: Jun 18 (2 days overdue)\n- Status: Pending\n\n**Action Items:**\n1. Escalate DBA approval for Bob's blocked task\n2. Follow up with John on sync prep completion`
  }

  if (lowerMessage.includes('leave') || lowerMessage.includes('department')) {
    return `**Leave Requests by Department:**\n\n| Department | Pending | Approved | Total |\n|---|---|---|---|\n| Design | 1 | 2 | 3 |\n| Engineering | 0 | 2 | 2 |\n| HR | 0 | 0 | 0 |\n| Operations | 0 | 0 | 0 |\n\n**Pending Approvals:**\n- John Doe (Design) — Casual Leave, Jun 23-24 — *Awaiting manager approval*\n\n**Upcoming Approved:**\n- Alice Wong (Engineering) — Medical, Jun 20`
  }

  if (lowerMessage.includes('burnout') || lowerMessage.includes('stress')) {
    return `**Burnout Risk Analysis:**\n\n🔴 **High Risk:**\n- **Bob Martinez** — 4 consecutive days of 9+ hour work, blocked critical task causing frustration\n  - *Recommendation:* Suggest a half-day off, unblock the DBA dependency\n\n🟡 **Moderate Risk:**\n- **John Doe** — 4 active tasks, shorter breaks than average\n  - *Recommendation:* Encourage regular 15-min breaks, consider task redistribution\n\n🟢 **Low Risk:**\n- All other team members showing healthy work patterns`
  }

  if (lowerMessage.includes('productivity') || lowerMessage.includes('score')) {
    return `**Team Productivity Scores (Today):**\n\n| Employee | Score | Trend |\n|---|---|---|\n| Alice Wong | 92 🏆 | ↑ +5 |\n| Sarah Chen | 90 | ↑ +2 |\n| John Doe | 85 | → 0 |\n| Bob Martinez | 78 | ↓ -3 |\n\n**Key Factors:**\n- Alice's high score driven by 100% attendance + strong task completion\n- Bob's dip linked to blocked task and extended hours\n\n**AI Insight:** Team average is 86.25, above the 80-point healthy threshold.`
  }

  return `I can help you with questions about:\n\n- 👥 **Employees** — "Who has the highest workload?"\n- 📋 **Tasks** — "Which tasks are overdue?"\n- 📅 **Attendance** — "Summarize today's attendance"\n- 🏖️ **Leaves** — "Which department has the most leave requests?"\n- 🧠 **Productivity** — "Show me productivity scores"\n- 🔥 **Burnout** — "Is anyone at risk of burnout?"\n- 🏢 **Meetings** — "What meetings are scheduled today?"\n\nJust ask me anything about your workplace!`
}
