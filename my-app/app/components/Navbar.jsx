"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Button,
  InputBase,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const { cart } = useCart();

  const cartCount = cart.length;

  return (
    <Box
      component="nav"
      sx={{
        backgroundColor: "#a798e2ff",
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
      {/* Left: hamburger + logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <IconButton size="small" sx={{ color: "#1a1a1a", p: "4px" }}>
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography
          onClick={() => router.push("/products")}
          sx={{
            color: "#1a1a1a",
            fontWeight: 700,
            fontSize: "1rem",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          LENDI
        </Typography>
      </Box>

      {/* Center/Right: Search + Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: searchFocused ? "#fff" : "rgba(255,255,255,0.5)",
            borderRadius: "20px",
            px: "12px",
            height: "32px",
            width: "220px",
            transition: "background-color 0.2s ease",
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: searchFocused ? "#555" : "#1a1a1a", mr: "6px" }} />
          <InputBase
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              fontSize: "0.78rem",
              fontFamily: "Inter, sans-serif",
              color: searchFocused ? "#333" : "#1a1a1a",
              "& input::placeholder": { color: searchFocused ? "#0f0f0fff" : "rgba(26,26,26,0.7)", opacity: 1 },
              flex: 1,
            }}
          />
        </Box>

        <IconButton 
          id="bag-button"
          onClick={() => router.push("/bag")}
          sx={{ color: "#1a1a1a" }}
        >
          <Badge badgeContent={cartCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16, minWidth: 16 } }}>
            <ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Button
          id="become-lender-btn"
          variant="contained"
          sx={{
            backgroundColor: "#7c3aed",
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
            display: { xs: "none", sm: "block" },
            "&:hover": { backgroundColor: "#6d28d9", boxShadow: "none" },
          }}
        >
          Become a Lender
        </Button>
      </Box>
    </Box>
  );
}
