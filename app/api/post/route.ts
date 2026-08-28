import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RawTweet = Record<string, any>;

const STATUS_RE = /\/status\/(\d+)/i;
const ALLOWED_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);

function extractStatusId(input: string) {
  const trimmed = input.trim();
  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Paste a valid X post link.");
  }

  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("That does not look like an X/Twitter link.");
  }

  const match = url.pathname.match(STATUS_RE);
  if (!match?.[1]) {
    throw new Error("We could not find a post ID in that link.");
  }

  return match[1];
}

async function fetchTweet(id: string): Promise<RawTweet> {
  const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(id)}&lang=en&token=0`;
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      Accept: "application/json,text/plain,*/*",
      "User-Agent": "PostFrame/1.0 (+https://github.com/godozicodes/postframe)",
    },
  });

  if (!response.ok) {
    throw new Error("X did not return that post. It may be private, deleted, or unavailable.");
  }

  const data = (await response.json()) as RawTweet;
  if (!data?.id_str || !data?.user) {
    throw new Error("X returned an incomplete post. Try another public link.");
  }

  return data;
}

function cleanText(raw: RawTweet) {
  let text = String(raw.text || "");
  const mediaUrls = new Set<string>();

  for (const media of raw.mediaDetails || []) {
    if (media?.url) mediaUrls.add(media.url);
  }

  for (const entity of raw.entities?.media || []) {
    if (entity?.url) mediaUrls.add(entity.url);
  }

  for (const url of mediaUrls) {
    text = text.replace(url, "").trim();
  }

  return text;
}

function normalizeMedia(raw: RawTweet) {
  const source = Array.isArray(raw.mediaDetails) ? raw.mediaDetails : [];

  return source.slice(0, 4).map((item: any) => {
    const variants = item?.video_info?.variants || [];
    const bestMp4 = variants
      .filter((variant: any) => variant?.content_type === "video/mp4" && variant?.url)
      .sort((a: any, b: any) => (b?.bitrate || 0) - (a?.bitrate || 0))[0];

    return {
      type: item?.type || "photo",
      url: item?.media_url_https || item?.media_url || "",
      videoUrl: bestMp4?.url || null,
      alt: item?.ext_alt_text || "",
    };
  }).filter((item: any) => item.url);
}

function normalize(raw: RawTweet) {
  const avatar = String(raw.user?.profile_image_url_https || raw.user?.profile_image_url || "")
    .replace("_normal.", "_400x400.");

  return {
    id: String(raw.id_str),
    text: cleanText(raw),
    createdAt: raw.created_at || null,
    replyTo: raw.in_reply_to_screen_name || null,
    parentId: raw.in_reply_to_status_id_str || null,
    author: {
      name: raw.user?.name || raw.user?.screen_name || "Unknown",
      username: raw.user?.screen_name || "unknown",
      avatar,
      verified: Boolean(raw.user?.is_blue_verified || raw.user?.verified),
    },
    metrics: {
      replies: Number(raw.conversation_count || 0),
      reposts: Number(raw.retweet_count || 0),
      quotes: Number(raw.quote_count || 0),
      likes: Number(raw.favorite_count || 0),
      views: Number(raw.views?.count || raw.view_count || 0),
    },
    media: normalizeMedia(raw),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = String(body?.url || "");
    const id = extractStatusId(url);
    const selectedRaw = await fetchTweet(id);

    let directParentRaw: RawTweet | null = null;
    if (selectedRaw.parent?.id_str) {
      directParentRaw = selectedRaw.parent;
    } else if (selectedRaw.in_reply_to_status_id_str) {
      try {
        directParentRaw = await fetchTweet(String(selectedRaw.in_reply_to_status_id_str));
      } catch {
        directParentRaw = null;
      }
    }

    let rootRaw = directParentRaw;
    let cursor = directParentRaw;
    let hops = 0;

    while (cursor?.in_reply_to_status_id_str && hops < 6) {
      try {
        const next = await fetchTweet(String(cursor.in_reply_to_status_id_str));
        rootRaw = next;
        cursor = next;
        hops += 1;
      } catch {
        break;
      }
    }

    return NextResponse.json({
      post: normalize(selectedRaw),
      isReply: Boolean(selectedRaw.in_reply_to_status_id_str || selectedRaw.parent),
      parent: directParentRaw ? normalize(directParentRaw) : null,
      root: rootRaw ? normalize(rootRaw) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while fetching that post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
