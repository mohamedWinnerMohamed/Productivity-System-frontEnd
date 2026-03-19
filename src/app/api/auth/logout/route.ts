import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // To logout, we simply delete the HttpOnly cookie
  (await cookies()).delete("jwt");
  return NextResponse.json({ success: true }, { status: 200 });
}
