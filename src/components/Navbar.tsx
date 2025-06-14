import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Navbar as BSNavbar, Container, Nav, Button, Modal } from 'react-bootstrap'
import { supabase } from '../supabaseClient'
import { FaUserCircle } from 'react-icons/fa'

interface NavbarProps {
  showLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ showLogin }) => {
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('usersBT')
          .select('username')
          .eq('email', user.email)
          .single()
          
        if (data) {
          setUsername(data.username)
        }
      }
    }

    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUsername('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setShowLogoutConfirm(false)
      setUser(null)
      setUsername('')
      window.location.reload()
    }
  }

  return (
    <>
      <BSNavbar bg="white" expand="lg" className="shadow-sm py-2 sticky-top">
        <Container>
          <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold fs-3 text-gradient">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="src\\assets\\bbt.jpg"
                alt="Bubble Time Logo"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px #f3e8ff',
                  background: '#fff'
                }}
              />
            </span>
            My Bubble Time Cafe
          </BSNavbar.Brand>
          <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BSNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto gap-2 align-items-center">
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
              
              {user ? (
                <>
                  <span className="nav-link-custom d-flex align-items-center user-name">
                    <FaUserCircle size={22} className="me-2" />
                    {username}
                  </span>
                  <Button
                    variant="outline-danger"
                    className="logout-btn ms-2"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  className="login-btn"
                  onClick={showLogin}
                >
                  Login
                </Button>
              )}
            </Nav>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>

      <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Navbar