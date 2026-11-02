useEffect(() => {
  // Funktion som först kollar admin och sedan hämtar användarna
  const fetchUsers = async () => {
    // try/catch fångar fel så att sidan inte kraschar
    try {
      // Frågar Strapi "vem är jag?" och ber om rollen med (populate=role)
      const me = await fetch(`${API_URL}/api/users/me?populate=role`, {
        // credentials: "include" skickar med inloggningscookien
        credentials: "include",
      });

      // Om Strapi inte svarar OK (t.ex. 401/403) är man inte inloggad
      if (!me.ok) {
        // Skicka till inloggningssidan, utan att spara den här sidan i historiken
        navigate("/", { replace: true });
        // Avbryt funktionen, resten ska inte köras
        return;
      }

      // Gör om svaret från JSON till ett JavaScript-objekt
      const meData = await me.json();

      // Plockar ut rollnamnet i gemener, så "Admin" och "admin" blir samma
      const roleName =
        meData?.role?.name?.toLowerCase() || meData?.role?.toLowerCase();

      // Om rollen varken är "admin" eller "administratör" får man inte vara här
      if (roleName !== "admin") {
        // Skriver en varning i konsolen med vilken roll användaren hade
        console.warn("Åtkomst nekad. Rollen är inte admin:", roleName);
        // Skicka till inloggningssidan
        navigate("/", { replace: true });
        // Avbryt funktionen
        return;
      }

      // Det är en admin, så sluta visa "Laddar..." och visa sidan
      setChecking(false);

      // Hämtar alla användare, nyast registrerade först (sort=createdAt:desc)
      const response = await fetch(
        `${API_URL}/api/users?sort=createdAt:desc`,
        // Skickar med cookien igen
        { credentials: "include" },
      );

      // 401 = inte inloggad, 403 = saknar rättighet i Strapi
      if (response.status === 401 || response.status === 403) {
        // Kastar ett fel som fångas av catch längre ner
        throw new Error(
          "Du har inte behörighet att se användare. Logga in som administratör.",
        );
      }
      // Alla andra fel (t.ex. 500) ger ett allmänt felmeddelande
      if (!response.ok) throw new Error("Kunde inte hämta användare");

      // Sparar användarlistan i state, då ritas tabellen om
      setUsers(await response.json());
    } catch (err) {
      // Sparar felmeddelandet så att det visas på sidan
      setError(err.message);
    } finally {
      // Körs alltid: sluta visa "Laddar användare..."
      setLoading(false);
    }
  };

  // Kör funktionen direkt när sidan öppnas
  fetchUsers();
  // Lista över saker som får effekten att köras om (här bara navigate)
}, [navigate]);
