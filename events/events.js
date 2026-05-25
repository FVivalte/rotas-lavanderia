// events/events.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  btnVoltar,
  btnIniciarRota,
  btnExportar,
  btnFinalizar,
  btnNovaRota,
  btnGoogleMaps,

  btnAdicionarHotel,
  btnSalvarHotel,
  btnCloseModal,

  btnProximo,

  voiceToggle,

  chkEntrega,
  chkColeta,

  newName,
  newRegion,
  newAddress,
  newCoords,

  modal,

  deliveryPhotosInput,
  pickupPhotosInput,

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

} from '../ui/elements.js';


import {
  showScreen
}
from '../ui/screens.js';


import {
  generateRoute,
  renderSelection
}
from '../ui/selection.js';

import {
  renderRoute
}
from '../ui/route.js';

import {

  startModeRoute,
  updateModeUI

}
from '../ui/mode.js';


import {

  openReportScreen,
  renderReportMode

}
from '../ui/report.js';


import {

  parseCoords,
  readFilesAsBase64

}
from '../utils/utils.js';


import {

  saveAppState,
  saveCustomHotels

}
from '../storage/storage.js';


import {

  stopGpsTracking

}
from '../services/gps.js';


import {

  savePhoto

}
from '../storage/database.js';


// ======================
// BOTÕES
// ======================

const btnCriarRota =
  document.getElementById(
    'btn-criar-rota'
  );

const btnLimpar =
  document.getElementById(
    'btn-limpar'
  );


// ======================
// GERAR ROTA
// ======================

if(btnCriarRota){

  btnCriarRota.addEventListener(
    'click',
    ()=>{

      generateRoute();

      renderRoute();

      showScreen(screenRoute);

    }
  );

}


// ======================
// LIMPAR ROTA
// ======================

if(btnLimpar){

  btnLimpar.addEventListener(
    'click',
    ()=>{

      if(
        !confirm('Limpar rota?')
      ){
        return;
      }

      stopGpsTracking();

      state.activeSet.clear();

      state.routeOrder = [];

      state.routeReport = [];

      state.currentIndex = 0;

      state.lastInstruction = '';

      renderSelection();

      renderRoute();

      saveAppState();

    }
  );

}


// ======================
// VOLTAR
// ======================

if(btnVoltar){

  btnVoltar.addEventListener(
    'click',
    ()=>{

      stopGpsTracking();

      showScreen(screenSelect);

    }
  );

}


// ======================
// INICIAR ROTA
// ======================

if(btnIniciarRota){

  btnIniciarRota.addEventListener(
    'click',
    ()=>{

      startModeRoute();

      showScreen(screenMode);

    }
  );

}


// ======================
// PRÓXIMO HOTEL
// ======================

if(btnProximo){

  btnProximo.addEventListener(
    'click',
    ()=>{

      if(
        state.currentIndex >=
        state.routeOrder.length
      ){
        return;
      }

      const entry =
        state.routeReport[
          state.currentIndex
        ];

      entry.entrega =
        chkEntrega.checked;

      entry.coleta =
        chkColeta.checked;

      entry.departure =
        new Date().toISOString();

      state.currentIndex++;

      state.arrivalConfirmed =
        false;

      if(
        state.currentIndex >=
        state.routeOrder.length
      ){

        btnFinalizar?.click();

        return;

      }

      updateModeUI();

      renderReportMode();

      saveAppState();

    }
  );

}


// ======================
// FINALIZAR ROTA
// ======================

if(btnFinalizar){

  btnFinalizar.addEventListener(
    'click',
    ()=>{

      stopGpsTracking();

      const finalData =
        state.routeReport.map(r=>{

          const hotel =
            HOTELS.find(
              h => h.id === r.id
            );

          return {

            name:
              hotel?.name || '',

            arrival:
              r.arrival,

            departure:
              r.departure,

            deliveryPhotos:
              r.deliveryPhotos || [],

            pickupPhotos:
              r.pickupPhotos || []

          };

        });

      openReportScreen(
        finalData
      );

    }
  );

}


// ======================
// NOVA ROTA
// ======================

