import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../supabaseClient';

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

  // Map menu item names (lowercase) to assets folder images (relative path)
  const imageMap: Record<string, string> = {
    'nasi lemak': 'src/assets/nasilemak.jpg',
    'green tea': 'src/assets/greentea.jpg',
    'teh ais': 'src/assets/tea.jpg',
    'nasi buttermilk': 'src/assets/nasibuttermilk.jpg',
    'maggi goreng': 'src/assets/maggiegoreng.jpg',
  };

  // Fallback image if not found
  const fallbackImage = 'assets/bubble-tea.jpg';

  const getImageForMenuItem = (name: string) => {
    const key = name.trim().toLowerCase();
    return imageMap[key] || fallbackImage;
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
                    src={getImageForMenuItem(item.name)}
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
                      e.currentTarget.src = fallbackImage;
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