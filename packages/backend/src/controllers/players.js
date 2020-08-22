import cheerio from 'cheerio'
import express from 'express'

import { get } from '../utils'

const router = express.Router(({ mergeParams: true }))

/**
 * Extract title and imgSrc (thumbnail) url of the player
 * @param {} html Html of steam workshop website
 */
const extractPlayerDetails = (html) => {
  const $ = cheerio.load(html)

  const nick = $('.actual_persona_name').text().trim()
  const imgSrc = $('.playerAvatarAutoSizeInner img').last().attr('src')
  const flagImgSrc = $('.profile_flag').first().attr('src')
  const name = $('bdi').first().text()

  return {
    nick,
    name,
    imgSrc,
    flagImgSrc,
  }
}

export const addPlayer = async (db, id) => {
  const html = await get(`https://steamcommunity.com/profiles/${id}`)

  const details = extractPlayerDetails(html)

  if (!details.nick) {
    return null
  }

  const player = {
    id,
    nick: details.nick,
    imgSrc: details.imgSrc,
    flagImgSrc: details.flagImgSrc,
    name: details.name,
  }

  db.get('players').push(player).write()

  return player
}

export const addPlayers = async (db, playerIds) => {
  const playersAdded = []
  const playersFailed = []
  const playersSkipped = []

  await Promise.all(playerIds.map(async (id) => {
    if (db.get('players').find({ id }).value()) {
      playersSkipped.push(id)
      return
    }

    const playerAdded = await addPlayer(db, id)

    if (!playerAdded) {
      playersFailed.push(id)
      return
    }

    playersAdded.push(playerAdded)
  }))

  return {
    playersAdded,
    playersFailed,
    playersSkipped,
  }
}

router.get('/', (req, res) => {
  const { mainDb } = req.custom

  const players = mainDb.get('players').value()

  return res.status(200).json({ players })
})

/**
 * Add player to the list excluding duplicates and failed players
 */
router.post('/', async (req, res) => {
  const { playerIds } = req.body

  const {
    playersAdded,
    playersFailed,
    playersSkipped,
  } = await addPlayers(req.custom.mainDb, playerIds)

  res.status(200).json({ playersAdded, playersFailed, playersSkipped })
})

/**
 * Delete players
 */
router.delete('/', async (req, res) => {
  const { playerIds } = req.body

  const result = req.custom.mainDb.get('players')
    .remove((player) => playerIds.includes(player.id))
    .write()

  res.status(200).json({ result })
})

export default router