if(btnNovaRota){

  btnNovaRota.addEventListener(
    'click',
    ()=>{

      stopGpsTracking();

      state.activeSet.clear();

      state.routeOrder = [];

      state.routeReport = [];

      state.currentIndex = 0;

      renderSelection();

      saveAppState();

      showScreen(screenSelect);

    }
  );

}


// ======================
// EXPORT JSON
// ======================

if(btnExportar){

  btnExportar.addEventListener(
    'click',
    ()=>{

      const data = {

        generatedAt:
          new Date().toISOString(),

        route:
          state.routeOrder,

        report:
          state.routeReport

      };

      const blob =
        new Blob(
          [JSON.stringify(data,null,2)],
          {
            type:'application/json'
          }
        );

      const a =
        document.createElement('a');

      const url =
        URL.createObjectURL(blob);

      a.href = url;

      a.download =
        'relatorio_rota.json';

      a.click();

      setTimeout(()=>{

        URL.revokeObjectURL(url);

      },1000);

    }
  );

}


// ======================
// GOOGLE MAPS
// ======================

if(btnGoogleMaps){

  btnGoogleMaps.addEventListener(
    'click',
    ()=>{

      if(
        state.currentIndex >=
        state.routeOrder.length
      ){
        return;
      }

      const id =
        state.routeOrder[
          state.currentIndex
        ];

      const hotel =
        HOTELS.find(
          h => h.id === id
        );

      if(!hotel) return;

      window.open(
        `https://www.google.com/maps?q=${hotel.coords}`,
        '_blank'
      );

    }
  );

}


// ======================
// VOZ
// ======================

if(voiceToggle){

  voiceToggle.addEventListener(
    'change',
    ()=>{

      state.speechEnabled =
        voiceToggle.checked;

      saveAppState();

    }
  );

}


// ======================
// MODAL HOTEL
// ======================

if(btnAdicionarHotel){

  btnAdicionarHotel.addEventListener(
    'click',
    ()=>{

      modal?.classList.add(
        'active'
      );

    }
  );

}

if(btnCloseModal){

  btnCloseModal.addEventListener(
    'click',
    ()=>{

      modal?.classList.remove(
        'active'
      );

    }
  );

}


// ======================
// SALVAR HOTEL
// ======================

if(btnSalvarHotel){

  btnSalvarHotel.addEventListener(
    'click',
    ()=>{

      const coords =
        parseCoords(
          newCoords.value
        );

      if(
        !newName.value ||
        !newAddress.value ||
        !coords
      ){

        alert(
          'Preencha corretamente.'
        );

        return;

      }

      HOTELS.push({

        id: Date.now(),

        name:
          newName.value,

        region:
          newRegion.value,

        address:
          newAddress.value,

        coords:
          newCoords.value,

        custom:true

      });

      saveCustomHotels();

      renderSelection();

      modal?.classList.remove(
        'active'
      );

    }
  );

}


// ======================
// FOTO ENTREGA
// ======================

if(deliveryPhotosInput){

  deliveryPhotosInput
  .addEventListener(
    'change',
    async e=>{

      if(
        state.currentIndex >=
        state.routeReport.length
      ){
        return;
      }

      const images =
        await readFilesAsBase64(
          e.target.files
        );

      const ids = [];

      for(const image of images){

        const id =
          crypto.randomUUID();

        await savePhoto({
          id,
          image
        });

        ids.push(id);

      }

      state.routeReport[
        state.currentIndex
      ]
      .deliveryPhotos
      .push(...ids);

      saveAppState();

    }
  );

}


// ======================
// FOTO COLETA
// ======================

if(pickupPhotosInput){

  pickupPhotosInput
  .addEventListener(
    'change',
    async e=>{

      if(
        state.currentIndex >=
        state.routeReport.length
      ){
        return;
      }

      const images =
        await readFilesAsBase64(
          e.target.files
        );

      const ids = [];

      for(const image of images){

        const id =
          crypto.randomUUID();

        await savePhoto({
          id,
          image
        });

        ids.push(id);

      }

      state.routeReport[
        state.currentIndex
      ]
      .pickupPhotos
      .push(...ids);

      saveAppState();

    }
  );

}


// ======================
// INIT
// ======================

export function initEvents(){

  console.log(
    'Eventos iniciados'
  );

}
