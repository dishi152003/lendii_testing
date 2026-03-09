"use client";

import { Box, Typography, Button, IconButton, Skeleton, Paper, Grid } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse Dates
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const startDate = startParam ? new Date(startParam) : new Date();
  const endDate = endParam ? new Date(endParam) : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const diffTime = Math.abs(endDate - startDate);
  const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

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

  // Recalculating amounts so summary matches checkout accurately
  const basePrice = listing?.rental_price || 0;
  let multiplier = 1;
  if (rentalDays >= 8) multiplier = 0.97;
  if (rentalDays >= 12) multiplier = 0.95;
  if (rentalDays >= 16) multiplier = 0.93;
  
  const rentalTotal = parseFloat((basePrice * rentalDays * multiplier).toFixed(2));
  const securityDeposit = listing?.deposit || 0;
  const cleaningFee = 5;
  const serviceCharge = parseFloat((rentalTotal * 0.15).toFixed(2));
  const totalAmount = rentalTotal + securityDeposit + cleaningFee + serviceCharge;

  const paymentOptions = [
    { id: "card", title: "Credit / Debit Card", description: "Visa, Mastercard, Amex, Stripe", icon: <CreditCardIcon sx={{ fontSize: 32 }} /> },
    { id: "upi", title: "UPI Transfer", description: "Google Pay, PhonePe, Paytm", icon: <QrCodeScannerIcon sx={{ fontSize: 32 }} /> },
    { id: "netbanking", title: "Net Banking", description: "All major banks supported", icon: <AccountBalanceIcon sx={{ fontSize: 32 }} /> },
    { id: "wallet", title: "Wallets", description: "Amazon Pay, MobiKwik, Freecharge", icon: <AccountBalanceWalletIcon sx={{ fontSize: 32 }} /> },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create the order in the database (Mock)
      const orderData = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_amount: totalAmount,
        status: "paid",
        listing_title: listing?.title || "New Checkout Item",
        listing_category: listing?.category || "Womenswear",
        listing_size: listing?.size || "M",
        listing_image: listing?.images?.[0] || "/product.png",
        user_email: "testuser@example.com"
      };
      await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (paymentMethod !== "card") {
          router.push(`/order-confirmation?start=${startDate.toISOString()}&status=success`);
          return;
      }
      
      const res = await fetch("/api/v1/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: id || "test",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_amount: totalAmount
        })
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        router.push(json.data.url);
      } else {
        console.error("Stripe Session Error:", json);
        alert(json.error || "Failed to initialize Stripe session.");
      }
    } catch(e) {
      console.error("Stripe Fetch Error:", e);
      alert("Failed to connect to checkout services.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f9f9fc", display: "flex", justifyContent: "center", alignItems: "center", py: "40px", px: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <Box sx={{ maxWidth: "1000px", width: "100%", backgroundColor: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0px 10px 40px rgba(0,0,0,0.08)", display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        
        {/* Left Side: Order Summary Graphic */}
        <Box sx={{ flex: 1, backgroundColor: "#111", color: "#fff", p: "40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
          <Box>
            <IconButton onClick={() => router.back()} sx={{ color: "#fff", mb: "24px", alignSelf: "flex-start", ml: "-8px" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ fontSize: "1.8rem", fontWeight: 600, mb: "8px", fontFamily: "Inter, sans-serif" }}>Complete your payment</Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "#a0a0a0", mb: "40px", fontFamily: "Inter, sans-serif" }}>Secure your booking by finishing your transaction.</Typography>
          </Box>
          
          <Box sx={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "12px", p: "24px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <Box sx={{ display: "flex", gap: "16px", alignItems: "center", mb: "24px" }}>
               {loading ? (
                 <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: "8px", bgcolor: 'grey.800' }} />
               ) : (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={listing?.images?.[0] || "/product.png"} alt="Product" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
               )}
               <Box>
                 {loading ? <Skeleton width={120} sx={{ bgcolor: 'grey.800' }} /> : <Typography sx={{ fontSize: "1.1rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>{listing?.title}</Typography>}
                 <Typography sx={{ fontSize: "0.85rem", color: "#aaa", fontFamily: "Inter, sans-serif" }}>{rentalDays} day rental</Typography>
               </Box>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
                <Typography sx={{ fontSize: "0.95rem", color: "#ccc", fontFamily: "Inter, sans-serif" }}>Subtotal</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#fff", fontFamily: "Inter, sans-serif" }}>{loading ? <Skeleton width={50} sx={{ bgcolor: 'grey.800' }} /> : `£${(rentalTotal + securityDeposit + cleaningFee).toFixed(2)}`}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" }}>
                <Typography sx={{ fontSize: "0.95rem", color: "#ccc", fontFamily: "Inter, sans-serif" }}>Taxes & Fees</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#fff", fontFamily: "Inter, sans-serif" }}>{loading ? <Skeleton width={50} sx={{ bgcolor: 'grey.800' }} /> : `£${serviceCharge.toFixed(2)}`}</Typography>
            </Box>
            
            <Box sx={{ borderTop: "1px dashed rgba(255,255,255,0.2)", pt: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "1.1rem", color: "#fff", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Total Due</Typography>
                <Typography sx={{ fontSize: "1.5rem", color: "#fff", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>{loading ? <Skeleton width={80} sx={{ bgcolor: 'grey.800' }} /> : `£${totalAmount.toFixed(2)}`}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side: Payment Methods */}
        <Box sx={{ flex: 1.2, p: "40px" }}>
          <Typography variant="h2" sx={{ fontSize: "1.3rem", fontWeight: 600, mb: "24px", color: "#111", fontFamily: "Inter, sans-serif" }}>
            Select Payment Method
          </Typography>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mb: "40px" }}>
            {paymentOptions.map((option) => (
              <Box 
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  p: "20px", 
                  borderRadius: "12px", 
                  border: paymentMethod === option.id ? "2px solid #111" : "2px solid #eaeaea",
                  backgroundColor: paymentMethod === option.id ? "#FAFAFA" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { borderColor: paymentMethod === option.id ? "#111" : "#ccc" },
                  position: "relative"
                }}
              >
                 <Box sx={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: paymentMethod === option.id ? "#111" : "#f5f5f5", color: paymentMethod === option.id ? "#fff" : "#555", display: "flex", justifyContent: "center", alignItems: "center", mr: "20px", transition: "all 0.2s" }}>
                    {option.icon}
                 </Box>
                 <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, color: "#111", mb: "4px", fontFamily: "Inter, sans-serif" }}>{option.title}</Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#777", fontFamily: "Inter, sans-serif" }}>{option.description}</Typography>
                 </Box>
                 {paymentMethod === option.id && (
                     <CheckCircleIcon sx={{ color: "#111", position: "absolute", right: "20px" }} />
                 )}
              </Box>
            ))}
          </Box>
          
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#111",
              color: "#fff",
              py: "16px",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "50px",
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
              "&:hover": { backgroundColor: "#333", boxShadow: "0 12px 24px rgba(0,0,0,0.15)", transform: "translateY(-2px)" },
              "&:disabled": { backgroundColor: "#ccc", color: "#fff" }
            }}
          >
            {isProcessing ? "Processing Secure Payment..." : `Pay £${totalAmount.toFixed(2)}`}
          </Button>
          <Typography sx={{ mt: "16px", fontSize: "0.80rem", color: "#999", textAlign: "center", fontFamily: "Inter, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            <Box component="span" sx={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#4caf50" }} />
            256-bit SSL Secure encryption
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function InnovativePaymentPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", backgroundColor: "#f9f9fc" }} />}>
       <PaymentContent />
    </Suspense>
  );
}
