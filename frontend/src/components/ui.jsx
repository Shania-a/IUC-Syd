// ui.jsx
// Små byggstenar som används på många ställen i admin-sidan.

import { useState } from 'react';
import { initials } from '../utils/format';

// Vit ruta med rubrik. All information på admin-sidan ligger i en sådan.
export function Panel({ title, aside, action, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {aside && <p className="panel-aside">{aside}</p>}
        {action}
      </div>
      {children}
    </section>
  );
}

// Liten färgad etikett. color kan vara: ok, new, warn, danger, dark eller neutral.
export function Tag({ children, color = 'neutral' }) {
  return <span className={'tag tag-' + color}>{children}</span>;
}

// Rund bubbla med initialer, t.ex. "SH" för Sara Holm.
export function Avatar({ name }) {
  return <span className="avatar">{initials(name)}</span>;
}

// Knapp som blir grå medan den sparar, så att man inte kan klicka två gånger.
// color kan vara: primary (grön), secondary (vit) eller danger (röd text).
export function ActionButton({ onClick, children, color = 'secondary', disabled = false }) {
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    try {
      await onClick();
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  }

  return (
    <button className={'btn btn-' + color} onClick={handleClick} disabled={disabled || saving}>
      {children}
    </button>
  );
}

// Grå text som visas när en lista är tom.
export function EmptyState({ children }) {
  return <p className="empty">{children}</p>;
}

// Flikar för att filtrera en lista, t.ex. Väntar / Godkända / Blockerade.
// options = [{ value: 'pending', label: 'Väntar', count: 3 }, ...]
export function Tabs({ options, value, onChange }) {
  return (
    <div className="tabs">
      {options.map((option) => (
        <button
          key={option.value}
          className={option.value === value ? 'tab active' : 'tab'}
          onClick={() => onChange(option.value)}
        >
          {option.label} <span className="tab-count">{option.count}</span>
        </button>
      ))}
    </div>
  );
}