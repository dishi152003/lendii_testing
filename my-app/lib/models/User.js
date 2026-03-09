import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required — Google OAuth users won't have a password
    },
    provider: {
      type: String,
      default: "credentials", // or "google"
    },
  },
  { timestamps: true }
);

// Prevent model re-compilation during hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
