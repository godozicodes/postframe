import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "pbs.twimg.com",
  "video.twimg.com",
  "abs.twimg.com",
  "ton.twimg.com",
]);

export async function GET(request: NextRequest) {
  try {
    const source = request.nextUrl.searchParams.get("url");
    if (!source) return new NextResponse("Missing url", { status: 400 });

    const url = new URL(source);
    if (url.protocol !== "https:" || !ALLOWED.has(url.hostname.toLowerCase())) {
      return new NextResponse("Unsupported media host", { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "PostFrame/1.0",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return new NextResponse("Media unavailable", { status: response.status });

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Only image media is proxied", { status: 415 });
    }

    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return new NextResponse("Could not load media", { status: 400 });
  }
}
