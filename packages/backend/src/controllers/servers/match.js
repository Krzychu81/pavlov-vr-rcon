import express from 'express'
import _ from 'lodash'
import {
  switchMap, resetSnd, rotateMap, switchTeam, whoIsPlaying,
} from '../../netcat'
import { getValidInternalMap } from '../../utils'

const router = express.Router({ mergeParams: true })

/**
 * Switch to selected map
 */
router.get('/switchMap/:mapId/:mode', async (req, res) => {
  const { mapId, mode } = req.params
  let id
  if (isNaN(mapId)) {
    if (!getValidInternalMap(mapId)) {
      return res.status(400).json({ response: 'Invalid map' })
    }
    id = mapId
  } else {
    id = `UGC${mapId}`
  }
  const response = await switchMap(req.custom.serverConfig, id, mode)
  return res.status(200).json({ response })
})

/**
   * Reset S&D
   */
router.get('/resetSnd', async (req, res) => {
  const response = await resetSnd(req.custom.serverConfig)
  res.status(200).json({ response })
})

/**
   * Rotate map
   */
router.get('/rotateMap', async (req, res) => {
  const response = await rotateMap(req.custom.serverConfig)
  res.status(200).json({ response })
})

/**
 * Start match:
 * - Switch players according to the selected teams
 * - wait 10 seconds
 * - restart snd
 */
router.post('/start', async (req, res) => {
  const { teamIds } = req.body
  const { mainDb } = req.custom

  const playersIdsInTeams = teamIds.map(
    (teamId) => mainDb.get('teams').find({ id: teamId }).value().players,
  )

  const [team0ids, team1ids] = Math.random() > 0.5
    ? [playersIdsInTeams[0], playersIdsInTeams[1]]
    : [playersIdsInTeams[1], playersIdsInTeams[0]]

  const players = await whoIsPlaying(req.custom.serverConfig)
  await switchTeam(req.custom.serverConfig, { steamIds: _.intersection(team0ids, players), teamId: '0' })
  await switchTeam(req.custom.serverConfig, { steamIds: _.intersection(team1ids, players), teamId: '1' })

  await new Promise((resolve) => setTimeout(resolve, 10000))

  const response = await resetSnd(req.custom.serverConfig)

  res.status(200).json({ response })
})

export default router
