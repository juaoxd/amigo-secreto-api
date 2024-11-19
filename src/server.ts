import { fastify } from 'fastify'
import fastifyFormbody from '@fastify/formbody'

import { createGroup } from './routes/create-group'
import { addParticipant } from './routes/add-participant'
import { getGroup } from './routes/get-group'
import { performDraw } from './routes/perform-draw'

const server = fastify({ logger: true })

server.register(fastifyFormbody)

server.get('/', (req, res) => {
  return 'hello world'
})

server.register(createGroup)
server.register(addParticipant)
server.register(getGroup)
server.register(performDraw)

server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
})
