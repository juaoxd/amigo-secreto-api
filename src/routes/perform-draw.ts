import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

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

    return reply.status(200).send(pairs)
  })
}
