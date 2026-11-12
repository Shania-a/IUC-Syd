import { useState } from "react";
import { createPost } from "./communityApi";
import { POST_TYPES, TOPICS } from "./communityLabels";
import { getInitials } from "./communityFormat";
import "./PostForm.css";

const MAX_CONTENT_LENGTH = 2000; // samma gräns som i backend

/**
 * Formuläret för att skriva ett inlägg. Används på startsidan och på communitysidan.
 *
 * Formuläret börjar som en enda rad, som i andra flöden, och fälls ut när man klickar.
 * startsOpen = true visar hela formuläret direkt.
 * onPublished anropas med det sparade inlägget när publiceringen har lyckats.
 */
export default function PostForm({ authorName = "", startsOpen = false, onPublished }) {
  const [isOpen, setIsOpen] = useState(startsOpen);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState(POST_TYPES[0].value);
  const [topic, setTopic] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTypeHint = POST_TYPES.find((type) => type.value === postType).hint;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsPublishing(true);
    setErrorMessage("");
    try {
      const post = await createPost({ content, postType, topic });
      onPublished(post);
      setContent("");
      setIsOpen(startsOpen);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsPublishing(false);
    }
  }

  if (!isOpen) {
    return (
      <section className="mf-card pf-closed" aria-label="Skriv ett inlägg">
        <span className="mf-avatar" aria-hidden="true">
          {getInitials(authorName)}
        </span>
        <button type="button" className="pf-open-button" onClick={() => setIsOpen(true)}>
          Ställ en fråga eller dela något med medlemmarna
        </button>
      </section>
    );
  }

  return (
    <section className="mf-card" aria-labelledby="pf-title">
      <h2 id="pf-title" className="mf-card-title">
        Skriv ett inlägg
      </h2>
      <p className="mf-card-intro">
        Inlägget syns för alla godkända medlemmar och för IUC Syd. Ditt namn och företag visas.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mf-field pf-content-field">
          <label className="mf-label" htmlFor="pf-content">
            Inlägg
          </label>
          {/* autoFocus bara när användaren själv öppnade formuläret, annars flyttas fokus vid sidladdning. */}
          <textarea
            id="pf-content"
            className="mf-input pf-textarea"
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            placeholder="Beskriv frågan, behovet eller erfarenheten så att andra förstår sammanhanget."
            autoFocus={!startsOpen}
            required
          />
          <p className="pf-hint">
            {content.length} av {MAX_CONTENT_LENGTH} tecken
          </p>
        </div>

        <div className="mf-form-grid pf-choices">
          <div className="mf-field">
            <label className="mf-label" htmlFor="pf-post-type">
              Typ av inlägg
            </label>
            <select
              id="pf-post-type"
              className="mf-input"
              value={postType}
              onChange={(event) => setPostType(event.target.value)}
              aria-describedby="pf-post-type-hint"
            >
              {POST_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p id="pf-post-type-hint" className="pf-hint">
              {selectedTypeHint}
            </p>
          </div>

          <div className="mf-field">
            <label className="mf-label" htmlFor="pf-topic">
              Ämne
            </label>
            <select
              id="pf-topic"
              className="mf-input"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
            >
              <option value="">Välj ämne</option>
              {TOPICS.map((topicOption) => (
                <option key={topicOption.value} value={topicOption.value}>
                  {topicOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pf-buttons">
          <button type="submit" className="mf-button" disabled={isPublishing}>
            {isPublishing ? "Publicerar…" : "Publicera"}
          </button>
          {!startsOpen && (
            <button type="button" className="mf-button-quiet" onClick={() => setIsOpen(false)}>
              Avbryt
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="mf-error pf-error" role="alert">
            Inlägget publicerades inte. {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}