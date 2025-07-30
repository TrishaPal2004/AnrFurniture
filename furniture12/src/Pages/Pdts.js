import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext.js'
import Navbar from './Navbar.js';
import {ShoppingCart} from "lucide-react";
const Pdts = () => {
    const { isLoggedIn, user, logout } = useAuth();
    console.log(user);
  const { category } = useParams();
  console.log("Category from URL:", category);
  const [pdts, setPdts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]); // Track items in cart
  const navigate = useNavigate();

  const fetchPdts = async (categoryParam = category) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = categoryParam === "New Arrival" 
        ? "https://anrfurniture-2.onrender.com/api/pdt/all"
        : `https://anrfurniture-2.onrender.com/api/pdt/${categoryParam}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Products:", data);
      setPdts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items to check which products are already in cart
  const fetchCartItems = async () => {
    try {
      const response = await fetch("https://anrfurniture-2.onrender.com/api/cart/items", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Extract product IDs from cart items
        const cartProductIds = data.map(item => item.productId || item._id);
        setCartItems(cartProductIds);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // Check if a product is in cart
  const isInCart = (productId) => {
    return cartItems.includes(productId);
  };

  // Automatically fetch products and cart items when component mounts or category changes
  useEffect(() => {
    fetchPdts();
    fetchCartItems();
  }, [category]);
const token = localStorage.getItem("token");
  const handleCheckCart = async () => {
    try {
      const response = await fetch("https://anrfurniture-2.onrender.com/api/cart/check");
      if (!response.ok) {
        throw new Error(`Failed to check cart: ${response.status}`);
      }
      const data = await response.json();
      console.log("Cart Check Response:", data);
      if (data.exists) {
        alert("Item already in cart.");
      }
    } catch (error) {
      console.error("Error checking cart:", error);
      alert("Error checking cart: " + error.message);
    }
  };

  const handleAddToCart = async (pdt) => {
   
console.log(typeof pdt._id);     
    console.log( "Adding:",pdt._id,pdt.name, Number(pdt.price),pdt.images,pdt.material)
    console.log(user.id);
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    try {
      const response = await fetch("https://anrfurniture-2.onrender.com/api/user/${user._id}/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}` // Add auth token
        },
        body: JSON.stringify({ productId:pdt._id,name:pdt.name,price: Number(pdt.price),images:pdt.images,material:pdt.material })
      });
     
      if (response.ok) {
        alert("Product added to cart successfully!");
        // Update cart items state to reflect the new addition
        setCartItems(prev => [...prev, pdt._id]);
      } else {
        alert("Failed to add product to cart erroorrr.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding product to cart.");
    }
  };

  const handleViewDetails = (pdt) => {
    navigate(`/zoom/${pdt._id}`);
  };
 
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '18px',
      color: '#666'
    },
    errorContainer: {
      padding: '20px',
      backgroundColor: '#fee',
      color: '#c33',
      borderRadius: '8px',
      textAlign: 'center',
      margin: '20px 0'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '25px',
      padding: '20px 0'
    },
    pdtItem: {
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    pdtTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#333',
      lineHeight: '1.3'
    },
    pdtDescription: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
      lineHeight: '1.5',
      flex: '1'
    },
    pdtImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '15px'
    },
    pdtPrice: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#e74c3c',
      marginBottom: '15px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: 'auto'
    },
    pdtButton: {
      flex: '1',
      padding: '12px 16px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    addToCartButton: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    addedToCartButton: {
      backgroundColor: '#bdc3c7', // Dimmed background
      color: '#7f8c8d', // Dimmed text color
      cursor: 'not-allowed'
    },
    viewDetailsButton: {
      backgroundColor: '#95a5a6',
      color: 'white'
    },
    refreshButton: {
      padding: '12px 24px',
      backgroundColor: '#2ecc71',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'all 0.3s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#666'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h3>Error loading products</h3>
          <p>{error}</p>
          <button 
            style={styles.refreshButton}
            onClick={() => fetchPdts()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingLeft:"2vw",paddingRight:"2vw"}}>
      <Navbar/>
      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#f8f8f8',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px',
  }}
>
  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
    Products {category !== "all" ? `- ${category}` : ""}
  </h1>

  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <ShoppingCart
      onClick={() => navigate('/cart')}
      style={{
        color: 'black',
        cursor: 'pointer',
        width: '28px',
        height: '28px',
      }}
    />

    <button
      style={{
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: '0.3s',
      }}
      onClick={() => {
        fetchPdts();
        fetchCartItems();
      }}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Refresh'}
    </button>
  </div>
</div>

      {pdts.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No products found</h3>
          <p>Try refreshing or check back later.</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {pdts.map((pdt) => {
            const inCart = isInCart(pdt._id);
            
            return (
              <div key={pdt._id || pdt.id} style={styles.pdtItem}>
                <h2 style={styles.pdtTitle}>{pdt.name || pdt.title}</h2>
                <p style={styles.pdtDescription}>{pdt.material}</p>
                <p style={styles.pdtDescription}>{pdt._id}</p>
                {(pdt.images && pdt.images[0]) || pdt.image ? (
                  <img 
                    src={pdt.images ? pdt.images[0] : pdt.image} 
                    alt={pdt.name || pdt.title} 
                    style={styles.pdtImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    ...styles.pdtImage,
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d'
                  }}>
                    No Image Available
                  </div>
                )}
                
                <p style={styles.pdtPrice}>₹{pdt.price}</p>
                
                <div style={styles.buttonContainer}>
                  <button 
                    style={{
                      ...styles.pdtButton, 
                      ...(inCart ? styles.addedToCartButton : styles.addToCartButton)
                    }}
                    onClick={() => handleAddToCart(pdt)}
                    disabled={inCart}
                    onMouseOver={(e) => {
                      if (!inCart) {
                        e.target.style.backgroundColor = '#2980b9';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!inCart) {
                        e.target.style.backgroundColor = '#3498db';
                      }
                    }}
                  >
                    {inCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                  <button 
                    style={{...styles.pdtButton, ...styles.viewDetailsButton}}
                    onClick={() => handleViewDetails(pdt)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pdts;