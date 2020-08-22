import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import serversRoute from './controllers/servers'
import playersRoute from './controllers/players'
import teamsRoute from './controllers/teams'
import { mainDb } from './dbs'

require('dotenv').config()

const port = process.env.PORT || 5000

const app = express()
app.use(
  cors(),
  bodyParser.json(),
)

app.get('/', (req, res) => {
  res.status(200).json({ ok: 'all good' })
})

app.use((req, res, next) => {
  if (!req.custom) req.custom = {}
  req.custom.mainDb = mainDb
  next()
})

app.use('/servers/:serverId', serversRoute)
app.use('/players', playersRoute)
app.use('/teams', teamsRoute)

app.listen(port, (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(`ERROR: ${err.message}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`)
  }
})
