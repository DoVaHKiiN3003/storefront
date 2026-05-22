import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "../../middleware";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = checkRateLimit(`login:${ip}`, { maxRequests: 10, windowMs: 60_000 });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateCheck),
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const account = await prisma.customerAccount.findUnique({ where: { email } });
    if (!account) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const [salt, storedHash] = account.password.split(":");
    const hash = crypto.createHash("sha256").update(password + salt).digest("hex");

    if (hash !== storedHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate new session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    await prisma.customerAccount.update({
      where: { id: account.id },
      data: { sessionToken },
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: { id: account.id, email: account.email, name: account.name },
        sessionToken,
      },
      {
        headers: {
          "Set-Cookie": `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
        },
      }
    );
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
