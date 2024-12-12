import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'
import nodemailer from 'nodemailer'

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

    const mail = await getMailClient()

    await Promise.all(
      pairs.map(async ({ giver, receiver }) => {
        const message = await mail.sendMail({
          from: {
            name: 'Amigo Secreto',
            address: 'amigo@secreto.com',
          },
          to: giver.email,
          subject: 'Seu amigo secreto foi sorteado!',
          text: `Olá ${giver.name}, seu amigo secreto é ${receiver.name}`,
        })
        
        console.log(nodemailer.getTestMessageUrl(message))
      })
    )

    return reply.status(200).send(pairs)
  })
}
