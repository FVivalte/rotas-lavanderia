// services/map.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  atualizarCamera,
  configurarListenersCamera

}
from './map-camera.js';


// =========================
// MAPA PRINCIPAL
// =========================

let marcadorUsuario;


// =========================
// INIT MAP
// =========================

export function initMap(){

  map = new maplibregl.Map({

    container:'mapa',

    style:'https://demotiles.maplibre.org/style.json',

    center:[-41.882, -22.757],

    zoom:12,

    pitch:45,

    bearing:0,

    antialias:true

  });

  state.map.addControl(

    new maplibregl.NavigationControl(),

    'top-right'

  );

  state.map.on(
    'load',
    ()=>{

      adicionarHoteis();

    }
  );

  configurarListenersCamera(
    state.map
  );

  state.mapInitialized = true;

}


// =========================
// HOTÉIS
// =========================

function adicionarHoteis(){

  HOTELS.forEach(hotel=>{

    if(!hotel.coords){
      return;
    }

    const partes =
      hotel.coords.split(',');

    if(partes.length < 2){
      return;
    }

    const lat =
      Number(partes[0]);

    const lng =
      Number(partes[1]);

    const el =
      document.createElement('div');

    el.className =
      'hotel-marker';

    el.innerHTML = '🏨';

    new maplibregl.Marker(el)

      .setLngLat([
        lng,
        lat
      ])

      .setPopup(

        new maplibregl.Popup({
          offset:25
        })

        .setHTML(`

          <strong>
            ${hotel.name}
          </strong>

          <br>

          ${hotel.region}

        `)

      )

      .addTo(state.map);

  });

}


// =========================
// MARCADOR USUÁRIO
// =========================

function atualizarMarcadorUsuario(
  lng,
  lat
){

  if(!marcadorUsuario){

    const el =
      document.createElement('div');

    el.className =
      'user-marker';

    el.innerHTML = '📍';

    marcadorUsuario =
      new maplibregl.Marker(el)

        .setLngLat([
          lng,
          lat
        ])

        .addTo(state.map);

    return;

  }

  marcadorUsuario.setLngLat([
    lng,
    lat
  ]);

}


// =========================
// UPDATE MAP
// =========================

export function updateMap(

  lng,
  lat,
  heading = 0,
  speed = 0

){

  if(!state.map){
    return;
  }

  atualizarMarcadorUsuario(
    lng,
    lat
  );

  atualizarCamera(

    state.map,

    lng,
    lat,

    heading,
    speed

  );

}


// =========================
// EXPORT MAP
// =========================

export const map =
  ()=> state.map;
