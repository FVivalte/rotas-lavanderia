// core/init.js

import {
  carregarEstadoApp,
  restaurarEstadoApp,
  carregarHoteisCustomizados
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

import { renderizarRota, atualizarMapa } from '../ui/route.js';

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

export async function iniciarApp(){

  try{

    // ======================
    // DATABASE
    // ======================

    await initDatabase();

    // ======================
    // STORAGE
    // ======================

    carregarHoteisCustomizados();

    carregarEstadoApp();

    restaurarEstadoApp();

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
      atualizarMapa();

    }

    // ======================
    // RESTORE TELA
    // ======================

    switch(state.currentScreen){

      case 'tela-rota':

        mostrarTela(
          telaRota
        );

        break;

      case 'tela-navegacao':

        mostrarTela(
          telaNavegacao
        );

        atualizarModoUI();

        startGpsTracking();

        break;

      case 'tela-relatorio':

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
