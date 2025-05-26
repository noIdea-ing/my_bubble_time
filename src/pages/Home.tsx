import React from 'react'
import Navbar from '../components/Navbar'
import { Container, Row, Col, Card } from 'react-bootstrap'

const Home = () => {
  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <Container className="py-5">
        <Row className="justify-content-center text-center mb-5">
          <Col md={8}>
            <h1 className="display-4 mb-4">Welcome to Bubble Time</h1>
            <p className="lead text-muted">
              Your cozy destination for premium bubble tea and refreshing beverages
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h4>About Us</h4>
                <p>
                  Established in 2023, Bubble Time brings you authentic Taiwanese
                  bubble tea with a modern twist. We carefully select our
                  ingredients to ensure the best quality drinks.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h4>Our Specialties</h4>
                <p>
                  From classic milk teas to creative fruit teas, we offer a wide
                  range of customizable drinks. Try our signature Brown Sugar Pearl
                  Milk Tea or refreshing Fruit Tea Series.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h4>Visit Us</h4>
                <p>
                  Open daily from 10 AM to 10 PM. Located in the heart of the
                  city, we offer a comfortable space to enjoy your favorite
                  drinks with friends and family.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Home