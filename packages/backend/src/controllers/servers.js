import express from 'express'
import { serverDbs } from '../dbs'
import mapsRoute from './servers/maps'
import mapRotationRoute from './servers/mapRotation'
import matchRoute from './servers/match'
import configRoute from './servers/config'
import playersRoute from './servers/players'
import {
  serverInfo,
} from '../netcat'

const router = express.Router({ mergeParams: true })

/**
 * Inject serverDb and serverConfig
 * TODO: Check jwt to make sure user has access
 */
router.use((req, res, next) => {
  const { serverId } = req.params
  if (!serverId || !serverDbs[serverId]) {
    return res.status(400).json({ message: 'Incorrect server id' })
  }

  if (!req.custom) {
    req.custom = {}
  }

  req.custom.serverConfig = req.custom.mainDb
    .get('servers')
    .find({ id: Number(serverId) })
    .value()

  req.custom.serverDb = serverDbs[serverId]
  return next()
})

/**
 * Server info
 */
router.get('/', async (req, res) => {
  const response = await serverInfo(req.custom.serverConfig)
  res.status(200).json({ response })
})

router.use('/maps', mapsRoute)
router.use('/mapRotation', mapRotationRoute)
router.use('/match', matchRoute)
router.use('/config', configRoute)
router.use('/players', playersRoute)

export default router
