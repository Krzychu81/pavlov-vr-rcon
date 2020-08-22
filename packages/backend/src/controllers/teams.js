import express from 'express'
import shortId from 'shortid'
import _ from 'lodash'

const router = express.Router(({ mergeParams: true }))

router.get('/', (req, res) => {
  const { mainDb } = req.custom

  const teams = mainDb.get('teams').value()

  return res.status(200).json({ teams })
})

/**
 * Add team to the list excluding duplicates and failed teams
 */
router.post('/', async (req, res) => {
  const { name, imgSrc } = req.body

  const team = req.custom.mainDb
    .get('teams')
    .push({
      id: shortId.generate(),
      name,
      imgSrc,
      players: [],
    })

  res.status(200).json(team)
})

/**
 * Delete teams
 */
router.delete('/', async (req, res) => {
  const { teamIds } = req.body

  const result = req.custom.mainDb.get('teams')
    .remove((team) => teamIds.includes(team.id))
    .write()

  res.status(200).json({ result })
})

/**
 * Edit team
 */

const teamRouter = express.Router(({ mergeParams: true }))

teamRouter.use((req, res, next) => {
  req.custom.getTeamDb = () => req.custom.mainDb
    .get('teams')
    .find({ id: req.params.teamId })

  next()
})

teamRouter.get('/', async (req, res) => {
  const team = req.custom.getTeamDb().value()

  res.status(200).json(team)
})

teamRouter.post('/', async (req, res) => {
  const { name, imgSrc } = req.body

  const team = req.custom.getTeamDb()
    .assign({ name, imgSrc })
    .write()

  res.status(200).json(team)
})

teamRouter.post('/addPlayers', async (req, res) => {
  const { ids } = req.body

  const players = _.union(req.custom.getTeamDb().value().players, ids)
  const team = req.custom.getTeamDb()
    .set('players', players)
    .write()

  res.status(200).json(team)
})

teamRouter.post('/removePlayers', async (req, res) => {
  const { ids } = req.body

  const players = _.difference(req.custom.getTeamDb().value().players, ids)
  const team = req.custom.getTeamDb()
    .set('players', players)
    .write()

  res.status(200).json(team)
})

router.use('/:teamId', teamRouter)

export default router
