import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Send request to Strapi
    const strapiRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL || "https://supposed-tildi-0mar-5bc1420c.koyeb.app"}/api/auth/local/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      },
    );

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Registration failed" },
        { status: strapiRes.status },
      );
    }

    // Set the JWT token in an HttpOnly cookie
    (await cookies()).set({
      name: "jwt",
      value: data.jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // We don't send the JWT back to the client, only the user data
    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
