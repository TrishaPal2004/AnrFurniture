import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TrackOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  // Fetch orders when component mounts
  const handleFetch = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/order/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        
      });

      const data = await response.json();
      if (!response.ok) {
        console.log("Error fetching orders");
        return;
      }
      setOrders(data.orders || []);
      console.log("Orders fetched:", data);
    } catch (error) {
      console.error("Error fetching:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      handleFetch();
    }
  }, [user]);

  const getTotalItems = (items) =>
    items?.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const formatCurrency = (amount) =>
    `₹${amount.toFixed(2)}`;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'Shipped':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
      case 'Delivered':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'Cancelled':
        return { backgroundColor: '#FECACA', color: '#991B1B' };
      default:
        return { backgroundColor: '#E5E7EB', color: '#374151' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return '🕒';
      case 'Shipped':
        return '🚚';
      case 'Delivered':
        return '📦';
      case 'Cancelled':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      style={{
        padding:"4vw",
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <h1 style={{fontSize:"2rem",paddingBottom:"2vw"}}>Welcome {user?.name} ! Your Order Status !</h1>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            minWidth: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              {['Order Details', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((heading, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'white' }}>
            {orders.map((order) => (
              <tr key={order._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {order.orderId}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.paymentMethod}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {order.userName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.userPhone}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.location}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', marginRight: '5px' }}>
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          style={{
                            width: '9vw',
                            height: '2vw',
                            borderRadius: '50%',
                            border: '1px solid white',
                            objectFit: 'cover',
                            marginLeft: idx > 0 ? '-8px' : '0',
                          }}
                          src={item.images[0]}
                          alt=""
                        />
                      ))}
                      {order.items?.length > 3 && (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e5e7eb',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '-8px',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: '#111827' }}>
                      {getTotalItems(order.items)} items
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {formatCurrency(order.totalAmount)}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      gap: '4px',
                      ...getStatusColor(order.orderStatus),
                    }}
                  >
                    {getStatusIcon(order.orderStatus)} <span>{order.orderStatus}</span>
                  </span>
                </td>
                <td
                  style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}
                >
                  {formatDate(order.orderDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackOrder;
