import React, { useReducer, useEffect, useState, useRef, useMemo, useContext } from 'react'
import { GlobalContext } from '../App'
import Section from '../Layout/Section'
import BootstrapTable from 'react-bootstrap-table-next'
import Button from 'react-bootstrap/button'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYERS':
      return {
        ...state,
        loading: false,
        players: action.payload.players
      }
    case 'TOGGLE_SELECTION': {
      return {
        ...state,
        anySelected: action.payload.anySelected
      }
    }
    default:
      return {
        ...state
      }
  }
}

const getPlayers = (dispatch, api) => {
  api.get(`/players`)
    .then(json => {
      dispatch({
        type: 'SET_PLAYERS',
        payload: {
          players: json.players
        }
      })
    })
}

const addPlayer = (dispatch, api, id) => {
  return api.post(`/players`, {
    playerIds: [id]
  })
    .then(() => {
      getPlayers(dispatch, api)
    })
}

const removePlayers = (dispatch, api, ids) => {
  return api.del(`/players`, {
    playerIds: ids
  })
    .then(message => {
     
      getPlayers(dispatch, api)

      dispatch({
        type: 'TOGGLE_SELECTION',
        payload: {
          anySelected: false
        },
      })
    })
}


const idFormatter = (id) => {
  return (
    <a href={`http://steamcommunity.com/profiles/${id}`} target="_blank" rel="noopener noreferrer">
      {id}
    </a>
  )
}

const logormatter = (src) => {
  if (!src) return null

  return <img src={src} alt="" style={{width: '20px'}}/>
}

const flagFormatter = (src) => {
  if (!src) return null

  return <img src={src} alt="" />
}

const columns = [
  {
    dataField: 'id',
    text: 'Id',
    sort: true,
    formatter: idFormatter,
    headerStyle: () => {
      return { width: '200px' }
    }
  },
  {
    dataField: 'imgSrc',
    text: 'Logo',
    formatter: logormatter,
    headerStyle: () => {
      return { width: '80px' }
    }
  },
  {
    dataField: 'nick',
    text: 'Nick',
    sort: true,
  },
  {
    dataField: 'name',
    text: 'Name',
    sort: true,
  },
  {
    dataField: 'flagImgSrc',
    text: 'Country',
    formatter: flagFormatter,
    headerStyle: () => {
      return { width: '100px' }
    }
  }
]

const defaultSorted = [{
  dataField: 'nick',
  order: 'asc'
}]


const Players = () => {
  const [state, dispatch] = useReducer(reducer, { players: [] })
  const { api } = useContext(GlobalContext)
  const [playerId, setPlayerId] = useState('')
  const tableRef = useRef(null)

  const funcs = useMemo(() => ({
    getPlayers: () => getPlayers(dispatch, api),
    addPlayer: (playerId) => {
      addPlayer(dispatch, api, playerId)
      setPlayerId('')
    },
    removePlayers: () => removePlayers(dispatch, api, tableRef.current.selectionContext.selected),
  }), [dispatch, api])

  const objects = useMemo(() => ({
    selectRow: {
      mode: 'checkbox',
      clickToSelect: true,
      onSelect: (rowId, isSelected) => {

        // tableRef.current will only get updated once this method finishes
        const numSelected = tableRef.current.selectionContext.selected.length +
          (isSelected ? 1 : -1)

        dispatch({
          type: 'TOGGLE_SELECTION',
          payload: {
            anySelected: numSelected > 0
          }
        })
      },
      onSelectAll: (isSelected, rows) => {
        dispatch({
          type: 'TOGGLE_SELECTION',
          payload: {
            anySelected: isSelected && rows.length
          }
        })
      }
    }
  }), [ dispatch ])

  // Load initial players
  useEffect(
    () => {
      funcs.getPlayers()
    }, [ funcs ]
  )

  return (
    <>  
      <Section title='Players'>
        <span>
          Add player steamId64:{' '}
          <input
            type="text"
            id="playerId"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
          />
        </span>{' '}
        <Button 
          disabled={!Boolean(playerId)}
          onClick={() => funcs.addPlayer(playerId)}>
          Add
        </Button>

        <Button disabled={!state.anySelected} onClick={() => funcs.removePlayers()}>
          Delete
        </Button>
        
        <BootstrapTable 
          ref={tableRef}
          bootstrap4
          keyField='id' 
          data={ state.players } 
          columns={ columns } 
          selectRow={ objects.selectRow }
          defaultSorted={defaultSorted}
        />
      </Section>
    </>
  )
}

export default Players
