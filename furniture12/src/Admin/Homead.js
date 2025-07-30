import React, { useState, useCallback } from "react";
import HeroAdminPanel from "./HeroAdminPanel";
import UploadSection from "./UploadSection";
import Order1 from "./Order1"; 
import Userlog from "./Userlog";
import Navbar from "../Pages/Navbar";
import Productslog from "./Productslog.js"
const Homead = () => {
  const [activeSection, setActiveSection] = useState("hero");

  const sidebarItems = [
    { id: "hero", label: "Hero", icon: "🏠" },
    { id: "upload", label: "Upload New Items", icon: "📤" },
    { id: "orders", label: "Orders", icon: "📦" },
    {id:  "users", label: "Users" , icon:"🙎‍♂️"},
    {id: "products",label:"Products",icon:"✨"}
  ];

 

 

  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#333",
    },
    sidebar: {
      width: "280px",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderRight: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
    },
    sidebarHeader: {
      padding: "30px 25px",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
      color: "white",
    },
    sidebarTitle: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "5px",
      margin: 0,
    },
    sidebarSubtitle: {
      opacity: 0.9,
      fontSize: "14px",
      margin: 0,
    },
    sidebarNav: {
      padding: "20px 0",
      flex: 1,
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      padding: "15px 25px",
      margin: "5px 15px",
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
      transform: "translateX(5px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },
    navIcon: {
      fontSize: "20px",
      marginRight: "15px",
      width: "24px",
      textAlign: "center",
    },
    mainContent: {
      flex: 1,
      padding: "40px",
      overflowY: "auto",
    },
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
      marginBottom: "10px",
      margin: "0 0 10px 0",
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
    formGroup: {
      marginBottom: "25px",
    },
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
    orderTable: {
      width: "100%",
      borderCollapse: "collapse",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "15px",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
    },
    tableHeaderCell: {
      padding: "15px 20px",
      textAlign: "left",
      fontWeight: "600",
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    tableCell: {
      padding: "15px 20px",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
    },
    statusBadge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
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
  };

  const NavItem = ({ item, isActive, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={{
          ...styles.navItem,
          ...(isActive ? styles.navItemActive : {}),
          ...(isHovered && !isActive ? styles.navItemHover : {}),
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={styles.navIcon}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    );
  };

  const HeroSection = () => <HeroAdminPanel />;


  const OrderSection =()=><Order1/>;

  // Optimized image change handler
  
 const Productslog1 =()=><Productslog/>;


  const renderContent = () => {
    switch (activeSection) {
      case "hero":
        return <HeroSection />;
      case "upload":
        return  <UploadSection/>;
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
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
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

      <main style={styles.mainContent}>{renderContent()}</main>
    </div>
    </div>
  );
};

export default Homead;