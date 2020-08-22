import React, { useReducer, useContext, useMemo, useEffect, useState, useRef } from 'react'
import Section from '../Layout/Section'
import { GlobalContext } from '../App'
import BootstrapTable from 'react-bootstrap-table-next'
import Button from 'react-bootstrap/button'
import Form from 'react-bootstrap/form'
import common from '@pavlov-rcon-ui/common'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MAPS':
      return {
        ...state,
        loading: false,
        pavlovMaps: action.payload.maps
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

const addMap = (dispatch, api, id) => {
  return api.serverPost(`/maps`, {
    mapIds: [id]
  })
    .then(message => {
      getMaps(dispatch, api)
    })
}

const removeMaps = (dispatch, api, ids) => {
  return api.serverDel(`/maps`, {
    mapIds: ids
  })
    .then(message => {

      getMaps(dispatch, api)

      dispatch({
        type: 'TOGGLE_SELECTION',
        payload: {
          anySelected: false
        },
      })
    })
}

const idFormatter = (id) => {
  if (isNaN(id)) return <span>{id}</span>
  return (
    <a href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`} target="_blank" rel="noopener noreferrer">
      {id}
    </a>
  )
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
    dataField: 'title',
    text: 'Title',
    sort: true,
  },
]



const downloadMapRotation = (api) => {
  return api.serverDownload(`/mapRotation`)
}

const uploadMapRotation = (dispatch, api, file) => {
  const data = new FormData()
  data.append('file', file)
  return api.serverUpload(`/mapRotation`, data)
    .then(message => {
      dispatch({
        type: 'SET_MESSAGE',
        payload: {
          message
        },
      })

      getMaps(dispatch, api)
    })
}

const defaultSorted = [{
  dataField: 'title',
  order: 'asc'
}]

const Maps = () => {
  const [state, dispatch] = useReducer(reducer, { pavlovMaps: [], loading: true, message: null })
  const { api } = useContext(GlobalContext)
  const [file, setFile] = useState(null)
  const [mapId, setMapId] = useState('')
  const tableRef = useRef(null)

  const funcs = useMemo(() => ({
    getMaps: () => getMaps(dispatch, api),
    downloadMapRotation: () => downloadMapRotation(api),
    uploadMapRotation: (file) => uploadMapRotation(dispatch, api, file),
    addMap: (mapId) => {
      addMap(dispatch, api, mapId)
      setMapId('')
    },
    removeMaps: () => removeMaps(dispatch, api, tableRef.current.selectionContext.selected),
  }), [ dispatch, api ])

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
      }
    }
  }), [ dispatch ])

  // Load initial maps
  useEffect(
    () => {
      funcs.getMaps()
    }, [ funcs ]
  )

  return (
    <>  
      <Section title='Maps'>
        <span>
          Add map steam64Id:{" "}
          <input
            type="text"
            id="mapId"
            value={mapId}
            onChange={(e) => setMapId(e.target.value)}
            list="exampleList"
          />
          <datalist id="exampleList">
            {common.internalMaps.map((internalMap) => (
              <option key={internalMap.id} value={internalMap.id}>
                {internalMap.alt}
              </option>
            ))}
          </datalist>
        </span>{" "}
        <Button 
          disabled={!Boolean(mapId)}
          onClick={() => funcs.addMap(mapId)}>
          Add
        </Button>

        <Button disabled={!state.anySelected} onClick={() => funcs.removeMaps()}>
          Delete
        </Button>
        
        <BootstrapTable 
          ref={tableRef}
          bootstrap4
          keyField='id' 
          data={ state.pavlovMaps } 
          columns={ columns } 
          selectRow={ objects.selectRow }
          defaultSorted={defaultSorted}
        />
      </Section>



      <Section title='Map rotation'>
        <Form>
          <Form.Group>
            <Form.File 
              id="file" 
              label="Select file with map rotation settings" 
              onChange={(event) => setFile(event.target.files[0])}
            />
          </Form.Group>
        </Form>
        <Button onClick={() => funcs.uploadMapRotation(file)}>
          Upload
        </Button>
        <Button onClick={() => funcs.downloadMapRotation()}>
          Download
        </Button>
      </Section>
    </>
  )
}

export default Maps
