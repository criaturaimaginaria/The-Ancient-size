// import { calculateGeoJSONArea } from './utils/geoArea.js';
import { enableAutoRepeat } from './utils/uiHelpers.js';   
import { normalizeGeoJSON } from './utils/geoHelpers.js';
import { filterMaps } from './utils/filterEngine.js';
import { logFileLoaded, logTotalCount } from './utils/logger.js';
import { CanvasDrawer } from './utils/canvasDrawer.js';
import { initBaseMapControls } from './utils/baseMapControls.js';
import { PopupManager } from "./utils/popupManager.js";
import { initMobileTouchEngine, dragState } from './utils/mobileTouchEngine.js';
import { rotateBaseGeometry } from './utils/rotationMath.js';
import { showLayerInfo, hideLayerInfo, showLayerInfoMinimal } from './utils/tooltipController.js';
import { initPaintUI } from './utils/paintUI.js';
import { registerLoadAllMaps } from './utils/devLoader.js';

const map = L.map("map", {
  center: [42, 20],
  zoom: 2.13,
  zoomControl: false,
  zoomDelta: 0.50,
  zoomSnap: 0,
  zoomAnimation: true,
  wheelPxPerZoomLevel: 90,
  tap: false 
});

initBaseMapControls(map);
L.control.zoom({ position: "bottomleft" }).addTo(map);

initMobileTouchEngine(map);

let indexData = [];
let mapIndex = [];
let activeLayers = [];
let currentLayerObj = null;

const rotationControl = document.getElementById("rotation-control");
const rotateSlider = document.getElementById("rotate-slider");
const layersList = document.getElementById("layers-list");
const searchInput = document.getElementById("map-search");
const searchResults = document.getElementById('search-results');
const showAllBtn = document.getElementById('show-all');

