import { calculateGeoJSONArea } from './utils/geoArea.js';



const map = L.map("map", {
  center: [42, 20],
  zoom: 2.13,
  zoomControl: false,
  zoomDelta: 0.25,
  zoomSnap: 0.25,
});


L.control.zoom({ position: "bottomleft" }).addTo(map);

new L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: `attribution: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>`,
    detectRetina: true,
  }
).addTo(map);



let indexData = [];
let activeLayers = [];
// Referencia al contenedor HTML
const layersList = document.getElementById("layers-list");

// load the map index
fetch('./index.json')
  .then(response => response.json())
  .then(data => {
    indexData = data;
    // console.log("Índice cargado:", indexData);
  })
  .catch(error => console.error('Error cargando el índice:', error));

// search in the index
const searchInput = document.getElementById("map-search");
const resultsContainer = document.getElementById("search-results");
const tooltip = document.getElementById("map-tooltip");

searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  resultsContainer.innerHTML = "";

//   if (query.length < 2) return; // evitar demasiados resultados con 1 letra

  const filtered = indexData.filter(map =>
    map.name.toLowerCase().includes(query) ||
    map.era.toLowerCase().includes(query) ||
    map.religion.toLowerCase().includes(query) ||
    map.keywords.some(k => k.toLowerCase().includes(query))
  );

  filtered.forEach(map => {
    const btn = document.createElement("button");
    btn.textContent = `${map.name}`;
    btn.classList.add("result-item");
    btn.addEventListener("click", () => loadMap(map.file, map.name));
    resultsContainer.appendChild(btn);
  });
});


// loadMap("maps/europe/romeTrajan.json", "Rome (Empire) 98-117 AD ");
// waits for the map to load and then load the initial map 
fetch('./index.json')
  .then(response => response.json())
  .then(data => {
    indexData = data;

    // Buscar el mapa inicial por ID
    const initialMap = indexData.find(item => item.id === "rome2");

    if (initialMap) {
      loadMap(initialMap.file, initialMap.name);
    } else {
      console.error('No se encontró el mapa en index.json');
    }
  })
  .catch(error => console.error('Error cargando el índice:', error));

// Función para cargar un mapa y actualizar el panel de capas

function loadMap(file, name) {
  const existing = activeLayers.find(m => m.name === name);
  if (existing) {
    alert(`the map "${name}" is already loaded`);
    return;
  }

  fetch(file)
    .then(response => response.json())
    .then(data => {
      const layer = new L.trueSize(data, {
        color: data.properties.fillColor || "black",
        fillColor: data.properties.fillColor || "#FF0000",
        weight: 1.3,
        opacity: 1.5,
      }).addTo(map);

      activeLayers.push({ 
        name, 
        layer, 
        visible: true,
        geometry: data.geometry   
      });

      renderLayersList();
    })
    .catch(error => console.error('Error cargando mapa:', error));
}


function renderLayersList() {
  layersList.innerHTML = ""; // clean content 

  activeLayers.forEach((mapLayer, index) => {
    const container = document.createElement("div");
    container.classList.add("layer-item");

    // Checkbox para visibilidad
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = mapLayer.visible;
    checkbox.addEventListener("change", () => toggleLayerVisibility(index));

    // layer name
    const label = document.createElement("label");
    label.textContent = mapLayer.name;

    container.addEventListener("mouseover", () => showLayerInfo(mapLayer.name));
    container.addEventListener("mouseout", hideLayerInfo);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️";
    deleteButton.classList.add("delete-layer-btn");
    deleteButton.title = "Eliminar capa";
    deleteButton.addEventListener("click", () => removeLayer(index));

    container.appendChild(checkbox);
    container.appendChild(label);
    container.appendChild(deleteButton);
    layersList.appendChild(container);
  });
}

function toggleLayerVisibility(index) {
  const mapLayer = activeLayers[index];
  if (mapLayer.visible) {
    map.removeLayer(mapLayer.layer);
    mapLayer.visible = false;
  } else {
    mapLayer.layer.addTo(map);
    mapLayer.visible = true;
  }
}


function removeLayer(index) {
  const mapLayer = activeLayers[index];
  if (mapLayer.visible) {
    map.removeLayer(mapLayer.layer);
  }
  // delete array
  activeLayers.splice(index, 1);

  renderLayersList();
  hideLayerInfo()
}



// show or hide layer controls
document.getElementById('toggle-controls').addEventListener('click', function() {
  document.getElementById('layer-controls').classList.toggle('open');
  document.getElementById('chevron-img').classList.toggle('open');
});




// ---------------------------------
// references

const searchResults = document.getElementById('search-results');
const showAllBtn = document.getElementById('show-all');

let mapIndex = [];
fetch('./index.json')
  .then(res => res.json())
  .then(data => mapIndex = data);

function renderResults(results) {
  searchResults.innerHTML = '';
  if (results.length === 0) return;
  results.forEach(map => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.textContent = map.name;
    div.onclick = () => loadMap(map.file, map.name);
    searchResults.appendChild(div);
  });
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  if (query.trim() === '') {
    searchResults.innerHTML = '';
    return;
  }
  const filtered = mapIndex.filter(m => m.name.toLowerCase().includes(query));
  const filtered2 = mapIndex.filter(m => m.keywords.toLowerCase().includes(query));
  renderResults(filtered || filtered2);
});

showAllBtn.addEventListener('click', () => {
  // borra texto del buscador
  searchInput.value = '';
  renderResults(mapIndex);
});


// ----------------tool tip-----------------


const tooltipBox = document.getElementById("layer-info-tooltip");

function showLayerInfo(layerName) {
  const info = indexData.find(item => item.name === layerName);
  const layerObj = activeLayers.find(m => m.name === layerName);

  let areaText = "";
  if (layerObj && layerObj.geometry) {
    const area = calculateGeoJSONArea(layerObj.geometry);
    const areaKm2 = area / 1e6;
    areaText = `<p><text>Area ≈</text> ${areaKm2.toFixed(2)} km²</p><br>`;
  }

  if (!info) {
    tooltipBox.innerHTML = "<i>No data found</i>";
  } else {
    tooltipBox.innerHTML = `
      <b>${info.name}</b><br>
      ${info.flag ? `<div class="flagContainer"><img src="${info.flag}"></div>` : ""}
      <p><text>Era:</text> ${info.era}</p><br>
      ${info.religion ? `<p><text>religion:</text> ${info.religion}</p><br>` : ""}
      ${areaText}
      <p><text>Description:</text> ${info.description || ""}</p>
    `;
  }

  tooltipBox.style.display = "block";
}




function hideLayerInfo() {
  tooltipBox.style.display = "none";
}


