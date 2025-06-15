import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Navbar as BSNavbar, Container, Nav, Button, Modal, Form, Alert } from 'react-bootstrap'
import { supabase } from '../supabaseClient'
import { FaUserCircle } from 'react-icons/fa'

const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>('')
  
  // Login/Register form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getInitialUser = async () => {
      // Check if user is already logged in via session storage
      const userId = sessionStorage.getItem('userId')
      const userRole = sessionStorage.getItem('userRole')
      
      if (userId && userRole) {
        // Fetch user details from database using stored userId
        try {
          const { data: userData, error } = await supabase
            .from('usersBT')
            .select('id, email, username, role')
            .eq('id', userId)
            .single()

          if (userData && !error) {
            setUser({ id: userData.id, email: userData.email })
            setUsername(userData.username)
          } else {
            // If user not found, clear invalid session
            sessionStorage.removeItem('userId')
            sessionStorage.removeItem('userRole')
          }
        } catch (error) {
          // If error fetching user, clear session
          sessionStorage.removeItem('userId')
          sessionStorage.removeItem('userRole')
        }
      }
    }

    getInitialUser()
  }, [])

  const handleModalClose = () => {
    setShowLogin(false)
    setError(null)
    setEmail('')
    setPassword('')
    setRegisterUsername('')
    setIsRegistering(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!isRegistering) {
        // Login flow - select from usersBT
        const { data: userData, error } = await supabase
          .from('usersBT')
          .select('id, email, username, role, password')
          .eq('email', email)
          .eq('password', password)
          .single()

        if (error || !userData) {
          setError('Invalid email or password')
          return
        }

        // Store only userId and userRole in session storage
        sessionStorage.setItem('userId', userData.id)
        sessionStorage.setItem('userRole', userData.role)
        
        // Update state immediately
        setUser({ id: userData.id, email: userData.email })
        setUsername(userData.username)

        // Close modal
        handleModalClose()

        window.location.reload()

      } else {
        // Registration flow - insert into usersBT
        const { data: existingUser } = await supabase
          .from('usersBT')
          .select('email')
          .eq('email', email)
          .single()

        if (existingUser) {
          setError('Email already registered')
          setLoading(false)
          return
        }

        const { error: insertError } = await supabase
          .from('usersBT')
          .insert([
            {
              email: email,
              username: registerUsername || email.split('@')[0],
              password: password,
              role: 'user',
            },
          ])

        if (insertError) {
          setError('Error creating account: ' + insertError.message)
          return
        }

        const { data: userData, error } = await supabase
          .from('usersBT')
          .select('id, email, username, role, password')
          .eq('email', email)
          .eq('password', password)
          .single()

        if (error || !userData) {
          return
        }

        sessionStorage.setItem('userId', userData.id)
        sessionStorage.setItem('userRole', userData.role)
        
        // Update state immediately
        setUser({ id: userData.id, email: userData.email })
        setUsername(userData.username)

        // Close modal
        handleModalClose()
        window.location.reload() 
        setIsRegistering(false)
        setEmail('')
        setPassword('')
        setRegisterUsername('')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    setUser(null)
    setUsername('')
    // Clear only userId and userRole from session storage
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('userRole')
    window.location.reload()
  }

  return (
    <>
      <BSNavbar bg="white" expand="lg" className="shadow-sm py-2 sticky-top">
        <Container>
          <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold fs-3 text-gradient">
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="icon.png"
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
              <Nav.Link
                as={Link}
                to="/favorites"
                className={`nav-link-custom${location.pathname === '/favorites' ? ' active' : ''}`}
              >
                Featured
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
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </Button>
              )}
            </Nav>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>

      {/* Login/Register Modal */}
      <Modal show={showLogin} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isRegistering ? 'Create Account' : 'Login'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert 
              variant={error.includes('successful') ? 'success' : 'danger'}
              className="mb-3"
            >
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleAuth}>
            {isRegistering && (
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                variant={isRegistering ? "success" : "primary"}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isRegistering ? 'Creating Account...' : 'Logging in...'}
                  </span>
                ) : (
                  isRegistering ? 'Create Account' : 'Login'
                )}
              </Button>
              
              <Button
                variant="link"
                onClick={() => {
                  setIsRegistering(!isRegistering)
                  setError(null)
                }}
              >
                {isRegistering 
                  ? 'Already have an account? Login' 
                  : "Don't have an account? Register"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Logout Confirmation Modal */}
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

      <style>{`
        .nav-link-custom {
          color: #4a4a4a;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link-custom:hover {
          color: #7c4dff;
        }

        .nav-link-custom.active {
          color: #7c4dff !important;
        }

        .nav-link-custom.user-name {
          color: #7c4dff;
          font-weight: 500;
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: rgba(124, 77, 255, 0.1);
          border-radius: 20px;
        }

        .login-btn, .logout-btn {
          border-radius: 20px;
          padding: 0.5rem 1.2rem;
          transition: all 0.2s;
        }

        .login-btn {
          background: #7c4dff;
          border-color: #7c4dff;
        }

        .login-btn:hover {
          background: #6039cc;
          border-color: #6039cc;
          transform: translateY(-2px);
        }

        .logout-btn {
          color: #dc3545;
          border-color: #dc3545;
        }

        .logout-btn:hover {
          background: #dc3545;
          color: white;
          transform: translateY(-2px);
        }
      `}</style>
    </>
  )
}

export default Navbar