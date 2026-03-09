"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);



  const isFormFilled =
    form.email.trim() !== "" && form.password.trim() !== "";

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!isEmailValid(form.email)) newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    // Re-validate email in real-time once the field has been touched
    if (name === "email" && touched.email) {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!isEmailValid(value)) {
        setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } else if (name !== "email") {
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]:
          name.charAt(0).toUpperCase() + name.slice(1) + " is required",
      }));
    } else if (name === "email" && !isEmailValid(value)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (result?.ok) {
        router.push("/products");
      } else {
        // Check if there was a specific error type
        if (result?.error === "Configuration") {
          setServerError("Server configuration error. Please check MONGODB_URI.");
        } else {
          setServerError("Invalid email or password. Please try again.");
        }
        setLoading(false);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/products" });
  };

  // Shared standard (underline-only) field styles
  const fieldSx = {
    width: "100%",
    backgroundColor: "transparent",
    "& .MuiInput-root": {
      backgroundColor: "transparent",
      fontFamily: "Inter, sans-serif",
      fontSize: "0.9rem",
      color: "#333",
      "&:before": { borderBottomColor: "#d0d0d0" },
      "&:hover:not(.Mui-disabled):before": { borderBottomColor: "#aaa" },
      "&:after": { borderBottomColor: "#1976d2" },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.75rem",
      color: "#888",
      fontFamily: "Inter, sans-serif",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
    "& .MuiFormHelperText-root": {
      fontSize: "0.7rem",
      fontFamily: "Inter, sans-serif",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; font-family: 'Inter', sans-serif; }
      `}</style>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Card */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            width: "480px",
            backgroundColor: "#FAFAFA",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            paddingTop: "16px",
            paddingRight: "20px",
            paddingBottom: "16px",
            paddingLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "29px",
            boxSizing: "border-box",
          }}
        >
          {/* Email */}
          <TextField
            id="signin-email"
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            variant="standard"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="off"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MailOutlineIcon
                    sx={{
                      fontSize: 18,
                      color: errors.email ? "#d32f2f" : "#555",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              ...fieldSx,
              ...(errors.email && {
                "& .MuiInput-root:before": { borderBottomColor: "#d32f2f" },
                "& .MuiInput-root:after": { borderBottomColor: "#d32f2f" },
              }),
            }}
          />

          {/* Password */}
          <TextField
            id="signin-password"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            variant="standard"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.password}
            helperText={errors.password}
            autoComplete="current-password"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    id="toggle-signin-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityIcon sx={{ fontSize: 18, color: "#555" }} />
                    ) : (
                      <VisibilityOffIcon sx={{ fontSize: 18, color: "#555" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Fill Demo Data Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: -2 }}>
            <Button
              onClick={() => {
                setForm({
                  email: "demo@example.com",
                  password: "password123",
                });
              }}
              sx={{
                fontSize: "0.65rem",
                color: "#1976d2",
                textDecoration: "underline",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "transparent", textDecoration: "none" },
              }}
            >
              USE DEMO CREDENTIALS (demo@example.com)
            </Button>
          </Box>

          {/* Forgot Password */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -2 }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#1976d2",
                textDecoration: "none",
                letterSpacing: "0.03em",
              }}
            >
              FORGOT PASSWORD ?
            </Link>
          </Box>

          {/* Server Error */}
          {serverError && (
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "#d32f2f",
                textAlign: "center",
                mt: -2,
              }}
            >
              {serverError}
            </Typography>
          )}

          {/* Sign In Button */}
          <Button
            id="signin-submit-btn"
            type="submit"
            fullWidth
            disabled={!isFormFilled || loading}
            sx={{
              py: "10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "Inter, sans-serif",
              borderRadius: "4px",
              textTransform: "uppercase",
              backgroundColor: isFormFilled ? "#1976d2" : "#c8c8c8",
              color: isFormFilled ? "#fff" : "#888",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: isFormFilled ? "#1565c0" : "#c8c8c8",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                backgroundColor: "#c8c8c8",
                color: "#888",
              },
              transition: "background-color 0.25s ease",
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: "#888" }} />
            ) : (
              "SIGN IN"
            )}
          </Button>

          {/* Sign In With Google */}
          <Button
            id="signin-google-btn"
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            startIcon={
              googleLoading ? (
                <CircularProgress size={14} />
              ) : (
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              py: "10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "Inter, sans-serif",
              borderRadius: "4px",
              textTransform: "uppercase",
              color: "#1976d2",
              borderColor: "#d0d0d0",
              backgroundColor: "#fff",
              boxShadow: "none",
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: "#f0f6ff",
                boxShadow: "none",
              },
            }}
          >
            SIGN IN WITH GOOGLE
          </Button>



          {/* Don't have an account */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "#888",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Don&apos;t have an account?
            </Typography>
            <Link
              href="/signup"
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#1976d2",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              SIGN UP
            </Link>
          </Box>
        </Box>
      </Box>
    </>
  );
}

