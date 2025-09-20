import fastify from 'fastify'

export const buildApp = () => {
  const app = fastify()
  
  return app
}