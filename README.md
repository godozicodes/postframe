# PostFrame

PostFrame turns public X posts into clean, shareable PNG images.

## What it does

- Paste a normal X post URL to render a single post.
- Paste a reply URL and PostFrame automatically detects the conversation and can include the original/root post above the selected reply.
- Auto, Single Post, and Reply modes.
- Dark and light post cards.
- Velvet, Midnight, Blush, and clean export frames.
- Optional parent post, engagement metrics, and timestamp.
- Crisp PNG export in the browser.
- Emoji inside post content are rendered with a fixed image emoji set, so Android's native emoji font is not used in generated cards.
- No account or X login required for public posts.

## Stack

- Next.js 16
- React 19
- TypeScript
- X's public syndication/embed data endpoint (server-side)
- html2canvas for PNG export
- Twemoji artwork for consistent cross-device emoji rendering

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How links work

For a single post, copy that post's link. For a conversation image, copy the **reply's** link. PostFrame reads the reply, detects its parent chain, and shows the root/original post above the selected reply when `Show parent post` is enabled.

## Notes

Only public posts can be fetched. Protected, deleted, suspended, or otherwise unavailable posts may not render. X's syndication endpoint is public and does not require an API key, but it is not a stable public developer API and could change; the server route is isolated so it can be swapped for an official X API integration later without redesigning the UI.

Apple's actual Apple Color Emoji assets are proprietary and are not bundled in this repository. PostFrame uses a consistent non-Android image emoji renderer instead of falling back to Android's native emoji font.
