// ui/mode.js

import {
  inicializarMapa,
  updateMap,
  mapas,
  adicionarMarcadoresHoteis
}
from '../services/map.js';

import {
  HOTELS
}
from '../data/dados.js';

import {
  state
}
from '../core/state.js';

import {

  telaNavegacao,

  hotelAtual,
  proximosHoteis,
  toggleVoz,

  checkEntrega,
  checkColeta,

  btnProximo,

  previewEntrega,
  previewColeta

}
from './elements.js';

import {

  renderizarRelatorioModo,
  abrirTelaRelatorio

}
from './report.js';

import {

  startGpsTracking,
  stopGpsTracking

}
from '../services/gps.js';

import {

  salvarEstadoApp

}
from '../storage/storage.js';


// ======================
// INICIAR MODO ROTA
// ======================

export function iniciarModoRota(){
  
  if(toggleVoz){

  toggleVoz.checked = false;

  toggleVoz.addEventListener(
    'change',
    ()=>{

      state.voiceNavigation =
        toggleVoz.checked;

      salvarEstadoApp();

    }
  );

}
  if(
    state.routeOrder.length === 0
  ){

    alert(
      'Gere a rota primeiro.'
    );

    return;

  }

  state.currentIndex = 0;

  state.arrivalConfirmed =
    false;

  state.routeReport =
    state.routeOrder.map(id => ({

      id,

      arrival:null,
      departure:null,

      entrega:false,
      coleta:false,

      deliveryPhotos:[],
      pickupPhotos:[]

    }));

  state.mapInitialized = false;

  const primeiroHotel =
  HOTELS.find(h =>
    h.id === state.routeOrder[0]
  );

  if (primeiroHotel) {

    const lat =
      Number(primeiroHotel.lat);

    const lng =
      Number(primeiroHotel.lng);

    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {

      console.error(
        'Hotel sem coordenadas válidas',
        primeiroHotel
      );

    }

  }

  setTimeout(() => {

  const mapa = inicializarMapa('mapa');

  if (mapa) {
    mapa.resize();
  }

}, 300);
  
  if(

  state.userPosition &&

  typeof state.userPosition.lat === 'number' &&
  typeof state.userPosition.lng === 'number' &&

  !isNaN(state.userPosition.lat) &&
  !isNaN(state.userPosition.lng)

){

  updateMap(

    state.userPosition.lat,
    state.userPosition.lng,
    state.userPosition.heading || 0,
    state.userPosition.speed || 0

  );

}
  startGpsTracking();

  atualizarModoUI();

  renderizarRelatorioModo();

  renderizarPreviewsFotos();

  salvarEstadoApp();

}


// ======================
// UPDATE UI
// ======================

export function atualizarModoUI(){

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){

    if(hotelAtual){

      hotelAtual.innerHTML = `

        <div>

          <strong>
            Rota finalizada
          </strong>

        </div>

      `;

    }

    if(proximosHoteis){

      proximosHoteis.innerHTML = '';

    }

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

if (
  hotel &&
  mapas['mapa']
) {

  const lat = Number(hotel.lat);
  const lng = Number(hotel.lng);

  if (
    !isNaN(lat) &&
    !isNaN(lng)
  ) {

    mapas['mapa'].flyTo({
      center: [lng, lat],
      zoom: 16,
      duration: 1500
    });

  }

}

  if(!hotel){
    return;
  }

  if (hotel) {

  adicionarMarcadoresHoteis(
    [hotel],
    'mapa'
  );

}
  
  if(hotelAtual){

    hotelAtual.innerHTML = `

      <div style="font-weight:700">

        ${hotel.name}

      </div>

      <div class="muted">

        ${hotel.address}

      </div>

    `;

  }

  renderizarProximosHoteis();

  const entry =
    state.routeReport[
      state.currentIndex
    ];

  if(checkEntrega){

    checkEntrega.checked =
      entry.entrega;

  }

  if(checkColeta){

    checkColeta.checked =
      entry.coleta;

  }

  atualizarTextoBotao();

}


// ======================
// PRÓXIMOS HOTÉIS
// ======================

function renderizarProximosHoteis(){

  if(!proximosHoteis){
    return;
  }

  proximosHoteis.innerHTML = '';

  for(let i = 1; i <= 2; i++){

    const idx =
      state.currentIndex + i;

    if(
      idx >=
      state.routeOrder.length
    ){
      continue;
    }

    const hotel =
      HOTELS.find(
        h =>
          h.id ===
          state.routeOrder[idx]
      );

    if(!hotel){
      continue;
    }

    const div =
      document.createElement('div');

    div.className =
      'next-card';

    div.innerHTML = `

      <strong>

        ${hotel.name}

      </strong>

      <div
        class="muted"
        style="font-size:0.85rem"
      >

        ${hotel.address}

      </div>

    `;

    proximosHoteis
      .appendChild(div);

  }

}


// ======================
// TEXTO BOTÃO
// ======================

function atualizarTextoBotao(){

  if(!btnProximo){
    return;
  }

  if(
    state.currentIndex ===
    state.routeOrder.length - 1
  ){

    btnProximo.textContent =
      'Finalizar';

  }else{

    btnProximo.textContent =
      'Próximo hotel';

  }

}


// ======================
// PRÓXIMO HOTEL
// ======================

export async function proximoHotel(){

  if(
  state.currentIndex >=
  state.routeOrder.length
){

  await finalizarModoRota();

  return;

}

  const entry =
    state.routeReport[
      state.currentIndex
    ];

  const agora =
    new Date().toISOString();

  if(!entry.arrival){

    entry.arrival = agora;

  }

  entry.departure = agora;

  entry.entrega =
    checkEntrega.checked;

  entry.coleta =
    checkColeta.checked;

  state.arrivalConfirmed =
    false;

  state.currentIndex++;

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){

    finalizarModoRota();

    return;

  }

  atualizarModoUI();

  renderizarRelatorioModo();

  if (mapas['mapa']) {
    mapas['mapa'].resize();
  }

  updateMap();

  renderizarPreviewsFotos();

  salvarEstadoApp();

}


// ======================
// FINALIZAR
// ======================

export async function finalizarModoRota(){

  stopGpsTracking();

  atualizarModoUI();

  renderizarRelatorioModo();

  salvarEstadoApp();
  console.log(
  'STATE ROUTE REPORT FINAL',
  state.routeReport
);

  await abrirTelaRelatorio(
    state.routeReport
  );

}


// ======================
// FOTO PREVIEW
// ======================

function renderizarPreviewsFotos(){

  if(previewEntrega){

    previewEntrega.innerHTML = '';

  }

  if(previewColeta){

    previewColeta.innerHTML = '';

  }

}
