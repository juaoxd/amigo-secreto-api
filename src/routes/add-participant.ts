import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function addParticipant(app: FastifyInstance) {
  app.post('/:groupId/participants', async (req, reply) => {
    const { groupId } = req.params
    const { name } = req.body

    const nameExists = await prisma.participant.findFirst({
      where: {
        name,
        group_id: groupId,
      },
    })

    if (nameExists) {
      return reply.status(409).send({ error: 'Name already exists' })
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        group_id: groupId,
      },
    })

    return reply.status(201).send(participant)
  })
}
