// LocationChangeForm.jsx
import React, { useState } from "react";

const Location = () => {
  const [formData, setFormData] = useState({
    email: '',
    newLocation: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/user/change-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          newAddress: formData.newLocation,
        }),
      });

      const data = await res.json(); // ✅ Needed with fetch()

      if (data.success) {
        setMessage("✅ Location updated successfully!");
      } else {
        setMessage("❌ Update failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("⚠️ Error submitting form.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Change Location</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <input
          type="text"
          name="newLocation"
          placeholder="Enter new address"
          value={formData.newLocation}
          onChange={handleChange}
          required
          style={{ display: "block", marginBottom: "1rem", width: "100%" }}
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
};

export default Location;
