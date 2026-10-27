// ComingSoon.jsx
// En enkel sida för menypunkter som inte är byggda än,
// t.ex. IUC-området, Evenemang, Communityämnen och Inställningar.
//
// Användning: <ComingSoon title="Evenemang" />

import { Panel } from '../components/ui';

export default function ComingSoon({ title }) {
  return (
    <Panel title={title}>
      <p className="muted">
        Den här delen av administrationen är inte byggd än. Den läggs till i en senare version.
      </p>
    </Panel>
  );
}