export function filterMaps(indexData, { query, year, yearActive }) {
  let results = indexData || [];

  // Filtro por texto
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    results = results.filter(m =>
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.era && m.era.toLowerCase().includes(q)) ||
      (m.religion && m.religion.toLowerCase().includes(q)) ||
      (Array.isArray(m.keywords) && m.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }

  // Filtro por año
  if (yearActive && year !== null) {
    results = results.filter(m => {
      if (typeof m.yearStart !== 'number' || typeof m.yearEnd !== 'number') return false;
      return year >= m.yearStart && year <= m.yearEnd;
    });
  }

  return results;
}