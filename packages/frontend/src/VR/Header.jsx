import React from 'react'

import propTypes from 'prop-types'

import IconButton from '../Layout/IconButton'
import { GrPowerReset, GrFastForward } from 'react-icons/gr'

const Header = ({rotateMap, resetSnd}) => {
  return (
    <>
      <IconButton
        Icon={GrFastForward}
        label="Rotate map"
        onClick={rotateMap} />{' '}
      <IconButton
        Icon={GrPowerReset}
        label="Reset SND"
        onClick={resetSnd} />{' '}
    </>
  )
}

Header.propTypes = {
  rotateMap: propTypes.func.isRequired,
  resetSnd: propTypes.func.isRequired,
}

export default Header
