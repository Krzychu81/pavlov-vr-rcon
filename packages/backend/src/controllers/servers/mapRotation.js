import express from 'express'
import fileUpload from 'express-fileupload'
import { addMaps } from './maps'

const router = express.Router()

router.get('/', (req, res) => {
  const content = req.custom.serverDb.get('maps').value()
    .map((pavlovMap) => {
      if (isNaN(pavlovMap.id)) {
        return pavlovMap.id
      }
      return `UGC${pavlovMap.id}`
    })
    .map((id) => `MapRotation=(MapId="${id}"}, GameMode="SND")`)
    .join('\n')

  res.set({ 'Content-Disposition': 'attachment; filename="maprotation.txt"' })
  res.send(content)
})

router.post('/',
  fileUpload(),
  async (req, res) => {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No files were uploaded.' })
    }

    const { file } = req.files
    const content = file.data.toString('utf8')
    const matches = [...content.matchAll(/MapRotation=\(MapId="([^"]*)"/g)]
    const mapIds = matches.map((match) => match[1])
      .map((mapId) => {
        if (!isNaN(mapId)) return mapId

        if (mapId.startsWith('UGC')) return mapId.slice(3)

        return mapId
      })

    const { mapsAdded, mapsFailed, mapsSkipped } = await addMaps(
      req.custom.serverDb,
      mapIds,
    )

    return res.status(200).json({ mapsAdded, mapsFailed, mapsSkipped })
  })

export default router
