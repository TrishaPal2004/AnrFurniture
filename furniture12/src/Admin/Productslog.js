import React, { useEffect, useState } from 'react';

const Productslog = () => {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://anrfurniture-2.onrender.com/api/pdt/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`https://anrfurniture-2.onrender.com/api/pdt/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const updateProduct = async (id) => {
    const newName = prompt("Enter new product name:");
    const newQty = prompt("Enter new quantity:");
    const newPrice = prompt("Enter new price");
    try {
      const res = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, quantity: Number(newQty),price:Number(newPrice) }),
      });
      const updated = await res.json();
      setProducts(products.map(p => (p._id === id ? updated : p)));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '2rem',backgroundColor:"white" }}>
      <h2>Total Products: {products.length}</h2>
      {products.map(product => (
        <div key={product._id} style={{
          border: '1px solid #ccc', marginBottom: '1rem',
          padding: '1rem', borderRadius: '6px'
        }}>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Quantity:</strong> {product.quantity}</p>
          <p><strong>Price:</strong>{product.price}</p>
          <div ><img src={product.images[0]} style={{height:"20vw",border:"1px solid white",borderRadius:"5vh"}}/></div>
          <button onClick={() => deleteProduct(product._id)} style={{ marginRight: '1rem',backgroundColor:"red",width:"14vh",height:"4vh",borderRadius:"2vh",border:"1px solid white" }}>Delete</button>
          <button onClick={() => updateProduct(product._id)}>Update</button>
        </div>
      ))}
    </div>
  );
};

export default Productslog;
