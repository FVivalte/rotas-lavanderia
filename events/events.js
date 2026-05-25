// events/events.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  btnBack,
  btnStartRoute,
  btnExport,
  btnFinish,
  btnNewRoute,
  btnOpenMaps,

  btnAddHotel,
  btnSaveHotel,
  btnCloseModal,

  btnNext,

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

  screenSelect,
  screenRoute,
  screenMode

} from '../ui/elements.js';


import {
  generateRoute,
  renderSelection,
  renderRoute
} from '../ui/selection.js';


import {

  startModeRoute,
  updateModeUI

} from '../ui/mode.js';


import {

  hideAllScreens,
  openReportScreen,
  renderReportMode

} from '../ui/report.js';


import {

  parseCoords,
  readFilesAsBase64

} from '../utils/utils.js';


import {

  saveAppState,
  saveCustomHotels

} from '../storage/storage.js';


import {

  stopGpsTracking

} from '../services/gps.js';


import {

  savePhoto

} from '../storage/database.js';


// ======================
// BOTÕES NOVOS
// ======================

const btnCreateRoute =
  document.getElementById(
    'btnCreateRoute'
  );

const btnClear =
  document.getElementById(
    'btnClear'
  );


// ======================
// GERAR ROTA
// ======================

if(btnCreateRoute){

  btnCreateRoute.addEventListener(
    'click',
    generateRoute
  );

}


// ======================
// LIMPAR ROTA
// ======================

if(btnClear){

  btnClear.addEventListener(
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

if(btnBack){

  btnBack.addEventListener(
    'click',
    ()=>{

      stopGpsTracking();

      screenSelect.style.display =
        'block';

      screenRoute.style.display =
        'none';

      screenMode.style.display =
        'none';

    }
  );

}


// ======================
// INICIAR ROTA
// ======================

if(btnStartRoute){

  btnStartRoute.addEventListener(
    'click',
    startModeRoute
  );

}


// ======================
// PRÓXIMO HOTEL
// ======================

if(btnNext){

  btnNext.addEventListener(
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

        btnFinish?.click();

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

if(btnFinish){

  btnFinish.addEventListener(
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

if(btnNewRoute){

  btnNewRoute.addEventListener(
    'click',
    ()=>{

      stopGpsTracking();

      state.activeSet.clear();

      state.routeOrder = [];

      state.routeReport = [];

      state.currentIndex = 0;

      hideAllScreens();

      screenSelect.style.display =
        'block';

      renderSelection();

      saveAppState();

    }
  );

}


// ======================
// EXPORT JSON
// ======================

if(btnExport){

  btnExport.addEventListener(
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

if(btnOpenMaps){

  btnOpenMaps.addEventListener(
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
    'click',
    ()=>{

      state.speechEnabled =
        !state.speechEnabled;

      if(state.speechEnabled){

        voiceToggle.textContent =
          '🔊 Voz ligada';

      }else{

        voiceToggle.textContent =
          '🔇 Voz desligada';

      }

      saveAppState();

    }
  );

}


// ======================
// MODAL HOTEL
// ======================

if(btnAddHotel){

  btnAddHotel.addEventListener(
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

if(btnSaveHotel){

  btnSaveHotel.addEventListener(
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
