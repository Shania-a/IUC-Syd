import CommentSection from "./CommentSection";
import { formatPublishedTime, getInitials } from "./communityFormat";
import { getPostTypeLabel, getTopicLabel } from "./communityLabels";
import "./PostCard.css";

/**
 * Visar ett inlägg från communityt med sina kommentarer.
 * Används både på startsidan och på communitysidan.
 *
 * isNew ger inlägget en markering, så att den som just publicerat ser var det hamnade.
 * onCommentAdded anropas med inläggets documentId och den nya kommentaren.
 */
export default function PostCard({ post, isNew = false, onCommentAdded }) {
  return (
    <article className={isNew ? "pc-card pc-card-new" : "pc-card"}>
      <header className="pc-head">
        <span className="mf-avatar" aria-hidden="true">
          {getInitials(post.authorName)}
        </span>
        <div className="pc-author">
          <p className="pc-author-name">
            {post.authorName}
            {post.isFromIucSyd && <span className="mf-badge mf-badge-main">IUC Syd</span>}
          </p>
          {post.companyName && <p className="pc-company">{post.companyName}</p>}
        </div>
        <time className="pc-time" dateTime={post.createdAt}>
          {formatPublishedTime(post.createdAt)}
        </time>
      </header>

      <p className="pc-badges">
        <span className="mf-badge mf-badge-visible">{getPostTypeLabel(post.postType)}</span>
        <span className="mf-badge mf-badge-neutral">{getTopicLabel(post.topic)}</span>
      </p>

      <p className="pc-content">{post.content}</p>

      {isNew && (
        <p className="pc-new-note" role="status">
          Ditt inlägg är publicerat. Alla godkända medlemmar och IUC Syd kan läsa det.
        </p>
      )}

      <CommentSection
        post={post}
        onCommentAdded={(comment) => onCommentAdded(post.documentId, comment)}
      />
    </article>
  );
}