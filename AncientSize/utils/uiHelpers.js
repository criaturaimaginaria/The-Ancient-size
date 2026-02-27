// export function enableAutoRepeat(btn, cb) {
//   let interval = null, timeout = null;
  
//   const start = (e) => { 
//     e.preventDefault(); 
//     cb(); 
//     timeout = setTimeout(() => interval = setInterval(cb, 65), 65); 
//   };
  
//   const stop = () => { 
//     clearTimeout(timeout); 
//     if (interval) clearInterval(interval); 
//     interval = null; 
//   };

//   btn.addEventListener('mousedown', start);
//   btn.addEventListener('touchstart', start);
//   document.addEventListener('mouseup', stop);
//   document.addEventListener('touchend', stop);
//   document.addEventListener('touchcancel', stop);
// }


// utils/uiHelpers.js

/**
 * Permite que un botón ejecute una función continuamente (usado en los filtros de año)
 */
export function enableAutoRepeat(btn, cb) {
  let interval = null, timeout = null;
  
  const start = (e) => { 
    e.preventDefault(); 
    cb(); 
    timeout = setTimeout(() => interval = setInterval(cb, 65), 65); 
  };
  
  const stop = () => { 
    clearTimeout(timeout); 
    if (interval) clearInterval(interval); 
    interval = null; 
  };

  btn.addEventListener('mousedown', start);
  btn.addEventListener('touchstart', start);
  document.addEventListener('mouseup', stop);
  document.addEventListener('touchend', stop);
  document.addEventListener('touchcancel', stop);
}

/**
 * Genera un ID único para las capas (Evita el error de export en globe.js)
 */
export function generateLayerId() {
  return "ts-" + Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Aplica estilos CSS de rotación (usado en el index.js de Leaflet)
 */
export function applyRotationStyles(elements, angle) {
  for (let el of elements) {
    el.style.transformOrigin = 'center';
    el.style.transformBox = 'fill-box';
    el.style.transform = `rotate(${angle}deg)`;
    el.style.pointerEvents = 'auto'; 
  }
}