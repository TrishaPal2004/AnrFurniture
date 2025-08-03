import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.js';
import HeroAdminPanel from './Admin/HeroAdminPanel.js';
import './index.css'; // or './App.css' wherever you added @tailwind
import Homead from './Admin/Homead.js';
import Pdts from './Pages/Pdts.js';
import Pdtzoom from './Pages/Pdtzoom.js';
import AddtoCart from './Pages/AddtoCart.js';
import Signup from './Pages/Signup.js';
import Login from './Pages/Login.js';
import { AuthProvider } from './context/AuthContext.js';
import Navbar from './Pages/Navbar.js';
import Order1 from './Admin/Order1.js';
import TrackOrder from './Pages/TrackOrder.js';
import Productslog from './Admin/Productslog.js';
import Searchbar from './Pages/Searchbar.js'
import ForgotPassword from './Pages/ForgotPassword.js';
const App = () => {
  return (
    <AuthProvider>
     
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<HeroAdminPanel />} />
            <Route path="/hero" element={<Homead />} />
            <Route path="/pdts/:category" element={<Pdts />} />
            <Route path="/zoom/:id" element={<Pdtzoom />} />
            <Route path="/cart" element={<AddtoCart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/order" element={<Order1 />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/pdtlog" element={<Productslog/>}/>
            <Route path="/search" element={<Searchbar/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
          </Routes>
        </BrowserRouter>
    
    </AuthProvider>
  );
};

export default App;
