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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState({ email: false, name: false, password: false });

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);



  const isFormFilled =
    form.email.trim() !== "" &&
    form.name.trim() !== "" &&
    form.password.trim() !== "";

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!isEmailValid(form.email)) newErrors.email = "Enter a valid email";
    if (!form.name) newErrors.name = "Full name is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    // Re-validate email in real-time once touched
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
          name === "name"
            ? "Full name is required"
            : name.charAt(0).toUpperCase() + name.slice(1) + " is required",
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
      const res = await fetch(
        `/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            name: form.name,
            password: form.password,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      router.push(signInResult?.ok ? "/products" : "/signin");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
            id="signup-email"
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
                    sx={{ fontSize: 18, color: errors.email ? "#d32f2f" : "#555" }}
                  />
                </InputAdornment>
              ),
              disableUnderline: false,
            }}
            sx={{
              ...fieldSx,
              ...(errors.email && {
                "& .MuiInput-root:before": { borderBottomColor: "#d32f2f" },
                "& .MuiInput-root:after": { borderBottomColor: "#d32f2f" },
              }),
            }}
          />

          {/* Name */}
          <TextField
            id="signup-name"
            label="Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            variant="standard"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.name}
            helperText={errors.name}
            autoComplete="off"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <VisibilityOffIcon sx={{ fontSize: 18, color: "#555" }} />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Password */}
          <TextField
            id="signup-password"
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
            autoComplete="new-password"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    id="toggle-password-visibility"
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
                const randomId = Math.floor(Math.random() * 1000);
                setForm({
                  name: "Demo User",
                  email: `demo${randomId}@example.com`,
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
              FILL DEMO DATA (FOR TESTING)
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

          {/* Sign Up Button */}
          <Button
            id="signup-submit-btn"
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
              "SIGN UP"
            )}
          </Button>

          {/* Sign Up With Google */}
          <Button
            id="signup-google-btn"
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            endIcon={
              googleLoading ? (
                <CircularProgress size={14} />
              ) : (
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
            SIGN UP WITH GOOGLE
          </Button>



          {/* Already have account */}
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
              Already have account?
            </Typography>
            <Link
              href="/signin"
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#1976d2",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              SIGN IN
            </Link>
          </Box>
        </Box>
      </Box>
    </>
  );
}
