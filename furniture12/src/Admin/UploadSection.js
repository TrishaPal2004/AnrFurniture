import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";

const styles = {
  sectionHeader: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "30px",
    borderRadius: "20px",
    marginBottom: "30px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    marginBottom: "10px",
  },
  sectionDescription: {
    color: "#666",
    fontSize: "16px",
    margin: 0,
  },
  formContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxSizing: "border-box",
  },
  formGroup: { marginBottom: "25px" },
  formLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
  },
  formInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.8)",
    outline: "none",
    boxSizing: "border-box",
  },
  formTextarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    fontSize: "16px",
    minHeight: "120px",
    resize: "vertical",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.8)",
    outline: "none",
    boxSizing: "border-box",
  },
  submitButton: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
  },
};

const UploadSection = () => {
  const { user } = useAuth();
  const [pdtData, setpdtData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    images: ["", "", ""],
    date: new Date().toISOString().split("T")[0],
    material: "",
    color: "",
    size: "",
    quantity:""
  });

  console.log("Component rendered, user:", user);
 const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });
  const handleCreatePdt = async (e) => {
    console.log("handleCreatePdt called!"); // This should print
    e.preventDefault();
    console.log("After preventDefault");

    const { name, category, description, price, material, size,quantity } = pdtData;
    
    console.log("Form data:", pdtData);
    console.log("User data:", user);

    // Check if user exists first
    if (!user) {
      alert("Please log in first");
      return;
    }

    // Validation
    if (!name || !category || !description || !price || !material || !size) {
      alert("Please fill all required fields.");
      return;
    }

    // Admin check
    if (user.role !== "admin") {
      alert("Access denied! Admin access only");
      return;
    }

    try {
      console.log("Sending request to API...");
      const response = await fetch("http://localhost:5000/api/pdt", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...pdtData, price: Number(price),quantity:Number(quantity) }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      console.log("Product created:", data);
      alert("Product created successfully!");
      
      // Reset form
      setpdtData({
        name: "",
        category: "",
        description: "",
        price: "",
        images: ["", "", ""],
        date: new Date().toISOString().split("T")[0],
        material: "",
        color: "",
        size: "",
        quantity:""
      });
    } catch (error) {
      console.error("Error creating product:", error);
      alert(`Error creating product: ${error.message}`);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setpdtData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((index, value) => {
    console.log(`Image ${index} changed: ${value}`);
    setpdtData((prev) => {
      const images = [...prev.images];
      images[index] = value;
      return { ...prev, images };
    });
  }, []);

  // Debug button click
  const handleButtonClick = (e) => {
    console.log("Button clicked!", e);
    handleCreatePdt(e);
  };

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Upload New Items</h2>
        <p style={styles.sectionDescription}>
          Add new products to your inventory
        </p>
      </div>

      <form style={styles.formContainer} onSubmit={handleCreatePdt}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Product Name</label>
          <input
            type="text"
            name="name"
            value={pdtData.name}
            style={styles.formInput}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Product Description</label>
          <textarea
            name="description"
            style={styles.formTextarea}
            value={pdtData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Material Used</label>
          <input
            type="text"
            style={styles.formInput}
            onChange={handleChange}
            name="material"
            value={pdtData.material}
            placeholder="Enter material used"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Size</label>
          <input
            type="text"
            style={styles.formInput}
            name="size"
            value={pdtData.size}
            onChange={handleChange}
            placeholder="Enter size"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Quantity</label>
          <input
            type="number"
            style={styles.formInput}
            name="quantity"
            value={pdtData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={pdtData.price}
              onChange={handleChange}
              style={styles.formInput}
              placeholder="0.00"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Category</label>
            <select
              style={styles.formInput}
              name="category"
              value={pdtData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              <option value="Sofa">Sofa</option>
              <option value="Sofa Cum Bed">Sofa Cum Bed</option>
              <option value="Beds">Beds</option>
              <option value="Dining">Dining</option>
              <option value="Wardrobes">Wardrobes</option>
              <option value="Chairs">Chairs</option>
              <option value="Tea Tables">Tea Tables</option>
              <option value="TV Units">TV Units</option>
              <option value="Bookshelves">Bookshelves</option>
              <option value="Shoe Racks">Shoe Racks</option>
              <option value="Deal Zone">Deal Zone</option>
            </select>
          </div>
        </div>

        {[0, 1, 2].map((i) => (
          <div style={styles.formGroup} key={i}>
            <label style={styles.formLabel}>{`Product Image ${i + 1}`}</label>
            <input
              type="text"
              value={pdtData.images[i]}
              onChange={(e) => handleImageChange(i, e.target.value)}
              style={styles.formInput}
              placeholder={`Enter image url ${i + 1}`}
            />
          </div>
        ))}

        {/* Debug: Add both onSubmit and onClick */}
        <button 
          type="submit" 
          style={styles.submitButton}
          onClick={handleButtonClick}
        >
          Upload Product
        </button>
      </form>
    </div>
  );
};

export default UploadSection;