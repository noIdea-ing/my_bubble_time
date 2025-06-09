import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../supabaseClient'; // Import the supabase client

// Define a type for your menu items for better type safety
interface MenuItem {
  id: number;
  name:string;
  price: number;
  // Add other fields if your table has them
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      // Replace 'menu_items' with your actual table name if different
      const { data, error } = await supabase
        .from('menu_items')
        .select('*');

      if (error) {
        console.error('Error fetching menu items:', error);
        setError(error.message);
        setMenuItems(null);
      } else {
        setMenuItems(data);
      }
      setLoading(false);
    };

    fetchMenuItems();
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Menu Page</h1>
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: 'red' }}>Error loading menu: {error}</p>}
      {menuItems && menuItems.length > 0 && (
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.name} - ${item.price}
            </li>
          ))}
        </ul>
      )}
      {menuItems && menuItems.length === 0 && (
        <p>No menu items found. (This could also mean your table 'menu_items' is empty or does not exist yet in Supabase)</p>
      )}
      {/* Content for menu page */}
    </div>
  );
};

export default Menu;