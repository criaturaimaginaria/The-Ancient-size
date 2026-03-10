const R_EARTH = 6378137;

export function latLngToMercator(lng, lat) {
    const x = R_EARTH * lng * (Math.PI / 180);
    const y = R_EARTH * Math.log(Math.tan((Math.PI / 4) + (lat * Math.PI / 360)));
    return [x, y];
}

export function mercatorToLatLng(x, y) {
    const lng = (x / R_EARTH) * (180 / Math.PI);
    const lat = (2 * Math.atan(Math.exp(y / R_EARTH)) - (Math.PI / 2)) * (180 / Math.PI);
    return [lng, lat];
}

export function rotateBaseGeometry(baseGeometry, angleDeg) {
    const angleRad = -angleDeg * (Math.PI / 180);
    const cosT = Math.cos(angleRad);
    const sinT = Math.sin(angleRad);
    
    const newGeom = JSON.parse(JSON.stringify(baseGeometry));
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    function findBounds(coords) {
        if (typeof coords[0] === 'number') {
            const m = latLngToMercator(coords[0], coords[1]);
            minX = Math.min(minX, m[0]); maxX = Math.max(maxX, m[0]);
            minY = Math.min(minY, m[1]); maxY = Math.max(maxY, m[1]);
        } else { coords.forEach(findBounds); }
    }
    findBounds(newGeom.coordinates);
    
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    function rotateRecursive(coords) {
        if (typeof coords[0] === 'number') {
            const m = latLngToMercator(coords[0], coords[1]);
            const x = m[0] - cx;
            const y = m[1] - cy;
            const nx = (x * cosT - y * sinT) + cx;
            const ny = (x * sinT + y * cosT) + cy;
            const final = mercatorToLatLng(nx, ny);
            coords[0] = final[0];
            coords[1] = final[1];
        } else { coords.forEach(rotateRecursive); }
    }
    rotateRecursive(newGeom.coordinates);
    return newGeom;
}