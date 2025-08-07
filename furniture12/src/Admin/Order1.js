import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Edit, Package, Truck, CheckCircle, XCircle, Calendar, User, Phone, MapPin, CreditCard, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Order1 = () => {
  const {user}=useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE_URL = 'https://anrfurniture-2.onrender.com/api';

  // Fetch orders from your backend
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      setIsConnected(true);
      
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setOrders(data);
      setFilteredOrders(data);
      setLastUpdate(new Date());
      
      // Log order items if they exist
      data.forEach((order, orderIndex) => {
        if (order.items) {
          order.items.forEach((item, index) => {
            console.log(`Order ${orderIndex + 1}, Item ${index + 1}:`);
            console.log("Product ID:", item.productId);
            console.log("Name:", item.name);
            console.log("Price:", item.price);
            console.log("Quantity:", item.quantity);
            console.log("Images:", item.images);
            console.log("Material:", item.material || "N/A");
          });
        }
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setIsConnected(false);
      
      // If backend is not available, you can optionally set some mock data
      // or show an error message to user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Remove API_BASE_URL from dependencies as it's constant

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  // Initial fetch ONLY - no automatic refresh
  useEffect(() => {
    fetchOrders();
  }, []); // Empty dependency array - only runs once on mount

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userPhone?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    // Payment method filter
    if (paymentFilter !== 'All') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }

    // Date range filter
    if (dateRange !== 'All') {
      const now = new Date();
      const days = dateRange === 'Today' ? 1 : dateRange === 'Week' ? 7 : dateRange === 'Month' ? 30 : 0;
      if (days > 0) {
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(order => new Date(order.orderDate) >= startDate);
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange]);

  // Update order status via API with immediate UI update
  const updateOrderStatus = async (orderId, newStatus) => {
  // Store the current status OUTSIDE try block for proper scope
  const currentOrder = orders.find(order => order.orderId === orderId);
  const previousStatus = currentOrder?.orderStatus;
  
  try {
    console.log(orderId);
    
    // Update local state immediately (optimistic update)
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, orderStatus: newStatus, updatedAt: new Date() }
          : order
      )
    );

    // Update selected order in modal if it's the same order
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
    }

    // Make API call
    const response = await fetch(`${API_BASE_URL}/order/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderStatus: newStatus })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Order updated successfully:', result);

    // Optionally update with server response to ensure consistency
    if (result.success && result.order) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId ? { ...order, ...result.order } : order
        )
      );
    }

  } catch (error) {
    console.error('Error updating order status:', error);
    
    // Revert the optimistic update using the stored previous status
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, orderStatus: previousStatus } // ✅ Now properly accessible
          : order
      )
    );

    // Revert selected order if needed
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder(prev => ({ ...prev, orderStatus: previousStatus }));
    }

    // Show user-friendly error message
    alert(`Failed to update order status: ${error.message}`);
  }
};
  // Updated updateOrderStatus function in table
  const handleTableStatusChange = (order, newStatus) => {
    updateOrderStatus(order.orderId, newStatus);
  };

  // Updated updateOrderStatus function in modal
  const handleModalStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': { backgroundColor: '#fef3c7', color: '#92400e' },
      'Confirmed': { backgroundColor: '#dbeafe', color: '#1e40af' },
      'Processing': { backgroundColor: '#e9d5ff', color: '#7c3aed' },
      'Shipped': { backgroundColor: '#c7d2fe', color: '#4338ca' },
      'Delivered': { backgroundColor: '#d1fae5', color: '#065f46' },
      'Cancelled': { backgroundColor: '#fee2e2', color: '#991b1b' }
    };
    return colors[status] || { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Calendar style={{ width: '16px', height: '16px' }} />,
      'Confirmed': <CheckCircle style={{ width: '16px', height: '16px' }} />,
      'Processing': <Package style={{ width: '16px', height: '16px' }} />,
      'Shipped': <Truck style={{ width: '16px', height: '16px' }} />,
      'Delivered': <CheckCircle style={{ width: '16px', height: '16px' }} />,
      'Cancelled': <XCircle style={{ width: '16px', height: '16px' }} />
    };
    return icons[status] || <Package style={{ width: '16px', height: '16px' }} />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '48px',
          width: '48px',
          border: '2px solid transparent',
          borderBottom: '2px solid #2563eb',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#6b7280', margin: 0 }}>Loading orders...</p>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <XCircle style={{ width: '48px', height: '48px', color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ color: '#111827', margin: '0 0 8px 0' }}>Connection Error</h2>
        <p style={{ color: '#6b7280', margin: '0 0 16px 0', textAlign: 'center' }}>
          Unable to connect to the server. Please check if your backend is running on {API_BASE_URL}
        </p>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header with Connection Status */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Orders Management</h1>
            <p style={{
              color: '#6b7280',
              marginTop: '8px',
              margin: 0
            }}>Manage and track all customer orders</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: isConnected ? '#d1fae5' : '#fee2e2',
              color: isConnected ? '#065f46' : '#991b1b'
            }}>
              {isConnected ? 
                <Wifi style={{ width: '16px', height: '16px' }} /> : 
                <WifiOff style={{ width: '16px', height: '16px' }} />
              }
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Last Update Time */}
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Last updated: {formatDate(lastUpdate)}</span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '8px 12px',
                backgroundColor: refreshing ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <RefreshCw style={{ 
                width: '16px', 
                height: '16px',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <XCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            <span style={{ color: '#991b1b', fontSize: '14px' }}>
              Warning: {error}. Showing cached data.
            </span>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px'
              }}>
                <Package style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: 0
                }}>Total Orders</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#d1fae5',
                borderRadius: '8px'
              }}>
                <CheckCircle style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: 0
                }}>Delivered</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {orders.filter(o => o.orderStatus === 'Delivered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#e9d5ff',
                borderRadius: '8px'
              }}>
                <Truck style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: 0
                }}>In Transit</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {orders.filter(o => ['Processing', 'Shipped'].includes(o.orderStatus)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '8px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px'
              }}>
                <Calendar style={{ width: '24px', height: '24px', color: '#d97706' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  margin: 0
                }}>Pending</p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {orders.filter(o => o.orderStatus === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          padding: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  width: '16px',
                  height: '16px'
                }} />
                <input
                  type="text"
                  placeholder="Order ID, Name, Phone..."
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>Status</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>Payment Method</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="All">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>Date Range</label>
              <select
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Week">This Week</option>
                <option value="Month">This Month</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setPaymentFilter('All');
                  setDateRange('All');
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              minWidth: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Order Details
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Customer
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Items
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Amount
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
            <tbody style={{ backgroundColor: 'white' }}>
  {filteredOrders
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) // Sort by newest first
    .map((order) => (
      <tr key={order._id} style={{
        borderTop: '1px solid #e5e7eb'
      }}>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827'
            }}>{order.orderId}</div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>{order.paymentMethod}</div>
          </div>
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827'
            }}>{order.userName}</div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>{order.userPhone}</div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>{order.location}</div>
          </div>
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              marginRight: '5px'
            }}>
              {order.items && order.items.slice(0, 3).map((item, idx) => (
                <img
                  key={idx}
                  style={{
                    width: '9vw',
                    height: '2vw',
                    borderRadius: '50%',
                    border: '1px solid white',
                    objectFit: 'cover',
                    marginLeft: idx > 0 ? '-8px' : '0'
                  }}
                  src={item.images[0]}
                />
              ))}
              {order.items && order.items.length > 3 && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '-8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>+{order.items.length - 3}</span>
                </div>
              )}
            </div>
            <span style={{
              fontSize: '14px',
              color: '#111827'
            }}>{getTotalItems(order.items)} items</span>
          </div>
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827'
          }}>
            {formatCurrency(order.totalAmount)}
          </div>
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            gap: '4px',
            ...getStatusColor(order.orderStatus)
          }}>
            {getStatusIcon(order.orderStatus)}
            <span>{order.orderStatus}</span>
          </span>
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {formatDate(order.orderDate)}
        </td>
        <td style={{
          padding: '16px 24px',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowModal(true);
              }}
              style={{
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
            </button>
            <select
              value={order.orderStatus}
              onChange={(e) => handleTableStatusChange(order, e.target.value)}
              style={{
                fontSize: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 8px',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </td>
      </tr>
    ))}
</tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px'
            }}>
              <Package style={{
                margin: '0 auto 8px auto',
                height: '48px',
                width: '48px',
                color: '#9ca3af'
              }} />
              <h3 style={{
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                margin: '8px 0 4px 0'
              }}>No orders found</h3>
              <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div style={{
            position: 'fixed',
            inset: 0,
            marginLeft:"14vh",
            backgroundColor: 'rgba(107, 114, 128, 0.5)',
            overflowY: 'auto',
            height: '100%',
            width: '100%',
            zIndex: 50,
          }}>
            <div style={{
              position: 'relative',
              top: '80px',
              margin: '0 auto',
              padding: '20px',
              border: '1px solid #e5e7eb',
              width: '90%',
              maxWidth: '1024px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingLeft:"14vw",
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>Order Details - {selectedOrder.orderId}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#111827'}
                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                >
                  <XCircle style={{ width: '24px', height: '24px' }} />
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                {/* Customer Information */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: '0 0 12px 0'
                  }}>Customer Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <User style={{
                        width: '16px',
                        height: '16px',
                        color: '#6b7280',
                        marginRight: '8px'
                      }} />
                      <span style={{ fontSize: '14px' }}>{selectedOrder.userName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Phone style={{
                        width: '16px',
                        height: '16px',
                        color: '#6b7280',
                        marginRight: '8px'
                      }} />
                      <span style={{ fontSize: '14px' }}>{selectedOrder.userPhone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <MapPin style={{
                        width: '16px',
                        height: '16px',
                        color: '#6b7280',
                        marginRight: '8px'
                      }} />
                      <span style={{ fontSize: '14px' }}>{selectedOrder.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard style={{
                        width: '16px',
                        height: '16px',
                        color: '#6b7280',
                        marginRight: '8px'
                      }} />
                      <span style={{ fontSize: '14px' }}>{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '12px',
                    margin: '0 0 12px 0'
                  }}>Order Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>Order Date:</span>
                      <span style={{ fontSize: '14px' }}>{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>Estimated Delivery:</span>
                      <span style={{ fontSize: '14px' }}>{formatDate(selectedOrder.estimatedDelivery)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>Status:</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        gap: '4px',
                        ...getStatusColor(selectedOrder.orderStatus)
                      }}>
                        {getStatusIcon(selectedOrder.orderStatus)}
                        <span>{selectedOrder.orderStatus}</span>
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>Total Amount:</span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>Order Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      <img
                        src={item.images[0]}
                        style={{
                          width: '9vh',
                          height: '64px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          marginRight: '16px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>{item.name || 'Product Name'}</h5>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 4px 0'
                        }}>Material: {item.material || 'N/A'}</p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>Quantity: {item.quantity || 1}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 4px 0'
                        }}>{formatCurrency(item.price || 0)}</p>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0
                        }}>Total: {formatCurrency((item.price || 0) * (item.quantity || 1))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Update Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleModalStatusChange(selectedOrder._id, e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Order1;