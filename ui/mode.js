// ui/mode.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  telaNavegacao,

  currentHotelEl,
  nextTwoEl,

  chkEntrega,
  chkColeta,

  btnProximo

}
from './elements.js';

import {

  renderReportMode

}
from './report.js';

import {

  initMap,
  updateMap

}
from '../services/map.js';

import {

  startGpsTracking,
  stopGpsTracking

}
from '../services/gps.js';

import {

  saveAppState

}
from '../storage/storage.js';


// ======================
// INICIAR MODO ROTA
// ======================

export function startModeRoute(){

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

  state.mapInitialized =
    false;

  initMap();

  updateMap();

  startGpsTracking();

  updateModeUI();

  renderReportMode();

  renderPhotoPreviews();

  saveAppState();

}


// ======================
// UPDATE UI
// ======================

export function updateModeUI(){

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){

    currentHotelEl.innerHTML = `

      <div>

        <strong>
          Rota finalizada
        </strong>

      </div>

    `;

    nextTwoEl.innerHTML = '';

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

  currentHotelEl.innerHTML = `

    <div style="font-weight:700">

      ${hotel.name}

    </div>

    <div class="muted">

      ${hotel.address}

    </div>

  `;

  renderNextHotels();

  const entry =
    state.routeReport[
      state.currentIndex
    ];

  chkEntrega.checked =
    entry.entrega;

  chkColeta.checked =
    entry.coleta;

  updateNextButton();

}


// ======================
// PRÓXIMOS HOTÉIS
// ======================

function renderNextHotels(){

  nextTwoEl.innerHTML = '';

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

    if(!hotel) continue;

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

    nextTwoEl.appendChild(div);

  }

}


// ======================
// TEXTO BOTÃO
// ======================

function updateNextButton(){

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

export function nextHotel(){

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

  const now =
    new Date().toISOString();

  if(!entry.arrival){

    entry.arrival = now;

  }

  entry.departure = now;

  entry.entrega =
    chkEntrega.checked;

  entry.coleta =
    chkColeta.checked;

  state.arrivalConfirmed =
    false;

  state.currentIndex++;

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){

    finishModeRoute();

    return;

  }

  updateModeUI();

  renderReportMode();

  updateMap();

  renderPhotoPreviews();

  saveAppState();

}


// ======================
// FINALIZAR
// ======================

export function finishModeRoute(){

  stopGpsTracking();

  updateModeUI();

  renderReportMode();

  saveAppState();

}


// ======================
// FOTO PREVIEW
// ======================

function renderPhotoPreviews(){

  // evitar erro temporário
  // enquanto previews não foram migrados

}
