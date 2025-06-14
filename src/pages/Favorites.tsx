import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { FaHeart } from 'react-icons/fa';

// Update interfaces to match ERD
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  admin_id: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  admin_id: string;
}

interface FavouriteRecord {
  id: string;
  user_id: string;
  menuitem_id: string;
  menuItem: MenuItem;
}

interface TopMenuItem extends MenuItem {
  favorite_count: number;
}

const Favorites = () => {
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState<TopMenuItem[]>([]);
  const [drinkItems, setDrinkItems] = useState<TopMenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopFavorites = async () => {
      try {
        // First get categories to determine food vs drinks
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('*');

        if (catError) throw catError;

        if (!categories) {
          setError('No categories found');
          return;
        }

        // Get favorites with joined menu items
        const { data: favorites, error: favError } = await supabase
          .from('favourites')
          .select(`
            id,
            menuitem_id,
            user_id,
            menuitem (
              id,
              name,
              price,
              category_id,
              image_url
            )
          `);

        if (favError) throw favError;

        if (!favorites) {
          setError('No favorites found');
          return;
        }

        // Process favorites
        const itemCounts: { [key: string]: TopMenuItem } = {};
        favorites.forEach(fav => {
          if (fav.menuitem) {
            const item = fav.menuitem;
            if (!itemCounts[item.id]) {
              itemCounts[item.id] = {
                ...item,
                favorite_count: 0
              };
            }
            itemCounts[item.id].favorite_count++;
          }
        });

        // Separate food and drinks
        const foods = Object.values(itemCounts)
          .filter(item => categories
            .find(c => c.id === item.category_id && c.name.toLowerCase().includes('food')))
          .sort((a, b) => b.favorite_count - a.favorite_count)
          .slice(0, 5);

        const drinks = Object.values(itemCounts)
          .filter(item => categories
            .find(c => c.id === item.category_id && c.name.toLowerCase().includes('drink')))
          .sort((a, b) => b.favorite_count - a.favorite_count)
          .slice(0, 5);

        setFoodItems(foods);
        setDrinkItems(drinks);

      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchTopFavorites();
  }, []);

  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    const { data } = supabase.storage
      .from('bubbletimeimage')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div>
        <Navbar showLogin={() => {}} />
        <div className="d-flex justify-content-center align-items-center" 
             style={{ height: 'calc(100vh - 76px)' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar showLogin={() => {}} />
      <Container className="py-5">
        {/* Food Section */}
        <div className="mb-5">
          <h2 className="text-center mb-4">Top 5 Favorite Foods</h2>
          <Row className="justify-content-center">
            {foodItems.map((item, index) => (
              <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm hover-card position-relative">
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary">#{index + 1}</span>
                  </div>
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <Card.Img
                        variant="top"
                        src={getImageUrl(item.image_url)}
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="h-100 bg-light d-flex align-items-center justify-content-center">
                        <span className="text-muted">No image</span>
                      </div>
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-primary">RM{item.price.toFixed(2)}</span>
                      <div className="d-flex align-items-center text-danger">
                        <FaHeart className="me-1" />
                        <span>{item.favorite_count}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Drinks Section */}
        <div>
          <h2 className="text-center mb-4">Top 5 Favorite Drinks</h2>
          <Row className="justify-content-center">
            {drinkItems.map((item, index) => (
              <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm hover-card position-relative">
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary">#{index + 1}</span>
                  </div>
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <Card.Img
                        variant="top"
                        src={getImageUrl(item.image_url)}
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="h-100 bg-light d-flex align-items-center justify-content-center">
                        <span className="text-muted">No image</span>
                      </div>
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-primary">RM{item.price.toFixed(2)}</span>
                      <div className="d-flex align-items-center text-danger">
                        <FaHeart className="me-1" />
                        <span>{item.favorite_count}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      <style>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Favorites;