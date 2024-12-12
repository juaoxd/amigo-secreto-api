import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function getGroup(app: FastifyInstance) {
  app.get('/groups/:groupId', async (req, reply) => {
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
      return reply.code(400).send({ error: 'Group does not exist' })
    }

    return reply.status(200).send(group)
  })
}
