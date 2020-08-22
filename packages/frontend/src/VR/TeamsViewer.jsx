import React, { useState } from 'react'
import propTypes from 'prop-types'
import styles from './teamsViewer.module.css'
import Card from 'react-bootstrap/Card'
import Section from '../Layout/Section'
import IconButton from '../Layout/IconButton'
import { FaPlay } from 'react-icons/fa'
import { GrStatusInfo } from 'react-icons/gr'

const TeamsViewer = ({
  teams,
  startMatch,
  serverInfo
}) => {
  const [ selectedTeamIds, setSelectedTeamIds ] = useState([])

  const toggleTeam = (teamId) => {
    if (selectedTeamIds.includes(teamId)) {
      return setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId))
    }

    return setSelectedTeamIds(selectedTeamIds.concat(teamId))
  }

  return <Section title='Teams' style={{width: '100%'}}>
    <div>
      <IconButton
        Icon={GrStatusInfo}
        label="Refresh"
        onClick={serverInfo} />{' '}
      <IconButton
        Icon={FaPlay}
        label="Start"
        disabled={selectedTeamIds.length !== 2}
        onClick={() => startMatch(selectedTeamIds)} />{' '}
      <div className={styles.container}>
        {teams.map(team => {      
          const selectionStyle = selectedTeamIds.includes(team.id) ? styles.selected : ''

          const onClick = () => toggleTeam(team.id)
          return (
            <Card
              className={styles['team-tile']}
              key={team.id}
            >
              {!team.imgSrc &&
                <div
                  className={`${styles['alt-thumbnail']} ${selectionStyle}`}
                  onClick={onClick}
                >
                  {team.name}
                </div>
              }
              {team.imgSrc &&
                <Card.Img
                  variant="top"
                  className={`${styles.thumbnail} ${selectionStyle}`}
                  src={[team.imgSrc]}
                  alt={team.name}
                  onClick={onClick} />
              }
              <Card.Body>
                <Card.Title>{team.name}</Card.Title>
                Players: {team.playingPlayers.length}/{team.players.length}
              </Card.Body>
            </Card>
          )
        })}
    </div>
  </div>
  </Section>
}

TeamsViewer.propTypes = {
  teams: propTypes.array.isRequired,
  startMatch: propTypes.func.isRequired,
  refresh: propTypes.func.isRequired,
}

export default TeamsViewer