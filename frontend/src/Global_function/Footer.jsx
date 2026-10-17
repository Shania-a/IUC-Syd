import React from "react";

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="footer-container">
        {/* Kolumn 1: Logotyper & Adress / Kontakt */}
        <div className="footer-col logo-col">
          <div className="logo-section">
            {/* Huvudlogotyp */}
            <div className="main-logo">
              <span className="logo-circle">IUC</span>
              <span className="logo-text">SYD</span>
            </div>
            {/* Undermärke */}
            <div className="sub-logo">
              <span className="sub-logo-circle">IUC</span>
              <div className="sub-logo-text">
                <small>EN DEL AV NÄTVERKET</small>
                <strong>IUC SVERIGE</strong>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h4>Adress</h4>
            <p>
              Kosterögatan 15
              <br />
              211 24, Malmö
            </p>
          </div>

          <div className="info-block">
            <h4>Kontakt</h4>
            <p>
              <a href="tel:0733448080">0733-44 80 80</a>
              <br />
              <a href="mailto:info@iucsyd.se">info@iucsyd.se</a>
            </p>
          </div>

          <div className="info-block">
            <h4>Organisationsnummer</h4>
            <p>556101-2153</p>
          </div>
        </div>

        {/* Kolumn 2: Stöd för företag */}
        <div className="footer-col">
          <h3>Stöd för företag</h3>
          <ul>
            <li>
              <a href="#våra-insatser">Våra insatser</a>
            </li>
            <li>
              <a href="#vårt-utvecklingscentrum">Vårt utvecklingscentrum</a>
            </li>
            <li>
              <a href="#arbetsmarknadskunskap">Arbetsmarknadskunskap</a>
            </li>
            <li>
              <a href="#fokus-tillväxt">Fokus Tillväxt</a>
            </li>
            <li>
              <a href="#automation">Automation &amp; uppkopplad produktion</a>
            </li>
            <li>
              <a href="#kompetensutveckling">Kompetensutveckling</a>
            </li>
            <li>
              <a href="#kickstart-ai">Kickstart AI företag</a>
            </li>
            <li>
              <a href="#produktionslyftet">Produktionslyftet</a>
            </li>
            <li>
              <a href="#diploma">Diploma onlineutbildningar</a>
            </li>
            <li>
              <a href="#teknikcollege">Teknikcollege Skåne</a>
            </li>
            <li>
              <a href="#stod-att-soka">Stöd att söka</a>
            </li>
            <li>
              <a href="#spok">SPOK SWE + DK</a>
            </li>
          </ul>
        </div>

        {/* Kolumn 3: Event, aktuellt & inspiration */}
        <div className="footer-col">
          <h3>Event, aktuellt &amp; inspiration</h3>
          <ul>
            <li>
              <a href="#de-ville-utvecklas">
                De ville utvecklas – så hjälpte vi till
              </a>
            </li>
            <li>
              <a href="#kommande-event">Kommande event</a>
            </li>
            <li>
              <a href="#vara-medlemmar">Våra medlemmar &amp; partner</a>
            </li>
            <li>
              <a href="#nyheter">Nyheter</a>
            </li>
          </ul>
        </div>

        {/* Kolumn 4: Om oss */}
        <div className="footer-col">
          <h3>Om oss</h3>
          <ul>
            <li>
              <a href="#las-mer">Läs mer om IUC Syd</a>
            </li>
            <li>
              <a href="#kontakta-oss">Kontakta oss</a>
            </li>
            <li>
              <a href="#var-styrelse">Vår styrelse</a>
            </li>
            <li>
              <a href="#en-del-av-iuc">En del av IUC-nätverket</a>
            </li>
            <li>
              <a href="#hallbarhetsarbete">Vårt hållbarhetsarbete</a>
            </li>
            <li>
              <a href="#upphandlar-vi">Just nu upphandlar vi</a>
            </li>
          </ul>
        </div>

        {/* Kolumn 5: Nyhetsbrev & Medlemskap */}
        <div className="footer-col newsletter-col">
          <h3>Nyhetsbrev</h3>
          <p className="newsletter-text">
            Håll dig uppdaterad – anmäl dig till vårt nyhetsbrev.
          </p>

          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="email" placeholder="Ange din e-postadress" required />
            <button type="submit" aria-label="Skicka">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>

          <div className="member-section">
            <h3>Gör som 140 andra skånska företag</h3>
            <p>
              Som medlem i IUC Syd får ditt industriföretag stöd för långsiktig
              strategisk utveckling
            </p>
            <a href="#bli-medlem" className="member-link">
              Bli medlem hos IUC Syd
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Nedersta raden med copyright & LinkedIn */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <div className="legal">
            <span>© 2026 IUC Syd</span>
            <a href="#integritetspolicy">Integritetspolicy</a>
          </div>
          <div className="social">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
