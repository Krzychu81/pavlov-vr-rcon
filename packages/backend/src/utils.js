import https from 'https'
import common from '@pavlov-rcon-ui/common'

const get = (url, count = 0) => new Promise((resolve) => {
  https.get(url, (res) => {
    // Handle redirect
    if (res.headers.location && res.headers.location !== url) {
      if (count > 5) return resolve({})
      return resolve(get(res.headers.location, count + 1))
    }

    res.setEncoding('utf8')
    let body = ''

    res.on('data', (data) => {
      body += data
    })

    res.on('end', () => {
      resolve(body)
    })

    return null
  })
})

const getValidInternalMap = (id) => {
  if (isNaN(id)) {
    return common.internalMaps.find((internalMap) => internalMap.id === String(id).toLowerCase())
  }
  return common.internalMaps.find((internalMap) => internalMap.id === id)
}

export {
  get,
  getValidInternalMap,
}
