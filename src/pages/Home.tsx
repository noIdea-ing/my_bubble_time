import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

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
      `}</style>
    </div>
  );
};

export default Home;