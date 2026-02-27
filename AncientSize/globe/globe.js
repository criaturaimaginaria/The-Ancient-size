// import { generateLayerId } from '../utils/uiHelpers.js';

// // --- 1. CONFIGURACIÓN DE LA CAPA BASE (VOYAGER) ---
// const voyagerProvider = new Cesium.UrlTemplateImageryProvider({
//     url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
// });

// const voyagerLayer = new Cesium.ImageryLayer(voyagerProvider);

// // Ajustes estéticos iniciales
// voyagerLayer.brightness = 0.6; // Un poco más oscuro para que resalten tus polígonos
// voyagerLayer.contrast = 1.5;   // Contraste equilibrado (6 era demasiado alto)
// voyagerLayer.saturation = 0.8;

// // --- 2. INICIALIZACIÓN DEL VIEWER ---
// const viewer = new Cesium.Viewer('globe-container', {
//     infoBox: false,
//     selectionIndicator: false,
//     timeline: false,
//     animation: false,
//     baseLayerPicker: false,
//     geocoder: false,
//     baseLayer: voyagerLayer
// });

// viewer.scene.globe.baseColor = Cesium.Color.BLACK;

// // --- 3. VARIABLES PARA EL ARRASTRE (DRAG & DROP) ---
// let lastMousePosition = null;
// let activeDataSource = null;
// let indexData = [];

// // --- 4. CARGAR EL ÍNDICE DE CIVILIZACIONES ---
// fetch('../index.json').then(res => res.json()).then(async (data) => {
//     const parts = data.parts || [data];
//     const allData = await Promise.all(parts.map(async (ruta) => {
//         try {
//             const r = await fetch(`../${ruta}`);
//             return await r.json();
//         } catch (e) { return []; }
//     }));
//     indexData = allData.flat();
// });

// // --- 5. FUNCIÓN CARGAR PAÍS ---
// window.loadMapInGlobe = async (file, name, fillColor) => {
//     try {
//         const ds = await Cesium.GeoJsonDataSource.load(`../${file}`, {
//             fill: Cesium.Color.fromCssColorString(fillColor || '#FF0000').withAlpha(0.7),
//             stroke: Cesium.Color.WHITE,
//             strokeWidth: 2
//         });
        
//         const dataSource = await viewer.dataSources.add(ds);

//         // ZOOM CORREGIDO: 3.000.000 metros es una vista perfecta desde el espacio
//         viewer.zoomTo(dataSource, new Cesium.HeadingPitchRange(
//             0, 
//             Cesium.Math.toRadians(-90), // Mirando directo hacia abajo
//             3000000 
//         ));

//         // Añadir a la lista de capas en la UI
//         const list = document.getElementById('layers-list');
//         const item = document.createElement('div');
//         item.textContent = "• " + name;
//         item.style.color = "white";
//         item.style.padding = "5px";
//         list.appendChild(item);

//     } catch (e) { console.error("Error cargando GeoJSON:", e); }
// };

// // --- 6. LÓGICA DE ARRASTRE (DRAG & DROP) ---
// const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// // CLICK IZQUIERDO: Atrapamos el país
// handler.setInputAction((click) => {
//     const picked = viewer.scene.pick(click.position);
//     if (Cesium.defined(picked) && picked.id) {
//         // Obtenemos el DataSource que contiene todos los polígonos del país
//         activeDataSource = picked.id.entityCollection.owner;
//         lastMousePosition = viewer.camera.pickEllipsoid(click.position);
        
//         // Desactivamos los controles de la cámara para que el globo no se mueva
//         viewer.scene.screenSpaceCameraController.enableInputs = false;
//     }
// }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

// // MOVIMIENTO: Desplazamos los vértices
// handler.setInputAction((movement) => {
//     if (activeDataSource && lastMousePosition) {
//         const newPosition = viewer.camera.pickEllipsoid(movement.endPosition);
//         if (newPosition) {
//             // Calculamos la diferencia de coordenadas (Delta)
//             const oldCarto = Cesium.Cartographic.fromCartesian(lastMousePosition);
//             const newCarto = Cesium.Cartographic.fromCartesian(newPosition);
            
//             const deltaLon = newCarto.longitude - oldCarto.longitude;
//             const deltaLat = newCarto.latitude - oldCarto.latitude;

