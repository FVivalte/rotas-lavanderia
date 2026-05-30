// events/events.js

import { HOTELS } from '../data/dados.js';
import { state } from '../core/state.js';
import {

  btnVoltar,
  btnIniciarRota,
  btnExportar,
  btnFinalizar,
  btnNovaRota,
  btnGoogleMaps,

  btnAdicionarHotel,
  btnSalvarHotel,
  btnFecharModal,

  btnProximo,
  btnCriarRota,
  btnLimpar,

  toggleVoz,

  checkEntrega,
  checkColeta,

  inputNomeHotel,
  inputRegiaoHotel,
  inputEnderecoHotel,
  inputCoordsHotel,

  modalHotel,

  inputFotosEntrega,
  inputFotosColeta,

  telaSelecao,
  telaRota,
  telaNavegacao
}
from '../ui/elements.js';

import { mostrarTela } from '../ui/screens.js';
import { gerarRota,
  renderizarSelecao
} from '../ui/selection.js';

import {
  renderizarRota
}
from '../ui/route.js';


import {

  iniciarModoRota,
  atualizarModoUI

}
from '../ui/mode.js';


import {

  abrirTelaRelatorio,
  renderizarRelatorioModo

}
from '../ui/report.js';


import {

  parseCoords,
  readFilesAsBase64

}
from '../utils/utils.js';


import {

  salvarEstadoApp,
  salvarHoteisCustomizados

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
// GERAR ROTA
// ======================

if(btnCriarRota){

  btnCriarRota.addEventListener(
    'click',
    ()=>{

      gerarRota();

      renderizarRota();

      mostrarTela(telaRota);

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

      renderizarSelecao();

      renderizarRota();

      salvarEstadoApp();

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

      mostrarTela(
        telaSelecao
      );

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

      iniciarModoRota();

      mostrarTela(
        telaNavegacao
      );
      if (mapas['mapa']) {
    setTimeout(() => {
        mapas['mapa'].resize();
    }, 150); // O tempo garante que o CSS terminou de processar
}

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
        checkEntrega.checked;

      entry.coleta =
        checkColeta.checked;

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

      atualizarModoUI();

      renderizarRelatorioModo();

      salvarEstadoApp();

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

      abrirTelaRelatorio(
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

      renderizarSelecao();

      salvarEstadoApp();

      mostrarTela(
        telaSelecao
      );

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

if(toggleVoz){

  toggleVoz.addEventListener(
    'change',
    ()=>{

      state.speechEnabled =
        toggleVoz.checked;

      salvarEstadoApp();

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

      modalHotel?.classList.add(
        'active'
      );

    }
  );

}


if(btnFecharModal){

  btnFecharModal.addEventListener(
    'click',
    ()=>{

      modalHotel?.classList.remove(
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
          inputCoordsHotel.value
        );

      if(
        !inputNomeHotel.value ||
        !inputEnderecoHotel.value ||
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
    inputNomeHotel.value,

  region:
    inputRegiaoHotel.value,

  address:
    inputEnderecoHotel.value,

  lat: coords.lat,

  lng: coords.lng,

  custom: true

});
      
salvarHoteisCustomizados();

      renderizarSelecao();

      modalHotel?.classList.remove(
        'active'
      );

    }
  );

}


// ======================
// FOTO ENTREGA
// ======================

if(inputFotosEntrega){

  inputFotosEntrega
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
      .deliveryPhotos ??= [];

      state.routeReport[
        state.currentIndex
      ]
      .deliveryPhotos
      .push(...ids);

      salvarEstadoApp();

    }
  );

}


// ======================
// FOTO COLETA
// ======================

if(inputFotosColeta){

  inputFotosColeta
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
      .pickupPhotos ??= [];

      state.routeReport[
        state.currentIndex
      ]
      .pickupPhotos
      .push(...ids);

      salvarEstadoApp();

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
