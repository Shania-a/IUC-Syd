import { useState } from "react";

function Hämta_anv() {
  const [users, setUsers] = useState([]); // Lista med användare, startar tom

  async function Get_user() {
    const res = await fetch("http://localhost:1337/api/users");

    const data = await res.json();
    if (data.error) {
      console.log(data.error.message); // Visar t.ex. "Forbidden"
      return; // Avbryter så users inte skrivs över med ett felobjekt
    }
    setUsers(data);
  }

  return (
    <>
      <h2>Alla användare i systemet</h2>
      <div>
        <button onClick={Get_user}>Hämta användare</button>
        {users.map((u) => (
          <p key={u.id}>
            {u.username} - {u.email}
          </p>
        ))}
      </div>
    </>
  );
}

export default Hämta_anv; // Inga parenteser
