import React, { useState, useEffect, useContext } from 'react'
import Form from 'react-bootstrap/form'
import Button from 'react-bootstrap/button'
import Section from '../Layout/Section'
import { GlobalContext } from '../App'
import { get, post } from '../utils'


const submit = (serverId, config, setConfig) => {
  return post(`/servers/${serverId}/config`, { config })
    .then(json => setConfig({
      ...json.serverConfig,
      plainPassword: '',
    }))
}

const Configuration = () => {

  const [ config, setConfig ] = useState({ ip: '', name: '', password: '', plainPassword: '' })
  const { state: globalState } = useContext(GlobalContext)

  useEffect(() => {
    const loadConfig = async () => {
      get(`/servers/${globalState.serverId}/config`)
      .then(json => setConfig({
        ...json.serverConfig,
        plainPassword: '',
      }))
    }
    loadConfig()
  }, [ globalState.serverId ])

  return (
    <Section title='Configuration'>
      <Form>
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

        <Form.Group controlId="formIp">
          <Form.Label>IP</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter IP" 
            value={config.ip}
            onChange={ ({ target: { value: ip }}) => {
              setConfig(prev => ({
                ...prev,
                ip
              }))
            }}
          />
        </Form.Group>

        <Form.Group controlId="formPlainPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Enter password"
            value={config.plainPassword}
            onChange={ ({ target: { value: plainPassword }}) => {
              setConfig(prev => ({
                ...prev,
                plainPassword,
              }))
            }}
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Hash password</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter password" 
            value={config.password}
            onChange={ ({ target: { value: password }}) => {
              setConfig(prev => ({
                ...prev,
                password,
              }))
            }}
          />
        </Form.Group>


        <Button
          onClick={() => submit(globalState.serverId, config, setConfig)}
        >
          Submit
          </Button>
      </Form>
    </Section>

  )
}

export default Configuration
