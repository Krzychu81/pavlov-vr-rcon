import React from 'react'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Section from '../Layout/Section'

const gameModes = [
  'SND', 'TDM', 'DM', 'GUN', 'ZWV', 'WW2GUN', 'TANKTDM', 'KOTH'
]

const ModeSetter = ({ setMode, mode }) => {

  return (
    <Section title="Game mode">
      <ButtonGroup toggle>
        {gameModes.map((gameMode, idx) => (
          <ToggleButton
            key={idx}
            type="radio"
            variant="secondary"
            name="radio"
            value={gameMode}
            checked={gameMode === mode}
            onChange={(e) => setMode(e.currentTarget.value)}
          >
            {gameMode}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </Section>
  )
}

export default ModeSetter
