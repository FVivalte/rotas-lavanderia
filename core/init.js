// core/init.js

import { loadCustomHotels } 
from '../storage/storage.js';

import { restoreAppState }
from '../storage/storage.js';

import { initDatabase }
from '../storage/database.js';

import { renderSelection }
from '../ui/selection.js';

import { renderRoute }
from '../ui/route.js';

import { updateModeUI }
from '../ui/mode.js';

import { initEvents }
from '../events/events.js';

import { startGpsTracking }
from '../services/gps.js';

import { state }
from '../core/state.js';

import {
  telaSelecao,
  telaRota,
  telaNavegacao
} from '../ui/elements.js';


// ======================
// INIT APP
// ======================

export async function initApp(){

  try{

    // indexedDB
    await initDatabase();

    // hotéis customizados
    loadCustomHotels();

    // restaura estado salvo
    restoreAppState();

    // listeners globais
    initEvents();

    // render inicial seleção
    renderSelection();

    // ======================
    // RESTORE SCREEN
    // ======================

    if(state.routeOrder.length){

      renderRoute();

    }

    if(state.currentScreen === 'route'){

      telaSelecao.style.display = 'none';
      telaRota.style.display = 'block';
      telaNavegacao.style.display = 'none';

    }

    if(state.currentScreen === 'mode'){

      telaSelecao.style.display = 'none';
      telaRota.style.display = 'none';
      telaNavegacao.style.display = 'block';

      updateModeUI();

      startGpsTracking();

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
