"use client";

import { Box, Typography, Button, IconButton, InputBase, Divider, Snackbar } from "@mui/material";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startParam = searchParams.get("start");
  const statusParam = searchParams.get("status");
  const isFailed = statusParam === "failed";
  const deliveryDate = startParam ? new Date(startParam) : new Date(Date.now() + 86400000); // Decides tomorrow if no param
  const confirmedDate = new Date(); // Right now

  const formatShortDate = (d) => `${d.toLocaleDateString('en-US', { month: 'short' })} ${String(d.getDate()).padStart(2, '0')}`;

  const [searchFocused, setSearchFocused] = useState(false);
  const [toastOpen, setToastOpen] = useState(true); // Automatically show toast on mount

  useEffect(() => {
    const timer = setTimeout(() => setToastOpen(false), 5000); // Hide after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Inter', sans-serif; }
      `}</style>
      
      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
        
        {/* Navbar */}
        <Box
          component="nav"
          sx={{
            backgroundColor: "#dfbafc", // Approximating the light purple from the screenshots
            height: "48px",
            px: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton size="small" sx={{ color: "#fff", p: "4px" }}>
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "Inter, sans-serif", letterSpacing: "0.08em" }}>
              LENDi
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: searchFocused ? "#fff" : "rgba(255,255,255,0.4)",
                borderRadius: "20px",
                px: "12px",
                height: "32px",
                width: "220px",
                transition: "background-color 0.2s ease",
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: searchFocused ? "#555" : "#fff", mr: "6px" }} />
              <InputBase
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                sx={{
                  fontSize: "0.78rem",
                  fontFamily: "Inter, sans-serif",
                  color: searchFocused ? "#333" : "#fff",
                  "& input::placeholder": { color: searchFocused ? "#0f0f0fff" : "#fff", opacity: 0.8 },
                  flex: 1,
                }}
              />
            </Box>

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                fontFamily: "Inter, sans-serif",
                borderRadius: "20px",
                px: "14px",
                py: "5px",
                textTransform: "uppercase",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" },
              }}
            >
              Become a Lender
            </Button>
          </Box>
        </Box>

        {/* Promo Banner */}
        <Box sx={{ backgroundColor: "#333", py: "10px", textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
            New here? Enjoy 15% off your first rental — our welcome treat to you.
          </Typography>
        </Box>

        {/* Page Content */}
        <Box sx={{ position: "relative", maxWidth: "1200px", width: "100%", mx: "auto", px: "40px", py: "24px", flex: 1 }}>
          
          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "32px" }}>
            <Link href="/" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>Home</Link>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#666", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>...</Typography>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#111", fontFamily: "Inter, sans-serif", fontWeight: 600, textTransform: "uppercase" }}>OD43848583939292020</Typography>
          </Box>

          {/* Payment Status Float / Toast */}
          <Snackbar
            open={toastOpen}
            autoHideDuration={5000}
            onClose={(e, reason) => { if (reason !== 'clickaway') setToastOpen(false); }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ mt: "48px" }} // Offset from the nav bar
          >
            <Box
              sx={{
                backgroundColor: isFailed ? "#d32f2f" : "#388e3c", // Red if failed, Dark green if success
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                borderRadius: "4px",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {isFailed ? <ErrorOutlineIcon sx={{ fontSize: 20 }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                {isFailed ? "Payment Failed" : "Payment Successful"}
              </Typography>
            </Box>
          </Snackbar>

          {/* Order Confirmed Header */}
          <Box sx={{ mb: "24px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "8px" }}>
              {isFailed ? <ErrorOutlineIcon sx={{ color: "#d32f2f", fontSize: 26 }} /> : <CheckCircleIcon sx={{ color: "#388e3c", fontSize: 26 }} />}
              <Typography variant="h1" sx={{ fontSize: "1.4rem", fontWeight: 500, color: "#222", fontFamily: "Inter, sans-serif" }}>
                {isFailed ? "Order Failed" : "Order Confirmed"}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", ml: "36px" }}>
              order ID: OD43848583939292020
            </Typography>
          </Box>

          <Divider sx={{ mb: "32px", borderColor: "#eaeaea" }} />

          {/* Timeline / Order Status */}
          <Box sx={{ display: "flex", flexDirection: "column", ml: "24px" }}>
            
            {/* Step 1 */}
            <Box sx={{ display: "flex", gap: "16px", position: "relative" }}>
              {/* Line connector to next step */}
              <Box sx={{ position: "absolute", top: "20px", left: "6px", bottom: "-16px", borderLeft: "1px solid #ccc", zIndex: 0 }} />
              <Box sx={{ position: "relative", zIndex: 1, backgroundColor: "#fff", pt: "2px" }}>
                <CircleIcon sx={{ fontSize: 12, color: "#388e3c" }} />
              </Box>
              <Box sx={{ pb: "24px" }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                  Order confirmed, {formatShortDate(confirmedDate)}
                </Typography>
              </Box>
            </Box>

            {/* Step 2 */}
            <Box sx={{ display: "flex", gap: "16px", position: "relative" }}>
               {/* Line connector to next step */}
               <Box sx={{ position: "absolute", top: "20px", left: "6px", bottom: "-16px", borderLeft: "1px solid #ccc", zIndex: 0 }} />
              <Box sx={{ position: "relative", zIndex: 1, backgroundColor: "#fff", pt: "2px" }}>
                <CircleIcon sx={{ fontSize: 12, color: "#bbb" }} />
              </Box>
              <Box sx={{ pb: "24px" }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                  -
                </Typography>
              </Box>
            </Box>

            {/* Step 3 */}
            <Box sx={{ display: "flex", gap: "16px", position: "relative" }}>
              <Box sx={{ position: "relative", zIndex: 1, backgroundColor: "#fff", pt: "2px" }}>
                <CircleIcon sx={{ fontSize: 12, color: "#bbb" }} />
              </Box>
              <Box sx={{ pb: "24px" }}>
                <Typography sx={{ fontSize: "0.9rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                  Delivery, {formatShortDate(deliveryDate)}
                </Typography>
              </Box>
            </Box>
            
          </Box>

          <Box sx={{ mt: "48px", textAlign: "center", pb: "32px", ml: "-24px" }}>
             <Button
                onClick={() => router.push("/my-bookings")}
                variant="contained"
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  py: "12px",
                  px: "32px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "4px",
                  boxShadow: "none",
                  fontFamily: "Inter, sans-serif",
                  "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" }
                }}
              >
                VIEW MY BOOKINGS
              </Button>
          </Box>

        </Box>
      </Box>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }} />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

