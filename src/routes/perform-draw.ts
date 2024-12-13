import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { resend } from '../lib/mail'

export async function performDraw(app: FastifyInstance) {
  app.post('/groups/:groupId/draw', async (req, reply) => {
    const { groupId } = req.params

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
      },
    })

    if (!group) {
      return reply.code(400).send({ message: 'Bad request' })
    }

    const participants = group.participants

    if (participants.length < 3) {
      return reply.code(400).send({ message: 'Not enough participants' })
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5)

    const pairs = shuffled.map((giver, index) => ({
      giver,
      receiver: shuffled[(index + 1) % shuffled.length], // O próximo da lista ou o primeiro
    }))

    await Promise.all(
      pairs.map(async ({ giver, receiver }) => {
        await resend.emails.send({
          from: 'Hi <oi@amigosecreto.juao.dev>',
          to: ['delivered@resend.dev'],
          subject: 'Seu amigo secreto foi sorteado!',
          text: `Olá ${giver.name}, seu amigo secreto é ${receiver.name}`,
        })
      })
    )

    return reply.status(200).send(pairs)
  })
}
