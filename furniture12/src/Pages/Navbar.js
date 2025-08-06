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
        background: "transparent",
        display: "flex",
        width:"100%",
        justifyContent: "space-between",
        alignItems: "center",
      }}
     
    >
 <img
          src= "/logo.jpeg"
          style={{ height: "4vw",backgroundRadius:"5px" }}  onClick={()=>{navigate("/")}}
        />
      
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
          {user?.role === "admin" && (
  <button style={{ marginLeft: "8px", color: "orange" ,zIndex:"12"}} onClick={()=>navigate("/hero")}>Admin</button>
)}
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
