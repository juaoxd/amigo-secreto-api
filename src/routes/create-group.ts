import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { resend } from '../lib/mail'

export async function createGroup(app: FastifyInstance) {
  app.post('/groups', async (req, reply) => {
    const { name, ownerName, ownerEmail } = req.body

    const group = await prisma.group.create({
      data: {
        name,
        participants: {
          create: {
            name: ownerName,
            email: ownerEmail,
          },
        },
      },
      select: {
        id: true,
        name: true,
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const { data, error } = await resend.emails.send({
      from: 'Hi <oi@amigosecreto.juao.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Seu grupo de amigo secreto foi criado!',
      text: `Parabéns ${ownerName}, seu grupo de amigo secreto foi criado com sucesso! Para adicionar participantes e realizar o sorteio, acesse o grupo através do link: http://localhost:3000/groups/${group.id}`,
      html: `<p>Parabéns ${ownerName}, seu grupo de amigo secreto foi criado com sucesso! Para adicionar participantes e realizar o sorteio, acesse o grupo através do link: http://localhost:3000/groups/${group.id}</p>`,
    });
  
    if (error) {
      return console.error({ error });
    }
  
    console.log({ data });

    return reply.status(201).send(group)
  })
}
