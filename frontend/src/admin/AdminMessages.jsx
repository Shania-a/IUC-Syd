import React, { useState } from "react";
import mockData from "../data/mockData.json";

function AdminMessages() {
  const [messages, setMessages] = useState(mockData.messages);
  // Id på meddelandet som är öppet just nu. null = inget öppet.
  const [openId, setOpenId] = useState(null);
  // Texten i svarsrutan
  const [replyText, setReplyText] = useState("");

  // Det öppna meddelandet (eller undefined om inget är öppet)
  const openMessage = messages.find((message) => message.id === openId);

  // Öppna ett meddelande och töm svarsrutan
  function openThis(id) {
    setOpenId(id);
    setReplyText("");
  }

  // Skicka svaret på det öppna meddelandet
  function sendReply() {
    const newList = messages.map((message) => {
      if (message.id === openId) {
        const newReply = {
          id: "r" + Date.now(),
          text: replyText,
          author: "IUC Syd",
        };
        // Samma meddelande, men med status "replied" och det nya svaret sist
        return {
          ...message,
          status: "replied",
          replies: [...message.replies, newReply],
        };
      }
      return message;
    });
    setMessages(newList);
    setReplyText("");
  }

  // Hitta namnet på den som skickade meddelandet
  function getSenderName(userId) {
    const user = mockData.users.find((u) => u.id === userId);
    if (user) {
      return user.firstName + " " + user.lastName;
    }
    return "Okänd användare";
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Privata meddelanden</h2>
        <p className="panel-aside">
          Frågor som medlemmar skickat direkt till IUC Syd
        </p>
      </div>

      <ul className="stack divided">
        {messages.map((message) => (
          <li key={message.id} className="msg-item">
            <div>
              <strong>{message.subject}</strong>
              <p className="muted small">
                {getSenderName(message.fromUserId)} ·{" "}
                {new Date(message.createdAt).toLocaleDateString("sv-SE")}
              </p>
              <div className="tag-row">
                {message.status === "new" && (
                  <span className="tag tag-warn">Ny</span>
                )}
                {message.status === "replied" && (
                  <span className="tag tag-ok">Besvarad</span>
                )}
                {message.tags.map((tag) => (
                  <span key={tag} className="tag tag-new">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Samma knapp öppnar och stänger */}
            {message.id === openId ? (
              <button
                className="btn btn-primary"
                onClick={() => setOpenId(null)}
              >
                Stäng
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => openThis(message.id)}
              >
                Öppna
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Det öppna meddelandet med svarsruta. Visas bara om något är öppet. */}
      {openMessage && (
        <div className="reply-box">
          <strong>{openMessage.subject}</strong>
          <p>{openMessage.body}</p>

          {/* Tidigare svar */}
          {openMessage.replies.map((reply) => (
            <div key={reply.id} className="reply">
              <span className="muted small">Svar från {reply.author}</span>
              <p>{reply.text}</p>
            </div>
          ))}

          <textarea
            rows={4}
            placeholder="Skriv ett svar..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <div className="actions">
            {/* Knappen är avstängd (disabled) tills något har skrivits */}
            <button
              className="btn btn-primary"
              onClick={sendReply}
              disabled={replyText.trim() === ""}
            >
              Skicka svar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminMessages;
