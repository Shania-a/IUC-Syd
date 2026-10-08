import { useState } from "react"; // Hook för att spara data i komponenten

function Ny_anv() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [felmedelande, setFelmedelande] = useState("");

  // Körs när man klickar på "Registrera"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Hindrar sidan från att laddas om

    // Skickar datan till Strapi
    const res = await fetch("http://localhost:1337/api/auth/local/register", {
      method: "POST", // Vi skickar data (skapar något nytt)
      headers: { "Content-Type": "application/json" }, // Berättar att datan är JSON
      // Gör ett objekt av de tre värdena och omvandlar det till text (JSON)
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (data.error) {
      setFelmedelande(data.error?.message);
    } else {
      setFelmedelande("ett nytt konto är skapad");
      setEmail("");
      setPassword("");
      setUsername("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          placeholder="E-post"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          placeholder="Lösenord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button className="btn btn-primary">Registrera</button>
      <p>{felmedelande}</p>
    </form>
  );
}

export default Ny_anv;
