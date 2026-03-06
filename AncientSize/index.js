import { calculateGeoJSONArea } from './utils/geoArea.js';
import { enableAutoRepeat } from './utils/uiHelpers.js';   
import { getTooltipContent } from './utils/formatters.js';
import { normalizeGeoJSON } from './utils/geoHelpers.js';
import { filterMaps } from './utils/filterEngine.js';
import { logFileLoaded, logTotalCount } from './utils/logger.js';
import { CanvasDrawer } from './utils/canvasDrawer.js';
import { initBaseMapControls } from './utils/baseMapControls.js';



// MOTOR TÁCTIL GLOBAL (mobile) ---

let activeTouchDrag = null;
let dragAnimationFrame = null;

const endTouchDrag = () => {
  if (activeTouchDrag) {
    activeTouchDrag = null;
    map.dragging.enable();

    // foecx manual reset
    if (map.dragging._draggable) {
      map.dragging._draggable._moving = false;
      map.dragging._draggable._lastEvent = null;
      if (typeof map.dragging._draggable._finishDrag === 'function') {
          map.dragging._draggable._finishDrag();
      }
    }

    const stopEvent = new Event('touchend', { bubbles: true });
    map._container.dispatchEvent(stopEvent);
    
    const stopEventMouse = new Event('mouseup', { bubbles: true });
    map._container.dispatchEvent(stopEventMouse);
  }

  if (dragAnimationFrame) {
    cancelAnimationFrame(dragAnimationFrame);
    dragAnimationFrame = null;
  }
};

window.addEventListener('pointermove', (e) => {
  if (!activeTouchDrag) return;

  e.preventDefault();

  const mapContainer = map._container;
  const rect = mapContainer.getBoundingClientRect();
  const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
  const latlng = map.containerPointToLatLng(point);

  const newLat = latlng.lat + activeTouchDrag.offsetLat;
  const newLng = latlng.lng + activeTouchDrag.offsetLng;

  if (!dragAnimationFrame) {
    dragAnimationFrame = requestAnimationFrame(() => {
      if (activeTouchDrag) {
        activeTouchDrag.layer.setCenter([newLat, newLng]);
      }
      dragAnimationFrame = null;
    });
  }
}, { passive: false, capture: true });

window.addEventListener('pointerup', (e) => {
  endTouchDrag();
}, { capture: true });

window.addEventListener('pointercancel', (e) => {
  endTouchDrag();
}, { capture: true });

// --- fnn ---


const map = L.map("map", {
  center: [42, 20],
  zoom: 2.13,
  zoomControl: false,
  zoomDelta: 0.25,
  zoomSnap: 0.25,
  tap: false 
});

initBaseMapControls(map);

L.control.zoom({ position: "bottomleft" }).addTo(map);



let indexData = [];
let activeLayers = [];
let currentLayerObj = null;
const rotationControl = document.getElementById("rotation-control");
const rotateSlider = document.getElementById("rotate-slider");
const layersList = document.getElementById("layers-list");


fetch('./index.json')
  .then(res => res.json())
  .then(async (index) => {
    let totalObjetos = 0;

    if (Array.isArray(index)) {
      indexData = index;
      mapIndex = index; 
      totalObjetos = index.length;
    } else if (index.parts) {
      const parts = await Promise.all(
        index.parts.map(async (ruta) => {
          try {
            const r = await fetch(ruta);
            const data = await r.json();
            const cantidad = data.length;
            totalObjetos += cantidad;
            logFileLoaded(ruta, data.length);
            return data;
          } catch (err) {
            console.error(`Error cargando el fichero ${ruta}:`, err);
            return [];
          }
        })
      );
      indexData = parts.flat();
      mapIndex = indexData; 
    }

    logTotalCount(totalObjetos);

    const initialMap = indexData.find(item => item.id === "rome2");
    if (initialMap) {
      loadMap(initialMap.file, initialMap.name, initialMap.fillColor);
    }
  })
  .catch(err => console.error('Error crítico en el sistema de índices:', err));

// search in the index
const searchInput = document.getElementById("map-search");
const resultsContainer = document.getElementById("search-results");
const tooltip = document.getElementById("map-tooltip");
let showAllActive = false;

