import React, { useState, useEffect, useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import _differenceBy from 'lodash/differenceBy'
import { sortPlayersByNick } from './utils'
import styles from './playersInTeam.module.css'

const PlayersInTeam = ({ allPlayers, teamPlayerIds, addPlayers, removePlayers }) => {
  const [ playersNotInTeam, setPlayersNotInTeam ] = useState([])
  const [ playersInTeam, setPlayersInTeam ] = useState([])
  useEffect(() => {
    const teamPlayers = sortPlayersByNick(teamPlayerIds.map(id => allPlayers.find(player => player.id === id)))
    setPlayersInTeam(teamPlayers)
    setPlayersNotInTeam(_differenceBy(allPlayers, teamPlayers, 'id'))
  }, [allPlayers, teamPlayerIds])

  const [ selectedPlayersNotInTeam, setSelectedPlayersNotInTeam ] = useState([])
  const toggleSelectedPlayerNotInTeam = useCallback(({ target: { options }}) => {
    setSelectedPlayersNotInTeam([...options].filter(option => option.selected).map(option => option.value))
  }, [])

  const [ selectedPlayersInTeam, setSelectedPlayersInTeam ] = useState([])
  const toggleSelectedPlayerInTeam = useCallback(({ target: { options }}) => {
    setSelectedPlayersInTeam([...options].filter(option => option.selected).map(option => option.value))
  }, [])

  const handleAddPlayers = useCallback(() => {
    const playersToAdd = allPlayers.filter(player => selectedPlayersNotInTeam.includes(player.id))

    const newPlayers = sortPlayersByNick(playersInTeam.concat(playersToAdd))
    setPlayersInTeam(newPlayers)
    setPlayersNotInTeam(_differenceBy(allPlayers, newPlayers, 'id'))
    setSelectedPlayersNotInTeam([])

    addPlayers(selectedPlayersNotInTeam)

  }, [addPlayers, allPlayers, playersInTeam, selectedPlayersNotInTeam])

  const handleRemovePlayers = useCallback(() => {

    const newPlayers = sortPlayersByNick(playersInTeam.filter(player => !selectedPlayersInTeam.includes(player.id)))
    setPlayersInTeam(newPlayers)
    setPlayersNotInTeam(_differenceBy(allPlayers, newPlayers, 'id'))
    setSelectedPlayersInTeam([])

    removePlayers(selectedPlayersInTeam)

  }, [allPlayers, playersInTeam, removePlayers, selectedPlayersInTeam])

  return (
    <Form className={styles.container} >  
      <Form.Group controlId="form.CurrentPlayers" className={styles.selector}>
        <Form.Label>Team players</Form.Label>
        <Form.Control as="select" multiple onChange={toggleSelectedPlayerInTeam} htmlSize={10}>
          {playersInTeam.map(player => 
            <option key={player.id} value={player.id}>{player.nick}</option>
          )}
        </Form.Control>
      </Form.Group>
      <div className={styles.buttons}> 
        <Button 
          disabled={selectedPlayersNotInTeam.length === 0}
          onClick={handleAddPlayers}
        >
          {'<<'}
        </Button><br/><br/>
        <Button 
          className={styles.button} 
          disabled={selectedPlayersInTeam.length === 0}
          onClick={handleRemovePlayers}
        >
          {'>>'}
        </Button>
      </div>
      <Form.Group controlId="form.TeamPlayers" className={styles.selector}>
        <Form.Label>Other players</Form.Label>
        <Form.Control as="select" multiple onChange={toggleSelectedPlayerNotInTeam} htmlSize={10}>
          {playersNotInTeam.map(player => 
            <option key={player.id} value={player.id}>{player.nick}</option>
          )}
        </Form.Control>
      </Form.Group>
    </Form>
  )
}

export default PlayersInTeam
