"use client";

import { useCart } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Grid,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BagPage() {
  const { cart, removeFromBag } = useCart();
  const router = useRouter();

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const serviceFee = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + serviceFee;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fdfdfd" }}>
      <Navbar />

      <Box
        sx={{
          width: "1200px",
          maxWidth: "100%",
          mx: "auto",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "32px" }}>
          <Link href="/products" style={{ fontSize: "0.85rem", color: "#666", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>Products</Link>
          <NavigateNextIcon sx={{ fontSize: 16, color: "#999" }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#111", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Your Bag</Typography>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: "32px", fontFamily: "Inter, sans-serif" }}>
          Shopping Bag ({cart.length})
        </Typography>

        {cart.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "80px" }}>
            <Typography sx={{ fontSize: "1.1rem", color: "#666", mb: "24px" }}>Your bag is empty</Typography>
            <Button 
              variant="contained" 
              onClick={() => router.push("/products")}
              sx={{ backgroundColor: "#111", "&:hover": { backgroundColor: "#333" } }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Bag Items */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {cart.map((item, idx) => (
                  <Box 
                    key={`${item.id}-${idx}`}
                    sx={{ 
                      display: "flex", 
                      gap: "20px", 
                      border: "1px solid #f0f0f0", 
                      p: "20px",
                      borderRadius: "8px",
                      backgroundColor: "#fff"
                    }}
                  >
                    <Box sx={{ width: "120px", height: "150px", backgroundColor: "#f9f9f9", borderRadius: "4px", overflow: "hidden" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{item.name}</Typography>
                        <Typography sx={{ fontWeight: 700 }}>£{item.total.toFixed(2)}</Typography>
                      </Box>
                      <Typography sx={{ color: "#666", fontSize: "0.9rem", mt: "4px" }}>{item.brand} • Size: {item.size}</Typography>
                      <Box sx={{ mt: "12px", p: "8px 12px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#444" }}>
                          <strong>Rental Period:</strong> {item.days} Days
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#444" }}>
                          <strong>Dates:</strong> {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
                        <IconButton 
                          onClick={() => removeFromBag(item.id, item.startDate, item.endDate)}
                          size="small" 
                          sx={{ color: "#ef4444" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                          <Typography sx={{ fontSize: "0.75rem", ml: "4px", fontWeight: 600 }}>REMOVE</Typography>
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Summary */}
            <Grid item xs={12} md={4}>
              <Box sx={{ border: "1px solid #f0f0f0", p: "24px", borderRadius: "8px", backgroundColor: "#fff", position: "sticky", top: "80px" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", mb: "20px" }}>Order Summary</Typography>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: "12px" }}>
                  <Typography sx={{ color: "#666" }}>Subtotal</Typography>
                  <Typography>£{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: "20px" }}>
                  <Typography sx={{ color: "#666" }}>Service Fee</Typography>
                  <Typography>£{serviceFee.toFixed(2)}</Typography>
                </Box>
                
                <Divider sx={{ mb: "20px" }} />
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: "32px" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>£{total.toFixed(2)}</Typography>
                </Box>

                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  onClick={() => router.push(`/checkout/${cart[0].id}`)} // Simplified for now, should handle multiple
                  sx={{ 
                    backgroundColor: "#1976d2", 
                    py: "14px", 
                    fontWeight: 700, 
                    borderRadius: "4px",
                    "&:hover": { backgroundColor: "#1565c0" }
                  }}
                >
                  CHECKOUT NOW
                </Button>
                
                <Typography sx={{ fontSize: "0.75rem", color: "#888", textAlign: "center", mt: "16px" }}>
                  By proceeding to checkout, you agree to our Terms of Service and Rental Agreement.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
