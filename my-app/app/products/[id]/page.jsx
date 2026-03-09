"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Button,
  InputBase,
  Grid,
  Radio,
  Divider,
  Snackbar,
  Skeleton,
  Chip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import StarIcon from "@mui/icons-material/Star";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { useCart } from "@/lib/CartContext";
import Navbar from "@/app/components/Navbar";

export default function ProductDetailPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const { addToBag } = useCart();
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [wished, setWished] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(4); // Default 4 days
  const [toastOpen, setToastOpen] = useState(false);
  const [bagSuccessOpen, setBagSuccessOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "This item is currently rented", sub: "Please check back after the return date" });
  const [isValidating, setIsValidating] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // API data state
  const [listing, setListing] = useState(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [listingError, setListingError] = useState(false);

  // Calendar State & Logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Fetch listing data on mount
  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    const fetchListing = async () => {
      setLoadingListing(true);
      setListingError(false);
      try {
        const res = await fetch(`/api/v1/listings/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setListing(json.data);
          setActiveImage(0);
        } else {
          setListingError(true);
        }
      } catch (e) {
        console.error("Failed to fetch listing:", e);
        setListingError(true);
      } finally {
        setLoadingListing(false);
      }
    };
    fetchListing();
  }, [params?.id]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateClick = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selected >= today) {
      setSelectedStartDate(selected);
    }
  };

  const returnDate = new Date(selectedStartDate);
  returnDate.setDate(returnDate.getDate() + selectedPeriod - 1);

  const formatDisplayDate = (d) => {
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '');
  };

  // Build display data from API listing or fallback
  const images = listing?.images?.length > 0 ? listing.images : ["/product.png"];
  const mainImage = images[activeImage] || images[0];

  // Generate rental options based on listing rental_price
  const basePrice = listing?.rental_price || 85.72;
  const rentalOptions = [
    { days: 4, total: parseFloat((basePrice * 4).toFixed(2)), perDay: parseFloat(basePrice.toFixed(2)) },
    { days: 8, total: parseFloat((basePrice * 8 * 0.97).toFixed(2)), perDay: parseFloat((basePrice * 0.97).toFixed(2)) },
    { days: 12, total: parseFloat((basePrice * 12 * 0.95).toFixed(2)), perDay: parseFloat((basePrice * 0.95).toFixed(2)) },
    { days: 16, total: parseFloat((basePrice * 16 * 0.93).toFixed(2)), perDay: parseFloat((basePrice * 0.93).toFixed(2)) },
  ];
  const selectedOption = rentalOptions.find(o => o.days === selectedPeriod) || rentalOptions[0];
  const retailPrice = listing?.retail_price || 400;
  const savings = (retailPrice - selectedOption.total).toFixed(2);

  const handleAddToBag = () => {
    if (!listing) return;
    
    addToBag({
      id: listing.id,
      name: listing.title,
      brand: listing.brand,
      size: listing.size || "One Size",
      image: images[0],
    }, {
      startDate: selectedStartDate.toISOString(),
      endDate: returnDate.toISOString(),
      days: selectedPeriod,
      total: selectedOption.total,
    });
    
    setBagSuccessOpen(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdfdfd; font-family: 'Inter', sans-serif; }
      `}</style>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#fdfdfd" }}>
        
        <Navbar />

        {/* Promo Banner */}
        <Box sx={{ backgroundColor: "#0a0a0aff", py: "8px", textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#f7f7faff", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            New here? Enjoy <strong>15% off</strong> your first rental — our welcome treat to you.
          </Typography>
        </Box>

        {/* Page Content */}
        <Box
          sx={{
            width: "1440px",
            maxWidth: "100%",
            mx: "auto",
            opacity: 1,
            paddingTop: "24px",
            paddingRight: "40px",
            paddingBottom: "48px",
            paddingLeft: "40px",
            gap: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          
          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "24px" }}>
            <Link href="/" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>Home</Link>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Link href="/products" style={{ fontSize: "0.8rem", color: "#666", textDecoration: "none", fontFamily: "Inter, sans-serif" }}>Products</Link>
            <NavigateNextIcon sx={{ fontSize: 14, color: "#999" }} />
            <Typography sx={{ fontSize: "0.8rem", color: "#111", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
              {loadingListing ? <Skeleton width={80} /> : (listing?.title || "Product")}
            </Typography>
          </Box>

          {/* Error State */}
          {listingError && (
            <Box sx={{ textAlign: "center", py: "80px" }}>
              <ErrorOutlineIcon sx={{ fontSize: 48, color: "#d32f2f", mb: "12px" }} />
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, color: "#d32f2f", fontFamily: "Inter, sans-serif" }}>Product not found</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#888", fontFamily: "Inter, sans-serif", mt: "4px" }}>This listing may have been removed or is unavailable.</Typography>
              <Button onClick={() => router.push("/products")} variant="outlined" sx={{ mt: "24px", borderColor: "#7c3aed", color: "#7c3aed" }}>Back to Products</Button>
            </Box>
          )}

          {!listingError && (
          <Box sx={{ display: "flex", gap: "40px" }}>
            
            {/* Left: Images Column */}
            <Box sx={{ flex: "1 1 50%", display: "flex", gap: "16px", height: "auto" }}>
              {/* Thumbnails */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", width: "80px" }}>
                {loadingListing ? (
                  [0,1,2].map(i => <Skeleton key={i} variant="rectangular" width={80} height={100} sx={{ borderRadius: "4px" }} />)
                ) : (
                  images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      sx={{
                        width: "80px",
                        height: "100px",
                        border: activeImage === idx ? "2px solid #7c3aed" : "1px solid #eee",
                        backgroundColor: "#f9f9f9",
                        cursor: "pointer",
                        overflow: "hidden",
                        borderRadius: "4px",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Thumb ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                  ))
                )}
              </Box>
              {/* Main Image */}
              <Box sx={{ flex: 1, position: "relative", backgroundColor: "#f9f9f9", maxHeight: "800px", overflow: "hidden", borderRadius: "6px" }}>
                {loadingListing ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ minHeight: "500px" }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage} alt={listing?.title || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: "500px" }} />
                )}
                {/* Wishlist icon on main image */}
                <IconButton
                  onClick={(e) => { e.stopPropagation(); setWished((p) => !p); }}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    backgroundColor: "#f5f5f5",
                    width: "36px",
                    height: "36px",
                    "&:hover": { backgroundColor: "#fff" },
                  }}
                >
                  {wished ? <FavoriteIcon sx={{ color: "#e53935", fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ color: "#666", fontSize: 20 }} />}
                </IconButton>
              </Box>
            </Box>

            {/* Right: Details Column */}
            <Box sx={{ flex: "1 1 50%", pl: "16px", pt: "8px" }}>

              {/* Availability Badge */}
              {!loadingListing && listing && (
                <Box sx={{ mb: "12px" }}>
                  {listing.is_available ? (
                    <Chip
                      icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                      label="Available to Rent"
                      size="small"
                      sx={{ backgroundColor: "#dcfce7", color: "#166534", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}
                    />
                  ) : (
                    <Chip
                      icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
                      label="Currently Rented"
                      size="small"
                      sx={{ backgroundColor: "#fef2f2", color: "#9f1239", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}
                    />
                  )}
                </Box>
              )}
              
              {/* Top Meta info */}
              <Box sx={{ display: "flex", alignItems: "center", mb: "12px", gap: "8px", flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#666", fontFamily: "Inter, sans-serif" }}>Category ─</Typography>
                {loadingListing ? <Skeleton width={80} height={20} /> : (
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#111", fontFamily: "Inter, sans-serif", textTransform: "capitalize" }}>
                    {listing?.category || "─"}
                  </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#4ade80", color: "#fff", px: "6px", py: "2px", borderRadius: "2px", ml: "4px" }}>
                  <StarIcon sx={{ fontSize: 10 }} />
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, fontFamily: "Inter, sans-serif", letterSpacing: "0.02em" }}>Top Lenders</Typography>
                </Box>
              </Box>

              <Box sx={{ fontSize: "0.8rem", color: "#444", mb: "16px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "Inter, sans-serif" }}>
                Brand ─ {loadingListing ? <Skeleton width={80} /> : <strong style={{color:"#111"}}>{listing?.brand || "─"}</strong>}
                <Box sx={{ display: "flex", alignItems: "center", ml: "6px" }}>
                  <StarIcon sx={{ fontSize: 12, color: "#000" }} />
                  <StarIcon sx={{ fontSize: 12, color: "#000" }} />
                  <StarIcon sx={{ fontSize: 12, color: "#000" }} />
                  <StarIcon sx={{ fontSize: 12, color: "#000" }} />
                  <StarIcon sx={{ fontSize: 12, color: "#d1d5db" }} />
                </Box>
              </Box>

              <Typography variant="h1" sx={{ fontSize: "1.7rem", fontWeight: 400, mb: "16px", color: "#1a1a1a", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em" }}>
                {loadingListing ? <Skeleton width="80%" height={40} /> : (listing?.title || "Product")}
              </Typography>

              <Typography sx={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.6, mb: "24px", fontFamily: "Inter, sans-serif" }}>
                {loadingListing ? (
                  <><Skeleton /><Skeleton /><Skeleton width="80%" /></>
                ) : (
                  listing?.description || "No description available."
                )}
              </Typography>

              {/* Condition */}
              {!loadingListing && listing?.condition && (
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "16px" }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#666", fontFamily: "Inter, sans-serif" }}>Condition ─</Typography>
                  <Chip
                    label={listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                    size="small"
                    sx={{ backgroundColor: "#f3f4f6", color: "#374151", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 600 }}
                  />
                </Box>
              )}

              <Divider sx={{ mb: "24px", borderColor: "#eaeaea" }} />

              {/* Rent option */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "16px" }}>
                <Radio checked={true} sx={{ p: 0, color: "#333", "&.Mui-checked": { color: "#333" } }} />
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>Rent</Typography>
              </Box>

              {/* Price Details */}
              <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, color: "#111", mb: "4px", fontFamily: "Inter, sans-serif" }}>
                {loadingListing ? <Skeleton width={160} /> : `From £${rentalOptions[0].total.toFixed(2)} / 4 Days`}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "24px" }}>
                <Typography sx={{ fontSize: "0.8rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                  {loadingListing ? <Skeleton width={100} /> : (
                    <>Retail <span style={{ textDecoration: "line-through" }}>£{retailPrice.toFixed(2)}</span></>
                  )}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                  {!loadingListing && savings > 0 && `Save £${savings}`}
                </Typography>
              </Box>

              {/* Size & Deposit */}
              <Box sx={{ display: "flex", gap: "24px", mb: "24px", flexWrap: "wrap" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "2px" }}>SIZE</Typography>
                  {loadingListing ? <Skeleton width={60} /> : (
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", fontFamily: "Inter, sans-serif" }}>
                      {listing?.size || "One Size"}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "2px" }}>DEPOSIT</Typography>
                  {loadingListing ? <Skeleton width={60} /> : (
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", fontFamily: "Inter, sans-serif" }}>
                      £{(listing?.deposit || 0).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Rental Period */}
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: "#222", mb: "12px", fontFamily: "Inter, sans-serif" }}>
                Rental period*
              </Typography>
              
              <Box sx={{ backgroundColor: "#dcfce7", color: "#166534", px: "12px", py: "8px", mb: "16px", textAlign: "center", fontSize: "0.8rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                Save more by renting for longer Period
              </Box>

              <Grid container spacing={2} sx={{ mb: "32px" }}>
                {rentalOptions.map((opt) => (
                  <Grid item xs={6} key={opt.days}>
                    <Box
                      onClick={() => setSelectedPeriod(opt.days)}
                      sx={{
                        border: selectedPeriod === opt.days ? "1px solid #111" : "1px solid #e5e7eb",
                        padding: "12px 16px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        backgroundColor: selectedPeriod === opt.days ? "#fcfcfc" : "#fff",
                        transition: "all 0.1s ease"
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#111", fontFamily: "Inter, sans-serif" }}>{opt.days} Days:</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>£{opt.perDay}/day</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#111", fontFamily: "Inter, sans-serif" }}>
                        £{opt.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Dynamic Calendar */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: "24px" }}>
                <Box sx={{ border: "1px solid #eaeaea", borderRadius: "8px", p: "16px", width: "260px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px" }}>
                    <IconButton size="small" onClick={handlePrevMonth}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton size="small" onClick={handleNextMonth}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", mb: "8px" }}>
                    {['S','M','T','W','T','F','S'].map((d, i) => <Typography key={i} sx={{ fontSize: "0.7rem", color: "#aaa" }}>{d}</Typography>)}
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
                    {[...Array(firstDayOfMonth)].map((_, i) => <Box key={`empty-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isPast = cellDate < today;
                      const isSelected = cellDate.getTime() === selectedStartDate.getTime();
                      return (
                        <Box
                          key={day}
                          onClick={() => !isPast && handleDateClick(day)}
                          sx={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            color: isSelected ? "#fff" : isPast ? "#ccc" : "#444",
                            backgroundColor: isSelected ? "#1976d2" : "transparent",
                            borderRadius: "50%",
                            margin: "auto",
                            cursor: isPast ? "default" : "pointer",
                            "&:hover": { backgroundColor: isSelected ? "#1976d2" : isPast ? "transparent" : "#f0f0f0" }
                          }}
                        >
                          {day}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", mb: "8px", fontFamily: "Inter, sans-serif" }}>Date:</Typography>
              <Box sx={{ fontSize: "0.8rem", color: "#555", mb: "16px", lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
                Select your preferred rental period. A 4-day buffer is automatically added for shipping and cleaning.
                <br />• Arrives by {formatDisplayDate(selectedStartDate)}
                <br />• Return by {formatDisplayDate(returnDate)}
              </Box>

              {/* Total */}
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", mb: "4px", fontFamily: "Inter, sans-serif" }}>
                Total: £{selectedOption.total.toFixed(2)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#777", mb: "24px", lineHeight: 1.4, fontFamily: "Inter, sans-serif" }}>
                Your total includes the rental price, a temporary security deposit (if applicable), service fee, shipping cost and any cleaning fee set by the lender.
              </Typography>

              {/* Actions */}
              <Button
                disabled={isValidating}
                onClick={async () => {
                  setIsValidating(true);
                  const id = params?.id || '1';
                  try {
                    const res = await fetch("/api/v1/bookings/validate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        listing_id: id,
                        start_date: selectedStartDate.toISOString(),
                        end_date: returnDate.toISOString()
                      })
                    });
                    const json = await res.json();
                    if (json.success && json.data.valid) {
                      router.push(`/checkout/${id}?start=${selectedStartDate.toISOString()}&end=${returnDate.toISOString()}`);
                    } else {
                      setToastMessage({ title: "Unavailable for Dates", sub: json.error || "The listing is not available for the selected dates." });
                      setToastOpen(true);
                    }
                  } catch (e) {
                     setToastMessage({ title: "Validation Error", sub: "Failed to validate booking dates." });
                     setToastOpen(true);
                  } finally {
                     setIsValidating(false);
                  }
                }}
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  py: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "2px",
                  mb: "12px",
                  boxShadow: "none",
                  fontFamily: "Inter, sans-serif",
                  "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" }
                }}
              >
                {isValidating ? "VALIDATING..." : "RENT NOW"}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddToBag}
                sx={{
                  borderColor: "#111",
                  color: "#111",
                  py: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "2px",
                  fontFamily: "Inter, sans-serif",
                  "&:hover": { borderColor: "#000", backgroundColor: "#fafafa" }
                }}
              >
                ADD TO BAG
              </Button>

              <Typography sx={{ fontSize: "0.7rem", color: "#ef4444", mt: "16px", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
                The lender has upto 12 hrs to accept your booking request. You will recieve an email and app notification once its confirmed.
              </Typography>
            </Box>
          </Box>
          )}
        </Box>
      </Box>

      {/* Rented Status Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={(e, reason) => { if (reason !== 'clickaway') setToastOpen(false); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: "64px" }}
      >
        <Box
          sx={{
            backgroundColor: "#ea580c",
            color: "#fff",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "16px 20px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            maxWidth: "450px"
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ mt: "2px", fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
              {toastMessage.title}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", mt: "2px", fontFamily: "Inter, sans-serif", opacity: 0.9 }}>
              {toastMessage.sub}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mt: "2px", ml: "16px" }}>
            <Typography
              onClick={() => router.push("/products")}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.05em",
                "&:hover": { opacity: 0.8 }
              }}
            >
              BACK TO CATALOG
            </Typography>
            <CloseIcon
              onClick={() => setToastOpen(false)}
              sx={{ fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
            />
          </Box>
        </Box>
      </Snackbar>

      {/* Success Toast */}
      <Snackbar
        open={bagSuccessOpen}
        autoHideDuration={4000}
        onClose={(e, reason) => { if (reason !== 'clickaway') setBagSuccessOpen(false); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: "64px" }}
      >
        <Box
          sx={{
            backgroundColor: "#10b981",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 20px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
              Added to Bag!
            </Typography>
          </Box>
          <Button 
            onClick={() => router.push("/bag")}
            sx={{ color: "#fff", fontWeight: 700, ml: "12px", textDecoration: "underline", fontSize: "0.75rem" }}
          >
            VIEW BAG
          </Button>
          <CloseIcon
            onClick={() => setBagSuccessOpen(false)}
            sx={{ fontSize: 16, cursor: "pointer", ml: "8px" }}
          />
        </Box>
      </Snackbar>
    </>
  );
}
