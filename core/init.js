// core/init.js

import { loadCustomHotels }
from '../storage/storage.js';

import { restoreAppState }
from '../storage/storage.js';

import { initDatabase }
from '../storage/database.js';

import { renderSelection }
from '../ui/selection.js';

import { state }
from './state.js';


// ======================
// INIT APP
// ======================

export async function initApp(){

  try{

    // inicia indexedDB
    await initDatabase();

    // carrega hotéis customizados
    loadCustomHotels();

    // restaura estado salvo
    restoreAppState();

    // render inicial
    renderSelection();

    console.log(
      'App iniciado com sucesso'
    );

  }catch(err){

    console.error(
      'Erro ao iniciar app:',
      err
    );

    alert(
      'Erro ao iniciar aplicativo'
    );

  }

}


// ======================
// RESET GLOBAL
// ======================

export function resetAppState(){

  state.activeSet.clear();

  state.routeOrder = [];

  state.routeReport = [];

  state.currentIndex = 0;

  state.arrivalConfirmed = false;

  state.lastInstruction = '';

  state.mapInitialized = false;

}


// ======================
// NOVA ROTA
// ======================

export function prepareNewRoute(){

  resetAppState();

  renderSelection();

}
