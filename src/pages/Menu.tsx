import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar'; // Make sure this is the same as Home
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Spinner, Button, Modal, Form, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  image_url?: string;
}

interface CategoryWithItems {
  id: string;
  name: string;
  items: MenuItem[];
}

const Menu: React.FC = () => {
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  // Login modal state
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  const navigate = useNavigate();

  // Check user authentication and initialize favorites
  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await initializeUserFavorites(user.email);
      }
    };

    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await initializeUserFavorites(session.user.email);
      } else {
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUserFavorites = async (email: string | undefined) => {
    if (!email) return;
    
    try {
      console.log('Initializing favourites for email:', email);
      
      // First get the user_id from usersBT table
      const { data: userData, error: userError } = await supabase
        .from('usersBT')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('Error getting user ID:', userError);
        return;
      }

      console.log('User ID found:', userData.id);

      // Check if favourites table exists and get user's favorites
      const { data: existingRecords, error: checkError } = await supabase
        .from('favourites')
        .select('id, menuitem_id')
        .eq('user_id', userData.id)
        .not('menuitem_id', 'is', null);
      
      if (checkError) {
        console.error('Error checking existing favorites:', checkError);
        
        // Check if it's a table not found error
        if (checkError.code === 'PGRST116' || checkError.message.includes('relation "public.favourites" does not exist')) {
          console.log('Favourites table does not exist. User favourites will not be loaded.');
          return;
        }
        
        setToastMessage('Could not load your favourites');
        setToastVariant('danger');
        setShowToast(true);
        return;
      }

      // Load existing favorites
      if (existingRecords && existingRecords.length > 0) {
        const actualFavorites = existingRecords.map(record => record.menuitem_id);
        console.log('Loaded existing favourites:', actualFavorites);
        setFavorites(actualFavorites);
      } else {
        console.log('No existing favourites found for user:', userData.id);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error initializing favourites:', error);
      setToastMessage('Error setting up favourites');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const toggleFavorite = async (itemId: string, itemName: string) => {
    if (!user) {
      setToastMessage('Please login to add favourites');
      setToastVariant('danger');
      setShowToast(true);
      return;
    }

    try {
      // First get the user_id from usersBT table
      const { data: userData, error: userError } = await supabase
        .from('usersBT')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (userError || !userData) {
        console.error('Error getting user ID:', userError);
        setToastMessage('Error accessing user data');
        setToastVariant('danger');
        setShowToast(true);
        return;
      }

      // Verify the menu item exists in the database
      const { data: menuItemData, error: menuItemError } = await supabase
        .from('menuItem')
        .select('id')
        .eq('id', itemId)
        .single();

      if (menuItemError || !menuItemData) {
        console.error('Menu item not found:', menuItemError);
        setToastMessage('Menu item not found');
        setToastVariant('danger');
        setShowToast(true);
        return;
      }

      const isFavorite = favorites.includes(itemId);
      
      if (isFavorite) {
        // Remove from favourites
        console.log('Removing from favourites:', { user_id: userData.id, menuitem_id: itemId });
        
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('user_id', userData.id)
          .eq('menuitem_id', itemId);
        
        if (error) {
          console.error('Error removing favourite:', error);
          throw error;
        }
        
        setFavorites(prev => prev.filter(id => id !== itemId));
        setToastMessage(`${itemName} removed from favourites`);
        setToastVariant('success');
      } else {
        // Add to favourites
        console.log('Adding new favourite:', { user_id: userData.id, menuitem_id: itemId });
        
        // Check if the record already exists (to prevent duplicates)
        const { data: existingFavorite, error: checkError } = await supabase
          .from('favourites')
          .select('id')
          .eq('user_id', userData.id)
          .eq('menuitem_id', itemId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // Error other than "no rows returned"
          console.error('Error checking existing favourite:', checkError);
        }

        if (existingFavorite) {
          // Already exists, just update state
          setFavorites(prev => [...prev, itemId]);
          setToastMessage(`${itemName} is already in your favourites`);
          setToastVariant('success');
        } else {
          // Insert new favorite
          const { error } = await supabase
            .from('favourites')
            .insert([{
              user_id: userData.id,
              menuitem_id: itemId
            }]);
          
          if (error) {
            console.error('Error adding favourite:', error);
            throw error;
          }
          
          setFavorites(prev => [...prev, itemId]);
          setToastMessage(`${itemName} added to favourites`);
          setToastVariant('success');
        }
      }
      
      setShowToast(true);
    } catch (error: any) {
      console.error('Error toggling favourite:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error updating favourites';
      
      if (error.code === 'PGRST116' || error.message?.includes('relation "public.favourites" does not exist')) {
        errorMessage = 'Favourites feature is not available. Please contact support.';
      } else if (error.code === '23505') {
        errorMessage = 'This item is already in your favourites';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid menu item or user. Please refresh and try again.';
      } else if (error.message?.includes('JWT expired') || error.message?.includes('Invalid JWT')) {
        errorMessage = 'Please login again to manage favourites';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Invalid request. Please check your data and try again.';
      }
      
      setToastMessage(errorMessage);
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const handleModalClose = () => {
    setShowLogin(false);
    setErrorAuth(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setIsRegistering(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setErrorAuth(null);

    try {
      if (!isRegistering) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorAuth(error.message);
          return;
        }

        if (data.user) {
          // Get user role
          const { data: userData, error: roleError } = await supabase
            .from('usersBT')
            .select('role')
            .eq('email', data.user.email)
            .single();

          if (roleError) {
            setErrorAuth('Error fetching user data');
            return;
          }

          setShowLogin(false);

          if (userData.role === 'admin') {
            navigate('/AdminHome');
          } else {
            window.location.reload();
          }
        }
      } else {
        // Registration
        const { data: existingUser } = await supabase
          .from('usersBT')
          .select('email')
          .eq('email', email)
          .single();

        if (existingUser) {
          setErrorAuth('Email already registered');
          setLoadingAuth(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorAuth(error.message);
          setLoadingAuth(false);
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
            setErrorAuth('Error creating user profile');
            return;
          }

          setErrorAuth('Registration successful! You can now login.');
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setUsername('');
        }
      }
    } catch (error) {
      setErrorAuth('An unexpected error occurred');
    } finally {
      setLoadingAuth(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    const { data } = supabase.storage
      .from('bubbletimeimage')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (categoriesError) throw categoriesError;

        // Fetch menu items
        const { data: menuItems, error: menuItemsError } = await supabase
          .from('menuItem')
          .select('id, name, price, category_id, image_url');

        if (menuItemsError) throw menuItemsError;

        // Group menu items by category and sort items by name
        const categoriesWithItemsData: CategoryWithItems[] = categories.map(category => ({
          id: category.id,
          name: category.name,
          items: menuItems
            .filter(item => item.category_id === category.id)
            .sort((a, b) => a.name.localeCompare(b.name))
        }));

        setCategoriesWithItems(categoriesWithItemsData);
      } catch (err: any) {
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <div className="bg-white min-vh-100">
      {/* Use the same Navbar as Home, pass showLogin */}
      <Navbar showLogin={() => setShowLogin(true)} />
      <Container className="py-5">
        <h2 className="text-center mb-5 fw-bold text-dark">Our Menu</h2>
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading menu...</p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}
        {!loading && categoriesWithItems.length === 0 && (
          <div className="alert alert-info text-center">
            No menu items found. Please check back later.
          </div>
        )}
        {categoriesWithItems.map(category => (
          <div key={category.id} className="mb-5">
            <h3 className="text-primary border-bottom pb-2 mb-4 fw-semibold">{category.name}</h3>
            {category.items.length > 0 ? (
              <Row className="g-4">
                {category.items.map(item => (
                  <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                    <div className="card h-100 shadow-sm hover-card rounded-4 border-0 position-relative">
                      {/* Favorite Button - Only show for logged in users */}
                      {user && (
                        <button
                          className="favorite-btn position-absolute"
                          onClick={() => toggleFavorite(item.id, item.name)}
                          style={{
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '8px',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {favorites.includes(item.id) ? (
                            <FaHeart color="#dc3545" size={16} />
                          ) : (
                            <FaRegHeart color="#6c757d" size={16} />
                          )}
                        </button>
                      )}
                      <div style={{ height: '200px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            className="card-img-top"
                            style={{
                              height: '100%',
                              width: '100%',
                              objectFit: 'cover',
                              borderTopLeftRadius: '1rem',
                              borderTopRightRadius: '1rem'
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{ height: '100%' }}
                          >
                            <div className="text-center text-muted">
                              <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                              <div className="small">No Image</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title mb-2 fw-semibold">{item.name}</h5>
                        <div className="mt-auto">
                          <span className="h5 text-primary mb-0">RM{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="alert alert-light text-center">
                <i className="bi bi-basket me-2"></i>
                No items in this category yet.
              </div>
            )}
          </div>
        ))}
      </Container>

      {/* Login/Register Modal */}
      <Modal show={showLogin} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isRegistering ? 'Create Account' : 'Login'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorAuth && (
            <Alert 
              variant={errorAuth.includes('successful') ? 'success' : 'danger'}
              className="mb-3"
            >
              {errorAuth}
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
                disabled={loadingAuth}
              >
                {loadingAuth ? (
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
                  setErrorAuth(null);
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

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <style>{`
        /* Menu page specific styles */
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
        }
        .card-title {
          font-size: 1.1rem;
        }

        /* Navbar styles - same as Home page */
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

        /* Brand gradient text */
        .text-gradient {
          background: linear-gradient(45deg, #7c4dff, #6839cc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Favorite button styles */
        .favorite-btn {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        .favorite-btn:hover {
          background: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Menu;