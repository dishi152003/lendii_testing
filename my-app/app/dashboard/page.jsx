"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Divider, Button, Tabs, Tab, IconButton, Chip, InputBase, Stepper, Step, StepLabel, TextField, MenuItem, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, InputAdornment, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Avatar, Pagination, Dialog, DialogTitle, DialogContent, StepContent, StepConnector, Menu, CircularProgress, Snackbar, Alert } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import PaymentIcon from "@mui/icons-material/Payment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GetAppIcon from "@mui/icons-material/GetApp";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [activeNotifTab, setActiveNotifTab] = useState(0);
  const [activeEarningsTab, setActiveEarningsTab] = useState(0);
  const [activeOrderTab, setActiveOrderTab] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addListingStep, setAddListingStep] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmShipOpen, setConfirmShipOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: "", severity: "success" });
  
  // Validation Widget States
  const [valListingId, setValListingId] = useState("");
  const [valStartDate, setValStartDate] = useState("");
  const [valEndDate, setValEndDate] = useState("");
  const [valIsLoading, setValIsLoading] = useState(false);
  const [valResult, setValResult] = useState(null);

  const defaultListing = {
    image: "/product.png",
    title: "Red Silk Evening Dress",
    brand: "Calvin Klein",
    category: "Womenswear",
    size: "Size 4",
    price: 45
  };

  const [mockListings, setMockListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(false);

  const [mockOrders, setMockOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(false);

  // Dynamic stats calculation
  const activeCount = mockListings.length;
  const upcomingCount = mockOrders.filter(o => ["Paid", "Shipped"].includes(o.status)).length;
  const pendingReturnCount = mockOrders.filter(o => o.status === "Delivered").length;
  const totalEarningsVal = mockOrders
    .filter(o => ["Delivered", "Returned"].includes(o.status))
    .reduce((sum, o) => sum + (parseFloat(o.total.replace('$', '').replace('€', '')) || 0), 0);

  const stats = [
    { title: "Active Listings", count: listingsLoading ? "..." : activeCount.toString(), sub: "Items live" },
    { title: "Upcoming Rentals", count: ordersLoading ? "..." : upcomingCount.toString(), sub: "To be shipped" },
    { title: "Pending Returns", count: ordersLoading ? "..." : pendingReturnCount.toString(), sub: "Awaiting items" },
    { title: "Total Earnings", count: ordersLoading ? "..." : `€${totalEarningsVal.toFixed(0)}`, sub: "Revenue to date" },
  ];

  const analyticsStats = [
    { title: "Total Revenue", value: ordersLoading ? "..." : `€${totalEarningsVal.toFixed(2)}` },
    { title: "Orders", value: ordersLoading ? "..." : mockOrders.length.toString() },
    { title: "Avg Order Value", value: ordersLoading ? "..." : (mockOrders.length > 0 ? `€${(totalEarningsVal / mockOrders.length).toFixed(2)}` : "€0.00") },
    { title: "Conversion Rate", value: "3.2%" }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setListingsLoading(true);
      setListingsError(false);
      try {
        console.log("Fetching listings API...");
        const response = await fetch("/api/v1/listings?status=published&limit=50&t=" + Date.now());
        const json = await response.json();
        if (json.success && json.data) {
          const mappedListings = json.data.map(item => ({
            id: item.id,
            image: item.images && item.images.length > 0 ? item.images[0] : "/product.png",
            title: item.title,
            brand: item.brand,
            category: item.category,
            size: item.size,
            price: item.rental_price,
            description: item.description,
            deposit: item.deposit,
            condition: item.condition
          }));
          setMockListings(mappedListings);
        } else {
          setListingsError(true);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListingsError(true);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, []);
  const [listingPage, setListingPage] = useState(1);
  const [selectedAvailabilityItem, setSelectedAvailabilityItem] = useState(null);
  const fileInputRef = useRef(null);

  const [listingForm, setListingForm] = useState({
    title: "", brand: "", category: "womenswear", description: "", price: "", deposit: "", size: "", condition: "new"
  });
  const [editIndex, setEditIndex] = useState(null);
  const [availabilityCheckResult, setAvailabilityCheckResult] = useState(null);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemIndex, setMenuItemIndex] = useState(null);

  const handleMenuClick = (event, absoluteIndex) => {
    setAnchorEl(event.currentTarget);
    setMenuItemIndex(absoluteIndex);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemIndex(null);
  };

  const handleDeleteListing = async () => {
    if (menuItemIndex !== null) {
      const listing = mockListings[menuItemIndex];
      try {
        const response = await fetch(`/api/v1/admin/listings/${listing.id}`, {
          method: "DELETE"
        });
        const json = await response.json();
        if (json.success) {
          setMockListings(prev => prev.filter((_, idx) => idx !== menuItemIndex));
          setSnackbarInfo({ open: true, message: "Listing deleted successfully!", severity: "success" });
        } else {
          setSnackbarInfo({ open: true, message: json.error || "Failed to delete listing.", severity: "error" });
        }
      } catch (e) {
        console.error(e);
        setSnackbarInfo({ open: true, message: "Failed to delete listing.", severity: "error" });
      }
    }
    handleMenuClose();
  };

  const handlePublishListing = async () => {
    if (menuItemIndex !== null) {
      const listing = mockListings[menuItemIndex];
      try {
        const response = await fetch(`/api/v1/admin/listings/${listing.id}/publish`, {
           method: "POST"
        });
        const json = await response.json();
        if (json.success) {
           setMockListings(prev => {
             const copy = [...prev];
             copy[menuItemIndex] = { ...copy[menuItemIndex], status: json.data.status };
             return copy;
           });
           setSnackbarInfo({ open: true, message: "Listing published successfully!", severity: "success" });
        }
      } catch (e) {
        console.error(e);
        setSnackbarInfo({ open: true, message: "Failed to publish listing.", severity: "error" });
      }
    }
    handleMenuClose();
  };

  const handleUnpublishListing = async () => {
    if (menuItemIndex !== null) {
      const listing = mockListings[menuItemIndex];
      try {
        const response = await fetch(`/api/v1/admin/listings/${listing.id}/unpublish`, {
           method: "POST"
        });
        const json = await response.json();
        if (json.success) {
           setMockListings(prev => {
             const copy = [...prev];
             copy[menuItemIndex] = { ...copy[menuItemIndex], status: json.data.status };
             return copy;
           });
           setSnackbarInfo({ open: true, message: "Listing unpublished successfully!", severity: "success" });
        }
      } catch (e) {
        console.error(e);
        setSnackbarInfo({ open: true, message: "Failed to unpublish listing.", severity: "error" });
      }
    }
    handleMenuClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };

  const handleEditListingClick = async (absoluteIndex) => {
    const baseItem = mockListings[absoluteIndex];
    try {
      const response = await fetch(`/api/v1/listings/${baseItem.id}`);
      const json = await response.json();
      let item = baseItem;
      if (json.success && json.data) {
        item = {
          ...baseItem,
          title: json.data.title,
          brand: json.data.brand,
          category: json.data.category,
          size: json.data.size,
          price: json.data.rental_price,
          description: json.data.description,
          deposit: json.data.deposit,
          condition: json.data.condition,
          image: json.data.images?.length > 0 ? json.data.images[0] : baseItem.image
        };
      }
      setListingForm({
        title: item.title, brand: item.brand, category: item.category, description: item.description || "", price: item.price, deposit: item.deposit || "", size: item.size, condition: item.condition || "new"
      });
      setEditIndex(absoluteIndex);
      if (item.image && item.image !== "/product.png") {
        setUploadedImages([{ url: item.image }]);
        setCoverIndex(0);
      } else {
        setUploadedImages([]);
      }
      setAddListingStep(0);
      setActiveMenu("AddNewListing");
    } catch (e) {
      console.error(e);
    }
  };

  const handleListingFormChange = (e) => {
    const { name, value } = e.target;
    setListingForm(prev => ({ ...prev, [name]: value }));
  };

  const menuItems = [
    { name: "Dashboard", icon: <DashboardIcon /> },
    { name: "Listing", icon: <ListAltIcon /> },
    { name: "Order", icon: <ShoppingCartIcon /> },
    { name: "Analytics", icon: <AnalyticsIcon /> },
  ];


  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(false);
      try {
        console.log("Fetching orders API...");
        const response = await fetch("/api/v1/admin/orders?t=" + Date.now());
        const json = await response.json();
        if (json.success && json.data) {
          const formatDate = (iso) => {
            if (!iso) return "";
            return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          };
          const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
          const mappedOrders = json.data
            .filter((order) => order.status !== "pending")
            .map((order) => ({
              id: order.id ? order.id.slice(0, 8).toUpperCase() : "—",
              rawId: order.id,
              date: formatDate(order.created_at),
              item: order.listings?.title || "—",
              details: `${capitalize(order.listings?.category || "")} - Size ${order.listings?.size || "—"}`,
              borrower: order.users?.email?.split("@")[0] || "—",
              email: order.users?.email || "—",
              dates: `${formatDate(order.start_date)} - ${formatDate(order.end_date)}`,
              status: capitalize(order.status),
              total: `$${order.total_amount ?? 0}`,
              image: order.listings?.image || "/product.png"
            }));
          setMockOrders(mappedOrders);
        } else {
          setOrdersError(true);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError(true);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleConfirmShip = async () => {
    if (selectedOrder && selectedOrder.rawId) {
      try {
        const res = await fetch(`/api/v1/orders/${selectedOrder.rawId}/ship`, { method: "PATCH" });
        if (res.ok) {
          setMockOrders(prev => prev.map(o => o.rawId === selectedOrder.rawId ? { ...o, status: "Shipped" } : o));
          setSelectedOrder(prev => ({ ...prev, status: "Shipped" }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    setConfirmShipOpen(false);
  };

  const handleMarkAsDelivered = async () => {
    if (selectedOrder && selectedOrder.rawId) {
      try {
        const res = await fetch(`/api/v1/orders/${selectedOrder.rawId}/complete`, { method: "PATCH" });
        if (res.ok) {
          setMockOrders(prev => prev.map(o => o.rawId === selectedOrder.rawId ? { ...o, status: "Delivered" } : o));
          setSelectedOrder(prev => ({ ...prev, status: "Delivered" }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMarkAsReturned = async () => {
    if (selectedOrder && selectedOrder.rawId) {
      // Mock returned API call since it's not explicitly requested, but good for completeness
      try {
        // await fetch(`/api/v1/admin/orders/${selectedOrder.rawId}/returned`, { method: "PATCH" });
        setMockOrders(prev => prev.map(o => o.rawId === selectedOrder.rawId ? { ...o, status: "Returned" } : o));
        setSelectedOrder(prev => ({ ...prev, status: "Returned" }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleManualValidation = async () => {
    if (!valListingId || !valStartDate || !valEndDate) {
      setSnackbarInfo({ open: true, message: "Please fill in all validation fields.", severity: "warning" });
      return;
    }
    setValIsLoading(true);
    setValResult(null);
    try {
      const res = await fetch("/api/v1/bookings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: valListingId,
          start_date: new Date(valStartDate).toISOString(),
          end_date: new Date(valEndDate).toISOString()
        })
      });
      const json = await res.json();
      if (json.success && json.data.valid) {
        setValResult({ success: true, message: json.message || "Booking dates are valid and available!" });
      } else {
        setValResult({ success: false, message: json.error || "Listing is not available for these dates." });
      }
    } catch (e) {
      setValResult({ success: false, message: "Failed to validate booking. Check server." });
    } finally {
      setValIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newImages = newFiles.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));
      setUploadedImages(prev => [...prev, ...newImages].slice(0, 5)); // max 5 photos
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    if (coverIndex === indexToRemove) {
      setCoverIndex(0);
    } else if (coverIndex > indexToRemove) {
      setCoverIndex(prev => prev - 1);
    }
  };

  const handleCreateListing = async () => {
    let newImage = "/product.png";
    if (uploadedImages.length > 0) {
      newImage = uploadedImages[coverIndex] ? uploadedImages[coverIndex].url : uploadedImages[0].url;
    }
    
    const payload = {
      title: listingForm.title || "New Custom Listing",
      brand: listingForm.brand || "LENDi Selection",
      category: listingForm.category || "Womenswear",
      size: listingForm.size || "Size M",
      rental_price: parseFloat(listingForm.price) || 65,
      description: listingForm.description || "",
      deposit: parseFloat(listingForm.deposit) || 0,
      condition: listingForm.condition || "new",
      images: [newImage]
    };
    
    if (editIndex === null) {
      try {
         const res = await fetch("/api/v1/admin/listings", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
         });
         const json = await res.json();
         if (json.success) {
            const newItem = {
               id: json.data.id,
               image: json.data.images[0] || "/product.png",
               title: json.data.title,
               brand: json.data.brand,
               category: json.data.category,
               size: json.data.size,
               price: json.data.rental_price,
               description: json.data.description,
               deposit: json.data.deposit,
               condition: json.data.condition
            };
            setMockListings(prev => [newItem, ...prev]);
         }
      } catch(e) { console.error(e); }
    } else {
       const existingItemId = mockListings[editIndex].id;
       try {
         const res = await fetch(`/api/v1/admin/listings/${existingItemId}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
         });
         const json = await res.json();
         if (json.success) {
           const updatedListing = {
              image: newImage,
              title: payload.title,
              brand: payload.brand,
              category: payload.category,
              size: payload.size,
              price: payload.rental_price,
              description: payload.description,
              deposit: payload.deposit,
              condition: payload.condition
           };
           setMockListings(prev => {
             const copy = [...prev];
             copy[editIndex] = { ...copy[editIndex], ...updatedListing };
             return copy;
           });
           setEditIndex(null);
         }
       } catch(e) { console.error(e); }
    }

    setUploadedImages([]);
    setAddListingStep(0);
    setListingForm({ title: "", brand: "", category: "womenswear", description: "", price: "", deposit: "", size: "", condition: "new" });
    setActiveMenu("Listing");
  };

  const getStatusChip = (status) => {
    if (status === "Paid") return <Chip label={status} size="small" sx={{ backgroundColor: "#e67e22", color: "#fff", fontSize: "0.7rem", height: "24px", fontWeight: 600, borderRadius: "12px", px: "4px" }} />;
    if (status === "Shipped") return <Chip label={status} size="small" sx={{ backgroundColor: "#1976d2", color: "#fff", fontSize: "0.7rem", height: "24px", fontWeight: 600, borderRadius: "12px", px: "4px" }} />;
    if (status === "Delivered") return <Chip label={status} size="small" sx={{ backgroundColor: "#2e7d32", color: "#fff", fontSize: "0.7rem", height: "24px", fontWeight: 600, borderRadius: "12px", px: "4px" }} />;
    if (status === "Returned") return <Chip label={status} size="small" sx={{ backgroundColor: "#e0e0e0", color: "#555", fontSize: "0.7rem", height: "24px", fontWeight: 600, borderRadius: "12px", px: "4px" }} />;
    return <Chip label={status} size="small" />;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdfdfd; font-family: 'Inter', sans-serif; }
      `}</style>
      
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
        
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
            <IconButton size="small" sx={{ color: "#fff", p: "4px", visibility: "hidden", display: { xs: "block", md: "none" } }}>
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.05rem", fontFamily: "Inter, sans-serif", letterSpacing: "0.05em" }}>
              LENDi
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flex: 1 }}>
          
          {/* Sidebar Wrapper */}
            <Box
            sx={{
              width: "240px",
              flexShrink: 0,
              overflow: "hidden",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: "#fff",
              borderRight: "1px solid #eaeaea",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ width: "240px", display: "flex", flexDirection: "column", height: "100%", pt: "8px" }}>
            <Box sx={{ px: "16px", flex: 1 }}>
              {menuItems.map((item) => (
                <Box
                  key={item.name}
                  onClick={() => {
                    setActiveMenu(item.name);
                    // Optional: setIsSidebarOpen(false) if auto-close is desired
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
            
            {/* Logout Bottom */}
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
            </Box>
          </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, p: "32px", overflowY: "auto" }}>
          <Box sx={{ width: "100%" }}>
            
            {activeMenu === "Dashboard" && (
              <>
            {/* Top Stat Cards */}
            <Box sx={{ display: "flex", gap: "16px", mb: "24px" }}>
              {stats.map((stat, idx) => (
                <Box key={idx} sx={{ flex: 1, backgroundColor: "#fff", p: "20px", border: "1px solid #eaeaea", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                  <Typography sx={{ fontSize: "1rem", color: "#333", fontWeight: 500, mb: "4px", fontFamily: "Inter, sans-serif" }}>
                    {stat.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#888", mb: "16px", fontFamily: "Inter, sans-serif" }}>
                    {stat.sub}
                  </Typography>
                  <Typography sx={{ fontSize: "1.8rem", color: "#555", fontWeight: 400, fontFamily: "Inter, sans-serif" }}>
                    {stat.count}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Quick Actions Bar */}
            <Box sx={{ display: "flex", gap: "16px", mb: "32px" }}>
              <Button onClick={() => {
                setListingForm({ title: "", brand: "", category: "womenswear", description: "", price: "", deposit: "", size: "", condition: "new" });
                setEditIndex(null);
                setUploadedImages([]);
                setActiveMenu("AddNewListing");
              }} sx={{ flex: 1, backgroundColor: "#fcfcfc", border: "1px solid #eaeaea", color: "#333", py: "12px", display: "flex", gap: "8px", textTransform: "none", fontWeight: 600, fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <AddIcon sx={{ color: "#777" }} /> Add New Listing
              </Button>
              <Button onClick={() => setActiveMenu("Order")} sx={{ flex: 1, backgroundColor: "#fcfcfc", border: "1px solid #eaeaea", color: "#333", py: "12px", display: "flex", gap: "8px", textTransform: "none", fontWeight: 600, fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <ShoppingBagIcon sx={{ color: "#777" }} /> View Order
              </Button>
              <Button onClick={() => setActiveMenu("Payments")} sx={{ flex: 1, backgroundColor: "#fcfcfc", border: "1px solid #eaeaea", color: "#333", py: "12px", display: "flex", gap: "8px", textTransform: "none", fontWeight: 600, fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <ReceiptIcon sx={{ color: "#777" }} /> Request Payments
              </Button>
              <Button onClick={() => setActiveMenu("Support")} sx={{ flex: 1, backgroundColor: "#fcfcfc", border: "1px solid #eaeaea", color: "#333", py: "12px", display: "flex", gap: "8px", textTransform: "none", fontWeight: 600, fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <SettingsIcon sx={{ color: "#777" }} /> Contact Support
              </Button>
            </Box>

            {/* Bottom 2-Column Section */}
            <Box sx={{ display: "flex", gap: "24px" }}>
              
              {/* Left Column: Notifications */}
              <Box sx={{ flex: 1.5, backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "4px", p: "24px" }}>
                <Typography variant="h2" sx={{ fontSize: "1.1rem", color: "#222", fontWeight: 500, mb: "16px", fontFamily: "Inter, sans-serif" }}>
                  Notifications & Activity
                </Typography>
                
                <Tabs value={activeNotifTab} onChange={(e, v) => setActiveNotifTab(v)} sx={{ minHeight: "36px", mb: "24px", borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { minHeight: "36px", fontSize: "0.75rem", fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#777", textTransform: "uppercase" }, "& .Mui-selected": { color: "#1976d2" } }}>
                  <Tab label="ALL" />
                  <Tab label="ORDERS" />
                  <Tab label="EARNINGS" />
                </Tabs>

                <Box sx={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {(ordersLoading ? [] : [
                    ...mockOrders.slice(0, 3).map(order => ({
                      type: 'order',
                      title: 'New Booking Received',
                      sub: `Booking #${order.id} confirmed from ${order.borrower}.`,
                      time: order.date,
                      action: 'VIEW ORDER',
                      link: `/order-details/${order.rawId}`,
                      icon: <ArticleIcon fontSize="small" />
                    })),
                    { type: 'earning', title: 'Payout processed', sub: 'Payout #P-3001 processed (€179).', time: 'Oct 1, 2025', action: 'VIEW DETAILS', icon: <PaymentIcon fontSize="small" /> },
                    { type: 'order', title: 'Review Pending', sub: 'Your item "Gucci Scarf" was returned. Please review condition.', time: 'Sep 28, 2025', action: 'REVIEW', icon: <ArticleIcon fontSize="small" /> },
                    { type: 'earning', title: 'Weekly Earning Report', sub: 'Report generated for the last 7 days.', time: 'Sep 27, 2025', action: 'VIEW REPORT', icon: <PaymentIcon fontSize="small" /> }
                  ]).filter(n => {
                    if (activeNotifTab === 0) return true;
                    if (activeNotifTab === 1) return n.type === 'order';
                    if (activeNotifTab === 2) return n.type === 'earning';
                    return true;
                  }).map((notif, idx, arr) => (
                    <Box key={idx} sx={{ display: "flex", gap: "16px", py: "16px", borderBottom: idx === arr.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                      <Box sx={{ mt: "4px", color: "#777" }}>{notif.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "0.95rem", color: "#222", fontWeight: 600, mb: "4px", fontFamily: "Inter, sans-serif" }}>
                          {notif.title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#555", mb: "8px", fontFamily: "Inter, sans-serif" }}>
                          {notif.sub}
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                          {notif.time}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          onClick={() => notif.link && router.push(notif.link)}
                          sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}
                        >
                          {notif.action}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Right Column: Upcoming Orders & Earnings Snapshot */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Upcoming Orders */}
                <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "4px", p: "24px" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" }}>
                     <Typography variant="h2" sx={{ fontSize: "1.1rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                      Upcoming Orders
                    </Typography>
                     <Typography onClick={() => setActiveMenu("Order")} sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
                        VIEW ALL
                     </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {ordersLoading ? (
                      <Box sx={{ py: "24px", display: "flex", justifyContent: "center" }}>
                        <CircularProgress size={24} sx={{ color: "#1976d2" }} />
                      </Box>
                    ) : ordersError ? (
                      <Box sx={{ py: "24px", textAlign: "center" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#d32f2f", fontFamily: "Inter, sans-serif" }}>Failed to load orders.</Typography>
                      </Box>
                    ) : mockOrders.length === 0 ? (
                      <Box sx={{ py: "24px", textAlign: "center" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#888", fontFamily: "Inter, sans-serif" }}>No upcoming orders.</Typography>
                      </Box>
                    ) : (
                      mockOrders.slice(0, 3).map((order, index) => (
                        <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "12px", borderBottom: index === 2 || index === mockOrders.length - 1 ? "none" : "1px solid #f0f0f0" }}>
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "6px" }}>
                               <Typography sx={{ fontSize: "0.8rem", color: "#444", fontFamily: "Inter, sans-serif" }}>{order.id}</Typography>
                               <Chip label={order.status} size="small" sx={{ 
                                  backgroundColor: order.status === "Pending" ? "#ed6c02" : order.status === "Paid" ? "#1976d2" : "#2e7d32", 
                                  color: "#fff", fontSize: "0.65rem", height: "18px", fontWeight: 500 
                               }} />
                            </Box>
                            <Typography sx={{ fontSize: "0.85rem", color: "#222", fontWeight: 500, mb: "2px", fontFamily: "Inter, sans-serif" }}>{order.item}</Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "#777", fontFamily: "Inter, sans-serif" }}>{order.borrower} - {order.dates}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                             <Typography sx={{ fontSize: "0.85rem", color: "#111", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>{order.total}</Typography>
                             <ArrowForwardIcon sx={{ fontSize: 16, color: "#111", cursor: "pointer" }} />
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>

                {/* Earnings Snapshot */}
                <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "4px", p: "24px" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" }}>
                     <Typography variant="h2" sx={{ fontSize: "1.1rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                      Earnings Snapshot
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#1976d2", cursor: "pointer" }}>
                      <GetAppIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
                        EXPORT
                     </Typography>
                    </Box>
                  </Box>
                  
                  <Tabs value={activeEarningsTab} onChange={(e, v) => setActiveEarningsTab(v)} sx={{ minHeight: "36px", borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { minHeight: "36px", fontSize: "0.75rem", fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#777", textTransform: "uppercase" }, "& .Mui-selected": { color: "#1976d2" } }}>
                    <Tab label="ALL" />
                    <Tab label="ORDERS" />
                    <Tab label="EARNINGS" />
                  </Tabs>

                  <Box sx={{ mt: "24px" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#666", mb: "4px" }}>Total Processed Earnings</Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 400, color: "#111" }}>
                      {ordersLoading ? "€..." : `€${totalEarningsVal.toLocaleString()}`}
                    </Typography>
                  </Box>

                  <Box sx={{ height: "60px", width: "100%", display: "flex", alignItems: "flex-end", gap: "4px", mt: "16px" }}>
                    {/* Tiny bar chart visualization */}
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <Box key={i} sx={{ flex: 1, backgroundColor: "#e2e8f0", height: `${h}%`, borderRadius: "2px" }} />
                    ))}
                  </Box>

                </Box>

              </Box>

            </Box>
            </>
            )}

            {activeMenu === "Listing" && (
              <Box>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Listing
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                      Manage your product rental inventory
                    </Typography>
                  </Box>
                  <Button onClick={() => {
                    setListingForm({ title: "", brand: "", category: "womenswear", description: "", price: "", deposit: "", size: "", condition: "new" });
                    setEditIndex(null);
                    setUploadedImages([]);
                    setActiveMenu("AddNewListing");
                  }} variant="contained" sx={{ backgroundColor: "#1976d2", textTransform: "none", fontWeight: 600, px: "20px", "&:hover": { backgroundColor: "#1565c0" }, boxShadow: "none" }}>
                    ADD NEW LISTING
                  </Button>
                </Box>

                {/* Grid */}
                {listingsLoading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: "80px", gap: "16px" }}>
                    <CircularProgress size={28} sx={{ color: "#1976d2" }} />
                    <Typography sx={{ fontSize: "0.85rem", color: "#888", fontFamily: "Inter, sans-serif" }}>Loading listings...</Typography>
                  </Box>
                ) : listingsError ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: "80px", gap: "8px", backgroundColor: "#fff9f9", borderRadius: "8px", border: "1px solid #fce8e8" }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>⚠️</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "#d32f2f", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Backend server is offline</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#888", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Failed to load listings. Please refresh the page.</Typography>
                  </Box>
                ) : mockListings.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: "80px", gap: "8px" }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>📂</Typography>
                    <Typography sx={{ fontSize: "0.9rem", color: "#888", fontFamily: "Inter, sans-serif" }}>No listings yet. Add your first listing!</Typography>
                  </Box>
                ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "32px" }}>
                  {mockListings.slice((listingPage - 1) * 6, listingPage * 6).map((item, index) => (
                    <Box key={index} sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      
                      <Box sx={{ height: "380px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={item.image} alt="product" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9, mixBlendMode: item.image === "/product.png" ? 'multiply' : 'normal' }} />
                      </Box>
                      
                      <Box sx={{ p: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, color: "#333", fontFamily: "Inter, sans-serif", mb: "2px" }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px" }}>
                          {item.brand}
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "20px" }}>
                           <Typography sx={{ fontSize: "0.75rem", color: "#333", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>{item.category}</Typography>
                           <Typography sx={{ fontSize: "0.75rem", color: "#333", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>{item.size}</Typography>
                        </Box>

                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#222", fontFamily: "Inter, sans-serif", mb: "20px" }}>
                          €{item.price}<Typography component="span" sx={{ fontSize: "0.7rem", color: "#666", fontWeight: 500 }}>/day</Typography>
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" }}>
                          <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif" }}>127</Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: "#888", fontFamily: "Inter, sans-serif" }}>Views</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", textAlign: "center" }}>12</Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: "#888", fontFamily: "Inter, sans-serif", textAlign: "center" }}>Bookings</Typography>
                          </Box>
                          <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mt: "2px" }}>Sep 20, 2024</Typography>
                            <Typography sx={{ fontSize: "0.65rem", color: "#888", fontFamily: "Inter, sans-serif" }}>Last rented</Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: "16px", borderColor: "#f0f0f0" }} />

                        <Box sx={{ display: "flex", gap: "8px", mt: "auto" }}>
                          <Button 
                            onClick={() => {
                              setSelectedAvailabilityItem(item);
                              setActiveMenu("AddNewAvailability");
                            }} 
                            variant="contained" startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} sx={{ flex: 1, backgroundColor: "#1976d2", textTransform: "none", fontWeight: 600, fontSize: "0.75rem", padding: "8px", boxShadow: "none", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}>
                            AVAILABILITY
                          </Button>
                          <IconButton onClick={() => handleEditListingClick((listingPage - 1) * 6 + index)} size="small" sx={{ border: "1px solid #e0e0e0", borderRadius: "4px", p: "6px", color: "#777" }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton onClick={(e) => handleMenuClick(e, (listingPage - 1) * 6 + index)} size="small" sx={{ border: "1px solid #e0e0e0", borderRadius: "4px", p: "6px", color: "#777" }}>
                            <MoreVertIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>

                      </Box>
                    </Box>
                  ))}
                </Box>
                )}

                {/* Menu and Pagination — always rendered, outside the ternary */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  {menuItemIndex !== null && mockListings[menuItemIndex]?.status === 'published' ? (
                     <MenuItem onClick={handleUnpublishListing} sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>Unpublish</MenuItem>
                  ) : (
                     <MenuItem onClick={handlePublishListing} sx={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>Publish</MenuItem>
                  )}
                  <MenuItem onClick={handleDeleteListing} sx={{ color: "red", fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>Delete</MenuItem>
                </Menu>
                {mockListings.length > 6 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: "32px", mb: "16px" }}>
                    <Pagination 
                      count={Math.ceil(mockListings.length / 6)} 
                      page={listingPage} 
                      onChange={(e, val) => setListingPage(val)} 
                      color="primary" 
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeMenu === "AddNewListing" && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                    Add new Listing
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", mb: "24px" }}>
                    Create a new rental listing for your fashion item
                  </Typography>
                  
                  <Box sx={{ backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "8px", p: "32px", display: "flex", flexDirection: "column", minHeight: "450px" }}>
                    
                    <Box sx={{ mb: "48px", mt: "24px" }}>
                      <Stepper activeStep={addListingStep} alternativeLabel sx={{
                        "& .MuiStepIcon-root": { color: "#ccc" },
                        "& .MuiStepIcon-root.Mui-active": { color: "#1976d2" },
                        "& .MuiStepIcon-root.Mui-completed": { color: "#1976d2" },
                        "& .MuiStepLabel-label": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "#888", cursor: "pointer" },
                        "& .MuiStepLabel-label.Mui-active": { color: "#222", fontWeight: 600 }
                      }}>
                        {["Basic Info", "Pricing", "Photos & Status"].map((label, idx) => (
                          <Step key={label}>
                            <StepLabel onClick={() => setAddListingStep(idx)}>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    {addListingStep === 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                          Basic Information
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", mb: "32px" }}>
                          Provide essential details about your fashion item to help renters find and understand your listing.
                        </Typography>

                        <Box sx={{ display: "flex", gap: "24px", mb: "32px" }}>
                          <TextField 
                            name="title"
                            value={listingForm.title}
                            onChange={handleListingFormChange}
                            label="Title" 
                            variant="standard" 
                            fullWidth 
                            helperText="Be descriptive and specific. Include color, style, and key features."
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                          />
                          <TextField 
                            select 
                            name="category"
                            value={listingForm.category}
                            onChange={handleListingFormChange}
                            label="Category" 
                            variant="standard" 
                            fullWidth 
                            sx={{ flex: 1, "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" } }}
                            InputLabelProps={{ shrink: true }}
                          >
                            <MenuItem value="" disabled>Select a category</MenuItem>
                            <MenuItem value="womenswear">Womenswear</MenuItem>
                            <MenuItem value="menswear">Menswear</MenuItem>
                          </TextField>
                        </Box>

                        <TextField 
                          name="description"
                          value={listingForm.description}
                          onChange={handleListingFormChange}
                          label="Description" 
                          variant="standard" 
                          fullWidth 
                          helperText="Describe the style, fabric, fit, and perfect occasions for this piece."
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: "48px", "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button onClick={() => setAddListingStep(1)} variant="contained" sx={{ backgroundColor: "#e0e0e0", color: "#888", fontWeight: 600, px: "32px", py: "8px", boxShadow: "none", borderRadius: "4px", "&:hover": { backgroundColor: "#d0d0d0", boxShadow: "none" } }}>
                            NEXT
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {addListingStep === 1 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                          Pricing & Detail
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", mb: "32px" }}>
                          Help Renters find perfect fit and set competitive pricing to maximize your rental income
                        </Typography>

                        <Box sx={{ display: "flex", gap: "24px", mb: "32px" }}>
                          <TextField 
                            name="price"
                            value={listingForm.price}
                            onChange={handleListingFormChange}
                            label="Enters daily price" 
                            variant="standard" 
                            fullWidth 
                            type="number"
                            helperText="Must be > 0, max 9999"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                               startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontSize: '1.2rem', color: '#555', fontWeight: 600 } }}>$</InputAdornment>,
                            }}
                            sx={{ flex: 1, "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                          />
                          <TextField 
                            name="deposit"
                            value={listingForm.deposit}
                            onChange={handleListingFormChange}
                            label="Enters deposit" 
                            variant="standard" 
                            fullWidth 
                            type="number"
                            helperText="Must be > 0, max 9999"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                               startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontSize: '1.2rem', color: '#555', fontWeight: 600 } }}>$</InputAdornment>,
                            }}
                            sx={{ flex: 1, "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                          />
                        </Box>

                        <Box sx={{ display: "flex", gap: "24px", mb: "32px" }}>
                          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <TextField 
                              select 
                              name="size"
                              value={listingForm.size}
                              onChange={handleListingFormChange}
                              label="Selects size" 
                              variant="standard" 
                              fullWidth 
                              helperText="Describe the style, fabric, fit, and perfect occasions for this piece.."
                              sx={{ flex: 1, "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                              InputLabelProps={{ shrink: true }}
                            >
                              <MenuItem value="" disabled>Selects size</MenuItem>
                              <MenuItem value="size4">Size 4</MenuItem>
                              <MenuItem value="size6">Size 6</MenuItem>
                              <MenuItem value="size8">Size 8</MenuItem>
                            </TextField>
                          </Box>

                          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", pt: "6px" }}>
                            <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", mb: "4px" }}>Selects condition</Typography>
                            <RadioGroup name="condition" value={listingForm.condition} onChange={handleListingFormChange} row sx={{ "& .MuiFormControlLabel-label": { fontFamily: "Inter, sans-serif", fontSize: "0.9rem", color: "#333" } }}>
                              <FormControlLabel value="new" control={<Radio size="small" sx={{ color: "#aaa", "&.Mui-checked": { color: "#1976d2" } }} />} label="New" />
                              <FormControlLabel value="like_new" control={<Radio size="small" sx={{ color: "#aaa", "&.Mui-checked": { color: "#1976d2" } }} />} label="Like New" />
                              <FormControlLabel value="good" control={<Radio size="small" sx={{ color: "#aaa", "&.Mui-checked": { color: "#1976d2" } }} />} label="Good" />
                            </RadioGroup>
                          </Box>
                        </Box>

                        <TextField 
                          name="brand"
                          value={listingForm.brand}
                          onChange={handleListingFormChange}
                          label="Enters brand (optional)" 
                          variant="standard" 
                          fullWidth 
                          helperText="Describe the style, fabric, fit, and perfect occasions for this piece.."
                          InputLabelProps={{ shrink: true }}
                          sx={{ mb: "48px", "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }, "& .MuiFormHelperText-root": { color: "#999", fontFamily: "Inter, sans-serif", ml: 0 } }}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                          <Button onClick={() => setAddListingStep(0)} variant="text" sx={{ color: "#555", fontWeight: 600, px: "24px", py: "8px", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                            BACK
                          </Button>
                          <Button onClick={() => setAddListingStep(2)} variant="contained" sx={{ backgroundColor: "#e0e0e0", color: "#888", fontWeight: 600, px: "32px", py: "8px", boxShadow: "none", borderRadius: "4px", "&:hover": { backgroundColor: "#d0d0d0", boxShadow: "none" } }}>
                            NEXT
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {addListingStep === 2 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                          Photos
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif", mb: "24px" }}>
                          High-quality photos are essential for attracting renters. Upload up to 5 photos showcasing your item.
                        </Typography>

                        {/* Dropzone Area */}
                        <Box sx={{ 
                          border: "1px dashed #ccc", 
                          borderRadius: "4px", 
                          backgroundColor: "#fdfdfd", 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          py: "40px", 
                          mb: "32px",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          "&:hover": { backgroundColor: "#f5f5f5" }
                        }}>
                          <Typography sx={{ fontWeight: 600, color: "#444", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                            Upload Photos
                          </Typography>
                          <Typography sx={{ fontSize: "0.8rem", color: "#777", fontFamily: "Inter, sans-serif", mb: "16px" }}>
                            Drag and drop your photos here, or click to browse
                          </Typography>
                          <Button onClick={() => fileInputRef.current?.click()} variant="contained" startIcon={<InsertPhotoIcon sx={{ fontSize: 18 }} />} sx={{ backgroundColor: "#1976d2", textTransform: "none", fontWeight: 600, mb: "16px", px: "20px", boxShadow: "none", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}>
                            CHOOSE FILES
                          </Button>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/png, image/jpeg" 
                            style={{ display: "none" }} 
                            ref={fileInputRef} 
                            onChange={handleImageUpload}
                          />
                          <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                            JPG, PNG up to 5MB each. File count : {uploadedImages.length}/5 photos.
                          </Typography>
                        </Box>

                        {/* Image Previews */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "24px", mb: "32px" }}>
                          {uploadedImages.map((img, imgIdx) => (
                            <Box key={imgIdx} sx={{ position: "relative", width: "220px", height: "220px", backgroundColor: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
                              <img src={img.url} alt={`upload-${imgIdx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <IconButton onClick={() => handleRemoveImage(imgIdx)} size="small" sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "#fff", p: "4px", zIndex: 10, "&:hover": { backgroundColor: "#f0f0f0" } }}>
                                <CloseIcon sx={{ fontSize: 14, color: "#333" }} />
                              </IconButton>
                              {imgIdx === coverIndex ? (
                                <Chip label="Cover" size="small" sx={{ position: "absolute", top: 8, left: 8, backgroundColor: "#1976d2", color: "#fff", fontSize: "0.7rem", fontWeight: 600, height: "22px", zIndex: 10 }} />
                              ) : (
                                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", "&:hover": { opacity: 1 } }}>
                                   <Button onClick={() => setCoverIndex(imgIdx)} variant="contained" size="small" sx={{ backgroundColor: "#1976d2", textTransform: "none", fontWeight: 600, fontSize: "0.7rem", "&:hover": { backgroundColor: "#1565c0" } }}>SET AS COVER</Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>

                        {/* Status Toggle */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: "48px" }}>
                          <FormControlLabel
                            control={<Switch size="small" defaultChecked sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#4caf50" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#4caf50" } }} />}
                            label={<Typography sx={{ fontSize: "0.9rem", color: "#333", fontFamily: "Inter, sans-serif", fontWeight: 500, ml: "8px" }}>Published listings are visible to borrowers</Typography>}
                          />
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                          <Button onClick={() => setAddListingStep(1)} variant="text" sx={{ color: "#555", fontWeight: 600, px: "24px", py: "8px", "&:hover": { backgroundColor: "#f5f5f5" } }}>
                            BACK
                          </Button>
                          <Button disabled={uploadedImages.length === 0} onClick={handleCreateListing} variant="contained" sx={{ backgroundColor: uploadedImages.length > 0 ? "#1976d2" : "#e0e0e0", color: uploadedImages.length > 0 ? "#fff" : "#888", fontWeight: 600, px: "32px", py: "8px", boxShadow: "none", borderRadius: "4px", "&:hover": { backgroundColor: uploadedImages.length > 0 ? "#1565c0" : "#d0d0d0", boxShadow: "none" } }}>
                            {editIndex !== null ? "UPDATE LISTING" : "CREATE LISTING"}
                          </Button>
                        </Box>
                      </Box>
                    )}

                  </Box>
                </Box>
            )}

            {activeMenu === "AddNewAvailability" && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Add new Availability
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                      Block dates or add new availability slots for your product
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "16px" }}>
                    <Button onClick={() => { setActiveMenu("Listing"); setAvailabilityCheckResult(null); }} variant="contained" sx={{ backgroundColor: "#1976d2", color: "#fff", fontWeight: 600, px: "32px", py: "8px", boxShadow: "none", borderRadius: "4px", textTransform: "none", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}>
                      Create Availability
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "8px", p: "32px", display: "flex", minHeight: "350px", gap: "32px" }}>
                  
                  {/* Left Column: Image Preview */}
                  <Box sx={{ width: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Box sx={{ width: "100%", height: "300px", backgroundColor: "#f5f5f5", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <img 
                         src={selectedAvailabilityItem?.image || "/product.png"} 
                         alt="selected product" 
                         style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: (!selectedAvailabilityItem || selectedAvailabilityItem.image === "/product.png") ? 'multiply' : 'normal' }} 
                       />
                    </Box>
                    <Box>
                       <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, color: "#333", fontFamily: "Inter, sans-serif", mb: "2px" }}>
                         {selectedAvailabilityItem?.title || "Selected Item"}
                       </Typography>
                       <Typography sx={{ fontSize: "0.8rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
                         {selectedAvailabilityItem?.brand || "Brand"}
                       </Typography>
                    </Box>
                  </Box>

                  {/* Right Column: Form Fields */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px", justifyContent: "center" }}>
                     <TextField 
                       label="Start Date" 
                       type="date" 
                       id="avail-start-date"
                       InputLabelProps={{ shrink: true }} 
                       fullWidth 
                       variant="standard" 
                     />
                     <TextField 
                       label="End Date" 
                       type="date" 
                       id="avail-end-date"
                       InputLabelProps={{ shrink: true }} 
                       fullWidth 
                       variant="standard" 
                     />
                     {availabilityCheckResult && (
                       <Box sx={{ mt: "8px", p: "12px", borderRadius: "4px", backgroundColor: availabilityCheckResult.success ? "#edf7ed" : (availabilityCheckResult.error ? "#fff4e5" : "#fdeded"), display: "flex", alignItems: "center", gap: "8px" }}>
                         {availabilityCheckResult.success ? (
                           <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
                         ) : (
                           <Typography sx={{ fontSize: "1.2rem", color: availabilityCheckResult.error ? "#ed6c02" : "#d32f2f" }}>⚠️</Typography>
                         )}
                         <Typography sx={{ fontSize: "0.85rem", color: availabilityCheckResult.success ? "#1e4620" : (availabilityCheckResult.error ? "#663c00" : "#5f2120"), fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                           {availabilityCheckResult.message}
                         </Typography>
                       </Box>
                     )}
                     <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "16px", mt: "24px" }}>
                        <Button 
                          onClick={async () => {
                            const sd = document.getElementById("avail-start-date").value;
                            const ed = document.getElementById("avail-end-date").value;
                            if(sd && ed && selectedAvailabilityItem) {
                               try {
                                  const res = await fetch(`/api/v1/listings/${selectedAvailabilityItem.id}/availability?startDate=${sd}&endDate=${ed}`);
                                  const json = await res.json();
                                  if (json.success && json.data?.available) {
                                     setAvailabilityCheckResult({ success: true, message: "Dates are available! Checking availability passed." });
                                  } else {
                                     setAvailabilityCheckResult({ success: false, message: "Dates are NOT available based on availability check." });
                                  }
                               } catch (e) {
                                  setAvailabilityCheckResult({ success: false, error: true, message: "Failed to check availability with the server." });
                               }
                            } else {
                               setAvailabilityCheckResult({ success: false, error: true, message: "Please select both a start date and an end date." });
                            }
                          }} 
                          variant="outlined" 
                          sx={{ borderColor: "#1976d2", color: "#1976d2", fontWeight: 600, px: "24px", py: "8px", "&:hover": { backgroundColor: "#f0f7ff" } }}
                        >
                          CHECK AVAILABILITY
                        </Button>
                        <Button onClick={() => { setActiveMenu("Listing"); setAvailabilityCheckResult(null); }} variant="text" sx={{ color: "#555", fontWeight: 600, px: "24px", py: "8px" }}>
                          CANCEL
                        </Button>
                     </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeMenu === "Payments" && (
              <Box>
                <Box sx={{ mb: "24px" }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                    Payments & Earnings
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                    Manage your payouts, bank accounts, and view earning history
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "24px" }}>
                  <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Current Balance Card */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "24px" }}>
                      <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#555", mb: "8px" }}>Available Balance</Typography>
                      <Typography sx={{ fontSize: "2.5rem", fontWeight: 400, color: "#111", mb: "24px" }}>€482.50</Typography>
                      <Button variant="contained" sx={{ backgroundColor: "#1976d2", px: "32px", py: "10px", fontWeight: 600, boxShadow: "none", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}>
                        REQUEST PAYOUT
                      </Button>
                      <Typography sx={{ fontSize: "0.75rem", color: "#888", mt: "16px" }}>Standard payouts take 3-5 business days to process.</Typography>
                    </Box>

                    {/* Earnings History */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", overflow: "hidden" }}>
                      <Box sx={{ p: "20px", borderBottom: "1px solid #f0f0f0" }}>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>Earning History</Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: "#fcfcfc" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: "12px" }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: "12px" }}>Source</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: "12px" }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: "12px" }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[
                              { date: 'Oct 05, 2025', source: 'Rental #ORD-9921', amount: '€65.00', status: 'Pending' },
                              { date: 'Oct 02, 2025', source: 'Rental #ORD-9812', amount: '€120.00', status: 'Completed' },
                              { date: 'Sep 28, 2025', source: 'Rental #ORD-9755', amount: '€45.50', status: 'Completed' },
                              { date: 'Sep 24, 2025', source: 'Payout #P-1002', amount: '-€320.00', status: 'Processed' },
                            ].map((row, i) => (
                              <TableRow key={i}>
                                <TableCell sx={{ fontSize: "0.8rem" }}>{row.date}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem" }}>{row.source}</TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: row.amount.startsWith('-') ? '#d32f2f' : '#2e7d32' }}>{row.amount}</TableCell>
                                <TableCell>
                                  <Chip label={row.status} size="small" sx={{ height: "20px", fontSize: "0.65rem", backgroundColor: row.status === 'Pending' ? '#fff7ed' : '#f0fdf4', color: row.status === 'Pending' ? '#c2410c' : '#15803d' }} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Bank Details */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "24px" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" }}>
                        <Typography sx={{ fontWeight: 600 }}>Bank Account</Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600, cursor: "pointer" }}>EDIT</Typography>
                      </Box>
                      <Box sx={{ p: "16px", border: "1px solid #f0f0f0", borderRadius: "4px", display: "flex", gap: "12px", alignItems: "center" }}>
                        <Box sx={{ width: 40, height: 40, backgroundColor: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ReceiptIcon sx={{ color: "#64748b" }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Barclays Bank PLC</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#888" }}>•••• 4421</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Tax Info */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "24px" }}>
                      <Typography sx={{ fontWeight: 600, mb: "8px" }}>Tax Information</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#555", mb: "16px" }}>Submit your tax details to avoid payout delays.</Typography>
                      <Button variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>Record Detail</Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeMenu === "Support" && (
              <Box>
                <Box sx={{ mb: "24px" }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                    Help & Support
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                    Need help? Our team is here to assist you 24/7
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: "24px" }}>
                  <Box sx={{ flex: 1.5, backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "32px" }}>
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, mb: "24px" }}>Send us a message</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <TextField label="Subject" variant="outlined" fullWidth size="small" select>
                        <MenuItem value="listing">Listing Issue</MenuItem>
                        <MenuItem value="order">Order Query</MenuItem>
                        <MenuItem value="payment">Payment Problem</MenuItem>
                        <MenuItem value="account">Account Access</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                      <TextField label="Describe your issue" variant="outlined" fullWidth multiline rows={4} placeholder="Tell us more about what's happening..." />
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" sx={{ px: "40px", py: "10px", fontWeight: 600, boxShadow: "none" }}>SEND MESSAGE</Button>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* FAQ Links */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "24px" }}>
                      <Typography sx={{ fontWeight: 600, mb: "16px" }}>Quick Help</Typography>
                      {[
                        'How do I ship an item?',
                        'When will I get paid?',
                        'Cancellation policy',
                        'Handling damaged returns'
                      ].map((faq, i) => (
                        <Box key={i} sx={{ py: "12px", borderBottom: i === 3 ? "none" : "1px solid #f0f0f0", cursor: "pointer", "&:hover": { color: "#1976d2" } }}>
                          <Typography sx={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {faq} <ArrowForwardIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", p: "24px" }}>
                      <Typography sx={{ fontWeight: 600, mb: "16px" }}>Contact Details</Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>Email: support@lendi.com</Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>Phone: +44 20 7946 0123</Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>Hours: Mon-Fri, 9am - 6pm GMT</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeMenu === "Order" && (
              <Box>
                {/* Header */}
                <Box sx={{ mb: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Orders
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                      Manage your rental bookings and track order status
                    </Typography>
                  </Box>
                </Box>

                {/* Manual Booking Validator Widget */}
                <Box sx={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", p: "16px", mb: "24px" }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "12px" }}>
                    Validate Booking
                  </Typography>
                  <Box sx={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                    <TextField 
                      label="Listing ID" size="small" variant="outlined" 
                      value={valListingId} onChange={(e) => setValListingId(e.target.value)}
                      sx={{ flex: 1, backgroundColor: "#fff", "& .MuiInputBase-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }, "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" } }} 
                    />
                    <TextField 
                      label="Start Date" size="small" type="date" variant="outlined" InputLabelProps={{ shrink: true }}
                      value={valStartDate} onChange={(e) => setValStartDate(e.target.value)}
                      sx={{ flex: 1, backgroundColor: "#fff", "& .MuiInputBase-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }, "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" } }} 
                    />
                    <TextField 
                      label="End Date" size="small" type="date" variant="outlined" InputLabelProps={{ shrink: true }}
                      value={valEndDate} onChange={(e) => setValEndDate(e.target.value)}
                      sx={{ flex: 1, backgroundColor: "#fff", "& .MuiInputBase-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" }, "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" } }} 
                    />
                    <Button 
                      onClick={handleManualValidation} disabled={valIsLoading}
                      variant="contained" sx={{ backgroundColor: "#1976d2", color: "#fff", height: "40px", px: "24px", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", boxShadow: "none", fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}
                    >
                      {valIsLoading ? "CHECKING..." : "VALIDATE BOOKING"}
                    </Button>
                  </Box>
                  {valResult && (
                    <Box sx={{ mt: "12px", p: "12px", backgroundColor: valResult.success ? "#dcfce7" : "#fee2e2", color: valResult.success ? "#166534" : "#991b1b", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                        {valResult.success ? "✅ ": "❌ "} {valResult.message}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f0f0f0", borderRadius: "8px", overflow: "hidden" }}>
                  <Tabs 
                    value={activeOrderTab} 
                    onChange={(e, v) => setActiveOrderTab(v)}
                    sx={{ 
                      px: "16px",
                      borderBottom: 1, 
                      borderColor: "divider", 
                      "& .MuiTab-root": { fontSize: "0.75rem", fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#777", textTransform: "uppercase" }, 
                      "& .Mui-selected": { color: "#1976d2" } 
                    }}
                  >
                    <Tab label="ALL" />
                    <Tab label="PAID" />
                    <Tab label="SHIPPED" />
                    <Tab label="DELIVERED" />
                    <Tab label="RETURNED" />
                  </Tabs>

                  <TableContainer>
                    <Table sx={{ minWidth: 650, "& .MuiTableCell-root": { padding: "12px 16px" } }} aria-label="orders table">
                      <TableHead sx={{ backgroundColor: "#fcfcfc" }}>
                        <TableRow>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Order</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Item</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Borrower</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Rental Dates</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Status</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0" }}>Total</TableCell>
                          <TableCell sx={{ color: "#222", fontWeight: 600, fontSize: "0.85rem", fontFamily: "Inter, sans-serif", borderBottom: "1px solid #f0f0f0", textAlign: "right", pr: "24px" }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ordersLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ borderBottom: "none", textAlign: "center", py: "48px" }}>
                              <CircularProgress size={28} sx={{ color: "#1976d2" }} />
                              <Typography sx={{ mt: "12px", fontSize: "0.85rem", color: "#888", fontFamily: "Inter, sans-serif" }}>Loading orders...</Typography>
                            </TableCell>
                          </TableRow>
                        ) : ordersError ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ borderBottom: "none", textAlign: "center", py: "48px" }}>
                              <Typography sx={{ fontSize: "1.5rem", mb: "8px" }}>⚠️</Typography>
                              <Typography sx={{ fontSize: "0.9rem", color: "#d32f2f", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>Backend server is offline</Typography>
                              <Typography sx={{ fontSize: "0.8rem", color: "#888", fontFamily: "Inter, sans-serif" }}>Failed to load orders. Please refresh the page.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : mockOrders.filter(order => {
                          if (activeOrderTab === 0) return true;
                          if (activeOrderTab === 1) return order.status === "Paid";
                          if (activeOrderTab === 2) return order.status === "Shipped";
                          if (activeOrderTab === 3) return order.status === "Delivered";
                          if (activeOrderTab === 4) return order.status === "Returned";
                          return true;
                        }).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ borderBottom: "none", textAlign: "center", py: "48px" }}>
                              <Typography sx={{ fontSize: "1.5rem", mb: "8px" }}>📦</Typography>
                              <Typography sx={{ fontSize: "0.9rem", color: "#888", fontFamily: "Inter, sans-serif" }}>No orders found for this filter.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : mockOrders.filter(order => {
                          if (activeOrderTab === 0) return true;
                          if (activeOrderTab === 1) return order.status === "Paid";
                          if (activeOrderTab === 2) return order.status === "Shipped";
                          if (activeOrderTab === 3) return order.status === "Delivered";
                          if (activeOrderTab === 4) return order.status === "Returned";
                          return true;
                        }).map((order, index) => (
                          <TableRow key={index} sx={{ borderBottom: "1px solid #f0f0f0", "&:last-child": { borderBottom: 0 } }}>
                            <TableCell sx={{ borderBottom: "none" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Checkbox size="small" sx={{ p: 0, color: "#ccc", "&.Mui-checked": { color: "#1976d2" } }} />
                                <Box>
                                  <Typography sx={{ fontSize: "0.85rem", color: "#444", fontWeight: 500, fontFamily: "Inter, sans-serif" }}>{order.id}</Typography>
                                  <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>{order.date}</Typography>
                               </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Avatar src={order.image || "/product.png"} alt="item" sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#f0f0f0" }} />
                                <Box>
                                  <Typography sx={{ fontSize: "0.85rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "2px" }}>{order.item}</Typography>
                                  <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>{order.details}</Typography>
                               </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Avatar alt="user" sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e2e8f0", color: "#64748b" }} />
                                <Box>
                                   <Typography sx={{ fontSize: "0.85rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif", mb: "2px" }}>{order.borrower}</Typography>
                                   <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>{order.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                               <Typography sx={{ fontSize: "0.85rem", color: "#444", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{order.dates}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                               {getStatusChip(order.status)}
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>
                               <Typography sx={{ fontSize: "0.85rem", color: "#333", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>{order.total}</Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: "none", textAlign: "right", pr: "24px" }}>
                               <Typography onClick={async () => {
                                 // Fetch order by ID from API
                                 try {
                                   const res = await fetch(`/api/v1/orders/${order.rawId}`);
                                   const json = await res.json();
                                   if (json.success && json.data) {
                                     const formatDate = (iso) => {
                                       if (!iso) return "";
                                       return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                     };
                                     const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
                                     const detailedOrder = {
                                       id: json.data.id ? json.data.id.slice(0, 8).toUpperCase() : "—",
                                       rawId: json.data.id,
                                       date: formatDate(json.data.created_at),
                                       item: json.data.listings?.title || "—",
                                       details: `${capitalize(json.data.listings?.category || "")} - Size ${json.data.listings?.size || "—"}`,
                                       borrower: json.data.users?.email?.split("@")[0] || "—",
                                       email: json.data.users?.email || "—",
                                       dates: `${formatDate(json.data.start_date)} - ${formatDate(json.data.end_date)}`,
                                       status: capitalize(json.data.status),
                                       total: `$${json.data.total_amount ?? 0}`,
                                       image: json.data.listings?.image || "/product.png"
                                     };
                                     setSelectedOrder(detailedOrder);
                                   } else {
                                     setSelectedOrder(order); // fallback to table data
                                   }
                                 } catch (err) {
                                   console.error("Failed to fetch order details", err);
                                   setSelectedOrder(order); // fallback
                                 }
                               }} sx={{ fontSize: "0.75rem", color: "#1976d2", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>VIEW DETAILS</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <Box sx={{ display: "flex", justifyContent: "center", py: "16px", borderTop: "1px solid #f0f0f0" }}>
                    <Pagination defaultPage={1} count={10} color="primary" size="small" sx={{ 
                      "& .MuiPaginationItem-root": { fontFamily: "Inter, sans-serif", fontSize: "0.85rem" },
                      "& .Mui-selected": { fontWeight: 600, backgroundColor: "#f0f0f0", color: "#222" } 
                    }} />
                  </Box>
                </Box>

                {/* Order Details Dialog */}
                <Dialog 
                  open={!!selectedOrder} 
                  onClose={() => setSelectedOrder(null)}
                  maxWidth="md"
                  fullWidth
                  sx={{ "& .MuiDialog-paper": { borderRadius: "8px", p: "8px" } }}
                >
                  {selectedOrder && (
                    <>
                      <DialogTitle sx={{ pb: "16px", pt: "24px", px: "24px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "8px" }}>
                              Order Details
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                                {selectedOrder.id} •
                              </Typography>
                              {getStatusChip(selectedOrder.status)}
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => setSelectedOrder(null)} sx={{ backgroundColor: "#f0f0f0", "&:hover": { backgroundColor: "#e0e0e0" } }}>
                            <CloseIcon sx={{ fontSize: 18, color: "#555" }} />
                          </IconButton>
                        </Box>
                      </DialogTitle>
                      
                      <Divider sx={{ borderStyle: "dashed", borderColor: "#e0e0e0", mx: "24px" }} />

                      <DialogContent sx={{ px: "24px", py: "24px" }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "48px" }}>
                          
                          {/* Left Column: Timeline */}
                          <Box>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                              Order Timeline
                            </Typography>
                            <Typography sx={{ fontSize: "0.8rem", color: "#666", fontFamily: "Inter, sans-serif", mb: "24px" }}>
                              Track your order status and required actions
                            </Typography>

                            <Stepper orientation="vertical" nonLinear activeStep={selectedOrder.status === "Paid" ? 0 : selectedOrder.status === "Shipped" ? 1 : selectedOrder.status === "Delivered" ? 2 : 3} sx={{ "& .MuiStepConnector-line": { minHeight: "32px" } }}>
                              <Step key="paid" expanded={true}>
                                <StepLabel icon={<CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 24 }} />} sx={{ py: 0, "& .MuiStepLabel-label": { mt: "-4px" } }}>
                                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif" }}>Paid</Typography>
                                </StepLabel>
                                <StepContent sx={{ ml: "12px", pl: "20px", borderLeft: "2px solid #bdbdbd" }}>
                                  <Typography sx={{ fontSize: "0.75rem", color: "#555", fontFamily: "Inter, sans-serif" }}>Sep 15, 2024</Typography>
                                </StepContent>
                              </Step>
                              <Step key="shipped" expanded={true}>
                                <StepLabel icon={["Shipped", "Delivered", "Returned"].includes(selectedOrder.status) ? <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 24 }} /> : undefined} sx={{ py: 0, "& .MuiStepLabel-label": { mt: "-4px" }, "& .MuiStepIcon-root": { color: "#9e9e9e" }, "& .MuiStepIcon-root.Mui-active": { color: "#1976d2" } }}>
                                  <Typography sx={{ fontSize: "0.9rem", fontWeight: ["Shipped", "Delivered", "Returned"].includes(selectedOrder.status) ? 600 : 500, color: ["Shipped", "Delivered", "Returned"].includes(selectedOrder.status) ? "#222" : "#444", fontFamily: "Inter, sans-serif" }}>Shipped</Typography>
                                </StepLabel>
                                <StepContent sx={{ ml: "12px", pl: "20px", borderLeft: "2px solid #bdbdbd" }}>
                                   <Typography sx={{ fontSize: "0.75rem", color: ["Shipped", "Delivered", "Returned"].includes(selectedOrder.status) ? "#555" : "#888", fontFamily: "Inter, sans-serif" }}>{["Shipped", "Delivered", "Returned"].includes(selectedOrder.status) ? "Sep 28, 2024" : "pending"}</Typography>
                                </StepContent>
                              </Step>
                              <Step key="delivered" expanded={true}>
                                <StepLabel icon={["Delivered", "Returned"].includes(selectedOrder.status) ? <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 24 }} /> : undefined} sx={{ py: 0, "& .MuiStepLabel-label": { mt: "-4px" }, "& .MuiStepIcon-root": { color: "#9e9e9e" }, "& .MuiStepIcon-root.Mui-active": { color: "#1976d2" } }}>
                                  <Typography sx={{ fontSize: "0.9rem", fontWeight: ["Delivered", "Returned"].includes(selectedOrder.status) ? 600 : 500, color: ["Delivered", "Returned"].includes(selectedOrder.status) ? "#222" : "#444", fontFamily: "Inter, sans-serif" }}>Delivered</Typography>
                                </StepLabel>
                                <StepContent sx={{ ml: "12px", pl: "20px", borderLeft: "2px solid #bdbdbd" }}>
                                   <Typography sx={{ fontSize: "0.75rem", color: ["Delivered", "Returned"].includes(selectedOrder.status) ? "#555" : "#888", fontFamily: "Inter, sans-serif" }}>{["Delivered", "Returned"].includes(selectedOrder.status) ? "Oct 1, 2024" : "pending"}</Typography>
                                </StepContent>
                              </Step>
                              <Step key="returned" expanded={true}>
                                <StepLabel icon={selectedOrder.status === "Returned" ? <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 24 }} /> : undefined} sx={{ py: 0, "& .MuiStepLabel-label": { mt: "-4px" }, "& .MuiStepIcon-root": { color: "#9e9e9e" }, "& .MuiStepIcon-root.Mui-active": { color: "#1976d2" } }}>
                                  <Typography sx={{ fontSize: "0.9rem", fontWeight: selectedOrder.status === "Returned" ? 600 : 500, color: selectedOrder.status === "Returned" ? "#222" : "#444", fontFamily: "Inter, sans-serif" }}>Returned</Typography>
                                </StepLabel>
                                <StepContent sx={{ borderLeft: "none" }}>
                                   <Typography sx={{ fontSize: "0.75rem", color: selectedOrder.status === "Returned" ? "#555" : "#888", fontFamily: "Inter, sans-serif", ml: "8px" }}>{selectedOrder.status === "Returned" ? "Oct 5, 2024" : "pending"}</Typography>
                                </StepContent>
                              </Step>
                            </Stepper>
                          </Box>

                          {/* Right Column: Order Info & Actions */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            
                            {/* Item Details and Actions */}
                            <Box>
                              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "12px" }}>
                                Item details & Actions
                              </Typography>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#fafafa", p: "16px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
                                <Box sx={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <Box sx={{ width: 64, height: 64, backgroundColor: "#ccc", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                    {selectedOrder.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={selectedOrder.image} alt={selectedOrder.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      <InsertPhotoIcon sx={{ color: "#fff", fontSize: 20 }} />
                                    )}
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontSize: "0.95rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "2px" }}>{selectedOrder.item}</Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>{selectedOrder.details}</Typography>
                                  </Box>
                                </Box>

                                {/* Actions */}
                                <Box sx={{ display: "flex", gap: "8px" }}>
                                  <Button onClick={() => setConfirmShipOpen(true)} disabled={selectedOrder.status !== "Paid"} variant="outlined" sx={{ flex: 1, borderColor: selectedOrder.status === "Paid" ? "#1976d2" : "#e0e0e0", color: selectedOrder.status === "Paid" ? "#1976d2" : "#999", fontWeight: 600, fontSize: "0.7rem", py: "6px", fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: selectedOrder.status === "Paid" ? "#f0f7ff" : "transparent" } }}>
                                    SHIPPED
                                  </Button>
                                  <Button onClick={handleMarkAsDelivered} disabled={selectedOrder.status !== "Shipped"} variant="outlined" sx={{ flex: 1, borderColor: selectedOrder.status === "Shipped" ? "#1976d2" : "#e0e0e0", color: selectedOrder.status === "Shipped" ? "#1976d2" : "#999", fontWeight: 600, fontSize: "0.7rem", py: "6px", fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: selectedOrder.status === "Shipped" ? "#f0f7ff" : "transparent" } }}>
                                    DELIVERED
                                  </Button>
                                  <Button onClick={handleMarkAsReturned} disabled={selectedOrder.status !== "Delivered"} variant="outlined" sx={{ flex: 1, borderColor: selectedOrder.status === "Delivered" ? "#1976d2" : "#e0e0e0", color: selectedOrder.status === "Delivered" ? "#1976d2" : "#999", fontWeight: 600, fontSize: "0.7rem", py: "6px", fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: selectedOrder.status === "Delivered" ? "#f0f7ff" : "transparent" } }}>
                                    RETURNED
                                  </Button>
                                </Box>
                              </Box>
                            </Box>

                            {/* Customer Details */}
                            <Box>
                              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "12px" }}>
                                Customer details
                              </Typography>
                              <Box sx={{ display: "flex", gap: "12px", alignItems: "center", backgroundColor: "#fafafa", p: "12px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
                                <Avatar alt="customer" sx={{ width: 44, height: 44, backgroundColor: "#bdbdbd" }} />
                                <Box>
                                  <Typography sx={{ fontSize: "0.85rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif", mb: "2px" }}>{selectedOrder.borrower}</Typography>
                                  <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif" }}>{selectedOrder.email}</Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Shipping Address */}
                            <Box sx={{ backgroundColor: "#fafafa", p: "16px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
                              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "12px" }}>
                                Shipping address
                              </Typography>
                              <Typography sx={{ fontSize: "0.8rem", color: "#444", fontFamily: "Inter, sans-serif", mb: "4px", lineHeight: 1.5 }}>
                                asdfghjkl;&apos;dfghjcvbncdfvbghndfg
                              </Typography>
                              <Typography sx={{ fontSize: "0.8rem", color: "#444", fontFamily: "Inter, sans-serif" }}>
                                Pin Code: 234564
                              </Typography>
                            </Box>

                          </Box>
                        </Box>
                      </DialogContent>
                    </>
                  )}
                </Dialog>

                {/* Confirm Ship Dialog */}
                <Dialog 
                  open={confirmShipOpen} 
                  onClose={() => setConfirmShipOpen(false)}
                  maxWidth="sm"
                  fullWidth
                  sx={{ "& .MuiDialog-paper": { borderRadius: "8px" } }}
                >
                  <DialogTitle sx={{ pb: "8px", pt: "20px", px: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", fontSize: "1.05rem" }}>
                      Confirm order is ready to ship
                    </Typography>
                    <IconButton size="small" onClick={() => setConfirmShipOpen(false)} sx={{ backgroundColor: "#f0f0f0", "&:hover": { backgroundColor: "#e0e0e0" } }}>
                      <CloseIcon sx={{ fontSize: 16, color: "#555" }} />
                    </IconButton>
                  </DialogTitle>
                  
                  <Divider sx={{ borderColor: "#f0f0f0" }} />

                  <DialogContent sx={{ px: "24px", py: "24px" }}>
                    <TextField 
                      label="Enter tracking number"
                      required
                      fullWidth
                      variant="standard"
                      placeholder="e.g., '1Z999AA10123456784'"
                      helperText="alphanumeric, 10-30 characters"
                      InputLabelProps={{ shrink: true }}
                      sx={{ 
                        "& .MuiInputLabel-root": { fontSize: "0.85rem", color: "#666", fontFamily: "Inter, sans-serif", fontWeight: 500 },
                        "& .MuiInputBase-input": { fontFamily: "Inter, sans-serif", fontSize: "0.95rem", py: "8px" },
                        "& .MuiFormHelperText-root": { color: "#888", fontFamily: "Inter, sans-serif", ml: 0, mt: "8px" }
                      }}
                    />
                    
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "32px", mb: "8px" }}>
                      <Button onClick={handleConfirmShip} variant="contained" sx={{ backgroundColor: "#1976d2", color: "#fff", fontWeight: 600, px: "24px", py: "8px", boxShadow: "none", borderRadius: "4px", textTransform: "none", fontFamily: "Inter, sans-serif", "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" } }}>
                        CONFIRM
                      </Button>
                    </Box>
                  </DialogContent>
                </Dialog>

              </Box>
            )}

            {activeMenu === "Analytics" && (
              <Box>
                {/* Header */}
                <Box sx={{ mb: "24px" }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#222", fontFamily: "Inter, sans-serif", mb: "4px" }}>
                    Analytics
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#555", fontFamily: "Inter, sans-serif" }}>
                    Track performance, revenue trends, and customer insights
                  </Typography>
                </Box>

                {/* Top Summary Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", mb: "24px" }}>
                  {analyticsStats.map((stat, idx) => (
                    <Box key={idx} sx={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "4px", p: "24px", display: "flex", flexDirection: "column", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                      <Typography sx={{ fontSize: "0.9rem", color: "#444", fontWeight: 500, mb: "16px", fontFamily: "Inter, sans-serif" }}>
                        {stat.title}
                      </Typography>
                      <Typography sx={{ fontSize: "2rem", color: "#555", fontWeight: 400, fontFamily: "Inter, sans-serif" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Middle Big Charts Section */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", mb: "24px" }}>
                  {/* Revenue */}
                  <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f9f9f9", borderRadius: "4px", p: "24px", minHeight: "360px" }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Revenue
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px", pb: "16px", borderBottom: "1px solid #f0f0f0" }}>
                      Earnings over time
                    </Typography>
                    {/* Placeholder for Revenue Chart */}
                  </Box>

                  {/* Orders */}
                  <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f9f9f9", borderRadius: "4px", p: "24px", minHeight: "360px" }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Orders
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px", pb: "16px", borderBottom: "1px solid #f0f0f0" }}>
                      Booking activity
                    </Typography>
                    {/* Placeholder for Orders Chart */}
                  </Box>
                </Box>

                {/* Bottom Section */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                  {/* Category Breakdown */}
                  <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f9f9f9", borderRadius: "4px", p: "24px" }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Category Breakdown
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px", pb: "16px", borderBottom: "1px solid #f0f0f0" }}>
                      Revenue by item type
                    </Typography>
                  </Box>

                  {/* Conversion Funnel */}
                  <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f9f9f9", borderRadius: "4px", p: "24px" }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Conversion Funnel
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px", pb: "16px", borderBottom: "1px solid #f0f0f0" }}>
                      From views to completed rentals
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {[1,2,3,4,5,6].map(i => (
                        <Box key={i}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                            <Typography sx={{ fontSize: "0.75rem", color: "#333", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Listing Views</Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, fontFamily: "Inter, sans-serif" }}>620</Typography>
                          </Box>
                          <Box sx={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                            <Box sx={{ width: i===1 ? '100%' : i===2 ? '80%' : i===3 ? '60%' : i===4 ? '50%' : i===5 ? '40%' : '30%', backgroundColor: '#3b82f6', height: '100%' }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Top Performers */}
                  <Box sx={{ backgroundColor: "#fdfdfd", border: "1px solid #f9f9f9", borderRadius: "4px", p: "24px" }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "4px" }}>
                      Top Performers
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888", fontFamily: "Inter, sans-serif", mb: "16px", pb: "16px", borderBottom: "1px solid #f0f0f0" }}>
                      Most rented items
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {mockListings.slice(0, 5).map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: index !== 4 ? '16px' : "0", borderBottom: index !== 4 ? '1px solid #f0f0f0' : "none" }}>
                           <Box sx={{ width: 40, height: 40, backgroundColor: "#f0f0f0", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                             <img src={item.image} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                           </Box>
                           <Box sx={{ flex: 1 }}>
                             <Typography sx={{ fontSize: "0.8rem", color: "#222", fontWeight: 500, fontFamily: "Inter, sans-serif", mb: "2px" }}>
                               {item.title}
                             </Typography>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Typography sx={{ fontSize: "0.7rem", color: "#777", fontFamily: "Inter, sans-serif" }}>{(Math.random() * 20 + 5).toFixed(0)} rentals</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <StarIcon sx={{ fontSize: 10, color: "#f59e0b" }} />
                                  <Typography sx={{ fontSize: "0.7rem", color: "#777", fontFamily: "Inter, sans-serif" }}>4.8</Typography>
                                </Box>
                             </Box>
                           </Box>
                           <Box sx={{ textAlign: "right" }}>
                             <Typography sx={{ fontSize: "0.85rem", color: "#222", fontWeight: 600, fontFamily: "Inter, sans-serif", mb: "2px" }}>
                               €{item.price}
                             </Typography>
                             <Typography sx={{ fontSize: "0.7rem", color: "#10b981", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                               +{Math.floor(Math.random() * 15)}%
                             </Typography>
                           </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

              </Box>
            )}

          </Box>
        </Box>
      </Box>
    </Box>
    {/* Snackbar notification */}
    <Snackbar 
      open={snackbarInfo.open} 
      autoHideDuration={4000} 
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleSnackbarClose} severity={snackbarInfo.severity} sx={{ width: '100%', fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
        {snackbarInfo.message}
      </Alert>
    </Snackbar>
    </>
  );
}


