// map/map.js

import { state } from '../core/state.js';
import { HOTELS } from '../data/dados.js';

import {
  currentHotelEl
} from '../ui/elements.js';


// =========================
// INIT MAP
// =========================

export function initMap(){

  if(state.map) return;

  state.map = L.map('map',{

    zoomControl:true,
    dragging:true,
    touchZoom:true,
    doubleClickZoom:true,
    scrollWheelZoom:true

  }).setView(
    [-22.75, -41.88],
    13
  );

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:'© OpenStreetMap'
    }
  ).addTo(state.map);

}


// =========================
// ROTATE MAP
// =========================

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


// =========================
// PARSE COORDS
// =========================

export function parseCoords(coords){

  if(!coords) return null;

  const parts = coords.split(',');

  if(parts.length !== 2)
    return null;

  const lat =
    Number(parts[0].trim());

  const lng =
    Number(parts[1].trim());

  if(
    isNaN(lat) ||
    isNaN(lng)
  ){
    return null;
  }

  return { lat, lng };

}


// =========================
// DISTÂNCIA
// =========================

export function getDistanceMeters(
  lat1,
  lon1,
  lat2,
  lon2
){

  const R = 6371e3;

  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;

  const Δφ =
    (lat2-lat1) * Math.PI/180;

  const Δλ =
    (lon2-lon1) * Math.PI/180;

  const a =

    Math.sin(Δφ/2) *
    Math.sin(Δφ/2)

    +

    Math.cos(φ1) *
    Math.cos(φ2) *

    Math.sin(Δλ/2) *
    Math.sin(Δλ/2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    );

  return R * c;

}


// =========================
// UPDATE MAP
// =========================

export function updateMap(){

  if(!state.map) return;

  if(
    state.currentIndex >=
    state.routeOrder.length
  ){
    return;
  }

  const currentHotel =
    HOTELS.find(
      h =>
        h.id ===
        state.routeOrder[
          state.currentIndex
        ]
    );

  if(!currentHotel) return;

  const parsed =
    parseCoords(
      currentHotel.coords
    );

  if(!parsed){

    alert(
      `Coordenadas inválidas em ${currentHotel.name}`
    );

    return;
  }

  const hotelLat = parsed.lat;
  const hotelLng = parsed.lng;

  const waypoints = [];

  // usuário

  if(state.userPosition){

    waypoints.push(
      L.latLng(
        state.userPosition.lat,
        state.userPosition.lng
      )
    );

  }

  // hotel atual

  waypoints.push(
    L.latLng(
      hotelLat,
      hotelLng
    )
  );

  // próximos hotéis

  for(let i = 1; i <= 2; i++){

    const idx =
      state.currentIndex + i;

    if(
      idx <
      state.routeOrder.length
    ){

      const nextHotel =
        HOTELS.find(
          h =>
            h.id ===
            state.routeOrder[idx]
        );

      if(!nextHotel) continue;

      const nextParsed =
        parseCoords(
          nextHotel.coords
        );

      if(nextParsed){

        waypoints.push(
          L.latLng(
            nextParsed.lat,
            nextParsed.lng
          )
        );

      }

    }

  }

  // rota

  if(!state.routingControl){

    state.routingControl =
      L.Routing.control({

        waypoints,

        routeWhileDragging:false,

        addWaypoints:false,

        draggableWaypoints:false,

        fitSelectedRoutes:false,

        show:false,

        createMarker:(i,wp)=>{
          return L.marker(
            wp.latLng
          );
        }

      }).addTo(state.map);

  }else{

    state.routingControl
      .setWaypoints(
        waypoints
      );

  }

}


// =========================
// CENTRALIZAR USUÁRIO
// =========================

export function centerUser(){

  if(
    !state.map ||
    !state.userPosition
  ){
    return;
  }

  state.map.setView(
    [
      state.userPosition.lat,
      state.userPosition.lng
    ],
    17
  );

}


// =========================
// PAN SUAVE
// =========================

export function panToUser(){

  if(
    !state.map ||
    !state.userPosition
  ){
    return;
  }

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


// =========================
// LIMPAR ROTA
// =========================

export function clearRoute(){

  if(
    state.map &&
    state.routingControl
  ){

    state.map.removeControl(
      state.routingControl
    );

    state.routingControl = null;

  }

}


// =========================
// OPEN GOOGLE MAPS
// =========================

export function openCurrentHotelInMaps(){

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
