import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getInitials } from "./community/communityFormat";
import PostCard from "./community/PostCard";
import PostForm from "./community/PostForm";
import { usePosts } from "./community/usePosts";
import { mockEvents, mockNews } from "./mockStartsida";
import "./MittForetag.css";
import "./Stard_sidan.css";
const API_URL = "http://localhost:1337";
const POSTS_PER_STEP = 10;

/**
 * Startsidan. Flödet med medlemmarnas inlägg ligger i mitten.
 * Till vänster finns ett kort om den inloggade och till höger en smal
 * spalt med nyheter och event från IUC Syd.
 */
function Start_sida() {
  const [user, setUser] = useState(null);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_STEP);
  const { posts, loadState, newPostId, addPost, addComment } = usePosts();
  const navigate = useNavigate();

  useEffect(() => {
    // StrictMode kör effekten två gånger i dev. Flaggan hindrar att ett gammalt svar skriver över state.
    let isCurrent = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (!isCurrent) return;
        if (currentUser) setUser(currentUser);
        else navigate("/", { replace: true });
      })
      .catch(() => {
        if (isCurrent) navigate("/", { replace: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  return (
    <main className="mf-page">
      <div className="mf-container st-layout">
        <ProfileCard user={user} />
        <IucCard news={mockNews} events={mockEvents} />

        <section className="st-feed" aria-labelledby="st-feed-title">
          <PostForm authorName={user?.username} onPublished={addPost} />

          <div className="st-feed-head">
            <h2 id="st-feed-title" className="st-feed-title">
              Från medlemmarna
            </h2>
            <Link to="/community" className="st-link">
              Filtrera på ämne
            </Link>
          </div>

          {loadState.status === "loading" && <p className="mf-muted">Hämtar inlägg…</p>}

          {loadState.status === "error" && (
            <p className="mf-error" role="alert">
              Inläggen kunde inte hämtas. {loadState.message}
            </p>
          )}

          {loadState.status === "ready" && posts.length === 0 && (
            <p className="mf-card mf-muted">
              Inga inlägg ännu. Skriv det första i rutan ovanför.
            </p>
          )}

          {posts.slice(0, visibleCount).map((post) => (
            <PostCard
              key={post.documentId}
              post={post}
              isNew={post.documentId === newPostId}
              onCommentAdded={addComment}
            />
          ))}

          {posts.length > visibleCount && (
            <button
              type="button"
              className="mf-button-quiet"
              onClick={() => setVisibleCount((current) => current + POSTS_PER_STEP)}
            >
              Visa fler inlägg
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default Start_sida;

/** Returnerar den inloggade användaren, eller null när ingen är inloggad. */
async function fetchCurrentUser() {
  const response = await fetch(`${API_URL}/api/users/me`, { credentials: "include" });
  return response.ok ? response.json() : null;
}

function ProfileCard({ user }) {
  return (
    <div className="mf-card st-profile">
      <span className="mf-avatar st-profile-avatar" aria-hidden="true">
        {getInitials(user?.username)}
      </span>
      <div className="st-profile-text">
        <h1 className="st-welcome">Välkommen tillbaka{user ? `, ${user.username}` : ""}</h1>
        {user?.company_id && <p className="mf-muted">{user.company_id}</p>}
      </div>
      <Link to="/mitt_foretag" className="st-link st-profile-link">
        Mitt företag
      </Link>
    </div>
  );
}

function IucCard({ news, events }) {
  return (
    <aside className="st-iuc" aria-labelledby="st-iuc-title">
      <h2 id="st-iuc-title" className="st-iuc-title">
        Från IUC Syd
      </h2>

      <div className="st-iuc-body">
        <h3 className="st-iuc-heading">Nyheter</h3>
        <ul className="st-list">
          {news.map((newsItem) => (
            <li key={newsItem.id} className="st-news">
              {newsItem.isPinned && (
                <span className="mf-badge mf-badge-waiting st-pinned">Fäst av IUC Syd</span>
              )}
              <p className="st-item-title">{newsItem.title}</p>
              <time className="st-item-detail" dateTime={newsItem.date}>
                {formatShortDate(newsItem.date)}
              </time>
            </li>
          ))}
        </ul>

        <h3 className="st-iuc-heading">Event och aktiviteter</h3>
        <ul className="st-list">
          {events.map((event) => (
            <li key={event.id} className="st-event">
              <time className="st-event-date" dateTime={event.date}>
                <span className="st-event-day">{new Date(event.date).getDate()}</span>
                <span className="st-event-month">{formatMonth(event.date)}</span>
              </time>
              <div className="st-event-text">
                <p className="st-item-title">{event.title}</p>
                <p className="st-item-detail">{event.place}</p>
                <a
                  className="st-link"
                  href={event.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Läs mer och anmäl
                  <span className="mf-visually-hidden">
                    {" "}
                    till {event.title}, öppnas i ny flik
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="st-iuc-footnote">Anmälan öppnas på IUC Syds webbplats.</p>
      </div>
    </aside>
  );
}

const shortDateFormat = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });
const monthFormat = new Intl.DateTimeFormat("sv-SE", { month: "short" });

function formatShortDate(isoDate) {
  return shortDateFormat.format(new Date(isoDate));
}

function formatMonth(isoDate) {
  return monthFormat.format(new Date(isoDate));
}