import express from 'express'
import { get } from '../../utils'

const router = express.Router({ mergeParams: true })

/**
 * Get IP and name
 */
router.get('/', async (req, res) => {
  const { serverConfig } = req.custom

  const data = await get('https://pablub.club/')
  const visible = data.indexOf(`<td>${serverConfig.name}</td>`) > -1

  return res.status(200).json({
    visible,
  })
})

export default router