//             // Movemos cada polígono del país sumando el Delta a sus posiciones
//             activeDataSource.entities.values.forEach(entity => {
//                 if (entity.polygon && entity.polygon.hierarchy) {
//                     const hierarchy = entity.polygon.hierarchy.getValue();
//                     const newPositions = hierarchy.positions.map(p => {
//                         const c = Cesium.Cartographic.fromCartesian(p);
//                         return Cesium.Cartesian3.fromRadians(
//                             c.longitude + deltaLon, 
//                             c.latitude + deltaLat, 
//                             c.height
//                         );
//                     });
//                     entity.polygon.hierarchy = new Cesium.PolygonHierarchy(newPositions);
//                 }
//             });

//             lastMousePosition = newPosition;
//         }
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// // SOLTAR: Liberamos el país y la cámara
// handler.setInputAction(() => {
//     activeDataSource = null;
//     lastMousePosition = null;
//     viewer.scene.screenSpaceCameraController.enableInputs = true;
// }, Cesium.ScreenSpaceEventType.LEFT_UP);

// // --- 7. LÓGICA DEL BUSCADOR ---
// const searchInput = document.getElementById('map-search');
// if (searchInput) {
//     searchInput.addEventListener('input', (e) => {
//         const query = e.target.value.toLowerCase();
//         const results = document.getElementById('search-results');
//         results.innerHTML = '';
//         if(!query) return;

//         indexData.filter(m => m.name.toLowerCase().includes(query)).forEach(m => {
//             const div = document.createElement('div');
//             div.className = 'result-item';
//             div.textContent = m.name;
//             div.style.cursor = "pointer";
//             div.onclick = () => window.loadMapInGlobe(m.file, m.name, m.fillColor);
//             results.appendChild(div);
//         });
//     });
// }






















// import { generateLayerId } from '../utils/uiHelpers.js';

// // --- 1. CONFIGURACIÓN DEL VIEWER ---
// const voyagerProvider = new Cesium.UrlTemplateImageryProvider({
//     url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
// });

// const voyagerLayer = new Cesium.ImageryLayer(voyagerProvider);
// voyagerLayer.brightness = 0.6;
// voyagerLayer.contrast = 1.2;

// const viewer = new Cesium.Viewer('globe-container', {
//     infoBox: false,
//     selectionIndicator: false,
//     timeline: false,
//     animation: false,
//     baseLayerPicker: false,
//     geocoder: false,
//     baseLayer: voyagerLayer
// });

// viewer.scene.globe.baseColor = Cesium.Color.BLACK;

// // --- 2. VARIABLES DE ESTADO ---
// let draggingDataSource = null;
// let ghostEntity = null;
// let startCartographic = null; // Guardamos en Lat/Lon
// let indexData = [];

// // --- 3. CARGAR INDEX ---
// fetch('../index.json').then(res => res.json()).then(async (data) => {
//     const parts = data.parts || [data];
//     const allData = await Promise.all(parts.map(async (ruta) => {
//         try {
//             const r = await fetch(`../${ruta}`);
//             return await r.json();
//         } catch (e) { return []; }
//     }));
//     indexData = allData.flat();
// });

// // --- 4. CARGAR PAÍS ---
// window.loadMapInGlobe = async (file, name, fillColor) => {
//     try {
//         const ds = await Cesium.GeoJsonDataSource.load(`../${file}`, {
//             fill: Cesium.Color.fromCssColorString(fillColor || '#FF0000').withAlpha(0.7),
//             stroke: Cesium.Color.WHITE,
//             strokeWidth: 2
//         });
//         const dataSource = await viewer.dataSources.add(ds);
//         viewer.zoomTo(dataSource);

//         const list = document.getElementById('layers-list');
//         if(list) {
//             const item = document.createElement('div');
//             item.textContent = "• " + name;
//             item.style.color = "white";
//             list.appendChild(item);
//         }
//     } catch (e) { console.error(e); }
// };

// // --- 5. LÓGICA DE ARRASTRE GEOGRÁFICO (SIN DEFORMACIÓN) ---
// const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

// handler.setInputAction((click) => {
//     const picked = viewer.scene.pick(click.position);
//     if (Cesium.defined(picked) && picked.id) {
//         draggingDataSource = picked.id.entityCollection.owner;
//         const cartesian = viewer.camera.pickEllipsoid(click.position);
        
//         if (cartesian) {
//             // Guardamos la posición inicial en RADIANES (Lat/Lon)
//             startCartographic = Cesium.Cartographic.fromCartesian(cartesian);
//             viewer.scene.screenSpaceCameraController.enableInputs = false;
            
//             // Crear Fantasma (Ghost) para fluidez
//             const entities = draggingDataSource.entities.values;
//             let allPos = [];
//             entities.forEach(e => { if(e.polygon) allPos.push(...e.polygon.hierarchy.getValue().positions); });
//             entities.forEach(e => e.show = false); // Ocultar original

