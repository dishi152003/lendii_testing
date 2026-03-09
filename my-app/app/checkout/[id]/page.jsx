"use client";

import { Box, Typography, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel, FormControl } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Skeleton } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import Navbar from "@/app/components/Navbar";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/v1/listings/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setListing(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const startDate = startParam ? new Date(startParam) : new Date();
  const endDate = endParam ? new Date(endParam) : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  const diffTime = Math.abs(endDate - startDate);
  const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const formatShort = (d) => `${d.getDate()}-${d.toLocaleDateString("en-GB", { month: "short" }).toLowerCase()}`;
  const dateRange = startParam && endParam 
    ? `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString("en-GB", { month: "short" }).toLowerCase()}`
    : "5-8 oct";

  const basePrice = listing?.rental_price || 0;
  // Apply a simple volume discount curve similar to the product page
  let multiplier = 1;
  if (rentalDays >= 8) multiplier = 0.97;
  if (rentalDays >= 12) multiplier = 0.95;
  if (rentalDays >= 16) multiplier = 0.93;
  
  const rentalTotal = parseFloat((basePrice * rentalDays * multiplier).toFixed(2));
  const securityDeposit = listing?.deposit || 0;
  const cleaningFee = 5;
  const serviceCharge = parseFloat((rentalTotal * 0.15).toFixed(2));
  const totalAmount = rentalTotal + securityDeposit + cleaningFee + serviceCharge;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Inter', sans-serif; }
      `}</style>
      
      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }}>
        
        <Navbar />

        {/* Promo Banner */}
        <Box sx={{ backgroundColor: "#2b2b2b", py: "10px", textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.85rem", color: "#ececec", fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
            New here? Enjoy 15% off your first rental — our welcome treat to you.
          </Typography>
        </Box>

        {/* Page Content */}
        <Box sx={{ maxWidth: "1200px", width: "100%", mx: "auto", px: "40px", py: "24px" }}>
          
          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "32px" }}>
            <Link href="/" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>Home</Link>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#666", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>...</Typography>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#111", fontFamily: "Inter, sans-serif", fontWeight: 600, textTransform: "uppercase" }}>BOOK-01</Typography>
          </Box>

          {/* Product Info Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "32px", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h1" sx={{ fontSize: "1.5rem", fontWeight: 400, color: "#1a1a1a", mb: "12px", fontFamily: "Inter, sans-serif" }}>
                {loading ? <Skeleton width={200} /> : listing?.title || "Product"}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#555", mb: "6px", fontFamily: "Inter, sans-serif" }}>
                Size: {loading ? <Skeleton width={40} sx={{ display: 'inline-block' }} /> : listing?.size || "One Size"}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#555", mb: "6px", fontFamily: "Inter, sans-serif" }}>
                Brand: {loading ? <Skeleton width={60} sx={{ display: 'inline-block' }} /> : listing?.brand || "Unknown"}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif", mt: "12px" }}>
                {loading ? <Skeleton width={120} /> : (
                  <>£{rentalTotal.toFixed(2)} <span style={{color: "#555", fontWeight: 400}}>/ {rentalDays} Days ({dateRange})</span></>
                )}
              </Typography>
            </Box>
            <Box sx={{ width: "90px", height: "110px", backgroundColor: "#f9f9f9", borderRadius: "4px", overflow: "hidden" }}>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing?.images?.[0] || "/product.png"} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: "32px", borderColor: "#eaeaea" }} />

          {/* Two Columns */}
          <Box sx={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            
            {/* Left Column: Shipping Form */}
            <Box sx={{ flex: 1.2, backgroundColor: "#fbfbfb", p: "32px", borderRadius: "8px" }}>
              <Typography variant="h2" sx={{ fontSize: "1.1rem", fontWeight: 600, mb: "24px", color: "#222", fontFamily: "Inter, sans-serif" }}>
                Shipping Form
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<MyLocationIcon sx={{fontSize: 18}} />}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  py: "10px",
                  px: "16px",
                  mb: "40px",
                  boxShadow: "none",
                  borderRadius: "4px",
                  fontFamily: "Inter, sans-serif",
                  "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" }
                }}
              >
                USE MY CURRENT LOCATION
              </Button>

              <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <Box sx={{ display: "flex", gap: "24px" }}>
                  <TextField fullWidth variant="standard" defaultValue="Mary" helperText="Enter your first name*" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                  <TextField fullWidth variant="standard" defaultValue="Parker" helperText="Enter your last name*" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                </Box>
                <Box sx={{ display: "flex", gap: "24px", mt: "12px" }}>
                  <TextField fullWidth variant="standard" defaultValue="1011-AB" helperText="Pin Code*" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                  <TextField fullWidth variant="standard" defaultValue="Lorem" helperText="Locality" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                </Box>
                <TextField fullWidth variant="standard" defaultValue="Lorem" helperText="Address*" sx={{ mt: "12px" }} FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                <Box sx={{ display: "flex", gap: "24px", mt: "12px" }}>
                  <TextField fullWidth variant="standard" defaultValue="Lorem" helperText="City/ District/ Town*" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                  <TextField fullWidth variant="standard" defaultValue="Lorem" helperText="State*" FormHelperTextProps={{ sx: { mx: 0, fontFamily: "Inter, sans-serif", fontSize: "0.7rem", color: "#777", mt: "4px" } }} InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", color: "#111" } }} />
                </Box>
              </Box>
            </Box>

            {/* Right Column: Price Details */}
            <Box sx={{ flex: 1, backgroundColor: "#fbfbfb", p: "32px", borderRadius: "8px" }}>
              <Typography variant="h2" sx={{ fontSize: "1.1rem", fontWeight: 600, mb: "24px", color: "#222", fontFamily: "Inter, sans-serif" }}>
                Price Details
              </Typography>
              
              <Divider sx={{ mb: "24px", borderColor: "#eaeaea" }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mb: "24px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Rental cost ({rentalDays} days)</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                    £{rentalTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Security deposit</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                    £{securityDeposit.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Cleaning fee</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                    £{cleaningFee.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Service charges(15%)</Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                    £{serviceCharge.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: "24px", borderColor: "#eaeaea" }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "32px" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#555", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>Total Amount</Typography>
                <Typography sx={{ fontSize: "1.4rem", color: "#111", fontWeight: 400, fontFamily: "Inter, sans-serif" }}>
                  {loading ? <Skeleton width={80} /> : `£${totalAmount.toFixed(2)}`}
                </Typography>
              </Box>

              <Button
                onClick={() => router.push(`/checkout/${id}/payment?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)}
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
                CONTINUE TO PAYMENT
              </Button>
            </Box>

          </Box>
        </Box>

      </Box>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", backgroundColor: "#fff" }} />}>
      <CheckoutContent />
    </Suspense>
  );
}

