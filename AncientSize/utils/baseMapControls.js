export function initBaseMapControls(map) {

  const baseMaps = {

    default: L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap",
        detectRetina: true
      }
    ),

    dark: L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap & CARTO",
        detectRetina: true
      }
    ),

    satellite: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        detectRetina: true
      }
    )

  };

  let currentBaseLayer = baseMaps.default;
  currentBaseLayer.addTo(map);

  function changeBaseMap(type) {

    if (currentBaseLayer) {
      map.removeLayer(currentBaseLayer);
    }

    currentBaseLayer = baseMaps[type];
    currentBaseLayer.addTo(map);
  }

  const baseMapControls = document.createElement("div");
  baseMapControls.id = "basemap-controls";

  baseMapControls.innerHTML = `
    <button data-map="default">Base</button>
    <button data-map="dark">Dark</button>
    <button data-map="satellite">Satellite</button>
  `;

  document.body.appendChild(baseMapControls);

  baseMapControls.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      changeBaseMap(btn.dataset.map);
    });
  });

}