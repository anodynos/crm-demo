import express from 'express'
import compression from 'compression'
import session from 'cookie-session'
import sslRedirect from 'heroku-ssl-redirect'
import swaggerUi from 'swagger-ui-express'
import { api } from './api'
import { auth } from './auth'
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { remultGraphql } from 'remult/graphql';
// @note: seems to works fine
// import voyagerMiddleware from 'graphql-voyager/middleware/express';

const app = express()
app.use(sslRedirect())
app.use(compression())

app.use(
  '/api',
  session({ secret: process.env['TOKEN_SIGN_KEY'] || 'my secret' })
)
app.use(auth)

app.get('/api/test', (req, res) => res.send('ok'))
app.use(api)

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(api.openApiDoc({ title: 'remult-crm-demo' }))
)

const { schema, rootValue } = remultGraphql(api);
app.use('/api/graphql', graphqlHTTP({
  schema: buildSchema(schema),
  rootValue,
  graphiql: true,
}));

// @note: seems to works fine
// app.use(voyagerMiddleware({ endpointUrl: '/api/graphql',  }))

app.use(express.static('build'))
app.use('/*', async (req, res) => {
  res.sendFile(process.cwd() + '/build/index.html')
})
const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Server started at ${port}`))
