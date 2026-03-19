import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt");

    if (!jwt || !jwt.value) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Verify token with Strapi
    const strapiRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${jwt.value}`,
        },
      },
    );

    if (!strapiRes.ok) {
      // Token is invalid or expired
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await strapiRes.json();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
