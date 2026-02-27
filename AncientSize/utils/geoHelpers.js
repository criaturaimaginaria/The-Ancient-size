export function normalizeGeoJSON(data) {
  if (data.type === "FeatureCollection") {
    const multiCoords = [];
    data.features.forEach(f => {
      if (f.geometry.type === "Polygon") multiCoords.push(f.geometry.coordinates);
      else if (f.geometry.type === "MultiPolygon") multiCoords.push(...f.geometry.coordinates);
    });
    return {
      type: "Feature",
      properties: data.features[0].properties || {},
      geometry: { type: "MultiPolygon", coordinates: multiCoords }
    };
  }
  return data; 
}