fetch('./index.json')
  .then(res => res.json())
  .then(async (index) => {
    let totalObjetos = 0;

    const currentYear = new Date().getFullYear();

    const parseYearEnd = (item) => {
      if (item.yearEnd === null) {
        item.yearEnd = currentYear;
      }
      return item;
    };

    if (Array.isArray(index)) {
      // indexData = index;
      // mapIndex = index; 
      // totalObjetos = index.length;
      indexData = index.map(parseYearEnd);
      mapIndex = indexData; 
      totalObjetos = indexData.length;
    } else if (index.parts) {
      const parts = await Promise.all(
        index.parts.map(async (ruta) => {
          try {
            const r = await fetch(ruta);
            const data = await r.json();
            const processedData = data.map(parseYearEnd);
            totalObjetos += data.length;
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

    registerLoadAllMaps(loadMap, mapIndex);

    const initialMap = indexData.find(item => item.id === "rome2");
    if (initialMap) {
      loadMap(initialMap.file, initialMap.name, initialMap.fillColor);
    }
  })
  .catch(err => console.error('Error crítico en el sistema de índices:', err));

function loadMap(file, name, indexFillColor) {
  const existing = activeLayers.find(m => m.name === name);
  if (existing) {
    PopupManager.show(`The map "${name}" is already loaded`);
    return;
  }

  fetch(file)
    .then(response => response.json())
    .then(data => {
      const geojsonData = normalizeGeoJSON(data);
      const detectedFillColor = indexFillColor || geojsonData?.properties?.fillColor || "#FF0000";
      const layerId = "ts-" + Date.now() + Math.floor(Math.random() * 1000);
      
      const layer = new L.trueSize(geojsonData, {
        color: detectedFillColor, fillColor: detectedFillColor,
        weight: 1.3, opacity: 1.5, className: layerId 
      });

      const mapLayerRecord = {
        name: name, layer: layer, layerId: layerId, visible: true,
        rotation: 0, geometry: geojsonData.geometry
      };

      const observer = new MutationObserver(() => {
        const elements = document.getElementsByClassName(mapLayerRecord.layerId);
        for (let el of elements) {
          el.onmouseenter = () => showLayerInfoMinimal(name, indexData);
          el.onmouseleave = () => hideLayerInfo();

          el.onpointerdown = (e) => {
            if (!e.isPrimary) return;
            L.DomEvent.stop(e); 
            
            currentLayerObj = mapLayerRecord;
            rotationControl.style.display = "block";
            rotateSlider.value = mapLayerRecord.rotation;
            
            const rotationValue = document.getElementById("rotation-value");
            if (rotationValue) rotationValue.textContent = mapLayerRecord.rotation;
            
            const rect = map._container.getBoundingClientRect();
            const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
            const startLatLng = map.containerPointToLatLng(point);
            const center = L.latLng(mapLayerRecord.layer._currentLayer.getCenter());

            dragState.activeTouchDrag = {
              layer: mapLayerRecord.layer,
              offsetLat: center.lat - startLatLng.lat,
              offsetLng: center.lng - startLatLng.lng
            };
          };
        }
      });

      observer.observe(document.getElementById('map'), {
        childList: true, subtree: true, attributes: true, attributeFilter: ['d', 'class']
      });

      layer.on('mousedown touchstart', (e) => {
        L.DomEvent.stopPropagation(e);
        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;

        currentLayerObj = mapLayerRecord;
        rotationControl.style.display = "block";
        rotateSlider.value = mapLayerRecord.rotation;
        
        const rotationValue = document.getElementById("rotation-value");
        if (rotationValue) rotationValue.textContent = mapLayerRecord.rotation;

        map.dragging.disable();

        const ev = e.originalEvent;
        const touch = ev.touches ? ev.touches[0] : ev;
        const rect = map._container.getBoundingClientRect();
        const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
        const startLatLng = map.containerPointToLatLng(point);
        const center = mapLayerRecord.layer._currentLayer.getCenter();
        
        dragState.activeTouchDrag = {
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
            map.fitBounds(mapLayer.layer._geoJSONLayer.getBounds());
        } else if (mapLayer.layer.getBounds) {
            map.fitBounds(mapLayer.layer.getBounds());
        }
    });

    container.addEventListener("mouseover", () => showLayerInfo(mapLayer.name, indexData, activeLayers));
    container.addEventListener("mouseout", hideLayerInfo);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-layer-btn");
    deleteButton.title = "Eliminar capa";
    
    const icon = document.createElement("img");
    icon.src = "./assets/rubbish-bin-svgrepo-com.svg";
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
  if (activeLayers[index].visible) map.removeLayer(activeLayers[index].layer);
  activeLayers.splice(index, 1);
  renderLayersList();
  hideLayerInfo();
}

document.getElementById('toggle-controls').addEventListener('click', () => {
  document.getElementById('layer-controls').classList.toggle('open');
  document.getElementById('chevron-img').classList.toggle('open');
});

// --- BÚSQ ---
searchResults.style.display = 'none'; 

let showAllActive = false;

function renderResults(results) {
  const textEmpty = (searchInput.value || '').trim() === '';
  
  if (textEmpty && !showAllActive && !yearFilterActive) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none'; 
    return;
  }
  
  searchResults.innerHTML = '';
  
  if (!results || results.length === 0) {
    searchResults.style.display = 'none'; 
    return;
  }

  searchResults.style.display = 'block'; 

  results.forEach(map => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.textContent = map.name;
    div.onclick = () => loadMap(map.file, map.name, map.fillColor);
    searchResults.appendChild(div);
  });
}

showAllBtn.addEventListener('click', () => {
  showAllActive = !showAllActive;
  if (showAllActive) {
    searchInput.value = '';
    renderResults(mapIndex);
  } else {
    applyCombinedFilters();
  }
});

// ---year filter ---
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
  showAllActive = false; 
  
  const query = searchInput.value;
  const year = getSelectedYear();
  const results = filterMaps(mapIndex, { query, year, yearActive: yearFilterActive });
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
yearInput.addEventListener('input', applyCombinedFilters);
yearEra.addEventListener('change', applyCombinedFilters);
yearFilterBox.style.display = 'none';
showDateFilterBtn.classList.remove('active-year-btn');

function updateYear(delta) {
  let cur = parseInt(yearInput.value) || 0;
  yearInput.value = Math.max(0, cur + delta); 
  applyCombinedFilters();
}
enableAutoRepeat(yPlus1, () => updateYear(1));
enableAutoRepeat(yMinus1, () => updateYear(-1));

// --- Rotation control ---
const rotationValue = document.getElementById("rotation-value");
const resetBtn = document.getElementById("reset-rotation");
let sliderAnchorCenter = null;

function applyRotation(record, angle, anchorCenter = null) {
  if (!record || !record.layer || !record.layer._currentLayer) return;
  
  record.rotation = angle;
  if (rotationValue) rotationValue.textContent = angle;

  const currentPos = anchorCenter || record.layer._currentLayer.getCenter();
  const rotatedGeometry = rotateBaseGeometry(record.geometry, angle);
  const rotatedGeoJSON = { type: "Feature", properties: {}, geometry: rotatedGeometry };
  const layerColor = record.layer.options.fillColor || "#FF0000";

  const newLayer = new L.trueSize(rotatedGeoJSON, {
    color: layerColor, fillColor: layerColor,
    weight: 1.3, opacity: 1.5, className: record.layerId 
  });

  newLayer.addTo(map);
  newLayer.setCenter([currentPos.lat, currentPos.lng]);
  map.removeLayer(record.layer);
  record.layer = newLayer;

  newLayer.on('mousedown touchstart', (e) => {
    L.DomEvent.stopPropagation(e);
    if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;
    
    currentLayerObj = record;
    rotationControl.style.display = "block";
    rotateSlider.value = record.rotation;
    map.dragging.disable();

    const ev = e.originalEvent;
    const touch = ev.touches ? ev.touches[0] : ev;
    const rect = map._container.getBoundingClientRect();
    const point = L.point(touch.clientX - rect.left, touch.clientY - rect.top);
    const startLatLng = map.containerPointToLatLng(point);
    const center = record.layer._currentLayer.getCenter();
    
    dragState.activeTouchDrag = {
      layer: record.layer,
      offsetLat: center.lat - startLatLng.lat,
      offsetLng: center.lng - startLatLng.lng
    };
  });
}

rotateSlider.addEventListener('pointerdown', () => {
  if (currentLayerObj && currentLayerObj.layer && currentLayerObj.layer._currentLayer) {
    sliderAnchorCenter = currentLayerObj.layer._currentLayer.getCenter();
  }
});
rotateSlider.addEventListener('pointerup', () => { sliderAnchorCenter = null; });
rotateSlider.addEventListener('pointercancel', () => { sliderAnchorCenter = null; });

rotateSlider.addEventListener('input', function() {
  if (!currentLayerObj) return;
  applyRotation(currentLayerObj, parseInt(this.value), sliderAnchorCenter);
});

resetBtn.addEventListener('click', () => {
  if (!currentLayerObj) return;
  rotateSlider.value = 0;
  applyRotation(currentLayerObj, 0); 
});

// --- Canvas for the pencil ---
const drawer = new CanvasDrawer('paintCanvas');
initPaintUI(map, drawer);