//             const bSphere = Cesium.BoundingSphere.fromPoints(allPos);
//             ghostEntity = viewer.entities.add({
//                 position: bSphere.center,
//                 point: { pixelSize: 20, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 }
//             });
//         }
//     }
// }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

// handler.setInputAction((movement) => {
//     if (draggingDataSource && ghostEntity) {
//         const currentPos = viewer.camera.pickEllipsoid(movement.endPosition);
//         if (currentPos) ghostEntity.position = currentPos;
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// handler.setInputAction((up) => {
//     if (draggingDataSource && ghostEntity && startCartographic) {
//         const endCartesian = viewer.camera.pickEllipsoid(up.position);
//         if (endCartesian) {
//             const endCartographic = Cesium.Cartographic.fromCartesian(endCartesian);

//             // Calculamos la diferencia REAL en Latitud y Longitud
//             const deltaLon = endCartographic.longitude - startCartographic.longitude;
//             const deltaLat = endCartographic.latitude - startCartographic.latitude;

//             draggingDataSource.entities.values.forEach(entity => {
//                 // Función para mover puntos manteniendo la escala esférica
//                 const movePoint = (p) => {
//                     const c = Cesium.Cartographic.fromCartesian(p);
//                     return Cesium.Cartesian3.fromRadians(c.longitude + deltaLon, c.latitude + deltaLat, c.height);
//                 };

//                 if (entity.polygon) {
//                     const h = entity.polygon.hierarchy.getValue();
//                     const newPos = h.positions.map(movePoint);
//                     entity.polygon.hierarchy = new Cesium.PolygonHierarchy(newPos);
//                 }
//                 if (entity.polyline) {
//                     const p = entity.polyline.positions.getValue();
//                     entity.polyline.positions = p.map(movePoint);
//                 }
//                 entity.show = true;
//             });
//         }
        
//         viewer.entities.remove(ghostEntity);
//         draggingDataSource = null;
//         ghostEntity = null;
//         startCartographic = null;
//         viewer.scene.screenSpaceCameraController.enableInputs = true;
//     }
// }, Cesium.ScreenSpaceEventType.LEFT_UP);

// // --- 6. BUSCADOR ---
// const searchInput = document.getElementById('map-search');
// const resultsContainer = document.getElementById('search-results');
// if (searchInput) {
//     searchInput.addEventListener('input', (e) => {
//         const query = e.target.value.toLowerCase();
//         resultsContainer.innerHTML = '';
//         if(!query) return;
//         indexData.filter(m => m.name.toLowerCase().includes(query)).forEach(m => {
//             const div = document.createElement('div');
//             div.className = 'result-item';
//             div.textContent = m.name;
//             div.onclick = () => {
//                 window.loadMapInGlobe(m.file, m.name, m.fillColor);
//                 resultsContainer.innerHTML = '';
//             };
//             resultsContainer.appendChild(div);
//         });
//     });
// }























import { generateLayerId } from '../utils/uiHelpers.js';

// --- 1. CONFIGURACIÓN DEL VIEWER ---
const voyagerProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
});

const voyagerLayer = new Cesium.ImageryLayer(voyagerProvider);
voyagerLayer.brightness = 0.6;
voyagerLayer.contrast = 1.2;

const viewer = new Cesium.Viewer('globe-container', {
    infoBox: false,
    selectionIndicator: false,
    timeline: false,
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    baseLayer: voyagerLayer
});

viewer.scene.globe.baseColor = Cesium.Color.BLACK;

// --- 2. VARIABLES DE ESTADO ---
let draggingDataSource = null;
let ghostEntity = null;
let startCartographic = null; // Guardamos en Lat/Lon
let indexData = [];

// --- 3. CARGAR INDEX ---
fetch('../index.json').then(res => res.json()).then(async (data) => {
    const parts = data.parts || [data];
    const allData = await Promise.all(parts.map(async (ruta) => {
        try {
            const r = await fetch(`../${ruta}`);
            return await r.json();
        } catch (e) { return []; }
    }));
    indexData = allData.flat();
});

