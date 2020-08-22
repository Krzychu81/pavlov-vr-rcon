import express from 'express'
import _intersection from 'lodash/intersection'
import {
  whoIsPlayingWithDetails,
  whoIsPlaying,
  switchTeam,
} from '../../netcat'
import { addPlayer } from '../players'

const router = express.Router({ mergeParams: true })

/**
 * Get list of currently playing players
 */
router.get('/', async (req, res) => {
  const { mainDb } = req.custom
  const players = await whoIsPlayingWithDetails(req.custom.serverConfig)

  const playersWithSteamDetails = await Promise.all(players.map(async (player) => {
    const playerFromDb = mainDb.get('players').find({
      id: player.id,
    }).value()

    if (playerFromDb) {
      return {
        ...player,
        ...playerFromDb,
      }
    }

    const addedPlayer = await addPlayer(mainDb, player.id)

    return {
      ...player,
      ...addedPlayer,
    }
  }))

  res.status(200).json({ players: playersWithSteamDetails })
})

/**
 * Get teams whose members are currently playing
 */
router.get('/teams', async (req, res) => {
  const playerIds = await whoIsPlaying(req.custom.serverConfig)

  const teams = req.custom.mainDb.get('teams').value()

  const teamsWithPlayers = teams.reduce((result, team) => {
    const playersInTeam = _intersection(team.players, playerIds)
    if (playersInTeam.length > 0) {
      result.push({
        ...team,
        playingPlayers: playersInTeam,
      })
    }
    return result
  }, [])

  res.status(200).json({ teamsWithPlayers })
})

/**
 * Switch team
 */
router.post('/:playerId', async (req, res) => {
  const { teamId } = req.body
  const player = await switchTeam(
    req.custom.serverConfig,
    {
      steamIds: [req.params.playerId],
      teamId,
    },
  )
  res.status(200).json({ player })
})

export default router
