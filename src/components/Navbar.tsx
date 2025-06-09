import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Navbar as BootstrapNavbar, Container, Nav } from 'react-bootstrap'
import { FaLeaf } from 'react-icons/fa'

const Navbar = () => {
  const location = useLocation()
  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm py-2 sticky-top custom-navbar">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold fs-3 text-gradient">
          {/* Bubble tea logo SVG */}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="38" rx="14" ry="6" fill="#ffe0b2"/>
              <rect x="12" y="10" width="24" height="28" rx="12" fill="#fffde7" stroke="#7c4dff" strokeWidth="2"/>
              <ellipse cx="24" cy="38" rx="10" ry="4" fill="#ffb300"/>
              <circle cx="18" cy="32" r="2" fill="#7c4dff"/>
              <circle cx="24" cy="34" r="2" fill="#7c4dff"/>
              <circle cx="30" cy="32" r="2" fill="#7c4dff"/>
              <rect x="22" y="4" width="4" height="12" rx="2" fill="#7c4dff"/>
            </svg>
          </span>
          Bubble Time
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-2">
            <Nav.Link
              as={Link}
              to="/"
              className={`nav-link-custom${location.pathname === '/' ? ' active' : ''}`}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/menu"
              className={`nav-link-custom${location.pathname === '/menu' ? ' active' : ''}`}
            >
              Menu
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
      <style>{`
        .custom-navbar {
          background: rgba(255,255,255,0.95) !important;
          border-bottom: 1.5px solid #f3e8ff;
        }
        .text-gradient {
          background: linear-gradient(90deg, #7c4dff 30%, #ffb300 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-link-custom {
          font-weight: 500;
          font-size: 1.1rem;
          color: #7c4dff !important;
          border-radius: 20px;
          padding: 0.5rem 1.2rem;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .nav-link-custom:hover, .nav-link-custom.active {
          background: linear-gradient(90deg, #f3e8ff 0%, #ffe0b2 100%);
          color: #4a148c !important;
          box-shadow: 0 2px 12px rgba(124,77,255,0.08);
        }
      `}</style>
    </BootstrapNavbar>
  )
}

export default Navbar