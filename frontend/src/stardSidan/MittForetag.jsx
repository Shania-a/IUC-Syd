import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyCompany, setCompanyConsent } from "./mittForetagApi";
import { mockParticipations } from "./mockDeltagande";
import "./MittForetag.css";

export default function MittForetag() {
  const [company, setCompany] = useState(null);
  const [contactPersons, setContactPersons] = useState([]);
  const [loadState, setLoadState] = useState({ status: "loading" });
  const [consentError, setConsentError] = useState("");
  const [isMemberPreview, setIsMemberPreview] = useState(false);

  useEffect(() => {
    // StrictMode kör effekten två gånger i dev. Flaggan hindrar att ett gammalt svar skriver över state.
    let isCurrent = true;
    fetchMyCompany()
      .then((result) => {
        if (!isCurrent) return;
        setCompany(result.company);
        setContactPersons(result.contactPersons);
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

  async function handleCompanyConsentChange(contactPerson, companyConsent) {
    setConsentError("");
    setContactPersons((current) =>
      replaceContactPerson(current, { ...contactPerson, companyConsent }),
    );
    try {
      const updated = await setCompanyConsent(contactPerson.documentId, companyConsent);
      setContactPersons((current) => replaceContactPerson(current, updated));
    } catch (error) {
      setContactPersons((current) => replaceContactPerson(current, contactPerson));
      setConsentError(`Samtycket för ${contactPerson.name} sparades inte. ${error.message}`);
    }
  }

 

  if (loadState.status === "loading") {
    return (
      <PageFrame>
        <p className="mf-muted">Hämtar ert företag…</p>
      </PageFrame>
    );
  }

  if (loadState.status === "error") {
    return (
      <PageFrame>
        <div className="mf-card mf-message" role="alert">
          <p>{loadState.message}</p>
          {loadState.needsLogin && (
            <Link to="/" className="mf-button">
              Gå till inloggningen
            </Link>
          )}
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <header className="mf-page-header">
        <div>
          <h1 className="mf-page-title">
            {isMemberPreview ? "Så ser andra medlemmar kortet" : "Mitt företag"}
          </h1>
          <p className="mf-page-intro">
            {isMemberPreview
              ? "Andra medlemmar ser företagsuppgifterna och de kontaktpersoner som har samtycke från både företaget och personen."
              : "Så ser ert företagskort ut, vilka som är kopplade till det och vilka behov ni har registrerat."}
          </p>
        </div>
        <button
          type="button"
          className="mf-button-quiet"
          onClick={() => setIsMemberPreview((current) => !current)}
        >
          {isMemberPreview ? "Tillbaka till Mitt företag" : "Se hur andra medlemmar ser kortet"}
        </button>
      </header>

      {isMemberPreview ? (
        <MemberPreview
          company={company}
          visibleContactPersons={contactPersons.filter(isVisibleToMembers)}
        />
      ) : (
        <div className="mf-layout">
          <div className="mf-column">
            <CompanyCard company={company} />
            <ContactPersonList
              contactPersons={contactPersons}
              errorMessage={consentError}
              onCompanyConsentChange={handleCompanyConsentChange}
            />
            
          </div>
          <div className="mf-column">
            {/* Identifierade behov och Engagemang i communityt byggs separat och hamnar i den här kolumnen. */}
            <ParticipationList participations={mockParticipations} />
          </div>
        </div>
      )}
    </PageFrame>
  );
}

function PageFrame({ children }) {
  return (
    <main className="mf-page">
      <div className="mf-container">{children}</div>
    </main>
  );
}

function CompanyCard({ company, showEditNotice = true }) {
  const location = [company.city, company.industry].filter(Boolean).join(" · ");

  return (
    <section className="mf-card" aria-label={company.name}>
      <div className="mf-company-head">
        <span className="mf-avatar mf-avatar-large" aria-hidden="true">
          {getInitials(company.name)}
        </span>
        <div>
          <h2 className="mf-company-name">{company.name}</h2>
          {location && <p className="mf-muted">{location}</p>}
        </div>
      </div>

      {company.description && <p className="mf-company-description">{company.description}</p>}

      {(company.email || company.phone) && (
        <p className="mf-company-contact">
          {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
          {company.phone && <a href={`tel:${toPhoneHref(company.phone)}`}>{company.phone}</a>}
        </p>
      )}

      {showEditNotice && (
        <p className="mf-notice">
          Företagsuppgifter läggs in och uppdateras av IUC Syd. Hör av er om något är fel.
        </p>
      )}
    </section>
  );
}

function ContactPersonList({ contactPersons, errorMessage, onCompanyConsentChange }) {
  return (
    <section className="mf-card" aria-labelledby="mf-contacts-title">
      <h2 id="mf-contacts-title" className="mf-card-title">
        Kontaktpersoner
      </h2>
      <p className="mf-card-intro">
        Andra medlemmar ser bara huvudkontakten. Namn, roll och e-post visas först när både
        företaget och personen har gett samtycke.
      </p>

      {errorMessage && (
        <p className="mf-error" role="alert">
          {errorMessage}
        </p>
      )}

      {contactPersons.length === 0 ? (
        <p className="mf-empty">Inga kontaktpersoner ännu. Föreslå en nedan.</p>
      ) : (
        <ul className="mf-list">
          {contactPersons.map((contactPerson) => (
            <ContactPersonRow
              key={contactPerson.documentId}
              contactPerson={contactPerson}
              onCompanyConsentChange={onCompanyConsentChange}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ContactPersonRow({ contactPerson, onCompanyConsentChange }) {
  const status = getContactPersonStatus(contactPerson);
  const checkboxId = `mf-consent-${contactPerson.documentId}`;

  return (
    <li className="mf-row">
      <span className="mf-avatar" aria-hidden="true">
        {getInitials(contactPerson.name)}
      </span>
      <div className="mf-row-text">
        <p className="mf-row-name">{contactPerson.name}</p>
        {contactPerson.jobTitle && <p className="mf-row-detail">{contactPerson.jobTitle}</p>}
      </div>
      <div className="mf-row-actions">
        {status && <span className={`mf-badge mf-badge-${status.tone}`}>{status.label}</span>}
        {contactPerson.approvalStatus === "approved" && (
          <label className="mf-consent" htmlFor={checkboxId}>
            <input
              id={checkboxId}
              type="checkbox"
              checked={contactPerson.companyConsent}
              onChange={(event) => onCompanyConsentChange(contactPerson, event.target.checked)}
            />
            Samtycke
            <span className="mf-visually-hidden"> för {contactPerson.name}</span>
          </label>
        )}
      </div>
    </li>
  );
}

const emptySuggestion = { name: "", jobTitle: "", phone: "", email: "" };

function SuggestContactPersonForm({ onSuggested }) {
  const [suggestion, setSuggestion] = useState(emptySuggestion);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setSuggestion((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setFeedback(null);
    try {
      const contactPerson = await suggestContactPerson(suggestion);
      onSuggested(contactPerson);
      setSuggestion(emptySuggestion);
      setFeedback({
        tone: "success",
        text: `Förslaget är skickat. ${contactPerson.name} väntar på godkännande från IUC Syd.`,
      });
    } catch (error) {
      setFeedback({ tone: "error", text: error.message });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="mf-card" aria-labelledby="mf-suggest-title">
      <h2 id="mf-suggest-title" className="mf-card-title">
        Föreslå ny kontaktperson
      </h2>
      <p className="mf-card-intro">
        IUC Syd granskar förslaget och godkänner vem som får inloggning till portalen.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mf-form-grid">
          <FormField label="Namn" name="name" value={suggestion.name} onChange={handleFieldChange} required />
          <FormField
            label="Yrkestitel eller roll"
            name="jobTitle"
            value={suggestion.jobTitle}
            onChange={handleFieldChange}
          />
          <FormField
            label="Telefon"
            name="phone"
            type="tel"
            value={suggestion.phone}
            onChange={handleFieldChange}
          />
          <FormField
            label="E-post"
            name="email"
            type="email"
            value={suggestion.email}
            onChange={handleFieldChange}
            required
          />
        </div>

        <button type="submit" className="mf-button" disabled={isSending}>
          {isSending ? "Skickar…" : "Skicka förslag"}
        </button>

        {feedback && (
          <p
            className={`mf-feedback mf-feedback-${feedback.tone}`}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.text}
          </p>
        )}
      </form>
    </section>
  );
}

function FormField({ label, name, type = "text", value, onChange, required = false }) {
  const inputId = `mf-field-${name}`;
  // autoComplete är av eftersom formuläret gäller en annan person än den inloggade.
  return (
    <div className="mf-field">
      <label className="mf-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="mf-input"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={200}
        autoComplete="off"
      />
    </div>
  );
}

const participationLabels = { deltar: "Deltar", anmald: "Anmäld" };

function ParticipationList({ participations }) {
  return (
    <section className="mf-card" aria-labelledby="mf-participation-title">
      <h2 id="mf-participation-title" className="mf-card-title">
        Deltar i och anmäld till
      </h2>
      <ul className="mf-list mf-list-plain">
        {participations.map((participation) => (
          <li key={participation.id} className="mf-row">
            <div className="mf-row-text">
              <p className="mf-row-name">{participation.title}</p>
              <p className="mf-row-detail">{participation.detail}</p>
            </div>
            <span className="mf-badge mf-badge-neutral">
              {participationLabels[participation.status]}
            </span>
          </li>
        ))}
      </ul>
      <span className="mf-badge mf-badge-waiting mf-badge-standalone">
        Årssummering kommer senare
      </span>
    </section>
  );
}

function MemberPreview({ company, visibleContactPersons }) {
  return (
    <div className="mf-preview">
      <CompanyCard company={company} showEditNotice={false} />
      <section className="mf-card" aria-labelledby="mf-preview-contacts-title">
        <h2 id="mf-preview-contacts-title" className="mf-card-title">
          Kontaktpersoner
        </h2>
        {visibleContactPersons.length === 0 ? (
          <p className="mf-empty">
            Inga kontaktpersoner visas för andra medlemmar ännu. Det krävs samtycke från både
            företaget och personen.
          </p>
        ) : (
          <ul className="mf-list">
            {visibleContactPersons.map((contactPerson) => (
              <li key={contactPerson.documentId} className="mf-row">
                <span className="mf-avatar" aria-hidden="true">
                  {getInitials(contactPerson.name)}
                </span>
                <div className="mf-row-text">
                  <p className="mf-row-name">{contactPerson.name}</p>
                  {contactPerson.jobTitle && (
                    <p className="mf-row-detail">{contactPerson.jobTitle}</p>
                  )}
                  {contactPerson.email && (
                    <a className="mf-row-link" href={`mailto:${contactPerson.email}`}>
                      {contactPerson.email}
                    </a>
                  )}
                </div>
                {contactPerson.isMainContact && (
                  <span className="mf-badge mf-badge-main">Huvudkontakt</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Samma regel som texten på sidan: IUC har godkänt personen och både företaget och personen har samtyckt.
function isVisibleToMembers(contactPerson) {
  return (
    contactPerson.approvalStatus === "approved" &&
    contactPerson.companyConsent &&
    contactPerson.personConsent
  );
}

function getContactPersonStatus(contactPerson) {
  if (contactPerson.approvalStatus === "pending") {
    return { label: "Väntar på godkännande", tone: "waiting" };
  }
  if (contactPerson.isMainContact) return { label: "Huvudkontakt", tone: "main" };
  if (isVisibleToMembers(contactPerson)) return { label: "Visas för medlemmar", tone: "visible" };
  if (contactPerson.companyConsent) {
    return { label: "Väntar på personens samtycke", tone: "waiting" };
  }
  return null;
}

function replaceContactPerson(contactPersons, updated) {
  return contactPersons.map((contactPerson) =>
    contactPerson.documentId === updated.documentId ? updated : contactPerson,
  );
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function toPhoneHref(phone) {
  return phone.replace(/[^\d+]/g, "");
}