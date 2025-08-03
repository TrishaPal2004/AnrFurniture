import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Package, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Pdtzoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const isMobile = window.innerWidth < 768;
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  // Fetch cart items to check which products are already in cart
  const fetchCartItems = async () => {
    try {
      const response = await fetch("https://anrfurniture-2.onrender.com/api/cart/items", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const cartProductIds = data.map(item => item.productId || item._id);
        setCartItems(cartProductIds);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

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

  // Check if a product is in cart
  const isInCart = (productId) => {
    return cartItems.includes(productId);
  };

  const handleAddToCart = async (pdt) => {
    console.log(typeof pdt._id);     
    console.log("Adding:", pdt._id, pdt.name, Number(pdt.price), pdt.images, pdt.material)
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
          images: pdt.images,
          material: pdt.material 
        })
      });
     
      if (response.ok) {
        alert("Product added to cart successfully!");
        setCartItems(prev => [...prev, pdt._id]);
      } else {
        alert("Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding product to cart.");
    }
  };

  const handleBuyNow = async (pdt) => {
    if (!user) {
      alert("Please login to purchase products.");
      navigate("/login");
      return;
    }

    setBuyNowLoading(true);
    
    try {
      // Create a temporary cart item for buy now
      const buyNowItem = {
        _id: pdt._id,
        productId: pdt._id,
        name: pdt.name,
        price: Number(pdt.price),
        images: pdt.images,
        material: pdt.material,
        quantity: 1,
        originalPrice: pdt.originalPrice || pdt.price * 1.2, // Optional: for discount calculation
        isBuyNow: true // Flag to identify this as buy now item
      };

      // Store the buy-now product data for the cart component
      sessionStorage.setItem('buyNowItems', JSON.stringify([buyNowItem]));
      sessionStorage.setItem('isBuyNow', 'true');
      
      // Navigate to cart page which will handle the checkout flow
      navigate("/cart?buyNow=true");
      
    } catch (error) {
      console.error("Error processing buy now:", error);
      alert("Error processing buy now request.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/hi/${id}`);
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data);
        console.log("minimum order quantity", data.minorderquantity);
        setCurrentImage(data?.images?.[0]);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    fetchCartItems();
  }, [id]);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "2rem 1rem"
    },
    contentWrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      padding: "2rem",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      padding: "1rem 0",
      borderBottom: "2px solid rgba(102, 126, 234, 0.1)"
    },
    title: {
      fontSize: isMobile ? "1.5rem" : "2.5rem",
      fontWeight: "800",
      margin: 0,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      lineHeight: "1.2"
    },
    cartIcon: {
      cursor: "pointer",
      background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      padding: "0.75rem",
      borderRadius: "16px",
      color: "#2c3e50",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
      transition: "all 0.3s ease"
    },
    imageSection: {
      display: isMobile ? "block" : "flex",
      gap: "2rem",
      alignItems: "flex-start",
      marginBottom: "2rem"
    },
    thumbnailContainer: {
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: "0.75rem",
      marginBottom: isMobile ? "1.5rem" : 0,
      overflowX: isMobile ? "auto" : "visible",
      width: isMobile ? "100%" : "120px"
    },
    thumbnail: {
      cursor: "pointer",
      width: isMobile ? "80px" : "100%",
      height: "80px",
      objectFit: "cover",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
    },
    activeThumbnail: {
      border: "3px solid #667eea",
      transform: "scale(1.05)",
      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)"
    },
    mainImageContainer: {
      flex: 1,
      background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      borderRadius: "20px",
      padding: "2rem",
      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)"
    },
    mainImage: {
      width: "100%",
      maxHeight: "500px",
      borderRadius: "16px",
      objectFit: "contain",
      transition: "all 0.3s ease"
    },
    detailsSection: {
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      borderRadius: "20px",
      padding: "2rem",
      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)"
    },
    detailItem: {
      display: "flex",
      marginBottom: "1rem",
      fontSize: "1.1rem",
      color: "#2c3e50"
    },
    detailLabel: {
      fontWeight: "700",
      minWidth: "120px",
      color: "#34495e"
    },
    detailValue: {
      fontWeight: "500",
      color: "#2c3e50"
    },
    priceValue: {
      fontSize: "2rem",
      fontWeight: "800",
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text"
    },
    buttonContainer: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
      flexWrap: "wrap"
    },
    actionButtonsContainer: {
      display: "flex",
      gap: "1rem",
      width: "100%",
      flexWrap: isMobile ? "wrap" : "nowrap"
    },
    button: {
      padding: "1rem 2rem",
      border: "none",
      borderRadius: "16px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      minHeight: "50px"
    },
    backButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white"
    },
    categoryButton: {
      background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      color: "#2c3e50"
    },
    addToCartButton: {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "white",
      flex: 1
    },
    buyNowButton: {
      background: "linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)",
      color: "white",
      flex: 1,
      position: "relative"
    },
    buyNowButtonLoading: {
      background: "linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)",
      cursor: "not-allowed",
      opacity: 0.7
    },
    addedToCartButton: {
      background: "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
      color: "#ecf0f1",
      cursor: "not-allowed",
      opacity: 0.7,
      flex: 1
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      flexDirection: "column",
      color: "#667eea"
    },
    spinner: {
      width: "60px",
      height: "60px",
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #667eea",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginBottom: "1rem"
    },
    smallSpinner: {
      width: "20px",
      height: "20px",
      border: "2px solid transparent",
      borderTop: "2px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
    errorContainer: {
      background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
      color: "white",
      padding: "2rem",
      borderRadius: "20px",
      textAlign: "center",
      boxShadow: "0 15px 35px rgba(255, 107, 107, 0.3)"
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ fontSize: "1.2rem", fontWeight: "600" }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Error Loading Product</h2>
          <p>{error}</p>
          <button 
            style={{...styles.button, ...styles.backButton, marginTop: "1rem"}}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button 
            style={{...styles.button, ...styles.backButton, marginTop: "1rem"}}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product._id);

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{product.name}</h1>
          <ShoppingCart
            onClick={() => navigate("/cart")}
            size={58}
            style={styles.cartIcon}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1) rotate(0deg)";
            }}
          />
        </div>

        {/* Image Section */}
        <div style={styles.imageSection}>
          {/* Thumbnails */}
          <div style={styles.thumbnailContainer}>
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx}`}
                onClick={() => setCurrentImage(img)}
                style={{
                  ...styles.thumbnail,
                  ...(currentImage === img ? styles.activeThumbnail : {})
                }}
                onMouseEnter={(e) => {
                  if (currentImage !== img) {
                    e.target.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentImage !== img) {
                    e.target.style.transform = "scale(1)";
                  }
                }}
              />
            ))}
          </div>

          {/* Main Image */}
          <div style={styles.mainImageContainer}>
            <img
              src={currentImage}
              alt="Selected product"
              style={styles.mainImage}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div style={styles.detailsSection}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Category:</span>
            <span style={styles.detailValue}>{product.category}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Description:</span>
            <span style={styles.detailValue}>{product.description}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Material:</span>
            <span style={styles.detailValue}>{product.material}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Size:</span>
            <span style={styles.detailValue}>{product.size}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Price:</span>
            <span style={{...styles.detailValue, ...styles.priceValue}}>₹{product.price}</span>
          </div>
          
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Minimum Order Quantity : </span>
            <span style={styles.detailValue}>{product.minorderquantity}</span>
          </div>

          {/* Buttons */}
          <div style={styles.buttonContainer}>
            {/* Navigation buttons */}
            <button
              onClick={() => navigate(-1)}
              style={{...styles.button, ...styles.backButton}}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
              }}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>

            <button
              onClick={() => navigate(`/pdts/${product.category}`)}
              style={{...styles.button, ...styles.categoryButton}}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(132, 250, 176, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
              }}
            >
              <Package size={20} />
              More in {product.category}
            </button>

            {/* Action buttons */}
            <div style={styles.actionButtonsContainer}>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={inCart}
                style={{
                  ...styles.button,
                  ...(inCart ? styles.addedToCartButton : styles.addToCartButton)
                }}
                onMouseEnter={(e) => {
                  if (!inCart) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 30px rgba(240, 147, 251, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!inCart) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                  }
                }}
              >
                <ShoppingCart size={20} />
                {inCart ? "Added to Cart" : "Add to Cart"}
              </button>

            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pdtzoom;