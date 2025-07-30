import React from "react";

const ContactSection = () => {
  const isMobile = window.innerWidth < 768;

  const containerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "40px",
    backgroundColor: "black",
    gap: "30px",
    flexWrap: "wrap",
  };

  const leftStyle = {
    flex: 1,
    textAlign: isMobile ? "center" : "left",
  };

  const logoStyle = {
    width: isMobile ? "120px" : "150px",
    height: "auto",
    marginBottom: "20px",
  };

  const headingStyle = {
    fontSize: isMobile ? "1.8rem" : "2.5rem",
    color:"white",
    fontWeight: "bold",
    marginBottom: "20px",
    lineHeight: "1.4",
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  };

  const rightStyle = {
    flex: 1,
    display: "flex",
    justifyContent: isMobile ? "center" : "flex-end",
  };

  const videoFrameStyle = {
    width: isMobile ? "100%" : "90%",
    maxWidth: "600px",
    border: "4px solid #ddd",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const videoStyle = {
    width: "100%",
    height: isMobile ? "200px" : "340px",
    objectFit: "cover",
  };

  return (
    <div style={containerStyle}>
      {/* Left: Logo + Text + Button */}
      <div style={leftStyle}>
        <img src="./logo.jpeg" alt="Logo" style={logoStyle} />
        <h1 style={headingStyle}>
          Let us help you<br />
          make <em>the</em> move
        </h1>
        <button style={buttonStyle}>CONTACT US</button>
      </div>

      {/* Right: Framed Video */}
      <div style={rightStyle}>
        <div style={videoFrameStyle}>
          <video
            src="./video.mp4"
            controls
            style={videoStyle}
            poster="./tt.jpg"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
