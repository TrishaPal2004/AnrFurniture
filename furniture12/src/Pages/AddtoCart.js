import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.js';

const AddtoCart = () => {
  const { isLoggedin, user,setUser, logout } = useAuth();
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

  const token = localStorage.getItem('token');

  // Get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // Helper function to get unit price (price per single item)
  const getUnitPrice = (item) => {
    if (item.minorderquantity && item.minorderquantity > 1) {
      return item.price / item.minorderquantity;
    }
    return item.price;
  };

  // Helper function to calculate item total
  const getItemTotal = (item) => {
    const unitPrice = getUnitPrice(item);
    return unitPrice * item.quantity;
  };

  // NEW: Enhanced validation function to check all items meet minimum quantity
  const validateCartMinimumQuantities = () => {
    const invalidItems = cart.filter(item => {
      const minOrderQty = item.minorderquantity || 1;
      return item.quantity < minOrderQty;
    });
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems: invalidItems
    };
  };

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

  // ENHANCED: Update quantity with stricter validation
  const updateQuantity = async (productId, newQuantity) => {
    const item = cart.find(cartItem => 
      cartItem.productId === productId || cartItem._id === productId
    );
    
    if (!item) return;

    const minOrderQty = item.minorderquantity;
    console.log(minOrderQty);
    // Prevent setting quantity below minimum
    if (newQuantity > 0 && newQuantity < minOrderQty) {
      toast.error(`Minimum order quantity for ${item.name} is ${minOrderQty}. Please order at least ${minOrderQty} units or remove the item completely.`);
      return;
    }

    if (newQuantity <= 0) {
      // Show confirmation dialog for items with minimum quantity > 1
      if (minOrderQty > 1) {
        if (!window.confirm(`${item.name} has a minimum order quantity of ${minOrderQty}. Removing it will delete the entire item from your cart. Continue?`)) {
          return;
        }
      }
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

  // Calculate total price using corrected calculation
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + getItemTotal(item);
    }, 0);
  };

  // Calculate savings (if you have original price field)
  const calculateSavings = () => {
    return cart.reduce((savings, item) => {
      const unitPrice = getUnitPrice(item);
      const originalUnitPrice = item.originalPrice ? 
        (item.minorderquantity && item.minorderquantity > 1 ? 
          item.originalPrice / item.minorderquantity : 
          item.originalPrice) : 
        unitPrice * 1.2;
      
      return savings + ((originalUnitPrice - unitPrice) * item.quantity);
    }, 0);
  };

  // ENHANCED: Proceed to checkout with validation
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate minimum quantities before proceeding
    const validation = validateCartMinimumQuantities();
    if (!validation.isValid) {
      const itemNames = validation.invalidItems.map(item => 
        `${item.name} (min: ${item.minorderquantity || 1}, current: ${item.quantity})`
      ).join(', ');
      
      toast.error(`Please meet minimum order quantities for: ${itemNames}`);
      return;
    }

    setCurrentStep('checkout');
  };

  // Handle location input
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  // Clear cart function
  const clearCart = async () => {
    console.log(token);
    try {
      console.log('Attempting to clear cart for user:', user?.id);
      
      const response = await fetch('https://anrfurniture-2.onrender.com/api/cart/clear', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Server response:', result);
        setCart([]);
        console.log('Cart cleared successfully on both server and client');
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to clear cart on server:', response.status, errorText);
        setCart([]);
        return false;
      }
    } catch (clearError) {
      console.error('Error clearing cart:', clearError);
      setCart([]);
      return false;
    }
  };

  // ENHANCED: Confirm order with final validation
  const confirmOrder = async () => {
   
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Final validation before order placement
    const validation = validateCartMinimumQuantities();
    if (!validation.isValid) {
      const itemDetails = validation.invalidItems.map(item => 
        `${item.name}: Current quantity ${item.quantity}, minimum required ${item.minorderquantity || 1}`
      ).join('\n');
      
      toast.error(`Cannot place order. The following items don't meet minimum quantity requirements:\n${itemDetails}`);
      setCurrentStep('cart');
      return;
    }

    setLoading(true);
    setCurrentStep('payment');
    
    try {
      const orderData = {
        userId: user.id,
        userName: user.name,
        userPhone: user.phoneno,
        location: user.address,
        items: cart.map(item => {
          const minOrderQty = item.minorderquantity || 1;
          // Double-check each item before sending
          if (item.quantity < minOrderQty) {
            throw new Error(`${item.name} quantity (${item.quantity}) is below minimum (${minOrderQty})`);
          }
          
          return {
            productId: item.productId || item._id,
            name: item.name,
            price: getUnitPrice(item),
            quantity: item.quantity,
            images: item.images,
            material: item.material || '',
            minorderquantity: item.minorderquantity || 1
          };
        }),
        totalAmount: calculateTotal(),
        paymentMethod: selectedPaymentMethod
      };

      const response = await fetch('https://anrfurniture-2.onrender.com/api/order/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      
      console.log('Order data sent:', orderData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      
      setOrderDetails({
        orderId: order.orderId || order._id || 'OD' + Date.now(),
        items: [...cart],
        total: calculateTotal(),
        savings: calculateSavings(),
        paymentMethod: selectedPaymentMethod,
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
        orderStatus: order.orderStatus || 'Pending'
      });

      await clearCart();
      setCurrentStep('confirmation');
      setLoading(false);
      toast.success('Order placed successfully! Your cart has been cleared.');
      
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error.message || 'Failed to place order');
      setCurrentStep('checkout');
      setLoading(false);
    }
  };

  // Fetch cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // ENHANCED: CartItem component with better UI indicators
  const CartItem = ({ item }) => {
    const unitPrice = getUnitPrice(item);
    const itemTotal = getItemTotal(item);
    const minOrderQty = item.minorderquantity;
    
    // Check if current quantity meets minimum requirement
    const meetsMinimum = item.quantity >= minOrderQty;
    const isAtMinimum = item.quantity === minOrderQty;
    const canDecrease = item.quantity > minOrderQty;

    return (
      <div style={{
        display: 'flex',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: meetsMinimum ? '#fff' : '#fff8f0',
        border: meetsMinimum ? 'none' : '2px solid #ff6b35'
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
              ₹{unitPrice.toLocaleString()} per unit
            </span>
            {minOrderQty > 1 && (
              <span style={{ 
                fontSize: '12px', 
                color: '#fff', 
                backgroundColor: meetsMinimum ? (isAtMinimum ? '#ff6b35' : '#4caf50') : '#f44336',
                padding: '2px 6px', 
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                Min: {minOrderQty} {isAtMinimum && '(At Min)'} {!meetsMinimum && '(Below Min!)'}
              </span>
            )}
          </div>

          {/* Warning messages */}
          {!meetsMinimum && (
            <div style={{ 
              color: '#f44336', 
              fontSize: '14px', 
              marginBottom: '8px',
              fontWeight: '600',
              backgroundColor: '#ffebee',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #f44336'
            }}>
              ⚠️ ATTENTION: Current quantity ({item.quantity}) is below minimum order quantity ({minOrderQty}). 
              Please increase to at least {minOrderQty} units or remove this item.
            </div>
          )}

          {isAtMinimum && minOrderQty > 1 && (
            <div style={{ 
              color: '#ff6b35', 
              fontSize: '12px', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              ℹ️ At minimum order quantity. Cannot reduce further without removing item.
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <button 
                onClick={() => updateQuantity(item.productId || item._id, item.quantity - 1)}
                disabled={loading || !canDecrease}
                title={!canDecrease ? `Cannot go below minimum quantity of ${minOrderQty}` : 'Decrease quantity'}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '8px 12px',
                  cursor: (loading || !canDecrease) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  opacity: !canDecrease ? 0.3 : 1,
                  color: !canDecrease ? '#ccc' : '#333'
                }}
              >
                -
              </button>
              <span style={{ 
                padding: '8px 16px', 
                fontSize: '16px', 
                fontWeight: '600',
                color: !meetsMinimum ? '#f44336' : (isAtMinimum ? '#ff6b35' : '#333')
              }}>
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
              onClick={() => {
                if (minOrderQty > 1) {
                  if (window.confirm(`This item has a minimum order quantity of ${minOrderQty}. Removing it will delete the entire item from your cart. Continue?`)) {
                    removeFromCart(item.productId || item._id);
                  }
                } else {
                  removeFromCart(item.productId || item._id);
                }
              }}
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
            ₹{itemTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {item.quantity} × ₹{unitPrice.toLocaleString()}
          </div>
          {minOrderQty > 1 && (
            <div style={{ 
              fontSize: '10px', 
              color: meetsMinimum ? '#999' : '#f44336', 
              marginTop: '2px',
              fontWeight: meetsMinimum ? 'normal' : '600'
            }}>
              Min qty: {minOrderQty}
            </div>
          )}
        </div>
      </div>
    );
  };

  // NEW: Enhanced PLACE ORDER button with validation indicator
  const PlaceOrderButton = () => {
    const validation = validateCartMinimumQuantities();
    const hasInvalidItems = !validation.isValid;
    
    return (
      <div>
        {hasInvalidItems && (
          <div style={{
            color: '#f44336',
            fontSize: '14px',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #f44336'
          }}>
            ⚠️ Some items don't meet minimum order quantities. Please adjust quantities or remove items before placing order.
          </div>
        )}
        
        <button 
          onClick={proceedToCheckout}
          disabled={cart.length === 0 || hasInvalidItems}
          style={{
            backgroundColor: (cart.length === 0 || hasInvalidItems) ? '#ccc' : '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (cart.length === 0 || hasInvalidItems) ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: (cart.length === 0 || hasInvalidItems) ? 0.7 : 1
          }}
        >
          {hasInvalidItems ? 'FIX QUANTITIES TO PLACE ORDER' : 'PLACE ORDER'}
        </button>
      </div>
    );
  };

  // Checkout Page Component
  const CheckoutPage = () => {
    const isMobile = window.innerWidth < 768;

    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '20px' }}>Checkout</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
            }}
          >
            <div style={{ flex: '2' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Order Summary</h3>
                {cart.map((item) => (
                  <div
                    key={item._id || item.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{getItemTotal(item).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
               
               <p>Delivering to: {user.name}</p>
                
               <button
  type="button"
  onClick={()=>{navigate("/location")}}
  style={{
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  }}
>
  Update Location
</button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                flex: '1',
                height: 'fit-content',
              }}
            >
              <h3>Payment Details</h3>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Total MRP</span>
                  <span>
                    ₹
                    {cart
                      .reduce((sum, item) => {
                        const unitPrice = getUnitPrice(item);
                        const originalUnitPrice = item.originalPrice
                          ? item.minorderquantity && item.minorderquantity > 1
                            ? item.originalPrice / item.minorderquantity
                            : item.originalPrice
                          : unitPrice * 1.2;
                        return sum + originalUnitPrice * item.quantity;
                      }, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    color: '#388e3c',
                  }}
                >
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
                {['Cash on Delivery'].map((method) => (
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
              
                style={{
                  backgroundColor: loading || !selectedPaymentMethod ? '#ccc' : '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor:  !selectedPaymentMethod ? 'not-allowed' : 'pointer',
                  width: '100%',
                  opacity: !selectedPaymentMethod ? 0.7 : 1,
                }}
              >
                {loading ? 'Processing...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <span>₹{getItemTotal(item).toLocaleString()}</span>
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
          onClick={() => {
            navigate('/');
            setTimeout(() => {
              fetchCartItems();
            }, 500);
          }}
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
                <div style={{ display: 'flex', gridTemplateColumns: '2fr 1fr', flexDirection: "column" }}>
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
                        <span>₹{cart.reduce((sum, item) => {
                          const unitPrice = getUnitPrice(item);
                          const originalUnitPrice = item.originalPrice ? 
                            (item.minorderquantity && item.minorderquantity > 1 ? 
                              item.originalPrice / item.minorderquantity : 
                              item.originalPrice) : 
                            unitPrice * 1.2;
                          return sum + (originalUnitPrice * item.quantity);
                        }, 0).toLocaleString()}</span>
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
                    <PlaceOrderButton />
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