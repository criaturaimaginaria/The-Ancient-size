import { calculateGeoJSONArea } from './geoArea.js';
import { getTooltipContent } from './formatters.js';

const tooltipBox = document.getElementById("layer-info-tooltip");
const tooltipBoxMinimal = document.getElementById("layer-info-tooltipMinimal");

const nameEl = document.createElement("b");
const br = document.createElement("br");
const flagContainer = document.createElement("div");
flagContainer.className = "flagContainerMinimal";
const flagImg = document.createElement("img");
flagContainer.appendChild(flagImg);
tooltipBoxMinimal.appendChild(nameEl);
tooltipBoxMinimal.appendChild(br);
tooltipBoxMinimal.appendChild(flagContainer);

export function showLayerInfo(layerName, indexData, activeLayers) {
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

export function hideLayerInfo() {
    tooltipBox.style.display = "none";
    tooltipBoxMinimal.style.display = "none";
}

export function showLayerInfoMinimal(layerName, indexData) {
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