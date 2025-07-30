import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const Userlog = () => {
  const [users, setUsers] = useState([]);
  const token=localStorage.getItem("token");
  console.log(token);
  useEffect(() => {
    // Fetch from backend
    const fetchUsers = async () => {
      console.log("hi");
      try {
        const response = await fetch('http://localhost:5000/api/user/all',{
          method:'POST',
          headers:{
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
          }
        });
        
        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Total Users: {users.length}</h2>
    
      {users.map((user) => (
        <div
          key={user._id}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            backgroundColor: '#f9f9f9',
          }}
        >
          <p style={{ margin: '0.2rem 0' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Email:</strong> {user.email}</p>
          <p style={{margin: '0.2rem 0'}}><strong>Phoneno:</strong>{user.phoneno}</p>
        </div>
      ))}
    </div>
  );
};

export default Userlog;
