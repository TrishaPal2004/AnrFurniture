import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.js';

const AddtoCart = () => {
  const { isLoggedin, user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [currentStep, setCurrentStep] = useState('cart');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [location, setLocation] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to view your cart');
      navigate('/login');
      return;
    }

    setFetchingCart(true);
    try {
      const response = await fetch('https://anrfurniture-2.onrender.com/api/cart/items', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setFetchingCart(false);
    }
  };

  // Update quantity in backend and local state
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://anrfurniture-2.onrender.com/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update local state
      setCart(cart.map(item => 
        item.productId === productId || item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));

      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://anrfurniture-2.onrender.com/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Update local state
      setCart(cart.filter(item => 
        item.productId !== productId && item._id !== productId
      ));

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate savings (if you have original price field)
  const calculateSavings = () => {
    return cart.reduce((savings, item) => {
      const originalPrice = item.originalPrice || item.price * 1.2;
      return savings + ((originalPrice - item.price) * item.quantity);
    }, 0);
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setCurrentStep('checkout');
  };

  // Handle location input
  const handleLocationChange = (e) => {
    e.preventDefault();
    setLocation(e.target.value);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  // Confirm order
  const confirmOrder = async () => {
    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }
    
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    setCurrentStep('payment');
    
    try {
      const orderData = {
        userId: user.id,
        userName: user.name,
        userPhone: user.phoneno,
        location: location,
        items: cart.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: item.images,
          material: item.material || '' // Include material field
        })),
        totalAmount: calculateTotal(),
        paymentMethod: selectedPaymentMethod
      };

      const response = await fetch('https://anrfurniture-2.onrender.com/api/order/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      console.log(orderData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      
      setOrderDetails({
        orderId: order.orderId || order._id || 'OD' + Date.now(),
        items: cart,
        total: calculateTotal(),
        savings: calculateSavings(),
        paymentMethod: selectedPaymentMethod,
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
        orderStatus: order.orderStatus || 'Pending'
      });

      // Clear cart after successful order - you might want to call a clear cart API endpoint
      try {
        await fetch('https://anrfurniture-2.onrender.com/api/cart/clear', {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } catch (clearError) {
        console.warn('Failed to clear cart on server:', clearError);
      }
      
      setCart([]);
      setCurrentStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error.message || 'Failed to place order');
      setCurrentStep('checkout'); // Go back to checkout on error
    }
  };

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Cart Item Component
  const CartItem = ({ item }) => (
    <div style={{
      display: 'flex',
      padding: '16px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fff'
    }}>
      <img 
        src={item.images?.[0] || item.image || '/placeholder-image.png'} 
        alt={item.name}
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginRight: '16px'
        }}
        onError={(e) => {
          e.target.src = '/placeholder-image.png';
        }}
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.name}</h4>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
          {item.material || item.description || 'No description available'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '600', marginRight: '8px' }}>
            ₹{item.price.toLocaleString()}
          </span>
          {item.originalPrice && (
            <span style={{ fontSize: '14px', color: '#666', textDecoration: 'line-through' }}>
              ₹{item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
            <button 
              onClick={() => updateQuantity(item.productId || item._id, item.quantity - 1)}
              disabled={loading}
              style={{
                border: 'none',
                background: 'none',
                padding: '8px 12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              -
            </button>
            <span style={{ padding: '8px 16px', fontSize: '16px', fontWeight: '600' }}>
              {item.quantity}
            </span>
            <button 
              onClick={() => updateQuantity(item.productId || item._id, item.quantity + 1)}
              disabled={loading}
              style={{
                border: 'none',
                background: 'none',
                padding: '8px 12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              +
            </button>
          </div>
          <button 
            onClick={() => removeFromCart(item.productId || item._id)}
            disabled={loading}
            style={{
              color: '#ff6b6b',
              border: 'none',
              background: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? 'REMOVING...' : 'REMOVE'}
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>
          ₹{(item.price * item.quantity).toLocaleString()}
        </div>
        {item.originalPrice && (
          <div style={{ fontSize: '12px', color: '#388e3c', marginTop: '4px' }}>
            Saved ₹{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );

  // Checkout Page Component
  const CheckoutPage = () => (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Checkout</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Order Summary</h3>
              {cart.map(item => (
                <div key={item._id || item.productId} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0', 
                  borderBottom: '1px solid #eee' 
                }}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
           <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
  <h3>Delivery Address</h3>
  <label htmlFor="location" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
    Enter your location:
  </label>
  <input
    type="text"
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="e.g., Kolkata, India"
    style={{
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '12px',
      width: '100%',
      fontSize: '16px'
    }}
  />
  <button
    type="button"
    onClick={() => toast.success('Location saved')} // Or any other action you want
    style={{
      marginTop: '10px',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer'
    }}
  >
    Save Location
  </button>
</div>


          </div>
          
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
            <h3>Payment Details</h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total MRP</span>
                <span>₹{cart.reduce((sum, item) => sum + ((item.originalPrice || item.price * 1.2) * item.quantity), 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#388e3c' }}>
                <span>Discount</span>
                <span>-₹{calculateSavings().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Delivery Fee</span>
                <span style={{ color: '#388e3c' }}>FREE</span>
              </div>
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                <span>Total Amount</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4>Payment Method</h4>
              {['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'].map(method => (
                <label key={method} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value={method} 
                    checked={selectedPaymentMethod === method}
                    onChange={handlePaymentMethodChange}
                    style={{ marginRight: '8px' }} 
                  />
                  {method}
                </label>
              ))}
            </div>
            
            <button 
              onClick={confirmOrder}
              disabled={loading || !location.trim() || !selectedPaymentMethod}
              style={{
                backgroundColor: (loading || !location.trim() || !selectedPaymentMethod) ? '#ccc' : '#ff6b35',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || !location.trim() || !selectedPaymentMethod) ? 'not-allowed' : 'pointer',
                width: '100%',
                opacity: (loading || !location.trim() || !selectedPaymentMethod) ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Payment Processing Component
  const PaymentProcessing = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '40px', 
        borderRadius: '8px', 
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #ff6b35', 
          borderTop: '3px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2>Processing Payment...</h2>
        <p>Please wait while we confirm your order</p>
      </div>
    </div>
  );

  // Order Confirmation Component
  const OrderConfirmation = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '40px', 
        borderRadius: '8px', 
        textAlign: 'center',
        maxWidth: '600px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#4caf50', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px',
          color: 'white'
        }}>
          ✓
        </div>
        <h2 style={{ color: '#4caf50', marginBottom: '16px' }}>Order Confirmed!</h2>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Order ID: <strong>{orderDetails?.orderId}</strong>
        </p>
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h3>Order Details:</h3>
          {orderDetails?.items.map(item => (
            <div key={item._id || item.productId} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 0',
            fontSize: '18px',
            fontWeight: '600',
            borderTop: '2px solid #eee',
            marginTop: '12px'
          }}>
            <span>Total Paid</span>
            <span>₹{orderDetails?.total.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            <strong>Order Status:</strong> {orderDetails?.orderStatus || 'Pending'}
          </p>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            <strong>Payment Method:</strong> {orderDetails?.paymentMethod}
          </p>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            <strong>Estimated delivery:</strong> {orderDetails?.estimatedDelivery}
          </p>
        </div>
        <p style={{ color: '#4caf50', fontSize: '16px', marginBottom: '20px' }}>
          You saved ₹{orderDetails?.savings.toLocaleString()} on this order!
        </p>
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // Add CSS animation for loading spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
        if (fetchingCart) {
          return (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '100vh' 
            }}>
              <div>Loading cart...</div>
            </div>
          );
        }

        return (
          <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>My Cart ({cart.length} items)</h1>
                <button 
                  onClick={() => navigate('/')}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '8px' }}>
                  <h2>Your cart is empty</h2>
                  <p>Add some products to get started!</p>
                  <button 
                    onClick={() => navigate('/')}
                    style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      marginTop: '20px'
                    }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    {cart.map(item => (
                      <CartItem key={item._id || item.productId} item={item} />
                    ))}
                  </div>
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Price Details</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Price ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                        <span>₹{cart.reduce((sum, item) => sum + ((item.originalPrice || item.price * 1.2) * item.quantity), 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#388e3c' }}>
                        <span>Discount</span>
                        <span>-₹{calculateSavings().toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Delivery Charges</span>
                        <span style={{ color: '#388e3c' }}>FREE</span>
                      </div>
                      <hr />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                        <span>Total Amount</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ color: '#388e3c', fontSize: '14px', marginBottom: '16px' }}>
                      You will save ₹{calculateSavings().toLocaleString()} on this order
                    </div>
                    <button 
                      onClick={proceedToCheckout}
                      disabled={cart.length === 0}
                      style={{
                        backgroundColor: cart.length === 0 ? '#ccc' : '#ff6b35',
                        color: 'white',
                        border: 'none',
                        padding: '16px',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                        width: '100%'
                      }}
                    >
                      PLACE ORDER
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'checkout':
        return <CheckoutPage />;
      
      case 'payment':
        return <PaymentProcessing />;
      
      case 'confirmation':
        return <OrderConfirmation />;
      
      default:
        return null;
    }
  };

  return renderStep();
};

export default AddtoCart;