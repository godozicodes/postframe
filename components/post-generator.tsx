"use client";

import html2canvas from "html2canvas";
import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  Image as ImageIcon,
  Link2,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Quote,
  RefreshCw,
  Repeat2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import twemoji from "twemoji";

type Mode = "auto" | "single" | "reply";
type FrameStyle = "velvet" | "midnight" | "blush" | "clean";
type CardTheme = "dark" | "light";

type Post = {
  id: string;
  text: string;
  createdAt: string | null;
  replyTo: string | null;
  parentId: string | null;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  metrics: {
    replies: number;
    reposts: number;
    quotes: number;
    likes: number;
    views: number;
  };
  media: Array<{
    type: string;
    url: string;
    videoUrl?: string | null;
    alt?: string;
  }>;
};

type ApiResult = {
  post: Post;
  isReply: boolean;
  parent: Post | null;
  root: Post | null;
};

const DEMO_POST: Post = {
  id: "demo-parent",
  text: "Small tools can still feel beautiful. The details are the product ✨",
  createdAt: "2026-08-28T18:12:00.000Z",
  replyTo: null,
  parentId: null,
  author: { name: "PostFrame", username: "postframe", avatar: "", verified: true },
  metrics: { replies: 28, reposts: 143, quotes: 4, likes: 2408, views: 49000 },
  media: [],
};

const DEMO_REPLY: Post = {
  id: "demo-reply",
  text: "Exactly. Make it useful, then make it pretty 😭💗",
  createdAt: "2026-08-28T18:19:00.000Z",
  replyTo: "postframe",
  parentId: "demo-parent",
  author: { name: "you", username: "yourhandle", avatar: "", verified: false },
  metrics: { replies: 3, reposts: 18, quotes: 0, likes: 734, views: 12100 },
  media: [],
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function EmojiText({ text }: { text: string }) {
  const html = useMemo(
    () =>
      twemoji.parse(escapeHtml(text), {
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
        folder: "svg",
        ext: ".svg",
        className: "postframe-emoji",
      }),
    [text],
  );

  return <span className="emoji-text" dangerouslySetInnerHTML={{ __html: html }} />;
}

function compact(value: number) {
  if (!value) return "0";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function postDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function mediaSrc(url: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("twimg.com")) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }
  return url;
}

function InitialAvatar({ name }: { name: string }) {
  return <div className="initial-avatar">{name.trim().slice(0, 1).toUpperCase() || "P"}</div>;
}

function VerifiedMark() {
  return (
    <span className="verified-mark" aria-label="Verified">
      <Check size={10} strokeWidth={3.5} />
    </span>
  );
}