searchInput.addEventListener("input", function () {
  showAllActive = false;
  const query = this.value.toLowerCase();
  resultsContainer.innerHTML = "";

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
    btn.addEventListener("click", () => loadMap(map.file, map.name, map.fillColor));
    resultsContainer.appendChild(btn);
  });
});

function loadMap(file, name, indexFillColor) {
  const existing = activeLayers.find(m => m.name === name);
  if (existing) {
    alert(`the map "${name}" is already loaded`);
    return;
  }

  fetch(file)
    .then(response => response.json())
    .then(data => {
      const geojsonData = normalizeGeoJSON(data);
      const detectedFillColor = indexFillColor || geojsonData?.properties?.fillColor || "#FF0000";
      const layerId = "ts-" + Date.now() + Math.floor(Math.random() * 1000);
      
      const layer = new L.trueSize(geojsonData, {
        color: detectedFillColor,
        fillColor: detectedFillColor,
        weight: 1.3,
        opacity: 1.5,
        className: layerId 
      });

      const mapLayerRecord = {
        name: name,
        layer: layer,
        layerId: layerId,
        visible: true,
        rotation: 0,
        geometry: geojsonData.geometry
      };

const observer = new MutationObserver(() => {
  const elements = document.getElementsByClassName(mapLayerRecord.layerId);
  for (let el of elements) {
    
    el.onmouseenter = () => showLayerInfoMinimal(name);
    el.onmouseleave = () => hideLayerInfo();

    // // follow the mouse
    // el.onmousemove = (e) => {
    //   tooltipBoxMinimal.style.left = (e.clientX + 15) + "px";
    //   tooltipBoxMinimal.style.top = (e.clientY + 15) + "px";
    // };
    // ----------------------------------------------------

    el.onpointerdown = (e) => {
      if (!e.isPrimary) return;
      L.DomEvent.stop(e); 
      
      currentLayerObj = mapLayerRecord;
      rotationControl.style.display = "block";
      
      const rect = map._container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const startLatLng = map.containerPointToLatLng(point);
      
      const center = L.latLng(mapLayerRecord.layer._currentLayer.getCenter());

      activeTouchDrag = {
        layer: mapLayerRecord.layer,
        offsetLat: center.lat - startLatLng.lat,
        offsetLng: center.lng - startLatLng.lng
      };
    };
  }
});

      observer.observe(document.getElementById('map'), {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['d', 'class']
      });

      layer.on('mousedown touchstart', (e) => {
        L.DomEvent.stopPropagation(e);
        
        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;

        currentLayerObj = mapLayerRecord;
        rotationControl.style.display = "block";
        rotateSlider.value = mapLayerRecord.rotation;

        map.dragging.disable();

        const ev = e.originalEvent;
        const touch = ev.touches ? ev.touches[0] : ev;
        
        const rect = map._container.getBoundingClientRect();
        const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
        const startLatLng = map.containerPointToLatLng(point);

        const center = mapLayerRecord.layer._currentLayer.getCenter();
        
        activeTouchDrag = {
          layer: mapLayerRecord.layer,
          offsetLat: center.lat - startLatLng.lat,
          offsetLng: center.lng - startLatLng.lng
        };
      });

      layer.addTo(map);
      activeLayers.push(mapLayerRecord);

      currentLayerObj = mapLayerRecord;
      rotationControl.style.display = "block";
      rotateSlider.value = 0;

      renderLayersList();
    })
    .catch(error => console.error('Error cargando mapa:', error));
}


