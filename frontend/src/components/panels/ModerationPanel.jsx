// ModerationPanel.jsx
// Visar inlägg i communityn som har anmälts eller väntar på granskning.
// Admin kan behålla, godkänna, avpublicera eller ta bort dem.
//
// mode="dashboard" -> bara inlägg som behöver granskas
// mode="full"      -> flikar för "Att granska" och "Hanterade"

import { useState } from 'react';
import { useAdmin } from '../../context/AdminDataContext';
import { fullName, timeAgo } from '../../utils/format';
import { ActionButton, EmptyState, Panel, Tabs, Tag } from '../ui';

// Text och färg för inlägg som redan är hanterade
const handledLabels = {
  kept: { text: 'Ligger kvar', color: 'ok' },
  approved: { text: 'Godkänd', color: 'ok' },
  unpublished: { text: 'Avpublicerad', color: 'warn' },
  removed: { text: 'Borttagen', color: 'danger' },
};

// Ett inlägg behöver granskas om det är anmält eller väntar
function needsReview(post) {
  return post.status === 'reported' || post.status === 'pending';
}

export default function ModerationPanel({ mode = 'dashboard' }) {
  const { data, userById, companyById, actions } = useAdmin();

  // Vald flik (används bara i full-läget)
  const [filter, setFilter] = useState('open');

  // Dela upp inläggen i två grupper
  const openPosts = data.posts.filter((post) => needsReview(post));
  const handledPosts = data.posts.filter((post) => !needsReview(post));

  // På översikten och under fliken "Att granska" visas öppna inlägg
  const posts = mode === 'dashboard' || filter === 'open' ? openPosts : handledPosts;

  // Fråga först innan något tas bort
  function remove(post) {
    const sure = window.confirm('Ta bort inlägget? Det försvinner för alla medlemmar.');
    if (sure) {
      return actions.moderatePost(post.id, 'removed');
    }
  }

  return (
    <Panel title="Moderering av community" aside="Inlägg som anmälts eller väntar på granskning">
      {/* Flikar visas bara på sidan "Moderering" */}
      {mode === 'full' && (
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'open', label: 'Att granska', count: openPosts.length },
            { value: 'handled', label: 'Hanterade', count: handledPosts.length },
          ]}
        />
      )}

      {posts.length === 0 && <EmptyState>Inget att granska just nu.</EmptyState>}

      <ul className="stack">
        {posts.map((post) => {
          const author = userById[post.authorId];
          const company = companyById[author?.companyId];

          return (
            <li key={post.id} className="mod-item">
              {/* Etikett + vem som skrev och när */}
              <div className="mod-meta">
                {post.status === 'reported' && <Tag color="danger">Anmäld av medlem</Tag>}
                {post.status === 'pending' && <Tag color="warn">Väntar på granskning</Tag>}
                {handledLabels[post.status] && (
                  <Tag color={handledLabels[post.status].color}>{handledLabels[post.status].text}</Tag>
                )}
                <span className="muted small">
                  {post.type === 'comment' ? 'Kommentar' : 'Inlägg'} av {fullName(author)},{' '}
                  {company?.name} · {timeAgo(post.createdAt)}
                </span>
              </div>

              {/* Själva texten i inlägget */}
              <p className="mod-text">{post.text}</p>

              {/* Varför det anmäldes, om det finns en anledning */}
              {post.reportReason && <p className="muted small">Anledning: {post.reportReason}</p>}

              {/* Knappar visas bara för inlägg som inte är hanterade än */}
              {needsReview(post) && (
                <div className="actions">
                  {/* Anmälda inlägg: "Behåll". Väntande inlägg: "Godkänn". */}
                  {post.status === 'reported' ? (
                    <ActionButton color="primary" onClick={() => actions.moderatePost(post.id, 'kept')}>
                      Behåll
                    </ActionButton>
                  ) : (
                    <ActionButton color="primary" onClick={() => actions.moderatePost(post.id, 'approved')}>
                      Godkänn
                    </ActionButton>
                  )}

                  <ActionButton onClick={() => actions.moderatePost(post.id, 'unpublished')}>
                    Avpublicera
                  </ActionButton>

                  <ActionButton color="danger" onClick={() => remove(post)}>
                    Ta bort
                  </ActionButton>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
