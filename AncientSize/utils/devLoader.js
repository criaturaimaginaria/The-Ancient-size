export function registerLoadAllMaps(loadMap, mapIndex) {

  async function loadAllMaps(batchSize = 5, delay = 70) {

    console.log(`Loading the ${mapIndex.length} maps...`);

    let i = 0;

    while (i < mapIndex.length) {

      const batch = mapIndex.slice(i, i + batchSize);

      batch.forEach(m => {
        try {
          loadMap(m.file, m.name, m.fillColor);
        } catch (e) {
          console.warn("Error loading:", m.name);
        }
      });

      i += batchSize;


      await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.log("Finished loading all maps");
  }

  window.loadAllMaps = loadAllMaps;


}




// in console write loadAllMaps()






