"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Button, Divider, Breadcrumbs, IconButton, Drawer } from "@mui/material";
import Link from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import LogoutIcon from "@mui/icons-material/Logout";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Order");
  const [product, setProduct] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/v1/admin/orders/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrderData(json.data);
          setProduct(json.data.listings);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    { name: "Listing", href: "#", icon: <ListAltIcon /> },
    { name: "Order", href: "#", icon: <ShoppingCartIcon /> },
    { name: "Analytics", href: "#", icon: <AnalyticsIcon /> },
  ];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Inter', sans-serif; }
      `}</style>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
        
        {/* Top Navbar */}
        <Box
          sx={{
            backgroundColor: "#d1a3ff", // the specific purple shade from the screenshot
            height: "56px",
            px: "16px",
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", pl: "4px" }}>
            <IconButton size="small" onClick={() => setIsSidebarOpen(true)} sx={{ color: "#fff", p: "4px" }}>
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.05rem", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
              LENDi
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          PaperProps={{
            sx: { width: "240px", backgroundColor: "#fff", pt: "8px", borderRight: "1px solid #eaeaea", display: "flex", flexDirection: "column" }
          }}
        >
          <Box sx={{ px: "16px", flex: 1 }}>
            {menuItems.map((item) => (
              <Box
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  setIsSidebarOpen(false);
                  if(item.name === "Dashboard") window.location.href = item.href;
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  py: "12px",
                  px: "16px",
                  mb: "4px",
                  cursor: "pointer",
                  backgroundColor: activeMenu === item.name ? "#ebf4ff" : "transparent",
                  color: activeMenu === item.name ? "#1976d2" : "#555",
                  borderLeft: activeMenu === item.name ? "3px solid #1976d2" : "3px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <Box sx={{ display: "flex", color: activeMenu === item.name ? "#1976d2" : "#777", "& svg": { fontSize: 20 } }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: activeMenu === item.name ? 600 : 500, fontFamily: "Inter, sans-serif" }}>
                  {item.name}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ p: "16px", mb: "24px" }}>
             <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  py: "12px",
                  px: "16px",
                  cursor: "pointer",
                  color: "#555",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  borderRadius: "4px"
                }}
                onClick={() => setIsSidebarOpen(false)}
              >
                <LogoutIcon sx={{ fontSize: 20, color: "#777" }} />
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                  Log Out
                </Typography>
              </Box>
          </Box>
        </Drawer>

        {/* Main Header / Breadcrumbs Area */}
        <Box sx={{ px: "40px", pt: "24px", pb: "16px", maxWidth: "1200px", mx: "auto", width: "100%" }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ 
              "& .MuiBreadcrumbs-li": { fontSize: "0.85rem", fontFamily: "Inter, sans-serif" },
              "& .MuiBreadcrumbs-separator": { color: "#999", mx: "4px" }
            }}
          >
            <Link href="/" passHref style={{ textDecoration: 'none', color: '#777' }}>
              Home
            </Link>
            <Typography color="inherit" sx={{ fontSize: "0.85rem", color: "#777", fontFamily: "Inter" }}>
              ...
            </Typography>
            <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter" }}>
              {id || "OD43848583939292020"}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Divider sx={{ borderColor: "#f0f0f0" }} />

        {/* Content Layout */}
        <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%", px: "40px", py: "32px", display: "flex", gap: "48px" }}>
          
          {/* Left Section */}
          <Box sx={{ flex: 1.2, display: "flex", flexDirection: "column" }}>
            
            {/* Product Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: "32px" }}>
              <Box>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 400, color: "#111", mb: "8px", fontFamily: "Inter, sans-serif" }}>
                  {loading ? "Loading..." : product?.title || "Chic Black Velvet Dress"}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: "4px", fontFamily: "Inter, sans-serif" }}>
                  Size: {loading ? "..." : product?.size || "UK 18"}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: "4px", fontFamily: "Inter, sans-serif" }}>
                  Seller: {loading ? "..." : product?.brand || "Lorem ipsum"}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#333", mt: "4px", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                  From €{loading ? "..." : orderData?.total_amount || product?.rental_price || "86.72"} <span style={{fontWeight: 400}}>/ 5-8 oct</span>
                </Typography>
              </Box>
              <Box sx={{ width: "90px", height: "110px", backgroundColor: "#f5f5f5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loading ? "/product.png" : product?.image || product?.images?.[0] || "/product.png"} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#f0f0f0", mb: "32px" }} />

            {/* Timeline */}
            <Box sx={{ display: "flex", flexDirection: "column", position: "relative", ml: "8px", mb: "40px" }}>
              {/* Connector Lines */}
              <Box sx={{ position: "absolute", top: "12px", bottom: "80px", left: "4px", width: "1px", backgroundColor: "#ccc", zIndex: 0 }} />
              
              <Box sx={{ display: "flex", alignItems: "center", gap: "16px", mb: "32px", position: "relative", zIndex: 1 }}>
                <Box sx={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ccc" }} />
                <Typography sx={{ fontSize: "0.9rem", color: "#222", fontFamily: "Inter, sans-serif" }}>
                  Order confirmed, Oct 05
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: "16px", mb: "32px", position: "relative", zIndex: 1 }}>
                <Box sx={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ccc" }} />
                <Typography sx={{ fontSize: "0.9rem", color: "#222", fontFamily: "Inter, sans-serif" }}>
                  Order Shipped, Oct 06
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
                <Box sx={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ccc" }} />
                <Typography sx={{ fontSize: "0.9rem", color: "#222", fontFamily: "Inter, sans-serif" }}>
                  Delivery, Oct 06
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: "24px", alignItems: "center", mb: "40px" }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#bbb", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                REPORT
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#bbb", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                EXTENDED
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#bbb", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                RETURN
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1976d2", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                CANCEL ORDER
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#f0f0f0", mb: "32px" }} />

            {/* Rate Delivery */}
            <Box sx={{ mb: "16px" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#222", mb: "4px", fontFamily: "Inter, sans-serif" }}>
                Rate your delivery
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#666", mb: "12px", fontFamily: "Inter, sans-serif" }}>
                Rate the product
              </Typography>
              <Box sx={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarBorderIcon key={star} sx={{ color: "#777", fontSize: 24, cursor: "pointer", "&:hover": { color: "#111" } }} />
                ))}
              </Box>
            </Box>

          </Box>


          {/* Right Section */}
          <Box sx={{ flex: 1.4, display: "flex", flexDirection: "column" }}>
            
            {/* Delivery Address */}
            <Box sx={{ mb: "32px" }}>
              <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 600, color: "#111", mb: "16px", fontFamily: "Inter, sans-serif" }}>
                Delivery address
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: "6px", fontFamily: "Inter, sans-serif" }}>
                Deliver to: {orderData?.users?.email?.split("@")[0] || "User Name"}, Pincode
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: "6px", fontFamily: "Inter, sans-serif" }}>
                Address: Lorem Ipsum is simply dummy text of the printing and typesetting industry
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666", fontFamily: "Inter, sans-serif" }}>
                Mobile Number : 1234567890
              </Typography>
            </Box>

            <Divider sx={{ borderColor: "#f0f0f0", mb: "32px" }} />

            {/* Mobile Number Block */}
            <Box sx={{ mb: "32px" }}>
              <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 600, color: "#111", mb: "12px", fontFamily: "Inter, sans-serif" }}>
                Mobile number
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#666", fontFamily: "Inter, sans-serif" }}>
                1234567890
              </Typography>
            </Box>

            {/* Price Details Card */}
            <Box sx={{ backgroundColor: "#f9f9f9", borderRadius: "8px", p: "24px", mb: "24px" }}>
              <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 600, color: "#111", mb: "16px", fontFamily: "Inter, sans-serif" }}>
                Price Details
              </Typography>
              
              <Divider sx={{ borderColor: "#eaeaea", mb: "16px" }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mb: "16px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Price</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>€100</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Security deposit</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>€10</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Cleaning fee</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>€5</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Service charges(15%)</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>€15</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#eaeaea", mb: "16px" }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Total Amount</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#111", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>€{orderData?.total_amount || 324}</Typography>
              </Box>
            </Box>

            {/* Download Invoice Button */}
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                py: "12px",
                fontSize: "0.85rem",
                fontWeight: 600,
                borderRadius: "4px",
                boxShadow: "none",
                fontFamily: "Inter, sans-serif",
                "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" }
              }}
            >
              DOWNLOAD INVOICE
            </Button>

          </Box>

        </Box>
      </Box>
    </>
  );
}


