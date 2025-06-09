import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../supabaseClient'

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('menuItem')
        .select('id, name, price');

      if (error) {
        console.error('Error fetching menu items:', error);
        setError(`Error: ${error.message}`);
        setMenuItems(null);
      } else {
        setMenuItems(data);
      }
      setLoading(false);
    };

    fetchMenuItems();
  }, []);

  // Function to get placeholder food image based on item name
  const getFoodImage = (itemName: string) => {
    return `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop&auto=format&q=80`;
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center mb-4">Our Menu</h1>
        
        {loading && (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading menu...</p>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            Error loading menu: {error}
          </div>
        )}
        
        {menuItems && menuItems.length > 0 && (
          <div className="row g-4">
            {menuItems.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <img 
                    src={getFoodImage(item.name)}
                    className="card-img-top" 
                    alt={item.name}
                    style={{ 
                      height: '200px', 
                      objectFit: 'cover',
                      borderTopLeftRadius: '0.375rem',
                      borderTopRightRadius: '0.375rem'
                    }}
                    onError={(e) => {
                      // Fallback image if the main image fails to load
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop&auto=format&q=80';
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.name}</h5>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h4 text-primary mb-0">RM{item.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {menuItems && menuItems.length === 0 && (
          <div className="text-center">
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">No Menu Items</h4>
              <p>No menu items found. Please check back later.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;