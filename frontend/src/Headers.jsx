import { useState } from "react";
import "./App.css";

function Headers() {
  const [count, setCount] = useState(0);

  return (
    <>
      <header>
        <ul className="nav justify-content-end">
          <li className="nav-item">
            <a
              className="nav-link active"
              aria-current="page"
              href="https://iucsyd.se/kontakta-oss/"
            >
              <img
                className="me-2"
                width="16"
                height="16"
                src="https://iucsyd.se/wp-content/uploads/2025/07/phone-icon.svg"
                alt=""
                decoding="async"
              ></img>
              Kontakt
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="https://iucsyd.se/event/">
              <img
                className="me-2"
                width="24"
                height="24"
                src="https://iucsyd.se/wp-content/uploads/2025/11/calendar-heart-black.svg"
                alt=""
                decoding="async"
              ></img>
              Event
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="https://iucsyd.se/kundcase/">
              <img
                className="me-2"
                width="24"
                height="24"
                src="https://iucsyd.se/wp-content/uploads/2025/12/message-square-quote-black.svg"
                alt=""
                decoding="async"
              ></img>
              Kundcase
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link" href="https://iucsyd.se/checkar/">
              <img
                className="me-2"
                width="24"
                height="24"
                src="https://iucsyd.se/wp-content/uploads/2025/12/credit-card-black.svg"
                alt=""
                decoding="async"
              ></img>
              Checkar
            </a>
          </li>
        </ul>
      </header>
    </>
  );
}

export default Headers;
