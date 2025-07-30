import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
const {signup}= useAuth();
  const signupReq = async ({ name, email, phoneno, password }) => {
    
    const response = await fetch("http://localhost:5000/api/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phoneno, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Signup failed");
    }
    const data = await response.json();

    localStorage.setItem("token", data.token); // Store the token
    console.log("Received token:", data.token); 
    return data;
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const phoneno = formData.get("phoneno");
    const password = formData.get("password");

    // ✅ Input validation
    if (!name || !email || !phoneno || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (phoneno.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Creating your account...", { id: "signup" });     

      // ✅ Create new user
      const data = await signupReq({ name, email, phoneno, password });
      signup(data.user);
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!", { id: "signup" });

      navigate("/cart"); // or home/dashboard
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Signup failed", { id: "signup" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <form onSubmit={handleSubmit} style={{
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sign Up</h2>

        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          style={inputStyle} 
          disabled={isLoading} 
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          style={inputStyle} 
          disabled={isLoading} 
          required 
        />
        <input 
          type="tel" 
          name="phoneno" 
          placeholder="Phone Number" 
          style={inputStyle} 
          disabled={isLoading} 
          required 
          minLength={10}
          maxLength={15}
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          style={inputStyle} 
          disabled={isLoading} 
          required 
          minLength={6} 
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px",
            marginTop: "16px",
            width: "100%",
            borderRadius: "8px",
            backgroundColor: isLoading ? "#ccc" : "#00ffff",
            fontWeight: "bold",
            fontSize: "16px",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease"
          }}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <p
          style={{ 
            textAlign: "center", 
            marginTop: "16px", 
            color: "#666", 
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
          onClick={() => !isLoading && navigate("/login")}
        >
          Already have an account?{" "}
          <span style={{ 
            color: "#00ffff", 
            textDecoration: "underline",
            pointerEvents: isLoading ? "none" : "auto"
          }}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;