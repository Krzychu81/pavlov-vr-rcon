import Netcat from 'node-netcat'

require('dotenv').config()

const {
  NC_DISABLE,
} = process.env

const ncReal = (serverConfig, messages) => new Promise((res) => {
  const parts = serverConfig.ip.split(':')
  let ip
  let port
  if (isNaN(parts[parts.length - 1])) {
    port = 9100
    ip = serverConfig.ip
  } else {
    port = Number(parts[parts.length - 1])
    ip = parts.slice(0, parts.length - 1).join('')
  }
  const client = Netcat.client(port, ip)

  const commands = [
    serverConfig.password,
    ...messages,
    'Disconnect',
  ]
  let currentCommand = 0

  const responses = []

  client.on('data', (data) => {
    const response = data.toString('ascii').replace('\n', '').replace('\t', '').replace('\r', '')

    if (currentCommand > 1 && currentCommand < commands.length) {
      try {
        responses.push(JSON.parse(response))
      } catch {
        responses.push(response)
      }
    }

    client.send(commands[currentCommand++], false)
  })

  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(err)
  })

  client.on('close', () => {
    res(responses)
  })

  client.start()
})

const ncDummy = (serverConfig, messages) => {
  const response = {
    messages,
    serverConfig,
  }
  console.log(response)

  return response
}

const nc = NC_DISABLE === 'true' ? ncDummy : ncReal

const switchMap = (serverConfig, id, mode = 'SND') => nc(serverConfig, [
  `SwitchMap ${id} ${mode}`,
])

const resetSnd = (serverConfig) => nc(serverConfig, [
  'ResetSND',
])

const rotateMap = (serverConfig) => nc(serverConfig, [
  'RotateMap',
])

const serverInfo = (serverConfig) => nc(serverConfig, [
  'ServerInfo',
])


const playersWithDetailsDummy = [{
  PlayerInfo: {
    UniqueId: '76561198374028403',
    TeamId: '0',
  },
},
{
  PlayerInfo: {
    UniqueId: '76561197970649814',
    TeamId: '0',
  },
},
{
  PlayerInfo: {
    UniqueId: '76561198006489025',
    TeamId: '1',
  },
},
{
  PlayerInfo: {
    UniqueId: '76561198341465286',
    TeamId: '1',
  },
},
{
  PlayerInfo: {
    UniqueId: '76561197970524974',
    TeamId: '1',
  },
},
]


const inspectPlayersReal = (serverConfig, steamIds) => nc(serverConfig,
  steamIds.map((steamId) => `InspectPlayer ${steamId}`))

const inspectPlayersDummy = async () => playersWithDetailsDummy

const inspectPlayers = NC_DISABLE === 'true' ? inspectPlayersDummy : inspectPlayersReal

const whoIsPlayingReal = async (serverConfig) => {
  const playerList = [...await nc(serverConfig, [
    'RefreshList',
  ])][0].PlayerList

  return playerList.map((player) => player.UniqueId)
}

const whoIsPlayingDummy = async () => playersWithDetailsDummy.map(
  (player) => player.PlayerInfo.UniqueId,
)

const whoIsPlaying = NC_DISABLE === 'true' ? whoIsPlayingDummy : whoIsPlayingReal

const whoIsPlayingWithDetailsReal = async (serverConfig) => {
  const steamIds = await whoIsPlaying(serverConfig)

  const playersWithDetails = [...await inspectPlayers(serverConfig, steamIds)]

  const playerInfo = playersWithDetails.map(
    (player) => player.PlayerInfo,
  ).map((player) => ({
    ...player,
    nick: player.PlayerName,
    id: player.UniqueId,
  }))

  return playerInfo
}

const whoIsPlayingWithDetailsDummy = async () => {
  const playerInfo = playersWithDetailsDummy.map(
    (player) => player.PlayerInfo,
  ).map((player) => ({
    ...player,
    nick: player.PlayerName,
    id: player.UniqueId,
  }))

  return playerInfo
}

const whoIsPlayingWithDetails = NC_DISABLE === 'true' ? whoIsPlayingWithDetailsDummy : whoIsPlayingWithDetailsReal

const switchTeamReal = (serverConfig, { steamIds, teamId }) => nc(serverConfig, [
  ...steamIds.map((steamId) => `SwitchTeam ${steamId} ${teamId}`),
])

const switchTeamDummy = (serverConfig, { steamIds, teamId }) => new Promise((res) => {
  steamIds.forEach((steamId) => {
    playersWithDetailsDummy.find((d) => d.PlayerInfo.UniqueId === steamId)
      .PlayerInfo.TeamId = String(teamId)
  })

  return res([`SwitchTeam ${steamIds.join(', ')} ${teamId}`])
})

const switchTeam = NC_DISABLE === 'true' ? switchTeamDummy : switchTeamReal

const setTeamSkin = async (serverConfig, { skinId, teamId }) => {
  const steamIds = await whoIsPlaying(serverConfig)

  

  const playersWithDetails = [...await inspectPlayers(serverConfig, steamIds)]

  console.log(playersWithDetails)

  const playersInTeam = playersWithDetails.map(
    (player) => player.PlayerInfo,
  ).map((player) => ({
    id: player.UniqueId,
    TeamId: player.TeamId,
  })).filter((player) => player.TeamId === teamId)

  return nc(serverConfig, [
    ...playersInTeam.map((player) => `SetPlayerSkin ${player.id} ${skinId}`),
  ])
}
export {
  switchMap,
  resetSnd,
  whoIsPlaying,
  whoIsPlayingWithDetails,
  rotateMap,
  serverInfo,
  switchTeam,
  setTeamSkin,
}
