import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Location = () => {
  const [formData, setFormData] = useState({
    email: '',
    newLocation: ''
  });

  const [message, setMessage] = useState('');
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://anrfurniture-2.onrender.com/api/user/change-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          newAddress: formData.newLocation,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Location updated successfully!");

        // ✅ update the user in AuthContext
        setUser(prev => ({
          ...prev,
          address: formData.newLocation
        }));

        // ✅ navigate to cart page after short delay
        setTimeout(() => {
          navigate("/cart");
        }, 1000); // wait 1s to show message (optional)
      } else {
        setMessage("❌ Update failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("⚠️ Error submitting form.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem"
    }}>
      <div style={{
        maxWidth: "450px",
        width: "100%",
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        padding: "3rem 2.5rem",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "100px",
          height: "100px",
          background: "linear-gradient(45deg, #ff9a9e, #fecfef)",
          borderRadius: "50%",
          opacity: "0.1"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-30px",
          left: "-30px",
          width: "60px",
          height: "60px",
          background: "linear-gradient(45deg, #a18cd1, #fbc2eb)",
          borderRadius: "50%",
          opacity: "0.1"
        }}></div>

        <div style={{
          textAlign: "center",
          marginBottom: "2rem"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px"
          }}>
            📍
          </div>
          <h2 style={{
            color: "#2d3748",
            fontSize: "1.8rem",
            fontWeight: "700",
            margin: "0",
            letterSpacing: "-0.5px"
          }}>Change Location</h2>
          <p style={{
            color: "#718096",
            fontSize: "0.95rem",
            margin: "0.5rem 0 0 0",
            lineHeight: "1.4"
          }}>Update your delivery address</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "1rem 1rem 1rem 3rem",
                fontSize: "1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.3s ease",
                backgroundColor: "#f8fafc",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.backgroundColor = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.backgroundColor = "#f8fafc";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.1rem",
              color: "#a0aec0"
            }}>
              ✉️
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              name="newLocation"
              placeholder="Enter new address"
              value={formData.newLocation}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "1rem 1rem 1rem 3rem",
                fontSize: "1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                outline: "none",
                transition: "all 0.3s ease",
                backgroundColor: "#f8fafc",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.backgroundColor = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.backgroundColor = "#f8fafc";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.1rem",
              color: "#a0aec0"
            }}>
              🏠
            </div>
          </div>

          <button 
            type="submit"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            Update Location
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: "12px",
            fontSize: "0.95rem",
            fontWeight: "500",
            textAlign: "center",
            backgroundColor: message.includes('✅') ? '#f0fff4' : message.includes('❌') ? '#fff5f5' : '#fffbf0',
            color: message.includes('✅') ? '#38a169' : message.includes('❌') ? '#e53e3e' : '#d69e2e',
            border: `2px solid ${message.includes('✅') ? '#9ae6b4' : message.includes('❌') ? '#feb2b2' : '#f6e05e'}`,
            animation: "fadeIn 0.3s ease-in"
          }}>
            {message}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Location;