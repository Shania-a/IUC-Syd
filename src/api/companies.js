const API_URL = `${import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'}/api`;

// Hämta företag med valfria filter
export async function getCompanies({ query = '', municipality = '', industry = '' } = {}) {
  const params = new URLSearchParams();
  
  // Hämta med logotyp
  params.append('populate', 'logo');

  if (query) {
    params.append('filters[name][$containsi]', query);
  }
  if (municipality) {
    params.append('filters[municipality][$eq]', municipality);
  }
  if (industry) {
    params.append('filters[industry][$eq]', industry);
  }

  const res = await fetch(`${API_URL}/companies?${params.toString()}`);
  if (!res.ok) throw new Error('Kunde inte hämta företag');
  return res.json();
}

// Hämta ett enskilt företag via slug tillsammans med medarbetare och logo

export async function getCompanyBySlug(slug) {
  const params = new URLSearchParams();

  params.append('filters[slug][$eq]', slug);
  params.append('populate', 'logo');

  const url = `${API_URL}/companies?${params.toString()}`;

  console.log('Hämtar företag från:', url);

  const res = await fetch(url);
  const result = await res.json();

  console.log('Svar från Strapi:', result);

  if (!res.ok) {
    throw new Error(
      result.error?.message || 'Kunde inte hämta företaget'
    );
  }

  return result.data?.[0] || null;
}
