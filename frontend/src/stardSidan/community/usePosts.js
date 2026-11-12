import { useEffect, useState } from "react";
import { fetchPosts } from "./communityApi";

/**
 * Hämtar inläggen när sidan visas och håller listan uppdaterad när
 * användaren publicerar eller kommenterar. Startsidan och communitysidan
 * använder samma hook, så att de fungerar likadant.
 *
 * Returnerar:
 *   posts       inläggen, nyast först
 *   loadState   { status: "loading" | "ready" | "error", message, needsLogin }
 *   newPostId   documentId för inlägget användaren just publicerade, annars null
 *   addPost     lägger ett nytt inlägg överst
 *   addComment  lägger en ny kommentar sist på ett inlägg
 */
export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loadState, setLoadState] = useState({ status: "loading" });
  const [newPostId, setNewPostId] = useState(null);

  useEffect(() => {
    // StrictMode kör effekten två gånger i dev. Flaggan hindrar att ett gammalt svar skriver över state.
    let isCurrent = true;
    fetchPosts()
      .then((fetchedPosts) => {
        if (!isCurrent) return;
        setPosts(fetchedPosts);
        setLoadState({ status: "ready" });
      })
      .catch((error) => {
        if (!isCurrent) return;
        setLoadState({
          status: "error",
          message: error.message,
          needsLogin: error.needsLogin,
        });
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  function addPost(post) {
    setPosts((current) => [post, ...current]);
    setNewPostId(post.documentId);
  }

  function addComment(postDocumentId, comment) {
    setPosts((current) =>
      current.map((post) =>
        post.documentId === postDocumentId
          ? { ...post, comments: [...post.comments, comment] }
          : post,
      ),
    );
  }

  return { posts, loadState, newPostId, addPost, addComment };
}