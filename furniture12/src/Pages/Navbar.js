import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
 const navigate=useNavigate();
  return (
    <div
      style={{
        padding: "10px 20px",
        backgroundColor: "white",
        display: "flex",
        width:"100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0,color:"black" }}>Anr Furniture</h2>
      
      {isLoggedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" ,color:"black"}}>
          <span>👋 Welcome, {user?.name || "User"}!</span>
          <button
            onClick={logout}
            style={{
              padding: "5px 10px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <a
          href="/login"
          style={{
            color: "#3498db",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Login
        </a>
      )}
    </div>
  );
};

export default Navbar;
