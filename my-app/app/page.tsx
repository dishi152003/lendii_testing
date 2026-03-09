"use client";

import { useState, ChangeEvent, FormEvent, FocusEvent } from "react";
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

export default function HomePage() {
  const router = useRouter();

  // Sign Up State
  const [signUpForm, setSignUpForm] = useState({ email: "", name: "", password: "" });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [signUpTouched, setSignUpTouched] = useState({ email: false, name: false, password: false });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isSignUpFormFilled =
    signUpForm.email.trim() !== "" && signUpForm.name.trim() !== "" && signUpForm.password.trim() !== "";

  // --- Sign Up Handlers ---
  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    if (!signUpForm.email) newErrors.email = "Email is required";
    else if (!isEmailValid(signUpForm.email)) newErrors.email = "Enter a valid email";
    if (!signUpForm.name) newErrors.name = "Full name is required";
    if (!signUpForm.password) newErrors.password = "Password is required";
    else if (signUpForm.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSignUpChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSignUpForm((prev) => ({ ...prev, [name]: value }));
    setServerError("");

    if (name === "email" && signUpTouched.email) {
      if (!value.trim()) {
        setSignUpErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!isEmailValid(value)) {
        setSignUpErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      } else {
        setSignUpErrors((prev) => ({ ...prev, email: "" }));
      }
    } else if (name !== "email") {
      if (signUpErrors[name]) setSignUpErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignUpBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSignUpTouched((prev) => ({ ...prev, [name]: true }));
    if (!value.trim()) {
      setSignUpErrors((prev) => ({
        ...prev,
        [name]: name === "name" ? "Full name is required" : name.charAt(0).toUpperCase() + name.slice(1) + " is required",
      }));
    } else if (name === "email" && !isEmailValid(value)) {
      setSignUpErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
    } else {
      setSignUpErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignUpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateSignUp();
    if (Object.keys(validationErrors).length > 0) {
      setSignUpErrors(validationErrors);
      return;
    }
    setLoading(true);
    setServerError("");
    
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signUpForm.email, name: signUpForm.name, password: signUpForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: signUpForm.email,
        password: signUpForm.password,
      });
      router.push(signInResult?.ok ? "/products" : "/signin");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleAction = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/products" });
  };

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

      {/* Main Page: Sign Up */}
      <Box component="main" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
        <Box component="form" onSubmit={handleSignUpSubmit} noValidate sx={{
          width: "480px",
          height: "499px",
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
        }}>
          {/* Email */}
          <TextField
            id="signup-email" label="Email" name="email" type="email" placeholder="Enter your email"
            variant="standard" value={signUpForm.email} onChange={handleSignUpChange} onBlur={handleSignUpBlur}
            error={!!signUpErrors.email} helperText={signUpErrors.email} autoComplete="off" fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{ endAdornment: <InputAdornment position="end"><MailOutlineIcon sx={{ fontSize: 18, color: signUpErrors.email ? "#d32f2f" : "#555" }} /></InputAdornment> }}
            sx={{ ...fieldSx, ...(signUpErrors.email && { "& .MuiInput-root:before": { borderBottomColor: "#d32f2f" }, "& .MuiInput-root:after": { borderBottomColor: "#d32f2f" } }) }}
          />

          {/* Name */}
          <TextField
            id="signup-name" label="Name" name="name" type="text" placeholder="Enter your full name"
            variant="standard" value={signUpForm.name} onChange={handleSignUpChange} onBlur={handleSignUpBlur}
            error={!!signUpErrors.name} helperText={signUpErrors.name} autoComplete="off" fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{ endAdornment: <InputAdornment position="end"><VisibilityOffIcon sx={{ fontSize: 18, color: "#555" }} /></InputAdornment> }}
            sx={fieldSx}
          />

          {/* Password */}
          <TextField
            id="signup-password" label="Password" name="password" type={showSignUpPassword ? "text" : "password"} placeholder="Enter your password"
            variant="standard" value={signUpForm.password} onChange={handleSignUpChange} onBlur={handleSignUpBlur}
            error={!!signUpErrors.password} helperText={signUpErrors.password} autoComplete="new-password" fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton id="toggle-password-visibility" onClick={() => setShowSignUpPassword((prev) => !prev)} edge="end" size="small">
                    {showSignUpPassword ? <VisibilityIcon sx={{ fontSize: 18, color: "#555" }} /> : <VisibilityOffIcon sx={{ fontSize: 18, color: "#555" }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          {/* Forgot Password */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -2 }}>
            <Link
              href="/forgot-password"
              style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1976d2", textDecoration: "none", letterSpacing: "0.03em" }}
            >
              FORGOT PASSWORD ?
            </Link>
          </Box>

          {/* Server Error */}
          {serverError && <Typography sx={{ fontSize: "0.78rem", color: "#d32f2f", textAlign: "center", mt: -2 }}>{serverError}</Typography>}

          {/* Sign Up Button */}
          <Button
            id="signup-submit-btn" type="submit" fullWidth disabled={!isSignUpFormFilled || loading}
            sx={{
              py: "10px", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", fontFamily: "Inter, sans-serif", borderRadius: "4px",
              textTransform: "uppercase", backgroundColor: isSignUpFormFilled ? "#1976d2" : "#c8c8c8", color: isSignUpFormFilled ? "#fff" : "#888", boxShadow: "none",
              "&:hover": { backgroundColor: isSignUpFormFilled ? "#1565c0" : "#c8c8c8", boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: "#c8c8c8", color: "#888" }, transition: "background-color 0.25s ease",
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: "#888" }} /> : "SIGN UP"}
          </Button>

          {/* Sign Up With Google */}
          <Button
            id="signup-google-btn" fullWidth variant="outlined" onClick={handleGoogleAction} disabled={googleLoading}
            endIcon={googleLoading ? <CircularProgress size={14} /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              py: "10px", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", fontFamily: "Inter, sans-serif", borderRadius: "4px",
              textTransform: "uppercase", color: "#1976d2", borderColor: "#d0d0d0", backgroundColor: "#fff", boxShadow: "none",
              "&:hover": { borderColor: "#1976d2", backgroundColor: "#f0f6ff", boxShadow: "none" },
            }}
          >
            SIGN UP WITH GOOGLE
          </Button>
          
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
            <Typography sx={{ fontSize: "0.78rem", color: "#888", fontFamily: "Inter, sans-serif" }}>
              Already have account?
            </Typography>
            <Link
              href="/signin"
              style={{
                fontSize: "0.78rem", fontWeight: 700, color: "#1976d2", textDecoration: "none", letterSpacing: "0.04em"
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
