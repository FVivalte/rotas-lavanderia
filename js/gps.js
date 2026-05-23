// core/gps.js

import { state } from './state.js';

import {
  renderReportMode,
  updateModeUI
} from '../ui/render.js';

import {
  updateMap
} from './map.js';

import {
  parseCoords,
  getDistanceMeters
} from '../utils/helpers.js';

import { HOTELS } from '../data/dados.js';


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

        const newPosition = {

          lat: pos.coords.latitude,
          lng: pos.coords.longitude

        };

        const heading =
          pos.coords.heading;

        state.userPosition =
          newPosition;

        // CENTRALIZA PRIMEIRA VEZ

        if(
          state.map &&
          !state.mapInitialized
        ){

          state.map.setView(
            [
              state.userPosition.lat,
              state.userPosition.lng
            ],
            17
          );

          state.mapInitialized = true;

        }

        // AUTO PAN

        if(state.map){

          state.map.panTo(
            [
              state.userPosition.lat,
              state.userPosition.lng
            ],
            {
              animate:true,
              duration:1
            }
          );

        }

        // ROTAÇÃO

        if(
          heading !== null &&
          !isNaN(heading)
        ){

          rotateMap(heading);

        }

        checkArrival();

        updateMap();

      },

      err => {

        console.log(err);

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

export function checkArrival(){

  if(
    state.currentIndex >=
    state.routeOrder.length
  ) return;

  if(state.arrivalConfirmed)
    return;

  const id =
    state.routeOrder[
      state.currentIndex
    ];

  const hotel =
    HOTELS.find(
      h => h.id === id
    );

  if(!hotel) return;

  const parsed =
    parseCoords(hotel.coords);

  if(!parsed) return;

  if(!state.userPosition)
    return;

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

      renderReportMode();

      updateModeUI();

    }else{

      state.arrivalConfirmed = false;

    }

  }

}


// ======================
// ROTATE MAP
// ======================

export function rotateMap(angle){

  if(!state.map) return;

  const mapPane =
    state.map.getPane('mapPane');

  mapPane.style.transformOrigin =
    '50% 50%';

  mapPane.style.transition =
    'transform 0.5s linear';

  mapPane.style.transform =
    `rotate(${-angle}deg)`;

}
