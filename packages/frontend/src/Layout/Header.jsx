import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Link, useLocation } from 'react-router-dom'

const NavLink = ({path, children}) => {
  return (
    <Nav.Link as={Link} to={path} eventKey={path}>
      {children}
    </Nav.Link>
  )
}

const Header = () => {
  const location = useLocation()

  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Navbar.Brand as={Link} to="/">Pavlov VR RCON</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav activeKey={location.pathname} className="mr-auto">
          <NavLink path="/VR">VR</NavLink>
          <NavLink path="/">Server</NavLink>
          <NavLink path="/players">Players</NavLink>
          <NavLink path="/teams">Teams</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Header
