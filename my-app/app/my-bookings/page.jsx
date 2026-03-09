"use client";

import { 
  Box, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  InputBase, 
  Divider, 
  Breadcrumbs, 
  Link as MuiLink, 
  IconButton, 
  Button,
  Skeleton
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import Navbar from "@/app/components/Navbar";

export default function MyBookingsPage() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTime, setSelectedTime] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/orders");
        const json = await res.json();
        if (json.success && json.data) {
          const formattedBookings = json.data.map((order) => {
            const startDate = new Date(order.start_date);
            const endDate = new Date(order.end_date);
            const dateRange = `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString("en-US", { month: "short" }).toLowerCase()}`;
            
            return {
              ...order,
              id: order.id,
              rawId: order.id,
              title: order.listings?.title || "Item",
              size: order.listings?.size || "M",
              price: `£${order.total_amount} / ${dateRange}`,
              deliveryDate: `${startDate.toLocaleDateString("en-US", { month: "short" }).toLowerCase()} ${startDate.getDate()}`,
              statusLine: `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
              image: order.listings?.image || "/product.png",
              createdAtDate: new Date(order.created_at || order.start_date)
            };
          });
          setBookings(formattedBookings);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = (status) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleTimeChange = (time) => {
    setSelectedTime(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const searchMatch = booking.title.toLowerCase().includes(searchText.toLowerCase()) || 
                       booking.id.toString().includes(searchText);
    
    // Status filter
    let statusMatch = true;
    if (selectedStatus.length > 0) {
      statusMatch = false;
      if (selectedStatus.includes("On the way") && booking.status === "shipped") statusMatch = true;
      if (selectedStatus.includes("Delivered") && booking.status === "delivered") statusMatch = true;
      if (selectedStatus.includes("Cancelled") && booking.status === "cancelled") statusMatch = true;
      if (selectedStatus.includes("Returned") && booking.status === "returned") statusMatch = true;
      // Fallback for messy data
      if (!statusMatch) {
         statusMatch = selectedStatus.some(s => booking.statusLine.includes(s));
      }
    }

    // Time filter
    let timeMatch = true;
    if (selectedTime.length > 0) {
      timeMatch = false;
      const now = new Date();
      const year = booking.createdAtDate.getFullYear().toString();
      
      if (selectedTime.includes("Last 30 days")) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (booking.createdAtDate >= thirtyDaysAgo) timeMatch = true;
      }
      
      if (!timeMatch && selectedTime.includes(year)) {
        timeMatch = true;
      }
    }

    return searchMatch && statusMatch && timeMatch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Inter', sans-serif; }
      `}</style>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
        
        <Navbar />

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
            <Link href="/" passHref>
              <MuiLink underline="hover" color="inherit" sx={{ color: "#777" }}>
                Home
              </MuiLink>
            </Link>
            <Typography color="inherit" sx={{ fontSize: "0.85rem", color: "#777", fontFamily: "Inter" }}>
              My account
            </Typography>
            <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter" }}>
              My Bookings
            </Typography>
          </Breadcrumbs>
        </Box>

        <Divider sx={{ borderColor: "#f0f0f0" }} />

        {/* Search Bar Container */}
        <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%", px: "40px", pt: "24px", pb: "32px", display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            borderBottom: searchFocused ? "1px solid #111" : "1px solid #ccc",
            width: "300px",
            pb: "4px",
            transition: "border-color 0.2s"
          }}>
            <InputBase
              placeholder="Search the booking here"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              sx={{ flex: 1, fontSize: "0.8rem", fontFamily: "Inter, sans-serif", color: "#333" }}
            />
            <SearchIcon sx={{ color: "#666", fontSize: 20 }} />
          </Box>
        </Box>

        {/* Content Layout */}
        <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%", px: "40px", display: "flex", gap: "40px", mb: "60px" }}>
          
          {/* Left Sidebar - Filters */}
          <Box sx={{ 
            width: "240px", 
            backgroundColor: "#fafafa", 
            p: "24px", 
            flexShrink: 0,
            borderRadius: "4px"
          }}>
            <Typography variant="h2" sx={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", mb: "16px", fontFamily: "Inter, sans-serif" }}>
              Filters
            </Typography>
            <Divider sx={{ mb: "24px", borderColor: "#eaeaea" }} />

            {/* Booking Status Filter */}
            <Typography sx={{ fontSize: "0.75rem", color: "#666", mb: "12px", fontFamily: "Inter, sans-serif" }}>
              Booking status:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mb: "32px" }}>
              {["On the way", "Delivered", "Cancelled", "Returned"].map((label) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Checkbox 
                      size="small" 
                      checked={selectedStatus.includes(label)}
                      onChange={() => handleStatusChange(label)}
                      sx={{ p: "4px", color: "#ccc", "&.Mui-checked": { color: "#111" } }} 
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.85rem", color: "#333", fontFamily: "Inter, sans-serif" }}>{label}</Typography>}
                  sx={{ m: 0, gap: "8px", "& .MuiFormControlLabel-label": { mt: "1px" } }}
                />
              ))}
            </Box>

            {/* Booking Time Filter */}
            <Typography sx={{ fontSize: "0.75rem", color: "#666", mb: "12px", fontFamily: "Inter, sans-serif" }}>
              Booking time
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Last 30 days", "2025", "2024", "2023"].map((label) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Checkbox 
                      size="small" 
                      checked={selectedTime.includes(label)}
                      onChange={() => handleTimeChange(label)}
                      sx={{ p: "4px", color: "#ccc", "&.Mui-checked": { color: "#111" } }} 
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.85rem", color: "#333", fontFamily: "Inter, sans-serif" }}>{label}</Typography>}
                  sx={{ m: 0, gap: "8px", "& .MuiFormControlLabel-label": { mt: "1px" } }}
                />
              ))}
            </Box>
          </Box>

          {/* Right Main Content - Listings */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "24px", mb: "32px" }}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} variant="rectangular" width="100%" height={158} sx={{ borderRadius: "8px" }} />
                ))}
              </Box>
            ) : filteredBookings.length === 0 ? (
              <Box sx={{ textAlign: "center", py: "60px", backgroundColor: "#fbfbfb", borderRadius: "8px" }}>
                <Typography sx={{ fontSize: "1.1rem", color: "#666", fontFamily: "Inter, sans-serif" }}>No bookings match your filters.</Typography>
                <Button 
                  onClick={() => { setSearchText(""); setSelectedStatus([]); setSelectedTime([]); }}
                  sx={{ mt: "16px", color: "#1976d2", textTransform: "none", fontSize: "0.9rem" }}
                >
                  Clear all filters
                </Button>
              </Box>
            ) : (
              filteredBookings.map((booking, index) => (
                <Box key={booking.id || index} sx={{ mb: index !== filteredBookings.length - 1 ? 0 : "32px" }}>
                  <Box 
                    onClick={() => router.push(`/order-details/${booking.rawId}`)}
                    sx={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      py: "24px", 
                      gap: "24px",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#fbfbfb" },
                      borderRadius: "8px",
                      px: "16px",
                      ml: "-16px",
                      mr: "24px",
                      transition: "background-color 0.2s"
                    }}
                  >
                    
                    {/* Image */}
                    <Box sx={{ width: "90px", height: "110px", backgroundColor: "#f5f5f5", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={booking.image} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>

                    {/* Title and Size */}
                    <Box sx={{ flex: 1.5 }}>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 400, color: "#111", mb: "8px", fontFamily: "Inter, sans-serif" }}>
                        {booking.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#666", fontFamily: "Inter, sans-serif" }}>
                        Size: {booking.size}
                      </Typography>
                    </Box>

                    {/* Price and Date Range */}
                    <Box sx={{ flex: 1, textAlign: "right", pr: "40px" }}>
                      <Typography sx={{ fontSize: "0.85rem", color: "#333", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
                        {booking.price}
                      </Typography>
                    </Box>

                    {/* Delivery Status */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Typography sx={{ fontSize: "0.9rem", color: "#222", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
                        Booking for {booking.deliveryDate}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#777", fontFamily: "Inter, sans-serif" }}>
                        {booking.statusLine}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "4px", cursor: "pointer" }}>
                        <StarIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                          RATE & REVIEW
                        </Typography>
                      </Box>
                    </Box>

                  </Box>
                  
                  {/* Divider between items */}
                  {index !== filteredBookings.length - 1 && (
                    <Divider sx={{ borderColor: "#f0f0f0" }} />
                  )}
                </Box>
              ))
            )}

            <Divider sx={{ borderColor: "#f0f0f0", mb: "32px" }} />

            {/* Pagination manually coded to match design loosely */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", mb: "40px" }}>
              <Typography sx={{ color: "#aaa", fontSize: "0.9rem", cursor: "pointer" }}>&lt;</Typography>
              <Box sx={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontSize: "0.85rem", fontWeight: 500 }}>
                1
              </Box>
              {["2", "3", "4", "...", "9", "10"].map((page, i) => (
                <Typography key={i} sx={{ color: "#444", fontSize: "0.85rem", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {page}
                </Typography>
              ))}
              <Typography sx={{ color: "#333", fontSize: "0.9rem", cursor: "pointer" }}>&gt;</Typography>
            </Box>

          </Box>

        </Box>

      </Box>
    </>
  );
}




