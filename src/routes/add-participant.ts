import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function addParticipant(app: FastifyInstance) {
  app.post('/groups/:groupId/participants', async (req, reply) => {
    const { groupId } = req.params

    const group = await prisma.group.findFirst({
      where: {
        id: groupId
      }
    })

    if (!group) {
      return reply.status(400).send({ error: 'Group does not exist' })
    }

    const { name, email } = req.body

    const nameExists = await prisma.participant.findFirst({
      where: {
        name,
        group_id: groupId,
      },
    })

    if (nameExists) {
      return reply.status(400).send({ error: 'Name already exists in this group' })
    }

    const emailExists = await prisma.participant.findFirst({
      where: {
        email,
        group_id: groupId
      }
    })

    if (emailExists) {
      return reply.status(400).send({ error: 'There is already a participant in the group using this email' })
    }

    const participant = await prisma.participant.create({
      data: {
        name,
        email,
        group_id: groupId,
      },
    })

    return reply.status(201).send(participant)
  })
}