function MediaGrid({ media }: { media: Post["media"] }) {
  if (!media.length) return null;
  const visible = media.slice(0, 4);
  return (
    <div className={`tweet-media media-${visible.length}`}>
      {visible.map((item, index) => (
        <div className="media-tile" key={`${item.url}-${index}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaSrc(item.url)} alt={item.alt || "Post media"} crossOrigin="anonymous" />
          {(item.type === "video" || item.type === "animated_gif") && (
            <span className="media-play"><span>▶</span></span>
          )}
        </div>
      ))}
    </div>
  );
}

function TweetCard({ post, theme, showMetrics, showDate, connected = false }: {
  post: Post;
  theme: CardTheme;
  showMetrics: boolean;
  showDate: boolean;
  connected?: boolean;
}) {
  return (
    <article className={`tweet-card tweet-${theme} ${connected ? "tweet-connected" : ""}`}>
      <div className="tweet-head">
        <div className="avatar-wrap">
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tweet-avatar" src={mediaSrc(post.author.avatar)} alt="" crossOrigin="anonymous" />
          ) : <InitialAvatar name={post.author.name} />}
        </div>
        <div className="tweet-author">
          <div className="author-line">
            <strong>{post.author.name}</strong>
            {post.author.verified && <VerifiedMark />}
          </div>
          <span>@{post.author.username}</span>
        </div>
        <button type="button" className="tweet-follow" tabIndex={-1}>Follow</button>
        <MoreHorizontal className="tweet-more" size={20} aria-hidden="true" />
      </div>

      <div className="tweet-text"><EmojiText text={post.text} /></div>
      <MediaGrid media={post.media} />

      {showDate && post.createdAt && <div className="tweet-date">{postDate(post.createdAt)}</div>}

      {showMetrics && (
        <div className="tweet-metrics">
          <span><MessageCircle size={16} />{compact(post.metrics.replies)}</span>
          <span><Repeat2 size={17} />{compact(post.metrics.reposts)}</span>
          <span className="metric-heart">♡ {compact(post.metrics.likes)}</span>
          {post.metrics.views > 0 && <span className="metric-views">{compact(post.metrics.views)} views</span>}
        </div>
      )}
    </article>
  );
}

function Segment<T extends string>({ value, current, onClick, children }: {
  value: T;
  current: T;
  onClick: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={current === value ? "segment active" : "segment"} onClick={() => onClick(value)}>
      {children}
    </button>
  );
}

export default function PostGenerator() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [frame, setFrame] = useState<FrameStyle>("clean");
  const [cardTheme, setCardTheme] = useState<CardTheme>("light");
  const [showParent, setShowParent] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const selected = result?.post || DEMO_REPLY;
  const parent = result ? (result.parent || result.root) : DEMO_POST;
  const isReply = result ? result.isReply : true;
  const parentVisible = mode !== "single" && isReply && showParent && Boolean(parent);

  async function pasteLink() {
    try {
      const value = await navigator.clipboard.readText();
      setUrl(value);
      setError("");
    } catch {
      setError("Your browser blocked clipboard access. Paste the X link manually.");
    }
  }

  async function generate() {
    if (!url.trim()) {
      setError("Paste an X post or reply link first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not fetch that post.");
      if (mode === "reply" && !data.isReply) {
        throw new Error("That link is a single post, not a reply. Switch to Auto or Single Post.");
      }
      setResult(data as ApiResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch that post.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage() {
    const node = captureRef.current;
    if (!node) return;

    setDownloading(true);
    setError("");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const images = Array.from(node.querySelectorAll("img"));
      await Promise.all(images.map(async (image) => {
        if (image.complete) return;
        try { await image.decode(); } catch { /* continue with available media */ }
      }));

      const canvas = await html2canvas(node, {
        backgroundColor: null,
        scale: Math.min(Math.max(window.devicePixelRatio, 2), 3),
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Could not create the image."));
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = objectUrl;
          link.download = `postframe-${selected.id}.png`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          resolve();
        }, "image/png", 1);
      });
    } catch {
      setError("The image could not be exported. Try again after the post media finishes loading.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="studio-shell" id="studio">
      <div className="studio-panel controls-panel">
        <div className="panel-kicker"><WandSparkles size={15} /> Create</div>
        <h2>Paste. Frame. Save.</h2>
        <p className="panel-copy">Use the reply link for a conversation, or any normal post link for a single card.</p>

        <div className="field-label"><Link2 size={14} /> X post link</div>
        <div className="url-field">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && generate()}
            placeholder="https://x.com/user/status/…"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button type="button" onClick={pasteLink} className="paste-button"><Clipboard size={16} /> Paste</button>
        </div>

        <div className="field-label">Mode</div>
        <div className="segment-row three">
          <Segment value="auto" current={mode} onClick={setMode}><Sparkles size={14} /> Auto</Segment>
          <Segment value="single" current={mode} onClick={setMode}><ImageIcon size={14} /> Single</Segment>
          <Segment value="reply" current={mode} onClick={setMode}><Quote size={14} /> Reply</Segment>
        </div>

        <button type="button" className="generate-button" onClick={generate} disabled={loading}>
          {loading ? <><LoaderCircle className="spin" size={18} /> Fetching post…</> : <><WandSparkles size={18} /> Generate frame</>}
        </button>

        {error && <div className="error-box">{error}</div>}

        <details className="customize" open>
          <summary>Make it yours <ChevronDown size={16} /></summary>
          <div className="customize-body">
            <div className="field-label">Frame</div>
            <div className="swatch-row">
              {(["velvet", "midnight", "blush", "clean"] as FrameStyle[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  title={item}
                  aria-label={`${item} frame`}
                  className={`frame-swatch swatch-${item} ${frame === item ? "selected" : ""}`}
                  onClick={() => setFrame(item)}
                />
              ))}
            </div>

            <div className="option-row">
              <span>Post appearance</span>
              <div className="mini-toggle">
                <button className={cardTheme === "dark" ? "active" : ""} onClick={() => setCardTheme("dark")}>Dark</button>
                <button className={cardTheme === "light" ? "active" : ""} onClick={() => setCardTheme("light")}>Light</button>
              </div>
            </div>

            <label className="switch-row">
              <span><strong>Show parent post</strong><small>For reply links</small></span>
              <input type="checkbox" checked={showParent} onChange={(event) => setShowParent(event.target.checked)} />
              <i />
            </label>
            <label className="switch-row">
              <span><strong>Show engagement</strong><small>Replies, reposts, likes & views</small></span>
              <input type="checkbox" checked={showMetrics} onChange={(event) => setShowMetrics(event.target.checked)} />
              <i />
            </label>
            <label className="switch-row">
              <span><strong>Show date</strong><small>Keep the post timestamp</small></span>
              <input type="checkbox" checked={showDate} onChange={(event) => setShowDate(event.target.checked)} />
              <i />
            </label>
          </div>
        </details>
      </div>

      <div className="studio-panel preview-panel">
        <div className="preview-toolbar">
          <div>
            <span className="preview-dot" /> Live preview
            {!result && <small>demo</small>}
          </div>
          {result && <button type="button" className="reset-button" onClick={() => { setResult(null); setUrl(""); }}><RefreshCw size={14} /> Reset</button>}
        </div>

        <div className="preview-stage">
          <div ref={captureRef} className={`capture-frame frame-${frame}`}>
            <div className={`conversation-stack ${parentVisible ? "has-parent" : "single-post"}`}>
              {parentVisible && parent && (
                <TweetCard post={parent} theme={cardTheme} showMetrics={showMetrics} showDate={showDate} connected />
              )}
              <TweetCard post={selected} theme={cardTheme} showMetrics={showMetrics} showDate={showDate} connected={false} />
            </div>
            <div className="frame-signature">made with <span>PostFrame</span></div>
          </div>
        </div>

        <div className="preview-actions">
          <div className="emoji-note"><span>🥹</span> Consistent emoji style — no Android emoji rendering.</div>
          <button type="button" className="download-button" onClick={downloadImage} disabled={downloading}>
            {downloading ? <><LoaderCircle className="spin" size={18} /> Exporting…</> : <><Download size={18} /> Download PNG</>}
          </button>
        </div>
      </div>
    </section>
  );
}
