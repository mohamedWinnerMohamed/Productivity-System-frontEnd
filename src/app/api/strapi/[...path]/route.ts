import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> },
) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value;

    const pathString = params.path.join("/");
    const searchParams = request.nextUrl.search;

    const strapiUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || "https://supposed-tildi-0mar-5bc1420c.koyeb.app"}/api/${pathString}${searchParams}`;

    const headers = new Headers();
    // Forward the content type. Some requests (like forms) might have different content types.
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    } else {
      headers.set("accept", "application/json");
    }

    if (jwt) {
      headers.set("Authorization", `Bearer ${jwt}`);
    }

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    const strapiRes = await fetch(strapiUrl, options);
    const data = await strapiRes.text();

    return new NextResponse(data, {
      status: strapiRes.status,
      headers: {
        "Content-Type":
          strapiRes.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Strapi proxy error:", error);
    return NextResponse.json(
      { error: "Internal server proxy error" },
      { status: 500 },
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
