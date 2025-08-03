import React, { useState, useCallback, useEffect } from "react";
import HeroAdminPanel from "./HeroAdminPanel";
import UploadSection from "./UploadSection";
import Order1 from "./Order1"; 
import Userlog from "./Userlog";
import Navbar from "../Pages/Navbar";
import Productslog from "./Productslog.js"

const Homead = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { id: "hero", label: "Hero", icon: "🏠" },
    { id: "upload", label: "Upload New Items", icon: "📤" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "users", label: "Users", icon: "🙎‍♂️" },
    { id: "products", label: "Products", icon: "✨" },
  ];

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#333",
      position: "relative",
    },
    
    // Mobile hamburger button
    mobileMenuButton: {
      display: isMobile ? "block" : "none",
      position: "fixed",
      top: "20px",
      left: "20px",
      zIndex: 1001,
      background: "rgba(255, 255, 255, 0.95)",
      border: "none",
      borderRadius: "8px",
      padding: "12px",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      fontSize: "18px",
    },

    // Overlay for mobile
    overlay: {
      display: isMobile && sidebarOpen ? "block" : "none",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },

    sidebar: {
      width: isMobile ? "100%" : "280px",
      maxWidth: isMobile ? "300px" : "280px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      position: isMobile ? "fixed" : "static",
      top: 0,
      left: isMobile ? (sidebarOpen ? "0" : "-100%") : "0",
      height: isMobile ? "100vh" : "auto",
      zIndex: 1000,
      transition: "left 0.3s ease",
    },

    sidebarHeader: {
      padding: isMobile ? "25px 20px" : "30px 25px",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
      color: "white",
      position: "relative",
    },

    // Close button for mobile
    closeButton: {
      display: isMobile ? "block" : "none",
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      cursor: "pointer",
      fontSize: "16px",
      color: "white",
    },

    sidebarTitle: {
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: "700",
      marginBottom: "5px",
      margin: 0,
    },

    sidebarSubtitle: {
      opacity: 0.9,
      fontSize: isMobile ? "12px" : "14px",
      margin: 0,
    },

    sidebarNav: {
      padding: "20px 0",
      flex: 1,
      overflowY: "auto",
    },

    navItem: {
      display: "flex",
      alignItems: "center",
      padding: isMobile ? "12px 20px" : "15px 25px",
      margin: isMobile ? "3px 10px" : "5px 15px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },

    navItemActive: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },

    navItemHover: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      transform: isMobile ? "none" : "translateX(5px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },

    navIcon: {
      fontSize: isMobile ? "18px" : "20px",
      marginRight: isMobile ? "12px" : "15px",
      width: "24px",
      textAlign: "center",
    },

    mainContent: {
      flex: 1,
      padding: isMobile ? "20px 15px" : "40px",
      overflowY: "auto",
      marginLeft: isMobile ? "0" : "0",
      minHeight: "100vh",
    },

    sectionHeader: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      padding: isMobile ? "20px 15px" : "30px",
      borderRadius: isMobile ? "15px" : "20px",
      marginBottom: isMobile ? "20px" : "30px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },

    sectionTitle: {
      fontSize: isMobile ? "24px" : "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "10px",
      margin: "0 0 10px 0",
    },

    sectionDescription: {
      color: "#666",
      fontSize: isMobile ? "14px" : "16px",
      margin: 0,
    },

    formContainer: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      padding: isMobile ? "20px 15px" : "30px",
      borderRadius: isMobile ? "15px" : "20px",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxSizing: "border-box",
    },

    formGroup: {
      marginBottom: isMobile ? "20px" : "25px",
    },

    formLabel: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#333",
      fontSize: isMobile ? "14px" : "16px",
    },

    formInput: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 16px",
      border: "2px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "10px",
      fontSize: isMobile ? "14px" : "16px",
      transition: "all 0.3s ease",
      background: "rgba(255, 255, 255, 0.8)",
      outline: "none",
      boxSizing: "border-box",
    },

    formTextarea: {
      width: "100%",
      padding: isMobile ? "10px 12px" : "12px 16px",
      border: "2px solid rgba(0, 0, 0, 0.1)",
      borderRadius: "10px",
      fontSize: isMobile ? "14px" : "16px",
      minHeight: isMobile ? "100px" : "120px",
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
      padding: isMobile ? "12px 24px" : "15px 30px",
      borderRadius: "10px",
      fontSize: isMobile ? "14px" : "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
      width: isMobile ? "100%" : "auto",
    },

    orderTable: {
      width: "100%",
      borderCollapse: "collapse",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "15px",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
      fontSize: isMobile ? "12px" : "14px",
    },

    tableHeader: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
    },

    tableHeaderCell: {
      padding: isMobile ? "10px 8px" : "15px 20px",
      textAlign: "left",
      fontWeight: "600",
      fontSize: isMobile ? "11px" : "14px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },

    tableCell: {
      padding: isMobile ? "10px 8px" : "15px 20px",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      fontSize: isMobile ? "12px" : "14px",
    },

    statusBadge: {
      padding: isMobile ? "4px 8px" : "6px 12px",
      borderRadius: "20px",
      fontSize: isMobile ? "10px" : "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "inline-block",
    },

    statusPending: {
      background: "#fff3cd",
      color: "#856404",
    },

    statusShipped: {
      background: "#d1ecf1",
      color: "#0c5460",
    },

    statusDelivered: {
      background: "#d4edda",
      color: "#155724",
    },

    // Responsive table wrapper
    tableWrapper: {
      overflowX: isMobile ? "auto" : "visible",
      WebkitOverflowScrolling: "touch",
    },
  };

  const NavItem = ({ item, isActive, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
      onClick();
      if (isMobile) {
        setSidebarOpen(false);
      }
    };

    return (
      <div
        style={{
          ...styles.navItem,
          ...(isActive ? styles.navItemActive : {}),
          ...(isHovered && !isActive ? styles.navItemHover : {}),
        }}
        onClick={handleClick}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <span style={styles.navIcon}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    );
  };

  const HeroSection = () => <HeroAdminPanel />;
  const OrderSection = () => <Order1/>;
  const Productslog1 = () => <Productslog/>;

  const renderContent = () => {
    switch (activeSection) {
      case "hero":
        return <HeroSection />;
      case "upload":
        return <UploadSection/>;
      case "orders":
        return <OrderSection/>;
      case "users":
        return <Userlog/>
      case "products":
        return <Productslog1/> 
      default:
        return <HeroSection />;
    }
  };

  return (
    <div>
      <Navbar/>
      
      {/* Mobile menu button */}
      <button 
        style={styles.mobileMenuButton}
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Mobile overlay */}
      <div 
        style={styles.overlay}
        onClick={() => setSidebarOpen(false)}
      />

      <div style={styles.container}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <button 
              style={styles.closeButton}
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
            <h1 style={styles.sidebarTitle}>Admin Panel</h1>
            <p style={styles.sidebarSubtitle}>Management Dashboard</p>
          </div>

          <nav style={styles.sidebarNav}>
            {sidebarItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
              />
            ))}
          </nav>
        </div>

        <main style={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Homead;