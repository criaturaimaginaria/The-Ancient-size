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