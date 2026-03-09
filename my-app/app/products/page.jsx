"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Button,
  InputBase,
  Skeleton,
  Chip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import StarIcon from "@mui/icons-material/Star";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";



// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, loading = false, index = 0 }) {
  const [wished, setWished] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgLoaded(true);
    }
  }, []);

  // Innovative vertical sizing based on index for masonry effect
  const cardHeight = index % 3 === 0 ? "460px" : index % 3 === 1 ? "380px" : "420px";
  const imgHeight = index % 3 === 0 ? "300px" : index % 3 === 1 ? "240px" : "280px";

  return (
    <Box
      onClick={() => router.push(`/products/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        mb: "32px", // vertical gap for masonry
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.03)",
        transform: isHovered ? "translateY(-8px) scale(1.02)" : "none",
        border: "1px solid rgba(0,0,0,0.03)",
      }}
    >
      {/* Image area */}
      <Box sx={{ position: "relative", width: "100%", height: imgHeight, backgroundColor: "#f8f8f8", overflow: "hidden" }}>
        {/* Floating Price Tag */}
        <Box sx={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 5,
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          px: "10px",
          py: "4px",
          borderRadius: "100px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a1a" }}>
            £{product.rentFrom}<span style={{fontSize: "0.65rem", fontWeight: 500, opacity: 0.6}}> /day</span>
          </Typography>
        </Box>

        {!imgLoaded && (
          <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" sx={{ bgcolor: "#f0f0f0", position: "absolute", top: 0, left: 0, zIndex: 1 }} />
        )}
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imgLoaded ? 1 : 0,
            transition: "all 0.6s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />

        {/* Wishlist Glassmorphism */}
        <IconButton
          onClick={(e) => { e.stopPropagation(); setWished((p) => !p); }}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.3)",
            width: 36,
            height: 36,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.4)" },
          }}
        >
          {wished ? <FavoriteIcon sx={{ fontSize: 18, color: "#ff4d4d" }} /> : <FavoriteBorderIcon sx={{ fontSize: 18, color: "#fff" }} />}
        </IconButton>

        {/* Quick Add Button Overlay */}
        <Box sx={{
           position: "absolute",
           top: 0,
           left: 0,
           width: "100%",
           height: "100%",
           backgroundColor: "rgba(0,0,0,0.1)",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           opacity: isHovered ? 1 : 0,
           transition: "opacity 0.3s ease",
           pointerEvents: "none"
        }}>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: "#fff", 
              color: "#1a1a1a", 
              fontWeight: 700, 
              fontSize: "0.75rem",
              borderRadius: "100px",
              px: "20px",
              py: "8px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              transform: isHovered ? "translateY(0)" : "translateY(20px)",
              transition: "transform 0.4s ease",
              pointerEvents: "auto",
              "&:hover": { backgroundColor: "#f8f8f8" }
            }}
            startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
          >
            QUICK SHOP
          </Button>
        </Box>
      </Box>

      {/* Details Area */}
      <Box sx={{ p: "20px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a1a1a", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>
            {product.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <StarIcon sx={{ fontSize: 12, color: "#f59e0b" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#1a1a1a" }}>{product.rating}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "2px" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            {product.brand}
          </Typography>
          <Box sx={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#ccc" }} />
          <Typography sx={{ fontSize: "0.75rem", color: "#888" }}>
            {product.size}
          </Typography>
        </Box>

        <Box sx={{ mt: "auto", pt: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box sx={{ display: "flex", gap: "4px" }}>
             <Chip label="Rental" size="small" sx={{ height: "20px", fontSize: "0.65rem", fontWeight: 700, backgroundColor: "#f0f0f0", color: "#666" }} />
             <Chip label="Insured" size="small" sx={{ height: "20px", fontSize: "0.65rem", fontWeight: 700, backgroundColor: "#f0f0f0", color: "#666" }} />
          </Box>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#1976d2" }}>
            £{product.price} deposit
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
import Navbar from "@/app/components/Navbar";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/v1/listings");
        const json = await response.json();
        if (json.success && json.data) {
          const mapped = json.data.map((item) => ({
            id: item.id,
            name: item.title,
            rentFrom: item.rental_price,
            size: item.size,
            brand: item.brand,
            rating: 4.8, // placeholder
            price: item.deposit,
            image: item.images && item.images.length > 0 ? item.images[0] : "/product.png",
          }));
          setProducts(mapped);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f5; font-family: 'Inter', sans-serif; }
      `}</style>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>

        <Navbar />

        {/* ── Promo Banner ───────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: "#0a0a0aff",
            py: "8px",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#f7f7faff",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            New here? Enjoy <strong>15% off</strong> your first rental — our welcome treat to you.
          </Typography>
        </Box>

        {/* ── Page Content ───────────────────────────────────── */}
        <Box
          sx={{
            width: "1440px",
            maxWidth: "100%",
            mx: "auto",
            opacity: 1,
            paddingTop: "24px",
            paddingRight: "40px",
            paddingBottom: "24px",
            paddingLeft: "40px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >

          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "2px", mb: "16px" }}>
            <Link href="/" style={{ fontSize: "0.72rem", color: "#888", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>
              Home
            </Link>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#aaa" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#333", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              Products
            </Typography>
          </Box>

          {/* ── Product Grid ──────────────────────────────────── */}
          <Box
            sx={{
              columnCount: { xs: 1, sm: 2, md: 3 },
              columnGap: "32px",
              width: "100%",
              "& > div": {
                breakInside: "avoid",
                display: "inline-block", // crucial for column-count masonry
                width: "100%",
              }
            }}
          >
            {loading ? (
              Array.from(new Array(6)).map((_, i) => (
                <Box key={i} sx={{ mb: "32px" }}>
                  <Skeleton variant="rectangular" height={300} sx={{ borderRadius: "16px", mb: "12px" }} />
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="40%" height={20} />
                </Box>
              ))
            ) : error ? (
              <Box sx={{ columnSpan: "all", textAlign: "center", py: "64px" }}>
                <Typography sx={{ fontSize: "1.5rem", mb: "8px" }}>⚠️</Typography>
                <Typography sx={{ fontSize: "1rem", color: "#d32f2f", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                  Failed to load products
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                  Please try refreshing the page.
                </Typography>
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ columnSpan: "all", textAlign: "center", py: "64px" }}>
                <Typography sx={{ fontSize: "1.5rem", mb: "8px" }}>🔍</Typography>
                <Typography sx={{ fontSize: "1rem", color: "#555", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                  No products found
                </Typography>
              </Box>
            ) : (
              products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

