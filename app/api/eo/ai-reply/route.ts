import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import { config } from '@/lib/config'

const replySchema = z.object({
  section: z.enum(['A', 'B']),
  document: z.string(),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  userMessage: z.string(),
  userName: z.string().optional(),
})

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

const SYSTEM_A = `Tu es l'employé(e) de l'organisme qui a publié l'annonce. Le candidat te téléphone pour obtenir des renseignements.
Tes règles ABSOLUES :
1. Réponds en MAXIMUM 15 mots. Jamais plus de 15 mots.
2. Utilise le vouvoiement (registre formel).
3. Pour les infos présentes dans l'annonce : réponds fidèlement.
4. Pour toute question hors annonce (transport, parking, restauration, hébergement, tenue, matériel, annulation, accessibilité, etc.) : IMPROVISE une réponse réaliste et cohérente — ne dis JAMAIS "je n'ai pas cette information".
5. Sois serviable et professionnel(le).`

const SYSTEM_B = `Tu es l'ami(e) SCEPTIQUE et DUBITATIF(VE) d'un candidat au TEF Canada pour la Section B.
Le candidat va te présenter une annonce et tenter de te convaincre d'y participer.
Tu es RÉSISTANT(E) : tu doutes, tu questionnes, tu exprimes des réserves. Le candidat doit vraiment te convaincre — ne cède pas facilement.
Tes règles ABSOLUES :
1. Réponds en MAXIMUM 15 mots. Jamais plus de 15 mots.
2. Utilise le tutoiement (registre informel).
3. Sois dubitatif : "Bof, je ne sais pas…" / "C'est cher non ?" / "Tu es sûr(e) ?" / "Ça m'étonnerait." / "Et si ça rate ?" / "Pas convaincu(e)."
4. Ne montre de l'enthousiasme qu'après plusieurs arguments solides et convaincants.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const data = replySchema.parse(body)

    // Short-circuit: deterministic opening line — no Claude call needed
    if (data.userMessage === '[DÉBUT DE LA CONVERSATION]') {
      if (data.section === 'A') {
        return NextResponse.json({ reply: 'Bonjour, comment puis-je vous aider ?' })
      } else {
        const firstName = data.userName?.trim().split(/\s+/)[0] ?? 'toi'
        return NextResponse.json({
          reply: `Salut ${firstName} ! Comment vas-tu aujourd'hui mon ami(e) ?`,
        })
      }
    }

    const systemPrompt = data.section === 'A' ? SYSTEM_A : SYSTEM_B
    const documentContext = data.document
      ? `\n\nANNONCE :\n${data.document}`
      : ''

    // Build messages: history + current user message
    const messages: Anthropic.MessageParam[] = [
      ...data.history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: data.userMessage },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 60,
      system: systemPrompt + documentContext,
      messages,
    })

    const reply = (response.content[0] as { type: string; text: string }).text.trim()

    return NextResponse.json({ reply })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('[API_ERROR] POST /api/eo/ai-reply', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
