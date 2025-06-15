import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import { FaHeart, FaTrophy } from 'react-icons/fa';

interface TopFavoriteItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category_name: string;
  favorite_count: number;
  image_url?: string;
}

interface FavoriteWithMenuItem {
  id: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
    category_id: string;
    image_url: string | null;
    categories: {
      name: string;
    } | null;
  } | null;
}

const TopFavorites = () => {
  const [loading, setLoading] = useState(true);
  const [topItems, setTopItems] = useState<TopFavoriteItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopFavorites = async () => {
      try {
        // Get all favorites with menu item details and category information
        const { data: favorites, error: favError } = await supabase
          .from('favourites')
          .select(`
            id,
            menuItem (
              id,
              name,
              price,
              category_id,
              image_url,
              categories (
                name
              )
            )
          `) as { data: FavoriteWithMenuItem[] | null, error: any };

        if (favError) throw favError;

        if (!favorites || favorites.length === 0) {
          setError('No favorites found');
          setLoading(false);
          return;
        }

        // Count favorites for each menu item
        const itemCounts: { [key: string]: TopFavoriteItem } = {};
        
        favorites.forEach(fav => {
          if (fav.menuItem) {
            const item = fav.menuItem;
            const itemId = item.id;
            
            if (!itemCounts[itemId]) {
              itemCounts[itemId] = {
                id: item.id,
                name: item.name,
                price: item.price,
                category_id: item.category_id,
                category_name: item.categories?.name || 'Unknown Category',
                favorite_count: 0,
                image_url: item.image_url || undefined
              };
            }
            itemCounts[itemId].favorite_count++;
          }
        });

        // Sort by favorite count and get top 10
        const sortedItems = Object.values(itemCounts)
          .sort((a, b) => b.favorite_count - a.favorite_count)
          .slice(0, 10);

        setTopItems(sortedItems);

      } catch (error) {
        console.error('Error fetching top favorites:', error);
        setError('Failed to load favorite items');
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


  const getRankBadge = (position: number) => {
    if (position <= 3) return 'bg-dark text-white';
    return 'bg-secondary text-white';
  };

  if (loading) {
    return (
      <div>
        <Navbar/>
        <div className="d-flex justify-content-center align-items-center" 
             style={{ height: 'calc(100vh - 76px)' }}>
          <Spinner animation="border" style={{ color: '#333' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar/>
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-4" style={{ color: '#333' }}>
            <FaHeart className="me-3" style={{ color: '#333' }} />
            Top 10 Customer Favorites
          </h1>
          <p className="lead" style={{ color: '#666' }}>Most loved items by our customers</p>
        </div>

        {error ? (
          <Alert variant="secondary" className="text-center">
            {error}
          </Alert>
        ) : topItems.length === 0 ? (
          <Alert variant="light" className="text-center border">
            No favorite items found yet.
          </Alert>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0">
                <thead style={{ backgroundColor: '#333', color: 'white' }}>
                  <tr>
                    <th className="text-center" style={{ width: '80px' }}>Rank</th>
                    <th style={{ width: '100px' }}>Image</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th className="text-end">Price (RM)</th>
                    <th className="text-center">
                      <FaHeart className="me-1" />
                      Favorites
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, index) => {
                    const position = index + 1;
                    return (
                      <tr key={item.id} className="align-middle">
                        <td className="text-center">
                          <span className={`badge ${getRankBadge(position)} fs-6 p-2`}>
                            {position}
                          </span>
                        </td>
                        <td>
                          <div style={{ width: '80px', height: '60px', overflow: 'hidden', borderRadius: '8px' }}>
                            {item.image_url ? (
                              <img
                                src={getImageUrl(item.image_url)}
                                alt={item.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                                className="border"
                              />
                            ) : (
                              <div className="w-100 h-100 border d-flex align-items-center justify-content-center" 
                                   style={{ backgroundColor: '#f8f9fa' }}>
                                <span style={{ color: '#666', fontSize: '12px' }}>No image</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold" style={{ color: '#333' }}>{item.name}</div>
                        </td>
                        <td>
                          <span className="badge bg-light border" style={{ color: '#333' }}>
                            {item.category_name}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="fw-bold" style={{ color: '#333' }}>
                            {item.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <FaHeart className="me-2" style={{ color: '#333' }} />
                            <span className="fw-bold fs-5" style={{ color: '#333' }}>
                              {item.favorite_count}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {topItems.length > 0 && (
          <div className="text-center mt-4">
            <small style={{ color: '#666' }}>
              Based on customer favorites • Updated in real-time
            </small>
          </div>
        )}
      </Container>

      <style>{`
        .table tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .badge {
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default TopFavorites;