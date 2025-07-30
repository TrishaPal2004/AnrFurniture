const adminMiddleware = (req, res, next) => {
  console.log("Checking admin middleware:");
  console.log("User info from JWT:", req.user);

  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.log("Here I am",req.user);
    console.log("Access denied. Not an admin.");
    res.status(403).json({ error: "Access denied. Admins only." });
  }
};
export default adminMiddleware;
