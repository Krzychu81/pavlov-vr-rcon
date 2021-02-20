import React, { useEffect, useReducer, useMemo, useContext } from 'react'
import { IconContext } from 'react-icons'
import styles from './index.module.css'
import Header from './Header'
import Footer from './Footer'
import MapsViewer from './MapsViewer'
import TeamsViewer from './TeamsViewer'
import Players from './Players'
import ModeSetter from './ModeSetter'
import ServerChecker from './ServerChecker'
import { GlobalContext } from '../App'
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa'

const sortMaps = (pavlovMaps) => pavlovMaps.sort((a, b) => a.title > b.title ? 1 : -1)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MAPS':
      return {
        ...state,
        loading: false,
        pavlovMaps: sortMaps(action.payload.maps)
      }
    case 'SET_MESSAGE':
      return {
        ...state,
        message: action.payload.message
      }
    case 'SET_PLAYERS':
      return {
        ...state,
        players: {
          ...state.players,
          [action.payload.team]: action.payload.players
        }
      }
    case 'SET_TEAMS':
      return {
        ...state,
        teams: action.payload.teams,
      }
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload.mode,
      }
    case 'SET_SERVER_STATUS':
      return {
        ...state,
        visible: action.payload.visible,
      }
    default:
      throw new Error('Incorrect action')
  }
}

// #region API functions

const switchMap = (dispatch, api, id, mode) => {
  return api.serverGet(`/match/switchMap/${id}/${mode}`)
    .then(message => dispatch({
      type: 'SET_MESSAGE',
      payload: {
        message
      }
    }))
}

const rotateMap = (dispatch, api) => {
  return api.serverGet(`/match/rotateMap`)
    .then(message => dispatch({
      type: 'SET_MESSAGE',
      payload: {
        message
      }
    }))
}

const resetSnd = (dispatch, api) => {
  return api.serverGet(`/match/resetSnd`)
    .then(message => dispatch({
      type: 'SET_MESSAGE',
      payload: {
        message
      }
    }))
}

const serverInfo = (dispatch, api) => {
  return api.serverGet(`/`)
    .then(message => dispatch({
      type: 'SET_MESSAGE',
      payload: {
        message
      }
    }))
}

const getMaps = (dispatch, api) => {
  api.serverGet(`/maps`)
    .then(json => {
      dispatch({
        type: 'SET_MAPS',
        payload: {
          maps: json.maps
        }
      })
    })
}

/**
 * Get players currently playing on the server
 */
const getPlayers = async (dispatch, api) => {
  const players = (await api.serverGet(`/players`)).players

  dispatch({
    type: 'SET_PLAYERS',
    payload: {
      team: 'red',
      players: players.filter(player => player.TeamId === '0')
    }
  })

  dispatch({
    type: 'SET_PLAYERS',
    payload: {
      team: 'blue',
      players: players.filter(player => player.TeamId === '1')
    }
  })
  
}

/**
 * Get teams currently playing on the server
 */
const getTeams = async (dispatch, api) => {
  const teams = (await api.serverGet(`/players/teams`)).teamsWithPlayers

  dispatch({
    type: 'SET_TEAMS',
    payload: {
      teams
    },
  })
  
}

const switchTeam = (dispatch, api, { playerId, teamId }) => {
  return api.serverPost(`/players/${playerId}`, {
    teamId
  })
    .then(() => getPlayers(dispatch, api))
}

const startMatch = (api, teamIds) => {
  return api.serverPost(`/match/start`, {
    teamIds
  })
}

/**
 * Set game mode to play
 */

const setMode = (dispatch, mode) => {
  dispatch({
    type: 'SET_MODE',
    payload: {
      mode
    },
  })
}

/**
 * Set skins of team
 */
const setTeamSkin = (dispatch, api, { skinId, teamId }) => {
  return api.serverPost(`/match/setTeamSkin`, {
    skinId, teamId
  })
    .then(() => getPlayers(dispatch, api))
}

/**
 * Check if server is visible in the server list
 */

const getServerStatus = async (dispatch, api) => {
  const visible = (await api.serverGet(`/status`)).visible

  dispatch({
    type: 'SET_SERVER_STATUS',
    payload: {
      visible
    }
  })
}

//#endregion

const VR = () => {
  const [state, dispatch] = useReducer(reducer, { pavlovMaps: [], teams: [], message: null, players: {}, mode: 'SND', visible: false })
  const { api } = useContext(GlobalContext)

  const funcs = useMemo(() => ({
    getMaps: () => getMaps(dispatch, api),
    rotateMap: () => rotateMap(dispatch, api),
    resetSnd: () => resetSnd(dispatch, api),
    serverInfo: () => {
      serverInfo(dispatch, api)
      funcs.getTeams()
      funcs.getPlayers()
    },
    getPlayers: () => getPlayers(dispatch, api),
    getTeams: () => getTeams(dispatch, api),
    startMatch: async (teamIds) => {
      await startMatch(api, teamIds)
      funcs.getPlayers()
    },
    switchToBlueTeam: (playerId) => switchTeam(dispatch, api, { playerId, teamId: 1}),
    switchToRedTeam: (playerId) => switchTeam(dispatch, api, { playerId, teamId: 0}),
    setMode: (mode) => setMode(dispatch, mode),
    getServerStatus: () => getServerStatus(dispatch, api),
  }), [dispatch, api])

  // Load initial maps
  useEffect(
    () => {
      funcs.getMaps()
      funcs.serverInfo()
      funcs.getServerStatus()
    }, [ funcs ]
  )

  return (
    <IconContext.Provider value={{ size: '1.5em' }}>
      <div className={styles['maps-switcher']}>

        <div className={styles['server-checker']}>
          <ServerChecker
            visible={state.visible}
            getServerStatus={funcs.getServerStatus}
          />
        </div>

        <div className={styles.header}>
          <Header
            rotateMap={funcs.rotateMap}
            resetSnd={funcs.resetSnd}
          />
        </div>

        <div className={styles['mode-setter']}>
          <ModeSetter
            setMode={funcs.setMode}
            mode={state.mode}
          />
        </div>

        <div className={styles['maps-viewer']}>
          <MapsViewer
            pavlovMaps={state.pavlovMaps}
            switchMap={(id) => switchMap(dispatch, api, id, state.mode)}
          />
        </div>
        <div className={styles['teams-viewer']}>
          <TeamsViewer
            teams={state.teams}
            startMatch={funcs.startMatch}
            serverInfo={funcs.serverInfo}
            resetSnd={funcs.resetSnd}
          />
        </div>
        <div className={styles.players}>
          <Players
            className={styles['red-players']}
            title='Red'
            switchTeam={funcs.switchToBlueTeam}
            switchTeamIcon={FaArrowRight}
            players={state.players.red}
            setTeamSkin={(skinId) => setTeamSkin(dispatch, api, { skinId, teamId: '0' })}
          />
        
          <Players 
            className={styles['blue-players']}
            switchTeam={funcs.switchToRedTeam}
            switchTeamIcon={FaArrowLeft}
            title='Blue'
            players={state.players.blue}
            setTeamSkin={(skinId) => setTeamSkin(dispatch, api, { skinId, teamId: '1' })}
          />
  
        </div>

        <div className={styles.footer}>
          <Footer
            message={state.message}
          />
        </div>

      </div>
    </IconContext.Provider>
  )
}

export default VR
