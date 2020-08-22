import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import fs from 'fs'

const DATA_FOLDER = './data'

if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER)
}

const mainAdapter = new FileSync(`${DATA_FOLDER}/main.json`)
const mainDb = low(mainAdapter)

mainDb.defaults({
  servers: [
    {
      id: 1,
      name: 'Default name',
      password: '',
      ip: '',
    },
  ],
  players: [],
  teams: [],
}).write()

const servers = mainDb.get('servers').value()
const serverDbs = servers.reduce((result, server) => {
  const serverAdapter = new FileSync(`${DATA_FOLDER}/server-${server.id}.json`)
  const serverDb = low(serverAdapter)
  serverDb.defaults({
    maps: [],
  }).write()

  return {
    ...result,
    [server.id]: serverDb,
  }
}, {})

export {
  mainDb,
  serverDbs,
}
