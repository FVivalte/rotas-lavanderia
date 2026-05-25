// core/init.js

import {
  loadCustomHotels,
  restoreAppState
}
from '../storage/storage.js';

import {
  initDatabase
}
from '../storage/database.js';

import {
  renderizarSelecao
}
from '../ui/selection.js';

import {
  renderizarRota
}
from '../ui/route.js';

import {
  atualizarModoUI
}
from '../ui/mode.js';

import {
  initEvents
}
from '../events/events.js';

import {
  startGpsTracking
}
from '../services/gps.js';

import {
  state
}
from './state.js';

import {

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

}
from '../ui/elements.js';

import {
  mostrarTela
}
from '../ui/screens.js';


// ======================
// INIT APP
// ======================

export async function initApp(){

  try{

    // ======================
    // DATABASE
    // ======================

    await initDatabase();

    // ======================
    // STORAGE
    // ======================

    loadCustomHotels();

    restoreAppState();

    // ======================
    // EVENTS
    // ======================

    initEvents();

    // ======================
    // RENDER INICIAL
    // ======================

    renderizarSelecao();

    // ======================
    // RESTORE ROTA
    // ======================

    if(state.routeOrder.length){

      renderizarRota();

    }

    // ======================
    // RESTORE TELA
    // ======================

    switch(state.currentScreen){

      case 'route':

        mostrarTela(
          telaRota
        );

        break;

      case 'mode':

        mostrarTela(
          telaNavegacao
        );

        atualizarModoUI();

        startGpsTracking();

        break;

      case 'report':

        mostrarTela(
          telaRelatorio
        );

        break;

      default:

        mostrarTela(
          telaSelecao
        );

    }

    // ======================
    // SERVICE WORKER
    // ======================

    if('serviceWorker' in navigator){

      navigator.serviceWorker
        .register('./sw.js')
        .catch(err=>{

          console.log(
            'SW erro:',
            err
          );

        });

    }

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

export function resetarEstadoApp(){

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

export function prepararNovaRota(){

  resetarEstadoApp();

  renderizarSelecao();

}
