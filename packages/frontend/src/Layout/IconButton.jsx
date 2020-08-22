import React from 'react'
import propTypes from 'prop-types'
import Button from 'react-bootstrap/Button'

const IconButton = ({Icon, label, onClick, disabled}) => {
  return (
    <Button 
      size="lg" 
      onClick={onClick}
      disabled={disabled}
    >
      <Icon/>
      <br/>  
      {label}
    </Button>
  )
}
  
IconButton.propTypes = {
  label: propTypes.string.isRequired,
  Icon: propTypes.func.isRequired,
  onClick: propTypes.func.isRequired,
}

export default IconButton
