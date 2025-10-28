
function calculateGeoJSONArea(geometry) {
  // radio tierra en metros
  const R = 6371000; 

  function toRad(deg) { return deg * Math.PI / 180; }

  function ringArea(coords) {
    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const [lon1, lat1] = coords[i];
      const [lon2, lat2] = coords[(i + 1) % coords.length];
      area += (toRad(lon2) - toRad(lon1)) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
    }
    return Math.abs(area * R * R / 2);
  }

  let total = 0;

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(ring => { total += ringArea(ring); });
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach(polygon => {
      polygon.forEach(ring => { total += ringArea(ring); });
    });
  }
  return total;
}
// --------------------------------------