import { ArrowDown, Github, Heart, Sparkles } from "lucide-react";
import PostGenerator from "@/components/post-generator";

export default function Home() {
  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" />

      <nav className="nav-wrap">
        <a className="brand" href="#top" aria-label="PostFrame home">
          <span className="brand-gem">P</span>
          <span>PostFrame</span>
        </a>
        <div className="nav-right">
          <a href="https://github.com/godozicodes/postframe" target="_blank" rel="noreferrer" className="ghost-link">
            <Github size={16} /> GitHub
          </a>
          <a href="#studio" className="nav-cta">Create a frame</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-pill"><Sparkles size={14} /> Pretty screenshots for X</div>
        <h1>Turn posts into <span>pretty little pictures.</span></h1>
        <p>
          Paste any public X post. PostFrame detects replies, finds the conversation,
          and turns it into a polished image you actually want to share.
        </p>
        <div className="hero-actions">
          <a href="#studio" className="hero-primary">Make one now <ArrowDown size={17} /></a>
          <span className="hero-note">No login · No API key · PNG export</span>
        </div>

        <div className="hero-mini-cards" aria-hidden="true">
          <div className="mini-card mini-one"><span className="mini-avatar">P</span><div><b>one link.</b><small>that’s literally it ✨</small></div></div>
          <div className="mini-card mini-two"><span className="mini-avatar alt">♡</span><div><b>reply detected</b><small>parent included automatically</small></div></div>
        </div>
      </section>

      <PostGenerator />

      <section className="how-section">
        <div className="section-kicker">stupidly simple</div>
        <h2>From timeline to camera roll in three taps.</h2>
        <div className="how-grid">
          <article><span>01</span><h3>Copy the link</h3><p>Copy a normal post link for a single image, or copy the reply link for a conversation.</p></article>
          <article><span>02</span><h3>Make it cute</h3><p>Pick the frame, dark or light post styling, and choose which details stay visible.</p></article>
          <article><span>03</span><h3>Save the PNG</h3><p>PostFrame exports the exact preview as a crisp, share-ready image.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-gem">P</span><span>PostFrame</span></a>
        <p>Built for screenshots that deserve better than a crop.</p>
        <span className="footer-love">made with <Heart size={13} fill="currentColor" /> by godozicodes</span>
      </footer>
    </main>
  );
}
