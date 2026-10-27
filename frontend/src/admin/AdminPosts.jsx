import React, { useState } from "react";
import mockData from "../data/mockData.json";

function AdminPosts() {
  const [posts, setPosts] = useState(mockData.posts);
  // Vald flik: "open" (att granska) eller "handled" (hanterade)
  const [filter, setFilter] = useState("open");

  // Inlägg som ska granskas: de som är anmälda eller väntar
  const openPosts = posts.filter(
    (post) => post.status === "reported" || post.status === "pending",
  );
  // Inlägg som redan är hanterade: alla andra
  const handledPosts = posts.filter(
    (post) => post.status !== "reported" && post.status !== "pending",
  );

  let visiblePosts = handledPosts;
  if (filter === "open") {
    visiblePosts = openPosts;
  }

  // Byt status på ETT inlägg (samma som för användare)
  function changeStatus(id, newStatus) {
    const newList = posts.map((post) => {
      if (post.id === id) {
        return { ...post, status: newStatus };
      }
      return post;
    });
    setPosts(newList);
  }

  // Fråga först innan något tas bort
  function removePost(id) {
    const sure = window.confirm(
      "Ta bort inlägget? Det försvinner för alla medlemmar.",
    );
    if (sure) {
      changeStatus(id, "removed");
    }
  }

  // Hitta namnet på den som skrev inlägget
  function getAuthorName(userId) {
    const user = mockData.users.find((u) => u.id === userId);
    if (user) {
      return user.firstName + " " + user.lastName;
    }
    return "Okänd användare";
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Moderering</h2>
        <p className="panel-aside">
          Anmälda och ogranskade inlägg i communityn
        </p>
      </div>

      <div className="tabs">
        <button
          className={filter === "open" ? "tab active" : "tab"}
          onClick={() => setFilter("open")}
        >
          Att granska
        </button>
        <button
          className={filter === "handled" ? "tab active" : "tab"}
          onClick={() => setFilter("handled")}
        >
          Hanterade
        </button>
      </div>

      {visiblePosts.length === 0 && (
        <p className="empty">Inget att visa just nu.</p>
      )}

      <ul className="stack">
        {visiblePosts.map((post) => (
          <li key={post.id} className="mod-item">
            <div className="mod-meta">
              {post.status === "reported" && (
                <span className="tag tag-danger">Anmäld av medlem</span>
              )}
              {post.status === "pending" && (
                <span className="tag tag-warn">Väntar på granskning</span>
              )}
              {post.status === "kept" && (
                <span className="tag tag-ok">Ligger kvar</span>
              )}
              {post.status === "approved" && (
                <span className="tag tag-ok">Godkänd</span>
              )}
              {post.status === "unpublished" && (
                <span className="tag tag-warn">Avpublicerad</span>
              )}
              {post.status === "removed" && (
                <span className="tag tag-danger">Borttagen</span>
              )}
              <span className="muted small">
                {post.type === "comment" ? "Kommentar" : "Inlägg"} av{" "}
                {getAuthorName(post.authorId)}
              </span>
            </div>

            <p className="mod-text">{post.text}</p>

            {post.reportReason && (
              <p className="muted small">Anledning: {post.reportReason}</p>
            )}

            {/* Knapparna visas bara för inlägg som ska granskas */}
            {(post.status === "reported" || post.status === "pending") && (
              <div className="actions">
                {post.status === "reported" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => changeStatus(post.id, "kept")}
                  >
                    Behåll
                  </button>
                )}
                {post.status === "pending" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => changeStatus(post.id, "approved")}
                  >
                    Godkänn
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => changeStatus(post.id, "unpublished")}
                >
                  Avpublicera
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => removePost(post.id)}
                >
                  Ta bort
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminPosts;
