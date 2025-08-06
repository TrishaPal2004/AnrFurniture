import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext.js'
import Navbar from './Navbar.js';
import {ShoppingCart} from "lucide-react";
import {toast} from 'react-toastify';
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
        toast.info("Item already in cart.");
      }
    } catch (error) {
      console.error("Error checking cart:", error);
      toast.error("Error checking cart: " + error.message);
    }
  };

 const handleAddToCart = async (pdt) => {
  if(!isLoggedIn) 
    return navigate("/login");
  
  console.log("Adding:", pdt._id, pdt.name, Number(pdt.price), pdt.images, pdt.material);
  console.log(user.id);
  
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  
  try {
    const response = await fetch(`https://anrfurniture-2.onrender.com/api/user/${user._id}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        productId: pdt._id,
        name: pdt.name,
        price: Number(pdt.price),
        quantity: Number(pdt.minorderquantity), // Start with minimum quantity
        minorderquantity: Number(pdt.minorderquantity), // Send as minorderquantity (not minorderquantity1)
        images: pdt.images,
        material: pdt.material 
      })
    });

    console.log(pdt.minorderquantity);
    
    if (response.ok) {
      toast.success("Product added to cart successfully!");
      setCartItems(prev => [...prev, pdt._id]);
    } else {
      toast.error("Failed to add product to cart.");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    toast.error("Error adding product to cart.");
  }
};

  const handleViewDetails = (pdt) => {
    navigate(`/zoom/${pdt._id}`);
  };
 
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paddingLeft: '2vw',
      paddingRight: '2vw'
    },
    headerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 32px',
      background: 'linear-gradient(135deg,black)',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      color: 'white'
    },
    headerTitle: {
      margin: 0,
      fontSize: '28px',
      fontWeight: '700',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      letterSpacing: '0.5px'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    cartIcon: {
      color: 'white',
      cursor: 'pointer',
      width: '32px',
      height: '32px',
      transition: 'all 0.3s ease',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
    },
    refreshButton: {
      background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      color: '#2c3e50',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      fontSize: '20px',
      color: '#667eea',
      fontWeight: '600'
    },
    errorContainer: {
      padding: '30px',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      color: 'white',
      borderRadius: '16px',
      textAlign: 'center',
      margin: '20px 0',
      boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '30px',
      padding: '20px 0'
    },
    pdtItem: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '4px',
      padding: '24px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.4s ease',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden'
    },
    pdtTitle: {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '12px',
      color: 'black',
      lineHeight: '1.3',
      // background: 'linear-gradient(135deg, black)',
   
    },
    pdtMaterial: {
      fontSize: '14px',
      color: '#7f8c8d',
      marginBottom: '8px',
      fontWeight: '500',
      padding: '4px 12px',
      background: 'rgba(127, 140, 141, 0.1)',
      borderRadius: '20px',
      display: 'inline-block',
      alignSelf: 'flex-start'
    },
    pdtId: {
      fontSize: '12px',
      color: '#bdc3c7',
      marginBottom: '16px',
      fontFamily: 'monospace',
      opacity: 0.7
    },
    pdtImage: {
      width: '100%',
      height: '220px',
      objectFit: 'cover',
      borderRadius: '4px',
      marginTop:'14px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
    },
    pdtPrice: {
      fontSize: '26px',
      fontWeight: '800',
      color: 'linear-gradient(135deg, black)',
      marginBottom: '20px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
   priceWrapper: {
    position: 'relative',
    display: 'inline-block',
    padding: '5px',
  },
  pdtPrice1: {
    fontSize: '25px',
    fontWeight: 800,
    color: 'rgb(105, 105, 105)',
   
  },
  line: {
    position: 'absolute',
    top: '35%',
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: '#444',
    transform: 'rotate(-12deg)',
    transformOrigin: 'center',
    pointerEvents: 'none',
  },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
      marginTop: 'auto'
    },
     pdtSize: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    backgroundColor: '#f2f2f2',
    padding: '6px 12px',
    borderRadius: '2px',
    display: 'inline-block',
    marginTop: '8px',
  },
    pdtButton: {
      flex: '1',
      padding: '14px 18px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    },
    addToCartButton: {
      background: 'rgb(196,147,46)',
      color: 'white'
    },
    addedToCartButton: {
      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
      color: '#ecf0f1',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    viewDetailsButton: {
      background: 'rgb(196,147,46)',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#7f8c8d',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
    },
    noImagePlaceholder: {
      width: '100%',
      height: '220px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6c757d',
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '16px',
      border: '2px dashed #dee2e6'
    }
  };

  // Hover effects for interactive elements
  const addHoverEffect = (element, hoverStyle, originalStyle) => {
    element.addEventListener('mouseenter', () => {
      Object.assign(element.style, hoverStyle);
    });
    element.addEventListener('mouseleave', () => {
      Object.assign(element.style, originalStyle);
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Navbar/>
        <div style={styles.loadingContainer}>
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <Navbar/>
        <div style={styles.errorContainer}>
          <h3 style={{margin: '0 0 15px 0', fontSize: '24px'}}>Error loading products</h3>
          <p style={{margin: '0 0 20px 0', fontSize: '16px'}}>{error}</p>
          <button 
            style={{
              ...styles.refreshButton,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white'
            }}
            onClick={() => fetchPdts()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar/>
      <div style={styles.headerContainer}>
        <h1 style={styles.headerTitle}>
          Products {category !== "all" ? `- ${category}` : ""}
        </h1>

        <div style={styles.headerActions}>
          <ShoppingCart
            onClick={() => navigate('/cart')}
            style={styles.cartIcon}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />

          <button
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={() => {
              fetchPdts();
              fetchCartItems();
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
              }
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {pdts.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={{fontSize: '24px', marginBottom: '10px'}}>No products found</h3>
          <p style={{fontSize: '16px'}}>Try refreshing or check back later.</p>
        </div>
      ) : (
        <div style={styles.productsGrid}>
          {pdts.map((pdt) => {
            const inCart = isInCart(pdt._id);
            
            return (
              <div 
                key={pdt._id || pdt.id} 
                style={styles.pdtItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
                }}
              >
                <h2 style={styles.pdtTitle}>{pdt.name || pdt.title}</h2>
                <span style={styles.pdtMaterial}>{pdt.material}</span>
                <p style={styles.pdtSize}>{pdt.size}</p>
                
                {(pdt.images && pdt.images[0]) || pdt.image ? (
                  <img 
                    src={pdt.images ? pdt.images[0] : pdt.image} 
                    alt={pdt.name || pdt.title} 
                    style={styles.pdtImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                ) : (
                  <div style={styles.noImagePlaceholder}>
                    No Image Available
                  </div>
                )}
                <div style={{display:"flex",gap:"2vw"}}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
  <span style={styles.pdtPrice1}>₹{pdt.price + pdt.price * 0.7}</span>
  <span style={styles.line}></span>
</div>

 
                <p style={styles.pdtPrice}>₹{pdt.price}</p>
                 </div>
                 <p style={{paddingBottom:"0.5vw",fontWeight:"700",overflow:"hidden"}}>{pdt.description}</p>
                <div style={styles.buttonContainer}>
                  <button 
                    style={{
                      ...styles.pdtButton, 
                      ...(inCart ? styles.addedToCartButton : styles.addToCartButton)
                    }}
                    onClick={() => handleAddToCart(pdt)}
                    disabled={inCart}
                    onMouseEnter={(e) => {
                      if (!inCart) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!inCart) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                  >
                    {inCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                  <button 
                    style={{...styles.pdtButton, ...styles.viewDetailsButton}}
                    onClick={() => handleViewDetails(pdt)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(252, 182, 159, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}
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