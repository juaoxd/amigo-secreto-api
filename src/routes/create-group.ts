import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function createGroup(app: FastifyInstance) {
  app.post('/groups', async (req, reply) => {
    const { name } = req.body

    const group = await prisma.group.create({
      data: {
        name,
      },
    })

    return reply.status(201).send(group)
  })
}
