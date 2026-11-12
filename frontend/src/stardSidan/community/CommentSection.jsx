import { useState } from "react";
import { createComment } from "./communityApi";
import { formatPublishedTime, getInitials } from "./communityFormat";
import "./CommentSection.css";

const MAX_COMMENT_LENGTH = 1000; // samma gräns som i backend

/**
 * Kommentarerna under ett inlägg. De är hopfällda tills användaren öppnar dem,
 * så att flödet inte blir för långt.
 * onCommentAdded anropas med den sparade kommentaren när den har skickats.
 */
export default function CommentSection({ post, onCommentAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputId = `cs-input-${post.documentId}`;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setErrorMessage("");
    try {
      const comment = await createComment(post.documentId, content);
      onCommentAdded(comment);
      setContent("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="cs-section">
      <button
        type="button"
        className="cs-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {getToggleLabel(post.comments.length, isOpen)}
      </button>

      {isOpen && (
        <>
          {post.comments.length > 0 && (
            <ul className="cs-list">
              {post.comments.map((comment) => (
                <Comment key={comment.documentId} comment={comment} />
              ))}
            </ul>
          )}

          <form className="cs-form" onSubmit={handleSubmit}>
            <label className="mf-visually-hidden" htmlFor={inputId}>
              Skriv en kommentar till {post.authorName}
            </label>
            <input
              id={inputId}
              className="mf-input cs-input"
              type="text"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              placeholder="Skriv en kommentar"
              autoComplete="off"
              required
            />
            <button type="submit" className="mf-button-quiet" disabled={isSending}>
              {isSending ? "Skickar…" : "Skicka"}
            </button>
          </form>

          {errorMessage && (
            <p className="mf-error cs-error" role="alert">
              Kommentaren skickades inte. {errorMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Comment({ comment }) {
  return (
    <li className="cs-comment">
      <span className="mf-avatar cs-avatar" aria-hidden="true">
        {getInitials(comment.authorName)}
      </span>
      <div className={comment.isFromIucSyd ? "cs-bubble cs-bubble-iuc" : "cs-bubble"}>
        <p className="cs-meta">
          <span className="cs-author">{comment.authorName}</span>
          {comment.isFromIucSyd ? (
            <span className="mf-badge mf-badge-main">IUC Syd</span>
          ) : (
            comment.companyName && <span>{comment.companyName}</span>
          )}
          <time className="cs-time" dateTime={comment.createdAt}>
            {formatPublishedTime(comment.createdAt)}
          </time>
        </p>
        <p className="cs-content">{comment.content}</p>
      </div>
    </li>
  );
}

function getToggleLabel(commentCount, isOpen) {
  if (isOpen) return "Dölj kommentarer";
  if (commentCount === 0) return "Kommentera";
  if (commentCount === 1) return "Visa 1 kommentar";
  return `Visa ${commentCount} kommentarer`;
}