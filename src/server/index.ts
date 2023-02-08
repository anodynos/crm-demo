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
import voyagerMiddleware from 'graphql-voyager/middleware/express';

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

const openApiDocument = api.openApiDoc({ title: 'remult-crm-demo' });

// API Docs
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument));

app.get("/api/openApi.json", (req, res) => res.json(openApiDocument));

// GraphQL
const { schema, rootValue } = remultGraphql(api);
app.use('/api/graphql', graphqlHTTP({
  schema: buildSchema(schema),
  rootValue,
  graphiql: true,
}));

app.use('/api/voyager', voyagerMiddleware({ endpointUrl: '/api/graphql',  }))

// Static
app.use(express.static('build'))
app.use('/*', async (req, res) => {
  res.sendFile(process.cwd() + '/build/index.html')
})

// Serve
const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Server started at ${port}`))
