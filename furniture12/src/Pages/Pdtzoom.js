import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const Pdtzoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://anrfurniture-2.onrender.com/api/pdt/hi/${id}`);
        const data = await res.json();
        setProduct(data);
        setCurrentImage(data?.images?.[0]);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <p style={{ textAlign: "center", marginTop: "2.5rem" }}>
        Loading...
      </p>
    );
  }

  return (
    <div style={{
      padding: "1rem",
      margin: "auto",
      backgroundColor: "#f3f4f6",
      width: "100vw",
      borderRadius: "12px"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem"
      }}>
        <h1 style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          margin: 0,
          color: "#111827"
        }}>{product.name}</h1>

        <ShoppingCart
          onClick={() => navigate("/cart")}
          size={28}
          style={{
            cursor: "pointer",
            backgroundColor: "#10b981",
            padding: "0.5rem",
            borderRadius: "8px",
            color: "white"
          }}
        />
      </div>

      {/* Image Section */}
      <div style={{
        display: isMobile ? "block" : "flex",
        gap: "2rem",
        alignItems: "flex-start"
      }}>
        {/* Thumbnails */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: "0.5rem",
          marginBottom: isMobile ? "1rem" : 0,
          overflowX: isMobile ? "auto" : "visible",
          width: isMobile ? "100%" : "100px"
        }}>
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Thumbnail ${idx}`}
              onClick={() => setCurrentImage(img)}
              style={{
                cursor: "pointer",
                width: isMobile ? "80px" : "100%",
                height: "80px",
                objectFit: "cover",
                border: currentImage === img ? "2px solid #2563eb" : "1px solid #d1d5db",
                borderRadius: "6px"
              }}
            />
          ))}
        </div>

        {/* Main Image */}
        <div style={{ flex: 1 }}>
          <img
            src={currentImage}
            alt="Selected"
            style={{
              width: "100%",
              maxHeight: "450px",
              borderRadius: "12px",
              objectFit: "contain",
              backgroundColor: "white",
              padding: "1rem"
            }}
          />
        </div>
      </div>

      {/* Product Details */}
      <div style={{
        marginTop: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        color: "#1f2937"
      }}>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>Material:</strong> {product.material}</p>
        <p><strong>Size:</strong> {product.size}</p>
        <p><strong>Price:</strong> ₹{product.price}</p>
        <p><strong>Date:</strong> {new Date(product.date).toLocaleDateString()}</p>

        {/* Buttons */}
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "1rem"
            }}
          >
            Go Back
          </button>

          <button
            onClick={() => navigate(`/pdts/${product.category}`)}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
          >
            More in {product.category}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pdtzoom;
