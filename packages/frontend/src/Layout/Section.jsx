import React from 'react'
import Card from 'react-bootstrap/Card'

const Section = ({ title, children }) => {
  return (
    <Card style={{ marginBottom: '20px' }}>
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {children}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Section