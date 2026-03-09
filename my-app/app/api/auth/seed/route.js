import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";

export async function GET() {
  try {
    console.log("Seed route: Connecting to DB...");
    await connectDB();
    console.log("Seed route: DB Connected.");
    
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@example.com",
        password: "password123",
      },
      {
        name: "Admin Tester",
        email: "admin@example.com",
        password: "adminpassword",
      }
    ];

    const results = [];

    for (const userData of demoUsers) {
      console.log(`Seed route: Checking user ${userData.email}...`);
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        console.log(`Seed route: Creating user ${userData.email}...`);
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await User.create({
          ...userData,
          password: hashedPassword,
          provider: "credentials",
        });
        results.push({ email: userData.email, status: "created" });
      } else {
        console.log(`Seed route: User ${userData.email} already exists.`);
        results.push({ email: userData.email, status: "already exists" });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Seeding completed",
      results 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
