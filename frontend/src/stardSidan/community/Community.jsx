import { useState } from "react";
import { Link } from "react-router-dom";
import { TOPICS } from "./communityLabels";
import PostCard from "./PostCard";
import PostForm from "./PostForm";
import { usePosts } from "./usePosts";
import "../MittForetag.css";
import "./Community.css";

const ALL_TOPICS = "";

export default function Community() {
  const [topicFilter, setTopicFilter] = useState(ALL_TOPICS);
  const { posts, loadState, newPostId, addPost, addComment } = usePosts();

  function handlePublished(post) {
    addPost(post);
    // Filtret nollställs, annars kan det nya inlägget vara dolt av ett valt ämne.
    setTopicFilter(ALL_TOPICS);
  }

  if (loadState.status === "loading") {
    return (
      <PageFrame>
        <p className="mf-muted">Hämtar inlägg…</p>
      </PageFrame>
    );
  }

  if (loadState.status === "error") {
    return (
      <PageFrame>
        <div className="mf-card mf-message" role="alert">
          <p>{loadState.message}</p>
          {loadState.needsLogin && (
            <Link to="/" className="mf-button">
              Gå till inloggningen
            </Link>
          )}
        </div>
      </PageFrame>
    );
  }

  const visiblePosts =
    topicFilter === ALL_TOPICS ? posts : posts.filter((post) => post.topic === topicFilter);

  return (
    <PageFrame>
      <div className="cm-form">
        <PostForm startsOpen onPublished={handlePublished} />
      </div>

      <section aria-labelledby="cm-feed-title">
        <div className="cm-feed-head">
          <h2 id="cm-feed-title" className="cm-feed-title">
            Inlägg från medlemmarna
          </h2>
          <TopicFilter topic={topicFilter} onTopicChange={setTopicFilter} />
        </div>

        {visiblePosts.length === 0 ? (
          <p className="mf-card mf-muted">
            {posts.length === 0
              ? "Inga inlägg ännu. Skriv det första i formuläret ovanför."
              : "Inga inlägg i det valda ämnet. Rensa filtret för att se alla."}
          </p>
        ) : (
          <div className="cm-feed">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.documentId}
                post={post}
                isNew={post.documentId === newPostId}
                onCommentAdded={addComment}
              />
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}

function PageFrame({ children }) {
  return (
    <main className="mf-page">
      <div className="mf-container cm-container">
        <header className="mf-page-header">
          <div>
            <h1 className="mf-page-title">Community</h1>
            <p className="mf-page-intro">
              Ställ en fråga, sök samarbete eller dela en erfarenhet med andra medlemsföretag.
            </p>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

function TopicFilter({ topic, onTopicChange }) {
  return (
    <div className="cm-filter">
      <label className="mf-label" htmlFor="cm-topic-filter">
        Visa ämne
      </label>
      <select
        id="cm-topic-filter"
        className="mf-input cm-filter-select"
        value={topic}
        onChange={(event) => onTopicChange(event.target.value)}
      >
        <option value={ALL_TOPICS}>Alla ämnen</option>
        {TOPICS.map((topicOption) => (
          <option key={topicOption.value} value={topicOption.value}>
            {topicOption.label}
          </option>
        ))}
      </select>
      {topic !== ALL_TOPICS && (
        <button type="button" className="mf-button-quiet" onClick={() => onTopicChange(ALL_TOPICS)}>
          Rensa filter
        </button>
      )}
    </div>
  );
}