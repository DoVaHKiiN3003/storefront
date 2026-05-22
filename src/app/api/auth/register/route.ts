import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "../../middleware";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = checkRateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateCheck),
        }
      );
    }

    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.customerAccount.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Hash password with simple SHA-256 + salt (in production, use bcrypt)
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const account = await prisma.customerAccount.create({
      data: {
        email,
        name,
        password: `${salt}:${passwordHash}`,
        sessionToken,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: account.id, email: account.email, name: account.name },
        sessionToken,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        },
      }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
