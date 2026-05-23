// ========================================
// STORAGE.JS
// ========================================


// ========================================
// INDEXED DB
// ========================================

function initDatabase(){

  return new Promise((resolve,reject)=>{

    const request =
      indexedDB.open(
        'RotaBuziosDB',
        1
      );

    request.onupgradeneeded = (e)=>{

      db = e.target.result;

      if(
        !db.objectStoreNames.contains(
          'photos'
        )
      ){

        db.createObjectStore(
          'photos',
          { keyPath:'id' }
        );

      }

    };

    request.onsuccess = (e)=>{

      db = e.target.result;

      resolve();

    };

    request.onerror = (e)=>{

      reject(e);

    };

  });

}


// ========================================
// SALVAR FOTO
// ========================================

function savePhoto(photo){

  return new Promise((resolve,reject)=>{

    const tx =
      db.transaction(
        ['photos'],
        'readwrite'
      );

    const store =
      tx.objectStore('photos');

    const request =
      store.put(photo);

    request.onsuccess = ()=>resolve();

    request.onerror = err=>reject(err);

  });

}


// ========================================
// BUSCAR FOTO
// ========================================

function getPhoto(id){

  return new Promise((resolve,reject)=>{

    const tx =
      db.transaction(
        ['photos'],
        'readonly'
      );

    const store =
      tx.objectStore('photos');

    const request =
      store.get(id);

    request.onsuccess =
      ()=>resolve(request.result);

    request.onerror =
      err=>reject(err);

  });

}


// ========================================
// HOTÉIS CUSTOMIZADOS
// ========================================

function saveCustomHotels(){

  const customHotels =
    HOTELS.filter(h => h.custom);

  localStorage.setItem(
    CUSTOM_HOTELS_KEY,
    JSON.stringify(customHotels)
  );

}


function loadCustomHotels(){

  const saved =
    localStorage.getItem(
      CUSTOM_HOTELS_KEY
    );

  if(!saved) return;

  try{

    const customHotels =
      JSON.parse(saved);

    customHotels.forEach(h=>{

      const alreadyExists =
        HOTELS.some(x=>x.id===h.id);

      if(!alreadyExists){

        HOTELS.push(h);

      }

    });

  }catch(err){

    console.log(
      'Erro carregando hotéis',
      err
    );

  }

}


// ========================================
// SALVAR ESTADO DO APP
// ========================================

function saveAppState(){

  const data = {

    activeSet: [...activeSet],

    routeOrder,

    routeReport,

    currentIndex,

    currentScreen:
      screenMode.style.display === 'block'
        ? 'mode'
        : screenRoute.style.display === 'block'
        ? 'route'
        : 'select'

  };

  localStorage.setItem(
    'rotaBuziosState',
    JSON.stringify(data)
  );

}


// ========================================
// RESTAURAR ESTADO
// ========================================

function restoreAppState(){

  const saved =
    localStorage.getItem(
      'rotaBuziosState'
    );

  if(!saved) return;

  try{

    const data = JSON.parse(saved);

    activeSet =
      new Set(data.activeSet || []);

    routeOrder =
      data.routeOrder || [];

    routeReport =
      data.routeReport || [];

    currentIndex =
      data.currentIndex || 0;

    renderSelection();

    if(routeOrder.length){

      renderRoute();

    }

    if(data.currentScreen === 'route'){

      screenSelect.style.display='none';

      screenRoute.style.display='block';

      screenMode.style.display='none';

    }

    if(data.currentScreen === 'mode'){

      screenSelect.style.display='none';

      screenRoute.style.display='none';

      screenMode.style.display='block';

      updateModeUI();

      renderReportMode();

      startGpsTracking();

    }

  }catch(err){

    console.log(
      'Erro restaurando estado',
      err
    );

  }

}