function renderLayersList() {
  layersList.innerHTML = ""; 

  activeLayers.forEach((mapLayer, index) => {
    const container = document.createElement("div");
    container.classList.add("layer-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = mapLayer.visible;
    checkbox.addEventListener("change", () => toggleLayerVisibility(index));

    const label = document.createElement("label");
    label.textContent = mapLayer.name;
    label.style.cursor = "pointer"; 

    label.addEventListener("click", () => {
    if (mapLayer.layer._geoJSONLayer && typeof mapLayer.layer._geoJSONLayer.getBounds === 'function') {
        const bounds = mapLayer.layer._geoJSONLayer.getBounds();
        map.fitBounds(bounds);
    } else if (mapLayer.layer.getBounds) {
        map.fitBounds(mapLayer.layer.getBounds());
    }
    });

    container.addEventListener("mouseover", () => showLayerInfo(mapLayer.name));
    container.addEventListener("mouseout", hideLayerInfo);

    const deleteButton = document.createElement("button");
    // deleteButton.textContent = "🗑️";
    deleteButton.classList.add("delete-layer-btn");
    deleteButton.title = "Eliminar capa";

    const icon = document.createElement("img");
    icon.src = "./assets/rubbish-bin-svgrepo-com.svg";
    icon.alt = "Delete";
    icon.classList.add("delete-layer-icon");

    deleteButton.appendChild(icon);


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
  activeLayers.splice(index, 1);
  renderLayersList();
  hideLayerInfo();
}

document.getElementById('toggle-controls').addEventListener('click', function() {
  document.getElementById('layer-controls').classList.toggle('open');
  document.getElementById('chevron-img').classList.toggle('open');
});

// ---------------------------------
// references

const searchResults = document.getElementById('search-results');
const showAllBtn = document.getElementById('show-all');

let mapIndex = [];

function renderResults(results) {
  const textEmpty = (searchInput.value || '').trim() === '';

  if (textEmpty && !showAllActive && !yearFilterActive) {
    searchResults.innerHTML = '';
    return;
  }

  searchResults.innerHTML = '';
  if (!results || results.length === 0) return;

  results.forEach(map => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.textContent = map.name;
    div.onclick = () => loadMap(map.file, map.name, map.fillColor);
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
const filtered2 = mapIndex.filter(m =>
  Array.isArray(m.keywords) &&
  m.keywords.some(k => k.toLowerCase().includes(query))
);
  renderResults(filtered || filtered2);
});

showAllBtn.addEventListener('click', () => {
  showAllActive = true;
  searchInput.value = '';
  renderResults(mapIndex);
});

// ----------------tool tip-----------------

const tooltipBox = document.getElementById("layer-info-tooltip");
const tooltipBoxMinimal = document.getElementById("layer-info-tooltipMinimal");

function showLayerInfo(layerName) {
  const info = indexData.find(item => item.name === layerName);
  const layerObj = activeLayers.find(m => m.name === layerName);

  let areaText = "";
  if (layerObj && layerObj.geometry) {
    const area = calculateGeoJSONArea(layerObj.geometry);
    const areaKm2 = area / 1e6;
    areaText = `<p><strong>Area:</strong> ≈ ${areaKm2.toLocaleString(undefined, {maximumFractionDigits: 2})} km²</p> <br>`;
  }

  tooltipBox.innerHTML = getTooltipContent(info, areaText);
  tooltipBox.style.display = "block";
}

function hideLayerInfo() {
  tooltipBox.style.display = "none";
    tooltipBoxMinimal.style.display = "none";
}

// reload of the flags each time fixed
const nameEl = document.createElement("b");
const br = document.createElement("br");

const flagContainer = document.createElement("div");
flagContainer.className = "flagContainerMinimal";

const flagImg = document.createElement("img");

flagContainer.appendChild(flagImg);
tooltipBoxMinimal.appendChild(nameEl);
tooltipBoxMinimal.appendChild(br);
tooltipBoxMinimal.appendChild(flagContainer);

function showLayerInfoMinimal(layerName) {
  const info = indexData.find(item => item.name === layerName);

  if (!info) {
    tooltipBoxMinimal.style.display = "none";
    return;
  }

  nameEl.textContent = info.name || "";

  if (info.flag) {
    flagImg.src = info.flag;
    flagContainer.style.display = "block";
  } else {
    flagContainer.style.display = "none";
    flagImg.src = "";
  }

  tooltipBoxMinimal.style.display = "block";
}
// -----------------------end geojson hover------------------------------

// YEAR FILTER-------------------------------

const showDateFilterBtn = document.getElementById('show-dateFilter');
const yearFilterBox = document.getElementById('year-filter');
const yearInput = document.getElementById('year-input');
const yearEra = document.getElementById('year-era');
const yMinus1 = document.getElementById('year-minus-1');
const yPlus1 = document.getElementById('year-plus-1');

let yearFilterActive = false;

function getSelectedYear() {
  const raw = parseInt(yearInput.value);
  if (isNaN(raw)) return null;
  return yearEra.value === 'BC' ? -Math.abs(raw) : Math.abs(raw);
}

function applyCombinedFilters() {
  const query = searchInput.value;
  const year = getSelectedYear();
  
  const results = filterMaps(mapIndex, { 
    query, 
    year, 
    yearActive: yearFilterActive 
  });

  renderResults(results);
}

showDateFilterBtn.addEventListener('click', () => {
  const visible = yearFilterBox.style.display === 'block';
  if (visible) {
    yearFilterBox.style.display = 'none';
    yearFilterActive = false;
    showDateFilterBtn.classList.remove('active-year-btn');
  } else {
    yearFilterBox.style.display = 'block';
    yearFilterActive = true;
    showDateFilterBtn.classList.add('active-year-btn');
  }
  applyCombinedFilters();
});

searchInput.addEventListener('input', applyCombinedFilters);
showAllBtn.addEventListener('click', () => {
  searchInput.value = '';
  yearInput.value = '';
  yearEra.value = 'AD';
  applyCombinedFilters();
});

function updateYear(delta) {
  let cur = parseInt(yearInput.value);
  if (isNaN(cur)) cur = 0;
  cur = Math.max(0, cur + delta); 
  yearInput.value = cur;
  applyCombinedFilters();
}

enableAutoRepeat(yPlus1, () => updateYear(1));
enableAutoRepeat(yMinus1, () => updateYear(-1));

yearInput.addEventListener('input', applyCombinedFilters);
yearEra.addEventListener('change', applyCombinedFilters);

yearFilterBox.style.display = 'none';
showDateFilterBtn.classList.remove('active-year-btn');

// ---------------- ROTATION CONTROL ----------------

const rotationValue = document.getElementById("rotation-value");
const resetBtn = document.getElementById("reset-rotation");

function applyRotation(record, angle) {
  record.rotation = angle;
  const elements = document.getElementsByClassName(record.layerId);
  for (let el of elements) {
    el.style.transformOrigin = 'center';
    el.style.transformBox = 'fill-box'; 
    el.style.transform = `rotate(${angle}deg)`;
  }
  rotationValue.textContent = angle;
}

rotateSlider.addEventListener('input', function() {
  if (!currentLayerObj) return;
  const angle = parseInt(this.value);
  applyRotation(currentLayerObj, angle);
});

resetBtn.addEventListener('click', () => {
  if (!currentLayerObj) return;
  rotateSlider.value = 0;
  applyRotation(currentLayerObj, 0);
});
// END YEAR FILTER---------------------------

// DRAW AND CURSOR--------------------------------

const drawer = new CanvasDrawer('paintCanvas');
const brushCursor = document.getElementById('brush-cursor');
const canvasElement = document.getElementById('paintCanvas');
const controls = document.getElementById('pencil-controls');

const updateCursor = (e) => {
    if (canvasElement.classList.contains('active')) {
        brushCursor.style.display = 'block';
        brushCursor.style.left = `${e.clientX}px`;
        brushCursor.style.top = `${e.clientY}px`;
        brushCursor.style.width = `${drawer.lineWidth}px`;
        brushCursor.style.height = `${drawer.lineWidth}px`;
    } else {
        brushCursor.style.display = 'none';
    }
};

window.addEventListener('mousemove', updateCursor);

document.getElementById('btn-toggle-paint').addEventListener('click', () => {
    const isActive = canvasElement.classList.toggle('active');
    controls.classList.toggle('hidden');
    
    if (isActive) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
    } else {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
    }
});

document.getElementById('btn-pencil-mode').addEventListener('click', () => drawer.setMode('pencil'));
document.getElementById('btn-eraser-mode').addEventListener('click', () => drawer.setMode('eraser'));
document.getElementById('btn-clear-canvas').addEventListener('click', () => drawer.clear());
document.getElementById('btn-close-paint').onclick = () => document.getElementById('btn-toggle-paint').click();

document.getElementById('pencil-color').oninput = (e) => drawer.setColor(e.target.value);
document.getElementById('pencil-width').oninput = (e) => drawer.setLineWidth(e.target.value);


// puto el que lee
// whoever reads this is gay
// chi legge è gay