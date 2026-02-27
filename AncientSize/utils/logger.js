// utils/logger.js

export function logFileLoaded(ruta, cantidad) {
  console.log(
    `%c FICHERO: %c${ruta.padEnd(25)} %c OBJETOS: %c${cantidad}`,
    "color: #888", "color: #00d4ff; font-weight: bold", 
    "color: #888", "color: #fff; font-weight: bold"
  );
}

export function logTotalCount(total) {
  console.log("%c--------------------------------------------------", "color: #444");
  console.log(
    `%c TOTAL Countries: ${total} `,
    "background: #2e7d32; color: white; font-weight: bold; border-radius: 4px; padding: 2px 5px;"
  );
  console.log("%c--------------------------------------------------", "color: #444");
}