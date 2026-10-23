// MessagesPanel.jsx
// Privata meddelanden från medlemmar till IUC Syd.
// Admin kan öppna ett meddelande (då blir det läst) och skriva ett svar.
//
// mode="dashboard" -> bara obesvarade meddelanden
// mode="full"      -> alla meddelanden, även besvarade

import { useState } from 'react';
import { useAdmin } from '../../context/AdminDataContext';
import { fullName, timeAgo } from '../../utils/format';
import { ActionButton, EmptyState, Panel, Tag } from '../ui';

export default function MessagesPanel({ mode = 'dashboard' }) {
  const { data, userById, companyById, actions } = useAdmin();

  // Id på meddelandet som är öppet just nu (null = inget öppet)
  const [openId, setOpenId] = useState(null);

  // Texten som skrivs i svarsrutan
  const [replyText, setReplyText] = useState('');

  // Välj vilka meddelanden som ska visas
  const messages =
    mode === 'dashboard'
      ? data.messages.filter((message) => message.status !== 'replied')
      : data.messages;

  // Det öppna meddelandet (eller undefined om inget är öppet)
  const openMessage = data.messages.find((message) => message.id === openId);

  // Öppna ett meddelande. Om det är nytt markeras det som läst.
  function open(message) {
    setOpenId(message.id);
    setReplyText('');
    if (message.status === 'new') {
      actions.markMessageRead(message.id);
    }
  }

  // Skicka svaret
  async function sendReply() {
    await actions.replyToMessage(openMessage.id, replyText.trim());
    setReplyText('');
    // På översikten stängs meddelandet, eftersom besvarade inte visas där
    if (mode === 'dashboard') {
      setOpenId(null);
    }
  }

  return (
    <Panel title="Privata meddelanden" action={<Tag color="dark">Endast IUC Syd ser dessa</Tag>}>
      {messages.length === 0 && <EmptyState>Alla meddelanden är besvarade.</EmptyState>}

      {/* Listan med meddelanden */}
      <ul className="stack divided">
        {messages.map((message) => {
          const sender = userById[message.fromUserId];
          const company = companyById[sender?.companyId];
          const isOpen = message.id === openId;

          return (
            <li key={message.id} className="msg-item">
              <div>
                <strong>{message.subject}</strong>
                <p className="muted small">
                  {fullName(sender)}, {company?.name} · {timeAgo(message.createdAt)}
                </p>

                {/* Etiketter: status och ämnen */}
                <div className="tag-row">
                  {message.status === 'new' && <Tag color="warn">Ny</Tag>}
                  {message.status === 'replied' && <Tag color="ok">Besvarad</Tag>}
                  {message.tags.map((tag) => (
                    <Tag key={tag} color="new">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Samma knapp öppnar och stänger */}
              <button
                className={isOpen ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => (isOpen ? setOpenId(null) : open(message))}
              >
                {isOpen ? 'Stäng' : 'Öppna'}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Det öppna meddelandet med svarsruta */}
      {openMessage && (
        <div className="reply-box">
          <strong>{openMessage.subject}</strong>
          <p>{openMessage.body}</p>

          {/* Tidigare svar, om det finns några */}
          {openMessage.replies.map((reply) => (
            <div key={reply.id} className="reply">
              <span className="muted small">
                Svar från {reply.author} · {timeAgo(reply.createdAt)}
              </span>
              <p>{reply.text}</p>
            </div>
          ))}

          <textarea
            rows={4}
            placeholder="Skriv ett svar…"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
          />

          <div className="actions">
            {/* Knappen är grå tills något har skrivits */}
            <ActionButton color="primary" onClick={sendReply} disabled={replyText.trim() === ''}>
              Skicka svar
            </ActionButton>
            <span className="muted small">Medlemmen får svaret i portalen och via e-post.</span>
          </div>
        </div>
      )}
    </Panel>
  );
}