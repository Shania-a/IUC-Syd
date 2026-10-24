# IUC Syd – anpassad Lovable-portal (utvecklingsprototyp)

Detta är en **separat kopia**, byggd på gruppens befintliga React/Vite-projekt med Lovables vyer och designsystem. Originalfilerna finns under `original_frontend_src/` för jämförelse.

## Starta

```bash
npm install
npm run dev
```

Strapi ska köras separat på `http://localhost:1337`. Anpassa `.env` efter `.env.example` om Strapi körs på annan adress. Strapi Public `find` för Company krävs för anonym kataloghämtning i denna demo; publicera inte privata uppgifter. React Router används för navigation, och Tailwind CSS för Lovables design. Bootstrap finns kvar som beroende från ursprungsprojektet men importeras inte i nya vyerna.

## Integrationsstatus

- **Riktig läsning:** `GET /api/companies` genom den befintliga `src/api/companies.js`. Hämtade företag visas i katalogen och på profilsidorna. Vid otillgänglig Strapi används demonstrationsföretag.
- **Mockdata:** startsida, community, behov, kontakter, evenemang, privata meddelanden, redaktörs- och adminfunktioner. Lokal demo-state i `src/lib/store.tsx`.
- **Ej riktig autentisering:** demo-inloggningen kontrollerar INTE lösenord. Rollväxling och frontend-roller är ENDAST för demonstration. Använd inte denna version med riktiga personuppgifter eller i produktion.
- **Ej riktig dataskrivning:** lokala ändringar skickas inte till Strapi. `isStrapiConfigured=false` förhindrar att otestade Lovable-endpoints försöker skriva till backend.
- **Mitt företag:** använder ett demokonto knutet till ett demoföretag tills verklig autentisering och Company/User-koppling implementerats. Det är alltså INTE säkert kopplat till inloggad användares riktiga företag.
- **Ej färdiga behörigheter/GDPR:** måste genomföras och testas på serversidan innan driftsättning.

## Vad som återstår

1. Koppla Strapi users-permissions till verklig inloggning och godkännande.
2. Inför backend-behörigheter för medlemsdata, privata behov, meddelanden och administration.
3. Skapa/verifiera Content Types för övriga resurser och bygg typade API-adaptrar.
4. Ta bort demo-inloggning, lokal persistent data och demonstrationsinnehåll innan produktion.
5. Kör funktionella tester, bygg- och säkerhetskontroller och granska kursens AI-regler.

**Källkod:** `src/routes/` = Lovable-vyer med React Router-brygga; `src/components/portal/` = Lovable-komponenter; `src/api/companies.js` = er bevarade Strapi-klient; `original_frontend_src/` = kopia av tidigare frontend.
