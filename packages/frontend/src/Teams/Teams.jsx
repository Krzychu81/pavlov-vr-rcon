/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useReducer, useEffect, useState, useRef, useMemo, useContext } from 'react'
import Section from '../Layout/Section'
import PlayersInTeam from './PlayersInTeam'
import BootstrapTable from 'react-bootstrap-table-next'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { GlobalContext } from '../App'
import { sortPlayersByNick } from './utils'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TEAMS':
      return {
        ...state,
        teams: action.payload.teams
      }
    case 'SET_PLAYERS':
      return {
        ...state,
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

const getTeams = (dispatch, api) => {
  api.get(`/teams`)
    .then(json => {
      dispatch({
        type: 'SET_TEAMS',
        payload: {
          teams: json.teams
        }
      })
    })
}

const getPlayers = (dispatch, api) => {
  api.get(`/players`)
    .then(json => {
      dispatch({
        type: 'SET_PLAYERS',
        payload: {
          players: sortPlayersByNick(json.players)
        }
      })
    })
}

const addEditTeam = (dispatch, api, { id, name, imgSrc }) => {
  if (id) {
    return api.post(`/teams/${id}`, {
      name,
      imgSrc,
    })
      .then(() => {
        getTeams(dispatch, api)
      })
  }
  
  return api.post(`/teams`, {
    name,
    imgSrc,
  })
    .then(() => {
      getTeams(dispatch, api)
    })
}

const removeTeams = (dispatch, api, ids) => {
  return api.del(`/teams`, {
    teamIds: ids
  })
    .then(message => {
     
      getTeams(dispatch, api)

      dispatch({
        type: 'TOGGLE_SELECTION',
        payload: {
          anySelected: false
        },
      })
    })
}

const addPlayers = (api, teamId, ids) => { 
  return api.postNoBlocking(`/teams/${teamId}/addPlayers`, {
    ids
  })
}

const removePlayers = (api, teamId, ids) => { 
  return api.postNoBlocking(`/teams/${teamId}/removePlayers`, {
    ids
  })
}

const idFormatter = selectTeam => (id) => {
  return (
    <a href='#' onClick={() => selectTeam(id)}>
      {id}
    </a>
  )
}

const logoFormatter = (src) => {
  if (!src) return null

  return <img src={src} alt="" style={{width: '20px'}}/>
}

const columns = ({ selectTeam }) => ([
  {
    dataField: 'id',
    text: 'Id',
    sort: true,
    headerStyle: () => {
      return { width: '200px' }
    },
    formatter: idFormatter(selectTeam)
  },
  {
    dataField: 'imgSrc',
    text: 'Logo',
    formatter: logoFormatter,
    headerStyle: () => {
      return { width: '80px' }
    }
  },
  {
    dataField: 'name',
    text: 'Name',
    sort: true,
  },
])

const defaultSorted = [{
  dataField: 'name',
  order: 'asc'
}]


const emptyTeamConfig = {id: '', name: '', imgSrc: ''}

const Teams = () => {
  const [state, dispatch] = useReducer(reducer, { teams: [], players: [] })
  const [config, setConfig] = useState(emptyTeamConfig)
  const { api } = useContext(GlobalContext)
  const tableRef = useRef(null)

  const funcs = useMemo(() => ({
    getTeams: () => getTeams(dispatch, api),
    getPlayers: () => getPlayers(dispatch, api),
    addEditTeam: (teamConfig, setTeamConfig) => addEditTeam(dispatch, api, teamConfig, setTeamConfig),
    removeTeams: () => removeTeams(dispatch, api, tableRef.current.selectionContext.selected),
    addPlayers: (ids) => addPlayers(api, config.id, ids),
    removePlayers: (ids) => removePlayers(api, config.id, ids)
  }), [api, config.id])

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
    },
    columns: columns({
      selectTeam: (id) => {
        setConfig(state.teams.find(team => team.id === id))
      }
    }),
  }), [state.teams])

  // Load initial teams
  useEffect(
    () => {
      funcs.getTeams()
      funcs.getPlayers()
    }, [ funcs ]
  )

  return (
    <>  
      <Section title='Teams'>

        <Button disabled={!state.anySelected} onClick={() => funcs.removeTeams()}>
          Delete
        </Button>
        
        <BootstrapTable 
          ref={tableRef}
          bootstrap4
          keyField='id' 
          data={ state.teams } 
          columns={ objects.columns } 
          selectRow={ objects.selectRow }
          defaultSorted={defaultSorted}
        />
      </Section>
      {config.id && 
        <Section title={`Players in ${config.name}`}>
          <PlayersInTeam
            teamPlayerIds={state.teams.find(team => team.id === config.id).players}
            allPlayers={state.players}
            addPlayers={funcs.addPlayers}
            removePlayers={funcs.removePlayers}
          />
        </Section>
      }
      
      <Section title='Add / edit Team'>
        <Form>
          <Form.Group controlId="formId">
            <Form.Label>Id</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Team will be created" 
              value={config.id}
              disabled
            />
          </Form.Group>

          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter name" 
              value={config.name}
              onChange={ ({ target: { value: name }}) => {
                setConfig(prev => ({
                  ...prev,
                  name,
                }))
              }}
            />
          </Form.Group>

          <Form.Group controlId="formImgScr">
            <Form.Label>Image url</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter url" 
              value={config.imgSrc}
              onChange={ ({ target: { value: imgSrc }}) => {
                setConfig(prev => ({
                  ...prev,
                  imgSrc
                }))
              }}
            />
          </Form.Group>

          <Button
            onClick={() => funcs.addEditTeam(config, setConfig)}
          >
            {config.id ? 'Edit' : 'Create'}
          </Button>
          <Button
            onClick={() => setConfig(emptyTeamConfig)}
          >
            Clear
          </Button>
        </Form>
      </Section>
    </>
  )
}

export default Teams
