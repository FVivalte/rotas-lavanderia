// core/storage.js

import { HOTELS } from '../data/dados.js';
import { state } from '../core/state.js';
const CUSTOM_HOTELS_KEY =
  'rotaBuziosCustomHotels';

const APP_STATE_KEY =
  'rotaBuziosState';


// =========================
// HOTÉIS CUSTOMIZADOS
// =========================

export function saveCustomHotels(){

  const customHotels =
    HOTELS.filter(h => h.custom);

  localStorage.setItem(
    CUSTOM_HOTELS_KEY,
    JSON.stringify(customHotels)
  );

}

export function loadCustomHotels(){

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


// =========================
// ESTADO DO APP
// =========================

export function saveAppState(currentScreen){

  const data = {

    activeSet:
      [...state.activeSet],

    speechEnabled:
      state.speechEnabled,

    arrivalConfirmed:
      state.arrivalConfirmed,

    routeOrder:
      state.routeOrder,

    routeReport:
      state.routeReport,

    currentIndex:
      state.currentIndex,

    currentScreen

  };

  localStorage.setItem(
    APP_STATE_KEY,
    JSON.stringify(data)
  );

}


export function loadAppState(){

  const saved =
    localStorage.getItem(
      APP_STATE_KEY
    );

  if(!saved) return null;

  try{

    return JSON.parse(saved);

  }catch(err){

    console.log(
      'Erro carregando estado',
      err
    );

    return null;

  }

}


export function restoreAppState(){

  const data = loadAppState();

  if(!data) return;

  state.speechEnabled =
    data.speechEnabled || false;

  state.arrivalConfirmed =
    data.arrivalConfirmed || false;

  state.activeSet =
    new Set(data.activeSet || []);

  state.routeOrder =
    data.routeOrder || [];

  state.routeReport =
    data.routeReport || [];

  state.currentIndex =
    data.currentIndex || 0;

}


// =========================
// RESET STORAGE
// =========================

export function clearAppState(){

  localStorage.removeItem(
    APP_STATE_KEY
  );

}


export function clearCustomHotels(){

  localStorage.removeItem(
    CUSTOM_HOTELS_KEY
  );

}
