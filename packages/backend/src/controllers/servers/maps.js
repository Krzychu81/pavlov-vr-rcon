import cheerio from 'cheerio'
import express from 'express'

import { get, getValidInternalMap } from '../../utils'

/**
 * Extract title and imgSrc (thumbnail) url of the map
 * @param {} html Html of steam workshop website
 */
const extractMapDetails = (html) => {
  const $ = cheerio.load(html)

  const title = $('.workshopItemTitle').text()
  let imgSrc = $('#previewImageMain').attr('src')
  if (!imgSrc || !imgSrc.length) {
    imgSrc = $('#previewImage').attr('src')
  }
  const game = $('.apphub_AppName')?.text()
  if (game !== 'Pavlov VR') {
    return {
      title: null,
      imgSrc: null,
    }
  }

  return {
    title,
    imgSrc,
  }
}

export const addMaps = async (db, mapIds) => {
  const mapsAdded = []
  const mapsFailed = []
  const mapsSkipped = []

  await Promise.all(mapIds.map(async (id) => {
    if (db.get('maps').find({ id }).value()) {
      mapsSkipped.push(id)
      return
    }

    let mapAdded
    if (isNaN(id)) {
      const internalMap = getValidInternalMap(id)
      if (!internalMap) {
        mapsFailed.push(id)
        return
      }

      mapAdded = {
        id: internalMap.id,
        title: internalMap.title,
      }
    } else {
      const html = await get(`https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`)
      const details = extractMapDetails(html)

      if (!details.title) {
        mapsFailed.push(id)
        return
      }

      mapAdded = {
        id,
        title: details.title,
        imgSrc: details.imgSrc,
      }
    }

    db.get('maps').push(mapAdded).write()
    mapsAdded.push(mapAdded)
  }))

  return {
    mapsAdded,
    mapsFailed,
    mapsSkipped,
  }
}

const router = express.Router(({ mergeParams: true }))

/**
 * Get list of maps
 */
router.get('/', (req, res) => {
  const maps = req.custom.serverDb.get('maps').value()
  res.status(200).json({ maps })
})

/**
 * Add map to the list excluding duplicates and failed maps
 */
router.post('/', async (req, res) => {
  const { mapIds } = req.body

  const { mapsAdded, mapsFailed, mapsSkipped } = await addMaps(req.custom.serverDb, mapIds)

  res.status(200).json({ mapsAdded, mapsFailed, mapsSkipped })
})

/**
 * Delete maps
 */
router.delete('/', async (req, res) => {
  const { mapIds } = req.body

  const result = req.custom.serverDb.get('maps')
    .remove((map) => mapIds.includes(map.id))
    .write()

  res.status(200).json({ result })
})

export default router
