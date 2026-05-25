// services/map-camera.js

// ======================
// CONFIG CAMERA
// ======================

let seguirUsuario = true;

let ultimaInteracao = 0;

const TEMPO_RETORNO_CAMERA = 5000;


// ======================
// BOTÃO SEGUIR
// ======================

export function alternarModoSeguir(){

  seguirUsuario = !seguirUsuario;

  atualizarBotaoSeguir();

}


// ======================
// LISTENERS MAPA
// ======================

export function configurarListenersCamera(
  mapa
){

  mapa.on(
    'dragstart',
    ()=>{

      seguirUsuario = false;

      ultimaInteracao =
        Date.now();

      atualizarBotaoSeguir();

    }
  );

  mapa.on(
    'zoomstart',
    ()=>{

      seguirUsuario = false;

      ultimaInteracao =
        Date.now();

      atualizarBotaoSeguir();

    }
  );

}


// ======================
// UPDATE CAMERA
// ======================

export function atualizarCamera(

  mapa,
  lng,
  lat,
  heading = 0,
  speed = 0

){

  const agora =
    Date.now();

  if(!seguirUsuario){

    if(
      agora - ultimaInteracao >
      TEMPO_RETORNO_CAMERA
    ){

      seguirUsuario = true;

      atualizarBotaoSeguir();

    }else{

      return;

    }

  }

  const zoom =
    obterZoomPorVelocidade(
      speed
    );

  mapa.easeTo({

    center:[lng,lat],

    zoom,

    bearing:heading,

    pitch:55,

    duration:1000,

    essential:true

  });

}


// ======================
// ZOOM DINÂMICO
// ======================

function obterZoomPorVelocidade(
  speed
){

  const kmh =
    speed * 3.6;

  if(kmh < 5)
    return 17.5;

  if(kmh < 20)
    return 16.5;

  if(kmh < 40)
    return 15.5;

  if(kmh < 70)
    return 14.5;

  return 13.5;

}


// ======================
// BOTÃO FOLLOW
// ======================

function atualizarBotaoSeguir(){

  const btn =
    document.getElementById(
      'follow-btn'
    );

  if(!btn) return;

  if(seguirUsuario){

    btn.classList.add(
      'active'
    );

  }else{

    btn.classList.remove(
      'active'
    );

  }

}
