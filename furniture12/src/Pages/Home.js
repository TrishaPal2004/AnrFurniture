import React, { useEffect, useState } from "react";
import "./style.css";
import { Search, MessageCircleQuestion, Menu, X } from "lucide-react";
import MyCarousel from "../components/MyCarousel";
import Pdts from "./Pdts.js";
import { useAuth } from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [heroSections, setHeroSections] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {isLoggedIn,user,logout}=useAuth();
  useEffect(() => {
    // Fetch all hero sections on load - KEEPING YOUR ORIGINAL API CALL
    fetch("https://anrfurniture-2.onrender.com/api/hero")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch hero sections");
        return res.json();
      })
      .then((data) => setHeroSections(data))
      .catch((err) => console.error("Hero fetch error:", err));
  }, []);


const handleWhatsAppClick = () => {
  const phoneNumber = "918597766538";
  const message = encodeURIComponent(`Hi! I'm want a customised product!`);
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(url, '_blank');
};


   const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
     const encodedCategory = encodeURIComponent(category);
     console.log("Navigating to category:", encodedCategory);
    navigate(`/pdts/${encodedCategory}`);
  };
    

  const renderCarouselItem = (key, active = false) => {
    const data = heroSections[key];
    if (!data) return null;

    return (
      <div className={`carousel-item${active ? " active" : ""}`} key={key}>
        <img
          src={data.imageUrl || `./${key}.jpg`}
          className="d-block w-100"
          style={{ height: "87vh" }}
          alt={data.h1 || "Hero Section"}
        />
        <div
          className="carousel-caption d-none d-md-block"
          style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            textAlign: "left",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            paddingLeft: "15vh",
            width: "80vh"
          }}
        >
          <h5 style={{ fontSize: "1.2rem", marginBottom: "10px", fontWeight: "500" }}>{data.h5}</h5>
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              marginBottom: "20px",
              lineHeight: "1.1",
              fontFamily: "Bitter, serif",
            }}
          >
            {data.h1}
          </h1>
          <p
            style={{
              fontSize: "1.4rem",
              marginBottom: "30px",
              fontWeight: "600",
              maxWidth: "500px",
              textShadow: "1px 1px 2px black",
            }}
          >
            {data.p}
          </p>
          <button
            style={{
              backgroundColor: "rgb(190, 147, 46)",
              color: "white",
              padding: "12px 30px",
              border: "none",
              borderRadius: "5px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
              zIndex: 24,
            }}
            onClick={()=>{handleCategoryClick("New Arrival")}}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "rgb(170, 127, 26)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "rgb(190, 147, 46)";
              e.target.style.transform = "scale(1)";
            }}
          >
            {data.buttonText || "Explore More"}
          </button>
        </div>
        
        {/* Mobile Caption */}
        <div
          className="d-block d-md-none"
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            right: "5%",
            textAlign: "center",
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h5 style={{ fontSize: "0.9rem", marginBottom: "8px", fontWeight: "500" }}>{data.h5}</h5>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "15px",
              lineHeight: "1.2",
              fontFamily: "Bitter, serif",
            }}
          >
            {data.h1}
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              marginBottom: "20px",
              fontWeight: "500",
            }}
          >
            {data.p}
          </p>
          <button
            style={{
              backgroundColor: "rgb(190, 147, 46)",
              color: "white",
              padding: "10px 25px",
              border: "none",
              borderRadius: "5px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: "pointer",
             z:"12"
            }}
            onClick={() => handleCategoryClick("New Arrival")}
          >
            {data.buttonText || "Explore More"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fit">
      {/* Header Section - Made Responsive */}
      <div style={{
      paddingTop: isMobile ? "1vh" : "1.5vh",
      backgroundColor: "rgb(190, 147, 46)",
      height: isMobile ? "5vh" : "10vh",
      minHeight: isMobile ? "12vh" : "10vh",
      display: "flex",
      paddingLeft: isMobile ? "1vw" : "2vw",
      paddingRight: isMobile ? "15vw" : "2vw",
      paddingBottom: isMobile ? "1vh" : "0",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "center" : "flex-start",
      justifyContent: isMobile ? "center" : "flex-start",
      textAlign: isMobile ? "center" : "left",
      flexWrap: "wrap",
      position: "relative"
    }}>
      
      {/* Logo */}
      <img
        src="./logo.jpeg"
        alt="Logo"
        style={{
          height: isMobile ? "10vh" : "18vh",
          borderRadius: "50%",
          width: isMobile ? "10vh" : "18vh",
          border: "0.01vh solid black",
          boxShadow: "8px 8px 0 rgba(0, 0, 0)",
          zIndex: "5",
          minHeight: isMobile ? "60px" : "80px",
          minWidth: isMobile ? "60px" : "60px",
          marginBottom: isMobile ? "1vh" : "0",
          alignSelf: isMobile ? "center" : "flex-start"
        }}
      />

      {/* Desktop Promo Text */}
      {!isMobile && (
        <div style={{
          display: "flex",
          paddingRight: "10%",
          paddingLeft: "10%",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
          flex: 1
        }}>
          <p style={{
            color: "white",
            fontSize: "1.2rem",
            textAlign: "center",
            fontWeight: "bold",
            textShadow: "2px 2px 4px black",
            zIndex: 10,
            margin: "0 0.5rem 0 0"
          }}>
            Use Code EXTRA5000 to get additional 5000 off!
          </p>
          <p style={{
            color: "Black",
            fontSize: "1.2rem",
            fontWeight: "bold",
            textShadow: "0.1px 0.1px 0.4px black",
            paddingLeft: "0.2vw",
            margin: "0"
          }}>
            Shop Now!
          </p>
        </div>
      )}

      {/* Mobile Promo Text */}
      {isMobile && (
        <div style={{
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <p style={{
            color: "white",
            fontSize: "0.85rem",
            fontWeight: "bold",
            margin: "0",
            textShadow: "1px 1px 2px black",
            lineHeight: "1.2"
          }}>
            Use Code EXTRA5000 for 5000 off!
          </p>
          <p style={{
            color: "Black",
            fontSize: "0.85rem",
            fontWeight: "bold",
            margin: "0",
            textShadow: "0.5px 0.5px 1px black",
            lineHeight: "1.2"
          }}>
            Shop Now!
          </p>
        </div>
      )}
    </div>
      {/* Carousel Section */}
      <div id="carouselExample" className="carousel slide position-relative" data-bs-ride="carousel">
        {/* Nav Controls - Desktop Only */}
        {!isMobile && (<div className="position-absolute translate-middle d-none d-lg-flex" role="search" style={{
          zIndex: 4,
          background: "transparent",
          color: "black",
          padding: "10px",
          borderRadius: "10px",
          marginLeft: "55vw",
          marginTop: "5vh",
          justifyContent: "space-between",
        }}>
          <button onClick={()=>navigate("/search")}>
          <div className="custom-search-bar" >
            <input type="text" placeholder="Search..." className="search-input" />
            <button className="search-icon" style={{ background: "transparent" }} >
              <Search size={20} style={{ background: "transparent" }} />
            </button>
          </div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "3vw", marginLeft: "4vw", color: "white", width: "100%", fontSize: "1.2rem" }}>
            <button style={{ fontWeight: "bold", textShadow: "2px 4px 4px black", cursor: "pointer" }} onClick={()=>navigate('/track')}>Track Order</button>
            <span style={{ fontWeight: "bold", textShadow: "2px 4px 4px black", cursor: "pointer" }} onClick={()=>{handleCategoryClick("Bulk Order")}}>Bulk Orders</span>
            <span style={{ fontWeight: "bold", textShadow: "2px 4px 4px black", cursor: "pointer" }} onClick={()=>{handleCategoryClick("UI Services")}}>UI Services</span>
{!isLoggedIn ? (
  <span
    style={{
      fontWeight: "bold",
      textShadow: "2px 4px 4px black",
      cursor: "pointer"
    }}
    onClick={() => navigate("/signup")}
  >
    Signup
  </span>
) : (
  <span
    style={{
      fontWeight: "bold",
      textShadow: "2px 4px 4px black",
      cursor: "pointer"
    }}
    onClick={logout}
  >
    Logout
  </span>
)}
            <button style={{ background: "transparent", border: "none", outline: "none", paddingLeft: "5vh", color: "white", cursor: "pointer" }} onClick={handleWhatsAppClick}>
              <MessageCircleQuestion size={22} />
            </button>
          </div>
        </div>)}

      {/* //Mobile */}

{isMobile && (<div
  className="position-absolute translate-middle d-flex flex-column flex-lg-row"
  role="search"
  style={{
    marginTop:"5vh",
    zIndex: 4,
    background: "transparent",
    color: "black",
    padding: "10px",
    borderRadius: "10px",
    left: "50%",
    top: "5vh",
    transform: "translate(-50%, 0)",
    width: "95vw",
    maxWidth: "1000px",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() => navigate("/search")}
    style={{ width: "100%", maxWidth: "300px", background: "transparent", border: "none", padding: 0 }}
  >
    <div className="custom-search-bar" style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <input
        type="text"
        placeholder="Search..."
        className="search-input"
        style={{
          flex: 1,
          padding: "8px 12px",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px 0 0 4px",
          width: "100%",
        }}
      />
      <button
        className="search-icon"
        style={{
          background: "transparent",
          border: "1px solid #ccc",
          borderLeft: "none",
          borderRadius: "0 4px 4px 0",
          padding: "8px",
          cursor: "pointer",
        }}
      >
        <Search size={20} />
      </button>
    </div>
  </button>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      color: "white",
      fontSize: "1.1rem",
      marginTop: "10px",
    }}
    className="flex-lg-row flex-column justify-content-lg-between align-items-lg-center w-100"
  >
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px", textAlign: "center" }}>
      <button
        style={{
          fontWeight: "bold",
          textShadow: "2px 4px 4px black",
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => navigate("/track")}
      >
        Track Order
      </button>

      <span
        style={{
          fontWeight: "bold",
          textShadow: "2px 4px 4px black",
          cursor: "pointer",
        }}
        onClick={() => handleCategoryClick("Bulk Order")}
      >
        Bulk Orders
      </span>

      <span
        style={{
          fontWeight: "bold",
          textShadow: "2px 4px 4px black",
          cursor: "pointer",
        }}
      >
        UI Services
      </span>

      {!isLoggedIn ? (
        <span
          style={{
            fontWeight: "bold",
            textShadow: "2px 4px 4px black",
            cursor: "pointer",
          }}
          onClick={() => navigate("/signup")}
        >
          Signup
        </span>
      ) : (
        <span
          style={{
            fontWeight: "bold",
            textShadow: "2px 4px 4px black",
            cursor: "pointer",
          }}
          onClick={logout}
        >
          Logout
        </span>
      )}

      <button
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "white",
          cursor: "pointer",
        }}
      >
        <MessageCircleQuestion size={22} />
      </button>
    </div>
  </div>
</div>)}

        {/* Carousel Indicators */}
        <div className="carousel-indicators" data-bs-interval="4000">
          {Object.keys(heroSections).map((_, i) => (
            <button
              key={i}
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to={i}          
              className={i === 0 ? "active" : ""}
              aria-label={`Slide ${i + 1}`}
            ></button>
          ))}
        </div>

        {/* Carousel Items */}
        <div className="carousel-inner">
          {renderCarouselItem("hero1", true)}
          {renderCarouselItem("hero2")}
          {renderCarouselItem("hero3")}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" style={{ filter: "invert(1)" }}></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" style={{ filter: "invert(1)" }}></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Furniture Categories Section - Made Responsive */}
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: "bold",
          textShadow: "2px 2px 4px black",
          textAlign: "center",
          paddingTop: "5vh",
          paddingBottom: "5vh",
        }}
      >
        <h1  style={{
          fontSize: window.innerWidth < 768 ? "2rem" : "3rem", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "3vh",
          lineHeight: "1.3",
          fontFamily: "Dancing Script, cursive",
          zIndex: 2,
          position: "relative",
          color:"white",
          backgroundClip: "text"}}>Explore our new Furniture Range!</h1>
        <div
          style={{
            backgroundColor: "rgb(190, 147, 46)",
            height: "1vh",
            width: "min(20vw, 200px)",
            borderRadius: "50px",
            margin: "30px auto",
            boxShadow: "0 0 10px rgba(190, 147, 46, 0.5)",
          }}
        ></div>

        {/* Circle Sections - Row 1 - Made Responsive */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "3vh",
            padding: "2vh 2vw",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          {[
            { label: "New Arrival", image: "./new.jpg" },
            { label: "Sofa", image: "./sof.jpg" },
            { label: "Sofa Cum Bed", image: "./sofac.jpg" },
            { label: "Beds", image: "./beds.jpg" },
            { label: "Dining", image: "./table.jpg" },
            { label: "Wardrobes", image: "./wardrobe1.jpeg" },
            { label: "Chairs", image: "./chair1.jpg" },
            { label: "Tea Tables", image: "./tea.jpg" },
            { label: "TV Units", image: "./TVs.jpg" },
            { label: "Bookshelves", image: "./books.jpg" },
            { label: "Shoe Racks", image: "./shoes.jpg" },
            { label: "Deal Zone", image: "./images.jpg" },
          ].map(({ label, image }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => handleCategoryClick(label)

              }
            >
              <div
                style={{
                  backgroundColor: "rgb(190,147,46)",
                  border: "0.1rem solid black",
                  borderRadius: "50%",
                  height: "min(15vh, 120px)",
                  width: "min(15vh, 120px)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(190, 147, 46, 0.3)",
                }}
              >
                <img
                  src={image}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                 
                />
              </div>
             
              <p style={{ paddingTop: "1vh", fontSize: "0.9rem", textAlign: "center" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
         
      {/* Terra Collection Section - Made Responsive */}
      <div>
      <div style={{
        backgroundColor: "rgb(0, 10, 0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2vh 2rem",
        fontFamily: "Bitter, serif",
        width:"100vw",
        //flexDirection: window.innerWidth < 768 ? "column" : "row"
      }}>
        {/* Left Image - Hidden on mobile */}
        <img 
          src="./doorl.png" 
          style={{ 
            width: window.innerWidth < 768 ? "20vw" : "70vh",
            height: window.innerWidth < 768 ? "98vw" : "70vh",
            //display: window.innerWidth < 768 ? "none" : "block"
          }} 
          alt="left" 
        />

        {/* Center Content */}
        <div style={{
          width: window.innerWidth < 768 ? "90vw" : "70vw",
          color: "white",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2vh"
        }}>
          <div style={{ 
            maxWidth: window.innerWidth < 768 ? "70vw" : "68vw", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
          }}>
            <h1  style={{
          color: "white", 
          fontSize: window.innerWidth < 768 ? "2rem" : "3rem", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "3vh",
          lineHeight: "1.3",
          fontFamily: "Dancing Script, cursive",
          zIndex: 2,
          position: "relative",
          background: "linear-gradient(45deg, #fff, #be932e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
            }}>
              Presenting The New Terra Collection
            </h1>
            <p style={{ 
              fontSize: window.innerWidth < 768 ? "1rem" : "1.5rem", 
              lineHeight: "1.6", 
              marginBottom: "2rem" ,
              fontFamily:"Dancing Script,cursive"
            }}>
              Rooted in nature's gentle rhythm, Terra encourages you to pause and embrace calm.
              Thoughtfully crafted, every item welcomes you with its natural charm, rich textures,
              and the understated beauty of genuine artistry—reflecting the enduring harmony
              between design and the natural world.
            </p>
            <button
              style={{
                backgroundColor: "rgb(190, 147, 46)",
                color: "white",
                padding: "5px 5px",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(190, 147, 46, 0.3)"
              }}
              onClick={() => handleCategoryClick("UI Services")}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "rgb(210, 167, 66)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "rgb(190, 147, 46)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Discover Terra
            </button>
          </div>
        </div>

       
        <img 
          src="./doorr.png" 
          style={{ 
            width: window.innerWidth < 768 ? "22vw" : "70vh",
            height: window.innerWidth < 768 ? "97.5vw" : "70vh",
            //display: window.innerWidth < 768 ? "none" : "block"
          }} 
          alt="right" 
        />
      </div>
      </div>

      {/* Featured Collection Section - Made Responsive */}
      <div style={{
        minHeight: "20vw", 
        backgroundColor: "black", 
        alignItems: "center", 
        fontFamily: "Bitter, serif",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        textAlign:"center",
        padding: "5vh 2vw"
      }}>
        <h1  style={{
          color: "white", 
          fontSize: window.innerWidth < 768 ? "2rem" : "3rem", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "3vh",
          lineHeight: "1.3",
          fontFamily: "Dancing Script, cursive",
          zIndex: 2,
          position: "relative",
          background: "linear-gradient(45deg, #fff, #be932e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Discover the Art of Living with Our Exclusive Terra Collection
        </h1>
        <img 
          src="./furn.jpg" 
          style={{
            height: window.innerWidth < 768 ? "50vw" : "50vw",
            width:"100%",
            //objectFit: "cover",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
          alt="Terra Collection"
        />
        <button style={{
          backgroundColor: "rgb(190, 147, 46)",
          color: "white",
          padding: "12px 30px",
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "2rem",
          marginBottom: "2rem",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(190, 147, 46, 0.3)"
        }}
        onClick={() => handleCategoryClick("New Arrival")}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "rgb(210, 167, 66)";
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "rgb(190, 147, 46)";
          e.target.style.transform = "scale(1)";
        }}>
          Explore More
        </button>
      </div>

      {/* Room Categories Section - Made Responsive */}
      <div style={{
        backgroundColor:"black",
        padding: window.innerWidth < 768 ? "5vh 2vw" : "12vh",
        display:"grid",
        gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "4vh",
        justifyItems: "center",
        alignItems: "center"
      }}>
        {[
          { name: "Bedroom", image: "./bedroom.jpeg",n:"Beds" },
          { name: "Living Room", image: "./living.jpg",n:"New Arrival" },
          { name: "Dining Room", image: "./dine.jpeg",n:"Dining" }
        ].map(({ name, image ,n}) => (
          <div 
            key={name}
            className="card" 
            style={{
              width: "100%",
              maxWidth: "25rem",
              background:"transparent",
              cursor: "pointer",
              transition: "transform 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img 
              src={image} 
              className="card-img-top" 
              alt={name}
              style={{
                height: window.innerWidth < 768 ? "25vh" : "35vh",
                width:"100%",
                objectFit: "cover",
                borderRadius: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)"
              }}
            />
            <div className="card-body" style={{textAlign: "center",background:"transparent", padding: "2vh 0"}}>
              <p className="card-text" style={{color:"white", fontSize: "1.2rem", fontWeight: "500"}}>{name}</p>
              <button
                style={{
                  backgroundColor: "rgb(190, 147, 46)",
                  color: "white",
                  padding: "1vh 2vh",
                  border: "none",
                  borderRadius: "2vh",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginTop:"2vh",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(190, 147, 46, 0.3)"
                }}
                onClick={() => handleCategoryClick(n)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "rgb(210, 167, 66)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "rgb(190, 147, 46)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Explore More
              </button>
            </div>
          </div>
        ))}
      </div>
      <div id="multiItemCarousel" className="carousel slide" data-bs-ride="carousel" style={{height:window.innerWidth<786?"90vw":"40vw",backgroundColor: "black",width:"99vw",alignItems: "center", justifyContent: "center",textAlign:"center",dispaly:"flex",flexDirection:"column"}}>
        <h1 style={{color: "white", 
          fontSize: window.innerWidth < 768 ? "2.4rem" : "5rem", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "3vh",
          lineHeight: "1.3",
          fontFamily: "Dancing Script, cursive",
          zIndex: 2,
          position: "relative",
          background: "linear-gradient(45deg, #fff, #be932e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"}}>Our Products</h1>
  <div className="carousel-inner" style={{width:window.innerWidth<786?"110vw":"100vw"}}>

    {/* Slide 1 */}
    <div className="carousel-item active" >
      <div className="d-flex justify-content-center" style={{ gap:window.innerWidth<786? "1vw":"4vw" }}>
        <button onClick={() => navigate('/pdts/Chair')}><img src="./chair.jpg" className="d-block" style={{ width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw" }} /></button>
        <div onClick={() => navigate('/pdts/Wardrobes')}><img src="./wardrobe.jpeg" className="d-block" style={{  width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw"}} /></div>
        <div onClick={() => navigate('/pdts/Beds')}><img src="./Bed1.jpeg" className="d-block" style={{  width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw" }} /></div>
      </div>
    </div>

    {/* Slide 2 */}
    <div className="carousel-item"  style={{width:"100vw"}}>
      <div className="d-flex justify-content-center gap-1" >
        <div onClick={() => navigate('/pdts/Dining')}><img src="./lights.jpg" className="d-block" style={{  width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw"}} /></div>
        <div onClick={() => navigate('/pdts/Sofa')}><img src="./so.jpg" className="d-block" style={{ width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw"}} /></div>
        <div onClick={() => navigate('/pdts/Beds')}><img src="./hero3.jpg" className="d-block" style={{  width: window.innerWidth<786?"40vw":"20vw", height:window.innerWidth<786?"50vw":"30vw"}} /></div>
      </div>
    </div>

    {/* Add more slides as needed */}
  </div>

  {/* Controls */}
  <button className="carousel-control-prev" type="button" data-bs-target="#multiItemCarousel" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#multiItemCarousel" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
</div>
     <div style={{height:window.innerWidth<786?"124vw":"70vw", backgroundColor: "black",justifyContent: "center", textAlign:"center",display:"flex",flexDirection:"column"}}>
       <h1  style={{color: "white", 
          fontSize: window.innerWidth < 768 ? "2.4rem" : "5rem", 
          fontWeight: "bold", 
          textAlign: "center",
          marginBottom: "3vh",
          lineHeight: "1.3",
          fontFamily: "Dancing Script, cursive",
          zIndex: 2,
          position: "relative",
          background: "linear-gradient(45deg, #fff, #be932e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"}} >Comfort Rooted in Every Style !</h1>
      <div id="carouselExample1" className="carousel slide" >
  <div className="carousel-inner" >
    <div className="carousel-item active" >
      <img src="./cus.jpg" className="d-block w-100" alt="..." style={{height:window.innerWidth<786?"64vw":"35vw"}}/>
    </div>
    <div className="carousel-item">
      <img src="./cus21.jpg" className="d-block w-100" alt="..." style={{height:window.innerWidth<786?"64vw":"35vw"}}/>
    </div>
    <div className="carousel-item">
      <img src="./cus3.jpg" className="d-block w-100" alt="..." style={{height:window.innerWidth<786?"64vw":"35vw"}}/>
    </div>
  </div>
  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample1" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#carouselExample1" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
</div>
<button style={{height:"5.6vh",width:"48%",fontWeight:"800" ,backgroundColor:"rgb(190,147,46)",color:"white",border:"2px solid black",borderRadius:"12px",marginLeft:"25vw",marginTop:"5%"}}   onClick={handleWhatsAppClick}>For Customized Work Contact Us !</button>
      </div>  
      <MyCarousel/> 
    </div>
  );
};

export default Home;