// --- 4. CARGAR PAÍS ---
window.loadMapInGlobe = async (file, name, fillColor) => {
    try {
        const ds = await Cesium.GeoJsonDataSource.load(`../${file}`, {
            fill: Cesium.Color.fromCssColorString(fillColor || '#FF0000').withAlpha(0.7),
            stroke: Cesium.Color.WHITE,
            strokeWidth: 2
        });
        const dataSource = await viewer.dataSources.add(ds);
        viewer.zoomTo(dataSource);

        const list = document.getElementById('layers-list');
        if(list) {
            const item = document.createElement('div');
            item.textContent = "• " + name;
            item.style.color = "white";
            list.appendChild(item);
        }
    } catch (e) { console.error(e); }
};

// --- 5. LÓGICA DE ARRASTRE GEOGRÁFICO (SIN DEFORMACIÓN) ---
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.id) {
        draggingDataSource = picked.id.entityCollection.owner;
        const cartesian = viewer.camera.pickEllipsoid(click.position);
        
        if (cartesian) {
            // Guardamos la posición inicial en RADIANES (Lat/Lon)
            startCartographic = Cesium.Cartographic.fromCartesian(cartesian);
            viewer.scene.screenSpaceCameraController.enableInputs = false;
            
            // Crear Fantasma (Ghost) para fluidez
            const entities = draggingDataSource.entities.values;
            let allPos = [];
            entities.forEach(e => { if(e.polygon) allPos.push(...e.polygon.hierarchy.getValue().positions); });
            entities.forEach(e => e.show = false); // Ocultar original

            const bSphere = Cesium.BoundingSphere.fromPoints(allPos);
            ghostEntity = viewer.entities.add({
                position: bSphere.center,
                point: { pixelSize: 20, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 }
            });
        }
    }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

handler.setInputAction((movement) => {
    if (draggingDataSource && ghostEntity) {
        const currentPos = viewer.camera.pickEllipsoid(movement.endPosition);
        if (currentPos) ghostEntity.position = currentPos;
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction((up) => {
    if (!draggingDataSource || !startCartographic) return;

    try {
        const endCartesian = viewer.camera.pickEllipsoid(up.position);
        
        if (endCartesian) {
            // 1. Convertimos el inicio (donde hicimos click) a Cartesian3
            const startCartesian = Cesium.Cartographic.toCartesian(startCartographic);
            
            // 2. Calculamos la rotación relativa entre el punto de inicio y el de fin
            const rotationQuaternion = Cesium.Quaternion.rotationBetween(
                startCartesian, 
                endCartesian, 
                new Cesium.Quaternion()
            );

            const rotationMatrix = Cesium.Matrix3.fromQuaternion(rotationQuaternion);

            draggingDataSource.entities.values.forEach(entity => {
                // Función para transformar cada punto
                const movePoint = (p) => {
                    // Si p no es un Cartesian3 válido, lo ignoramos
                    if (!p) return p;
                    
                    // Aplicamos la rotación al punto original
                    return Cesium.Matrix3.multiplyByVector(
                        rotationMatrix, 
                        p, 
                        new Cesium.Cartesian3()
                    );
                };

                // --- PROCESAR POLÍGONOS ---
                if (entity.polygon && entity.polygon.hierarchy) {
                    const hierarchy = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now());
                    if (hierarchy && hierarchy.positions) {
                        const newPositions = hierarchy.positions.map(movePoint);
                        // Reasignamos la jerarquía completa
                        entity.polygon.hierarchy = new Cesium.PolygonHierarchy(newPositions);
                    }
                }

                // --- PROCESAR POLILÍNEAS ---
                if (entity.polyline && entity.polyline.positions) {
                    const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
                    if (positions) {
                        entity.polyline.positions = positions.map(movePoint);
                    }
                }
                
                // Forzamos que se muestre
                entity.show = true;
            });
        }
    } catch (error) {
        console.error("Error en el cálculo de posición:", error);
    } finally {
        // --- LIMPIEZA TOTAL ---
        if (ghostEntity) viewer.entities.remove(ghostEntity);
        
        draggingDataSource = null;
        ghostEntity = null;
        startCartographic = null;
        
        // Reactivar cámara
        viewer.scene.screenSpaceCameraController.enableInputs = true;
    }
}, Cesium.ScreenSpaceEventType.LEFT_UP);

// --- 6. BUSCADOR ---
const searchInput = document.getElementById('map-search');
const resultsContainer = document.getElementById('search-results');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        resultsContainer.innerHTML = '';
        if(!query) return;
        indexData.filter(m => m.name.toLowerCase().includes(query)).forEach(m => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.textContent = m.name;
            div.onclick = () => {
                window.loadMapInGlobe(m.file, m.name, m.fillColor);
                resultsContainer.innerHTML = '';
            };
            resultsContainer.appendChild(div);
        });
    });
}

















