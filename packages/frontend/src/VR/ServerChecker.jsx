import React from 'react'
import propTypes from 'prop-types'
import Alert from 'react-bootstrap/Alert'

const ServerChecker = ({ visible, getServerStatus }) => {

  const variant = visible ? 'success' : 'danger'
  const message = visible ? `Server is visible` : `Server is not visible (click to refresh)!`

  return <>
    <Alert variant={variant} onClick={getServerStatus}>
      {message}
    </Alert>
  </>
}

ServerChecker.propTypes = {
  serverName: propTypes.string.isRequired,
}

export default ServerChecker