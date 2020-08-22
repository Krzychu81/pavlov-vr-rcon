import express from 'express'
import crypto from 'crypto'

const router = express.Router({ mergeParams: true })

/**
 * Get IP and name
 */
router.get('/', async (req, res) => {
  const { serverConfig } = req.custom
  return res.status(200).json({
    serverConfig: {
      ip: serverConfig.ip,
      name: serverConfig.name,
      password: serverConfig.password,
    },
  })
})

/**
 * Set values that have been passed
 */
router.post('/', async (req, res) => {
  const { mainDb, serverConfig } = req.custom
  const {
    ip, plainPassword, name, password,
  } = req.body.config

  const patch = {}
  if (ip && ip.length) patch.ip = ip

  if (plainPassword && plainPassword.length) {
    patch.password = crypto.createHash('md5').update(plainPassword).digest('hex')
  } else if (password && password) {
    patch.password = password
  }
  if (name && name.length) patch.name = name

  const newServerConfig = mainDb.get('servers')
    .find({ id: serverConfig.id })
    .assign(patch)
    .write()

  return res.status(200).json({
    serverConfig: {
      ip: newServerConfig.ip,
      name: newServerConfig.name,
      password: newServerConfig.password,
    },
  })
})

export default router
