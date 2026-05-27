// services/map-camera.js

import { state }
from '../core/state.js';


// =========================
// CONFIG
// =========================

const CAMERA_CONFIG = {

  zoom:17,

  pitch:60,

  animationDuration:1000

};


// =========================
// LISTENERS
// =========================

export function configurarListenersCamera(
  map
){

  map.on(
    'dragstart',
    ()=>{

      state.cameraFollowing =
        false;

    }
  );

}


// =========================
// ATUALIZAR CAMERA
// =========================

export function atualizarCamera(

  map,

  lat,
  lng,

  heading = 0,
  speed = 0

){

  if(

    typeof lat !== 'number' ||
    typeof lng !== 'number' ||

    isNaN(lat) ||
    isNaN(lng)

  ){

    console.error(
      'Camera coordenadas inválidas',
      { lat, lng }
    );

    return;

  }

  if(!state.cameraFollowing){
    return;
  }

  map.easeTo({

    center:[
      lng,
      lat
    ],

    zoom:
      CAMERA_CONFIG.zoom,

    pitch:
      CAMERA_CONFIG.pitch,

    bearing:
      heading || 0,

    duration:
      CAMERA_CONFIG.animationDuration

  });

}
