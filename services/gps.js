// services/gps.js

import { state }
from '../core/state.js';

import {
  updateMap
}
from './map.js';

import {
  parseCoords,
  getDistanceMeters
}
from '../utils/utils.js';

import {
  atualizarModoUI
}
from '../ui/mode.js';

import {
  renderizarRelatorioModo
}
from '../ui/report.js';

import { HOTELS }
from '../data/dados.js';


// ======================
// START GPS
// ======================

export function startGpsTracking(){

  if(!navigator.geolocation){

    alert('GPS não suportado');

    return;

  }

  state.watchId =
    navigator.geolocation.watchPosition(

      pos => {

        const lat =
          pos.coords.latitude;

        const lng =
          pos.coords.longitude;

        const heading =
          pos.coords.heading || 0;

        const speed =
          pos.coords.speed || 0;

        if(

          typeof lat !== 'number' ||
          typeof lng !== 'number' ||

          isNaN(lat) ||
          isNaN(lng)

        ){

          console.error(
            'GPS inválido',
            { lat, lng }
          );

          return;

        }

        state.userPosition = {

          lat,
          lng,
          heading,
          speed

        };

        console.log({

          lat,
          lng,
          heading,
          speed

        });

        updateMap(

          lat,
          lng,
          heading,
          speed

        );

        verificarChegada();

      },

      err => {

        console.log(
          'Erro GPS:',
          err
        );

      },

      {

        enableHighAccuracy:true,
        maximumAge:1000,
        timeout:5000

      }

    );

}


// ======================
// STOP GPS
// ======================

export function stopGpsTracking(){

  if(state.watchId !== null){

    navigator.geolocation.clearWatch(
      state.watchId
    );

    state.watchId = null;

  }

}


// ======================
// CHECK ARRIVAL
// ======================

export function verificarChegada(){

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){
    return;
  }

  if(state.arrivalConfirmed){
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

  if(!hotel){
    return;
  }

  const parsed =
    parseCoords(hotel.coords);

  if(!parsed){
    return;
  }

  if(!state.userPosition){
    return;
  }

  const distance =
    getDistanceMeters(

      state.userPosition.lat,
      state.userPosition.lng,

      parsed.lat,
      parsed.lng

    );

  if(distance <= 90){

    state.arrivalConfirmed = true;

    const ok = confirm(
      `Você chegou em ${hotel.name}?`
    );

    if(ok){

      state.routeReport[
        state.currentIndex
      ].arrival =
        new Date().toISOString();

      renderizarRelatorioModo();

      atualizarModoUI();

    }else{

      state.arrivalConfirmed = false;

    }

  }

}
