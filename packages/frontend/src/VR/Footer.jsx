import React from 'react'
import propTypes from 'prop-types'

const Footer = ({
  message,
}) => {
  return (
    <>
      {message && <pre>{JSON.stringify(message, null, 2)}</pre>}
    </>
  )
}

Footer.propTypes = {
  message: propTypes.object,
}

export default Footer

