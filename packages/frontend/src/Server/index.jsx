import React, { } from 'react'
import Container from 'react-bootstrap/Container'
import Maps from './Maps'
import Configuration from './Configuration'

const ServerAdmin = () => {
  return (
    <Container>
      <Maps />
      <Configuration />
    </Container>
  )
}

export default ServerAdmin