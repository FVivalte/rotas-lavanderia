// services/gps.js
import { state } from '../core/state.js';
import { updateMap, desenharRotaOSRM } from './map.js';
import { obterRota } from './osrm.js';
import { getDistanceMeters } from '../utils/utils.js'; // Removido o parseCoords desnecessário
import { atualizarModoUI } from '../ui/mode.js';
import { renderizarRelatorioModo } from '../ui/report.js';
import { HOTELS } from '../data/dados.js';
import { falar } from './voice.js';

// ======================
// START GPS
// ======================
export function startGpsTracking() {
  if (!navigator.geolocation) {
    alert('GPS não suportado neste navegador/dispositivo.');
    return;
  }

  state.watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const heading = pos.coords.heading || 0;
      const speed = pos.coords.speed || 0;

      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        isNaN(lat) ||
        isNaN(lng)
      ) {
        console.error('GPS inválido', { lat, lng });
        return;
      }

      state.userPosition = {
        lat,
        lng,
        heading,
        speed
      };

      const hotelId =
  state.routeOrder[
    state.currentIndex
  ];

const hotel =
  HOTELS.find(
    h => h.id === hotelId
  );

if(hotel){

  obterRota(

    lat,
    lng,

    Number(hotel.lat),
    Number(hotel.lng)

  )
  .then(rota=>{

    if(!rota) return;

    desenharRotaOSRM(
      rota.geometry.coordinates,
      'mapa'
    );

  });

}

      console.log('Posição atualizada:', { lat, lng, heading, speed });

      // Atualiza a posição visual no mapa
      updateMap(lat, lng, heading, speed);

      // Verifica se o motorista chegou perto do hotel atual da rota
      verificarChegada();
    },
    err => {
      console.error('Erro de leitura do GPS:', err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000 // Aumentado para 10s para evitar quedas em conexões oscilantes
    }
  );
}

// ======================
// STOP GPS
// ======================
export function stopGpsTracking() {
  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
  }
}

// ======================
// CHECK ARRIVAL
// ======================
export function verificarChegada() {
  // Evita rodar se a rota já terminou
  if (state.currentIndex >= state.routeOrder.length) {
    return;
  }

  // Evita disparar múltiplos alerts se já confirmou a chegada neste ponto
  if (state.arrivalConfirmed) {
    return;
  }

  // Pega o ID do hotel atual na sequência da rota
  const id = state.routeOrder[state.currentIndex];

  // Busca o hotel correspondente na lista do arquivo dados.js
  const hotel = HOTELS.find(h => h.id === id);

  if (!hotel) {
    console.warn(`Hotel com ID ${id} não foi encontrado em dados.js`);
    return;
  }

  if (!state.userPosition) {
    return;
  }

  // CORREÇÃO: Pegando direto as propriedades lat e lng do objeto do hotel
  const distance = getDistanceMeters(
    state.userPosition.lat,
    state.userPosition.lng,
    hotel.lat,
    hotel.lng
  );

  // Se estiver a menos de 90 metros do local
  if (distance <= 90) {

  state.arrivalConfirmed = true;

  // Fala somente se o switch estiver ligado
  if (state.voiceNavigation) {

    falar(
      `Você chegou ao hotel ${hotel.name}`
    );

  }

  const ok = confirm(
    `Você chegou em: ${hotel.name}?`
  );

  if (ok) {

    state.routeReport[
      state.currentIndex
    ].arrival =
      new Date().toISOString();

    renderizarRelatorioModo();

    atualizarModoUI();

  }

  else {

    // Se clicar cancelar
    state.arrivalConfirmed = false;

  }

}
}
