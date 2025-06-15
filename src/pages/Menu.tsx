import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Memoized function to show toast messages
  const showToastMessage = useCallback((message: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  }, []);

  // Check session and get current user from sessionStorage
  useEffect(() => {
    const getUserSession = () => {
      try {
        // Get user from sessionStorage instead of localStorage
        const storedUserId = sessionStorage.getItem('userId');
        const storedUserRole = sessionStorage.getItem('userRole');
        
        if (storedUserId) {
          setCurrentUserId(storedUserId);
        } else {
          setCurrentUserId(null);
        }
        
      } catch (error) {
        console.error('Error checking user session:', error);
        setCurrentUserId(null);
      } finally {
        setSessionLoading(false);
      }
    };

    getUserSession();

    // Listen for storage changes (when user logs in/out in another tab)
    // Note: sessionStorage events don't work across tabs, but keeping for potential localStorage usage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId') {
        if (e.newValue) {
          setCurrentUserId(e.newValue);
          initializeFavorites(e.newValue);
        } else {
          setCurrentUserId(null);
          setFavorites([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserId]);

  // Initialize favorites when user is available
  useEffect(() => {
    if (currentUserId && !sessionLoading) {
      initializeFavorites(currentUserId);
    }
  }, [currentUserId, sessionLoading]);

  const initializeFavorites = async (userId: string) => {
    try {
      // Get user's favorites
      const { data: favoriteRecords, error: favoriteError } = await supabase
        .from('favourites')
        .select('menuItem_id')
        .eq('user_id', userId);
      
      if (favoriteError) {
        console.error('Error loading favorites:', favoriteError);
        
        // Check if table doesn't exist
        if (favoriteError.code === 'PGRST116' || favoriteError.message.includes('relation "public.favourites" does not exist')) {
          console.log('Favourites table does not exist. Favorites will work in memory only.');
          return;
        }
        
        showToastMessage('Could not load your favourites', 'danger');
        return;
      }

      // Load existing favorites
      if (favoriteRecords && favoriteRecords.length > 0) {
        const favoriteIds = favoriteRecords.map(record => record.menuItem_id);
        setFavorites(favoriteIds);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error initializing favourites:', error);
      showToastMessage('Error setting up favourites', 'danger');
    }
  };

  const toggleFavorite = async (itemId: string, itemName: string) => {
    // Check if user is logged in
    if (!currentUserId) {
      showToastMessage('Please log in to add favorites', 'danger');
      return;
    }

    // Prevent multiple clicks on the same item
    if (favoriteLoading === itemId) {
      return;
    }

    setFavoriteLoading(itemId);

    try {
      const isFavorite = favorites.includes(itemId);
      
      if (isFavorite) {
        
        const { error } = await supabase
          .from('favourites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('menuItem_id', itemId);
        
        if (error) {
          console.error('Error removing favourite:', error);
          throw error;
        }
        
        // Update state immediately for better UX
        setFavorites(prev => prev.filter(id => id !== itemId));
        showToastMessage(`${itemName} removed from favourites`, 'success');
      } else {
        // Add to favourites - Check if it already exists first
        const { error } = await supabase
          .from('favourites')
          .insert([{
            user_id: currentUserId,
            menuItem_id: itemId
          }]);
        
        if (error) {
          if (error.code === '23505') {
            // Duplicate key error - item already exists, just update UI
            setFavorites(prev => [...prev, itemId]);
            showToastMessage(`${itemName} is already in favourites`, 'success');
          } else {
            throw error;
          }
        } else {
          // Successfully added
          setFavorites(prev => [...prev, itemId]);
          showToastMessage(`${itemName} added to favourites`, 'success');
        }
      }
    } catch (error: any) {
      console.error('Error toggling favourite:', error);
      
      // Provide specific error messages
      let errorMessage = 'Error updating favourites';
      
      if (error.code === 'PGRST116' || error.message?.includes('relation "public.favourites" does not exist')) {
        errorMessage = 'Favourites feature is not available. Please contact support.';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid menu item. Please refresh and try again.';
      } else if (error.code === '23505') {
        // Duplicate key error - item already in favorites
        errorMessage = 'Item is already in your favourites';
      }
      
      showToastMessage(errorMessage, 'danger');
    } finally {
      setFavoriteLoading(null);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    const { data } = supabase.storage
      .from('bubbletimeimage')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };

  // Fetch menu data on component mount
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
        setError(`Error loading menu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return (
    <div className="bg-white min-vh-100">
      <Navbar />

      <Container className="py-4">
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading delicious menu items...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center mb-5">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {!loading && categoriesWithItems.length === 0 && !error && (
          <div className="alert alert-info text-center">
            <i className="bi bi-info-circle-fill me-2"></i>
            No menu items found. Please check back later.
          </div>
        )}

        {/* User Status Info */}
        {!sessionLoading && !currentUserId && (
          <div className="alert alert-info text-center mb-4">
            <i className="bi bi-info-circle-fill me-2"></i>
            Log in to save your favorite items!
          </div>
        )}

        {/* Display Categories and Menu Items */}
        {categoriesWithItems.map(category => (
          <div key={category.id} className="mb-5">
            <div className="d-flex align-items-center mb-4">
              <h2 className="text-primary fw-bold mb-0">{category.name}</h2>
              <div className="flex-grow-1 ms-3" style={{ height: '2px', background: 'linear-gradient(to right, #007bff, transparent)' }}></div>
              <span className="badge bg-primary-subtle text-primary ms-3">
                {category.items.length} item{category.items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {category.items.length > 0 ? (
              <Row className="g-4">
                {category.items.map(item => (
                  <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                    <div className="card h-100 shadow-sm hover-card rounded-4 border-0 position-relative overflow-hidden">
                      {/* Favorite Button - Only show if user is logged in */}
                      {currentUserId && (
                        <button
                          className="favorite-btn position-absolute"
                          onClick={() => toggleFavorite(item.id, item.name)}
                          disabled={favoriteLoading === item.id}
                          style={{
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '10px',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            cursor: favoriteLoading === item.id ? 'not-allowed' : 'pointer',
                            opacity: favoriteLoading === item.id ? 0.7 : 1,
                            width: '44px',
                            height: '44px'
                          }}
                        >
                          {favoriteLoading === item.id ? (
                            <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '18px', height: '18px' }}>
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : favorites.includes(item.id) ? (
                            <FaHeart color="#dc3545" size={20} />
                          ) : (
                            <FaRegHeart color="#6c757d" size={20} />
                          )}
                        </button>
                      )}

                      {/* Item Image */}
                      <div className="position-relative" style={{ height: '220px', overflow: 'hidden' }}>
                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.name}
                            className="card-img-top"
                            style={{
                              height: '100%',
                              width: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-light h-100"
                          >
                            <div className="text-center text-muted">
                              <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                              <div className="mt-2">No Image Available</div>
                            </div>
                          </div>
                        )}
                        {/* Gradient overlay for better text readability */}
                        <div className="position-absolute bottom-0 start-0 end-0" style={{
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
                          height: '50px'
                        }}></div>
                      </div>

                      {/* Item Details */}
                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="card-title mb-2 fw-semibold text-dark">{item.name}</h5>
                        <div className="mt-auto pt-2">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="h4 text-primary mb-0 fw-bold">RM{item.price.toFixed(2)}</span>
                            {currentUserId && favorites.includes(item.id) && (
                              <span className="badge bg-danger-subtle text-danger">
                                <i className="bi bi-heart-fill me-1"></i>
                                Favorite
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="alert alert-light text-center py-4">
                <i className="bi bi-basket me-2 text-muted" style={{ fontSize: '1.5rem' }}></i>
                <div className="mt-2 text-muted">No items available in this category yet.</div>
              </div>
            )}
          </div>
        ))}
      </Container>

      {/* Enhanced Toast Notifications */}
      <ToastContainer position="top-end" className="p-3 position-fixed">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={4000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white d-flex align-items-center">
            {toastVariant === 'success' ? (
              <i className="bi bi-check-circle-fill me-2"></i>
            ) : (
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
            )}
            <span className="fw-medium">{toastMessage}</span>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <style>{`
        /* Enhanced Card Styles */
        .hover-card {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(0,0,0,0.08);
        }
        
        .hover-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
        
        .hover-card:hover .card-img-top {
          transform: scale(1.05);
        }

        /* Enhanced Favorite Button */
        .favorite-btn {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .favorite-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 1) !important;
          transform: scale(1.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .favorite-btn:active:not(:disabled) {
          transform: scale(1.1);
        }

        /* Category Header Styling */
        .text-primary {
          color: #007bff !important;
        }

        /* Badge Styling */
        .bg-primary-subtle {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }

        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.1) !important;
        }

        /* Toast Enhancements */
        .toast-body {
          font-size: 0.95rem;
        }

        /* Loading Spinner */
        .spinner-border-sm {
          border-width: 2px;
        }

        /* Header Gradient */
        .bg-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .favorite-btn {
            width: 40px;
            height: 40px;
            top: 10px;
            right: 10px;
            padding: 8px;
          }
          
          .hover-card:hover {
            transform: translateY(-6px) scale(1.01);
          }
          
          .card-body {
            padding: 1rem !important;
          }
        }

        @media (max-width: 576px) {
          .hover-card:hover {
            transform: translateY(-4px);
          }
        }

        /* Card Title Styling */
        .card-title {
          font-size: 1.15rem;
          line-height: 1.3;
          color: #2c3e50;
        }

        /* Price Styling */
        .h4.text-primary {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default Menu;