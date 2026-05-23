// core/database.js

import { state } from './state.js';

const DB_NAME = 'RotaBuziosDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

export function initDatabase(){

  return new Promise((resolve, reject)=>{

    const request =
      indexedDB.open(
        DB_NAME,
        DB_VERSION
      );

    request.onupgradeneeded = (e)=>{

      state.db = e.target.result;

      if(
        !state.db.objectStoreNames.contains(
          STORE_NAME
        )
      ){

        state.db.createObjectStore(
          STORE_NAME,
          { keyPath:'id' }
        );

      }

    };

    request.onsuccess = (e)=>{

      state.db = e.target.result;

      resolve();

    };

    request.onerror = (e)=>{

      reject(e);

    };

  });

}

export function savePhoto(photo){

  return new Promise((resolve,reject)=>{

    if(!state.db){

      reject(
        new Error('Banco não inicializado')
      );

      return;

    }

    const tx =
      state.db.transaction(
        [STORE_NAME],
        'readwrite'
      );

    const store =
      tx.objectStore(STORE_NAME);

    const request =
      store.put(photo);

    request.onsuccess = ()=>{

      resolve(photo);

    };

    request.onerror = (err)=>{

      reject(err);

    };

  });

}

export function getPhoto(id){

  return new Promise((resolve,reject)=>{

    if(!state.db){

      reject(
        new Error('Banco não inicializado')
      );

      return;

    }

    const tx =
      state.db.transaction(
        [STORE_NAME],
        'readonly'
      );

    const store =
      tx.objectStore(STORE_NAME);

    const request =
      store.get(id);

    request.onsuccess = ()=>{

      resolve(request.result);

    };

    request.onerror = (err)=>{

      reject(err);

    };

  });

}

export function deletePhoto(id){

  return new Promise((resolve,reject)=>{

    if(!state.db){

      reject(
        new Error('Banco não inicializado')
      );

      return;

    }

    const tx =
      state.db.transaction(
        [STORE_NAME],
        'readwrite'
      );

    const store =
      tx.objectStore(STORE_NAME);

    const request =
      store.delete(id);

    request.onsuccess = ()=>{

      resolve();

    };

    request.onerror = (err)=>{

      reject(err);

    };

  });

}

export function clearPhotos(){

  return new Promise((resolve,reject)=>{

    if(!state.db){

      reject(
        new Error('Banco não inicializado')
      );

      return;

    }

    const tx =
      state.db.transaction(
        [STORE_NAME],
        'readwrite'
      );

    const store =
      tx.objectStore(STORE_NAME);

    const request =
      store.clear();

    request.onsuccess = ()=>{

      resolve();

    };

    request.onerror = (err)=>{

      reject(err);

    };

  });

}
