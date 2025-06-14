import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModalClose = () => {
    setShowLogin(false);
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setIsRegistering(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isRegistering) {
        // Simple login flow without pre-checks
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        if (data.user) {
          // Get user role in a single query
          const { data: userData, error: roleError } = await supabase
            .from('usersBT')
            .select('role')
            .eq('email', data.user.email)
            .single();

          if (roleError) {
            setError('Error fetching user data');
            return;
          }

          // Close modal first
          setShowLogin(false);

          // Navigate based on role
          if (userData.role === 'admin') {
            navigate('/AdminHome');
          } else {
            window.location.reload();
          }
        }
      } else {
        // Registration flow
        const { data: existingUser } = await supabase
          .from('usersBT')
          .select('email')
          .eq('email', email)
          .single();

        if (existingUser) {
          setError('Email already registered');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { error: insertError } = await supabase
            .from('usersBT')
            .insert([
              {
                email: data.user.email,
                username: username || email.split('@')[0],
                role: 'user',
              },
            ]);

          if (insertError) {
            setError('Error creating user profile');
            return;
          }

          setError('Registration successful! You can now login.');
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setUsername('');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar showLogin={() => setShowLogin(true)} />

      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80) center/cover',
          minHeight: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
        className="mb-5 shadow-sm rounded-4 animate__animated animate__fadeInDown"
      >
        <h1 className="display-3 fw-bold mb-3" style={{ color: '#7c4dff', textShadow: '1px 1px 8px #fff' }}>
          Welcome to My Bubble Time Cafe
        </h1>
        <p className="lead text-muted mb-4" style={{ fontSize: '1.3rem' }}>
          Your cozy destination for premium refreshing beverages and delightful foods.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="px-5 py-2 rounded-pill shadow-lg"
          onClick={() => navigate('/menu')}
        >
          See Menu
        </Button>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm card-hover animate__animated animate__fadeInUp" style={{ transition: 'transform 0.3s, box-shadow 0.3s' }}>
              <Card.Body className="text-center">
                <FaUsers size={40} className="mb-3 text-primary" />
                <h4>About Us</h4>
                <p>
                  Established in 2021, My Bubble Time Cafe brings you delightful and variety foods with a modern twist. We carefully select our
                  ingredients to ensure the best quality!
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm card-hover animate__animated animate__fadeInUp" style={{ transition: 'transform 0.3s, box-shadow 0.3s', animationDelay: '0.1s' }}>
              <Card.Body className="text-center">
                <FaStar size={40} className="mb-3 text-warning" />
                <h4>Our Specialties</h4>
                <p>
                  From western food to authentic local foods, we offer a wide
                  range of foods and drinks. Try our signature Brown Sugar Pearl
                  Milk Tea or refreshing Fruit Tea Series.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm card-hover animate__animated animate__fadeInUp" style={{ transition: 'transform 0.3s, box-shadow 0.3s', animationDelay: '0.2s' }}>
              <Card.Body className="text-center">
                <FaMapMarkerAlt size={40} className="mb-3 text-danger" />
                <h4>Visit Us</h4>
                <p>
                  Open daily from 11.30 AM to 9 PM *except Saturday*. Located in the Parit Raja, we offer a comfortable space to enjoy your favorite
                  drinks with friends and family. Buffet parties are enjoyed!
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                minLength={6}
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
                  setIsRegistering(!isRegistering);
                  setError(null);
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

      <style>{`
        .card-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(124,77,255,0.15);
        }
        
        .animate__fadeInDown { 
          animation-name: fadeInDown; 
        }
        
        .animate__fadeInUp { 
          animation-name: fadeInUp; 
        }
        
        @keyframes fadeInDown {
          from { 
            opacity: 0; 
            transform: translateY(-40px); 
          } to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(40px); 
          } to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
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
    </div>
  );
};

export default Home;