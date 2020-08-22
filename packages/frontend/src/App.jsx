import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"
import VR from './VR'
import Players from './Players'
import Server from './Server'
import Teams from './Teams'
import Header from './Layout/Header'
import styles from './app.module.css'
import { get, post, del, upload, download } from './utils'


export const GlobalContext = React.createContext()

const globalReducer = (state, action) => {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        loadingCount: state.loadingCount + 1
      }
    case 'FINISH_LOADING':
      return {
        ...state,
        loadingCount: Math.max(state.loadingCount - 1, 0)
      }
    default:
      return {
        ...state
      }
  }
}

const wrapInLoading = (dispatch, func) => {

  return async (...args) => {
    dispatch({
      type: 'START_LOADING'
    })

    try {
      return await func(...args)
    }
    finally {
      dispatch({
        type: 'FINISH_LOADING'
      })
      
    }
  }
}

function App() {
  const [ state, dispatch ] = React.useReducer(globalReducer, {
    serverId: 1,
    loadingCount: 0,
  })

  const api = React.useMemo(() => ({
    get: wrapInLoading(dispatch, get),
    serverGet: wrapInLoading(dispatch, (path) => get(`/servers/${state.serverId}${path}`)),
    post: wrapInLoading(dispatch, post),
    postNoBlocking: post,
    serverPost: wrapInLoading(dispatch, (path, body) => post(`/servers/${state.serverId}${path}`, body)),
    del: wrapInLoading(dispatch, del),
    serverDel: wrapInLoading(dispatch, (path, body) => del(`/servers/${state.serverId}${path}`, body)),
    upload: wrapInLoading(dispatch, upload),
    serverUpload: wrapInLoading(dispatch, (path, file) => upload(`/servers/${state.serverId}${path}`, file)),
    download: wrapInLoading(dispatch, download),
    serverDownload: wrapInLoading(dispatch, (path) => download(`/servers/${state.serverId}${path}`)),
  }), [ state.serverId ])

  return (
    <GlobalContext.Provider value={{state, api, dispatch}}>
      <Router>
        <div>
          <div className={styles.header}>
            <Header />
          </div>
          <div className={styles.container}>
            <Switch>
              <Route path="/players">
                <Players />
              </Route>
              <Route path="/teams">
                <Teams />
              </Route>
              <Route path="/VR">
                <VR />
              </Route>
              <Route path="/">
                <Server />
              </Route>
            </Switch>
          </div>
          {state.loadingCount > 0 ? <div className={styles.loading}></div> : null}
        </div>
      </Router>
    </GlobalContext.Provider>
  )
};

export default App
