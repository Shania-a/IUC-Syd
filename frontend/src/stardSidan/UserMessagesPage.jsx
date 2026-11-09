import React, { useState, useEffect } from "react";
import "./UserMessagesPage.css";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:1337";

function UserMessagesPage() {
  // true = visa formuläret, false = visa meddelanden
  const [activeTab, setActiveTab] = useState(true);
  const [search, setSearch] = useState(""); // det du skriver i sökrutan
  const [selected, setSelected] = useState([]); // mottagare du kryssat i
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState("");

  // Hämta användare från Strapi
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Kunde inte hämta användare");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  //hämta meddelanden från Strapi och använder cokie genom useEffect för att
  // filtrera meddelanden som är riktade till den inloggade användaren
  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/messages?populate=sender&filters[receivers][id][$eq]=${userId}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("Kunde inte hämta meddelanden");
      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  // Kolla om inloggad användare är Admin när sidan laddas och kör igång alla funktioner som behövs
  useEffect(() => {
    fetch(`${API_URL}/api/users/me?populate=role`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          navigate("/", { replace: true });
          return null;
        }
        return res.json();
      })
      .then((meData) => {
        if (!meData) return;

        fetchUsers();
        fetchMessages(meData.id);
      })
      .catch(() => navigate("/", { replace: true }));
  }, [navigate]);

  // Visa bara användare som matchar sökningen
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  // Visa bara meddelanden som matchar sökningen
  const filteredMessages = messages.filter(
    (m) =>
      m.title.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.content.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.sender?.username.toLowerCase().includes(messageSearch.toLowerCase()),
  );

  // Kryssa i eller ur en mottagare
  function toggleUser(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  }

  // När du klickar på "Skicka"
  async function handleSubmit(e) {
    e.preventDefault();

    if (selected.length === 0) {
      alert("Välj minst en mottagare");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { title, content, receivers: selected },
        }),
      });
      if (!response.ok) throw new Error("Kunde inte skicka meddelandet");

      alert("Meddelandet skickades");
      setSelected([]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("Något gick fel");
    }
  }

  return (
    <div className="messages-page">
      <h1>Privata meddelanden</h1>

      {/* Flikar */}
      <div className="tabs">
        <button
          type="button"
          className={activeTab ? "tab active" : "tab"}
          onClick={() => setActiveTab(true)}
        >
          Skicka meddelande
        </button>
        <button
          type="button"
          className={activeTab ? "tab" : "tab active"}
          onClick={() => setActiveTab(false)}
        >
          Mina meddelanden
        </button>
      </div>

      {/* Om activeTab är true: visa formuläret. Annars: visa meddelanden. */}
      {activeTab ? (
        <form className="messages-form" onSubmit={handleSubmit}>
          <label>Till</label>
          <input
            type="text"
            placeholder="Sök användare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="user-list">
            {filteredUsers.map((u) => (
              <label key={u.id} className="user-item">
                <input
                  type="checkbox"
                  checked={selected.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                />
                {u.username}
              </label>
            ))}
          </div>

          <label>Rubrik</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Innehåll</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Skicka</button>
        </form>
      ) : (
        <div className="message-list">
          <input
            type="text"
            placeholder="Sök meddelanden..."
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
          />
          {filteredMessages.length === 0 && <p>Inga meddelanden hittades.</p>}

          {filteredMessages.map((m) => (
            <div key={m.id} className="message-item">
              <h3>{m.title}</h3>
              <small>Från {m.sender?.username}</small>
              <p>{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserMessagesPage;
