import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      if (response.ok) {
        login(data.user, data.token);
      }

      toast.success('Login successful!');
      if (data.user.role === "admin") {
        navigate("/hero");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <form onSubmit={handleLogin} style={{
        padding: '30px',
        boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        backgroundColor: '#fff',
        width: '400px',
        maxWidth: '90vw',
      }}>
        <h2 style={{
          textAlign: 'center',
          paddingBottom: '20px',
          color: '#333',
        }}>Log in</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          style={{
            padding: '12px',
            margin: '10px 0',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          style={{
            padding: '12px',
            margin: '10px 0',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
            width: '100%',
            boxSizing: 'border-box',
          }}
          required
          minLength={6}
        />

        <button type="submit" disabled={isLoading} style={{
          padding: '12px',
          marginTop: '16px',
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#00ffff',
          color: 'black',
          fontWeight: 'bold',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
        }}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            color: "#666",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
          onClick={() => !isLoading && navigate("/signup")}
        >
          New User ?{" "}
          <span style={{
            color: "#00ffff",
            textDecoration: "underline",
            pointerEvents: isLoading ? "none" : "auto"
          }}>
            Signup 
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
