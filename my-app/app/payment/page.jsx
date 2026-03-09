"use client";

import { Box, Typography, Button, TextField, Divider, InputAdornment } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const startParam = searchParams.get("start");

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment network delay
    setTimeout(() => {
      router.push(`/order-confirmation?start=${startParam || new Date().toISOString()}&status=success`);
    }, 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdfdfd; font-family: 'Inter', sans-serif; }
      `}</style>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex", justifyContent: "center", py: "64px", px: "24px" }}>
        
        <Box sx={{ maxWidth: "480px", width: "100%" }}>
          {/* Logo / Header */}
          <Box sx={{ textAlign: "center", mb: "32px" }}>
            <Typography sx={{ color: "#3b0764", fontWeight: 700, fontSize: "1.4rem", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em", mb: "16px" }}>
              LENDI
            </Typography>
            <Typography variant="h1" sx={{ fontSize: "1.2rem", fontWeight: 600, color: "#111", mb: "8px", fontFamily: "Inter, sans-serif" }}>
              Complete your Payment
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#666", fontFamily: "Inter, sans-serif" }}>
              Secure payment processing powered by MockPay
            </Typography>
          </Box>

          {/* Payment Card Container */}
          <Box sx={{ backgroundColor: "#fff", p: "32px", borderRadius: "12px", boxShadow: "0 6px 24px rgba(0,0,0,0.06)", border: "1px solid #eaeaea" }}>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#555", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>Amount due</Typography>
              <Typography sx={{ fontSize: "1.5rem", color: "#111", fontWeight: 700, fontFamily: "Inter, sans-serif" }}>€324.00</Typography>
            </Box>

            <Divider sx={{ mb: "24px", borderColor: "#f0f0f0" }} />

            {/* Simulated Payment Form */}
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", mb: "16px", fontFamily: "Inter, sans-serif" }}>
              Pay with Card
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", mb: "32px" }}>
              <TextField 
                label="Email" 
                variant="outlined" 
                fullWidth 
                required
                defaultValue="lorem@example.com"
                InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", backgroundColor: "#fafafa" } }}
                InputLabelProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }}
              />
              <TextField 
                label="Card Information" 
                variant="outlined" 
                fullWidth 
                required
                defaultValue="4242 4242 4242 4242"
                InputProps={{ 
                  endAdornment: (
                    <InputAdornment position="end">
                      <CreditCardIcon sx={{ color: "#888" }} />
                    </InputAdornment>
                  ),
                  sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", backgroundColor: "#fafafa" } 
                }}
                InputLabelProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }}
              />
              <Box sx={{ display: "flex", gap: "16px" }}>
                <TextField 
                  label="MM/YY" 
                  variant="outlined" 
                  fullWidth 
                  required
                  defaultValue="12/26"
                  InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", backgroundColor: "#fafafa" } }}
                  InputLabelProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }}
                />
                <TextField 
                  label="CVC" 
                  variant="outlined" 
                  fullWidth 
                  required
                  defaultValue="123"
                  type="password"
                  InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", backgroundColor: "#fafafa" } }}
                  InputLabelProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }}
                />
              </Box>
              <TextField 
                label="Name on Card" 
                variant="outlined" 
                fullWidth 
                required
                defaultValue="Mary Parker"
                InputProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", backgroundColor: "#fafafa" } }}
                InputLabelProps={{ sx: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" } }}
              />
            </Box>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              fullWidth
              variant="contained"
              startIcon={!isProcessing && <LockIcon sx={{ fontSize: 16 }} />}
              sx={{
                backgroundColor: "#111",
                color: "#fff",
                py: "14px",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: "6px",
                textTransform: "none",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 12px rgba(17,17,17,0.2)",
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: "#333", boxShadow: "0 6px 16px rgba(17,17,17,0.3)" },
                "&.Mui-disabled": { backgroundColor: "#555", color: "#ccc" }
              }}
            >
              {isProcessing ? "Processing..." : "Pay €324.00"}
            </Button>

            <Box sx={{ textAlign: "center", mt: "24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              <LockIcon sx={{ fontSize: 14, color: "#888" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                Payments are secure and encrypted
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px", mt: "32px", opacity: 0.6 }}>
             <PaymentIcon />
             <AccountBalanceIcon />
             <CreditCardIcon />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", backgroundColor: "#f9fafb" }} />}>
      <PaymentContent />
    </Suspense>
  );
}
