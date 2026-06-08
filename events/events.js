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
  btnFollow,

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
  telaNavegacao,
  filtroRegiao
}
from '../ui/elements.js';

import { mostrarTela } from '../ui/screens.js';
import { gerarRota,
  renderizarSelecao
} from '../ui/selection.js';

import { renderizarRota, atualizarMapa, ordenarAuto } from '../ui/route.js';


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

// No topo do events.js, junto com os outros imports
import {
  getMapa,
  mapas,
  adicionarMarcadoresSequencia,
  desenharRotaPlanejada,
  ajustarMapaRota,
  atualizarMarcadoresStatus,
  limparMapaRota,
  inicializarMapaRota
} from '../services/map.js';

// ======================
// BOTÃO CRIAR ROTA - VERSÃO ESTÁVEL
// ======================
if (btnCriarRota) {
  btnCriarRota.addEventListener('click', () => {
    gerarRota();
    mostrarTela(telaRota);
    atualizarMapa();
  });
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
      atualizarMapa();

      salvarEstadoApp();

    }
  );

}
// ======================
// CENTRALIZAR MAPA
// ======================
if(btnFollow){

  btnFollow.addEventListener(
    'click',
    ()=>{

      const map = getMapa('mapa');

      if(
        !map ||
        !state.userPosition
      ){
        return;
      }

      state.cameraFollowing = true;

      map.flyTo({

        center:[
          state.userPosition.lng,
          state.userPosition.lat
        ],

        zoom:18,

        duration:1000

      });

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
// ORDEM AUTO
// ======================

const btnOrdemAuto = document.getElementById('btn-ordem-auto');
if(btnOrdemAuto){
  btnOrdemAuto.addEventListener('click', () => {
    ordenarAuto();
  });
}


// ======================
// ATUALIZAR MAPA
// ======================

const btnAtualizarMapa = document.getElementById('btn-atualizar-mapa');
if(btnAtualizarMapa){
  btnAtualizarMapa.addEventListener('click', () => {
    atualizarMapa();
  });
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
      if (getMapa('mapa')) {
    setTimeout(() => {
        getMapa('mapa').resize();
    }, 150);
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
  checkEntrega?.checked ?? false;

  entry.coleta =
  checkColeta?.checked ?? false;

      if(!entry.arrival){

  entry.arrival =
    new Date().toISOString();

}
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
// FILTRO DE REGIÃO
// ======================


document
  .querySelectorAll(
    '.chip-regiao'
  )
  .forEach(chip => {

    chip.addEventListener(
      'click',
      () => {

        document
          .querySelectorAll(
            '.chip-regiao'
          )
          .forEach(c =>
            c.classList.remove(
              'ativo'
            )
          );

        chip.classList.add(
          'ativo'
        );

        state.selectedRegion =
          chip.dataset.region;

        renderizarSelecao();

      }
    );

  });
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

  id: r.id,

  name:
    hotel?.name || '',

  arrival:
    r.arrival,

  departure:
    r.departure,

  entrega:
    r.entrega,

  coleta:
    r.coleta,

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
// NOVA ROTA (CORRIGIDO)
// ======================

if(btnNovaRota){
  btnNovaRota.addEventListener(
    'click',
    ()=>{
      stopGpsTracking();

      // 1. Limpa o estado
      state.activeSet.clear();
      state.routeOrder = [];
      state.routeReport = [];
      state.currentIndex = 0;

      // 2. ADICIONE ISSO: Limpa os desenhos do mapa
      // Certifique-se de que esta função remove as layers e sources do MapLibre
      limparMapaRota(); 

      // 3. Atualiza a UI
      renderizarSelecao();
      salvarEstadoApp();
      mostrarTela(telaSelecao);
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
        `https://www.google.com/maps?q=${hotel.lat},${hotel.lng}`,
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

      state.voiceNavigation =
        toggleVoz.checked;

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
