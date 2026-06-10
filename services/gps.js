// services/gps.js
import { state } from '../core/state.js';
import { updateMap, desenharRotaOSRM } from './map.js';
import { obterRota } from './osrm.js';
import { getDistanceMeters } from '../utils/utils.js';
import { atualizarModoUI } from '../ui/mode.js';
import { renderizarRelatorioModo } from '../ui/report.js';
import { HOTELS } from '../data/dados.js';
import { falar } from './voice.js';
import { distanceInfo, durationInfo } from '../ui/elements.js';
import { carregarSteps, obterStepAtual, traduzirInstrucao } from './navigation.js';

// ======================
// START GPS
// ======================
export function startGpsTracking() {
  // BUG 2 CORRIGIDO: evita registrar múltiplos watchPosition se já estiver rodando
  if (state.watchId !== null) return;

  if (!navigator.geolocation) {
    alert('GPS não suportado neste navegador/dispositivo.');
    return;
  }

  state.watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      let heading = pos.coords.heading;
      if (heading === null || heading === undefined) {
        heading = state.lastHeading || 0;
      } else {
        state.lastHeading = heading;
      }

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

      state.userPosition = { lat, lng, heading, speed };

      // Reativa câmera ao atualizar posição na tela de navegação
      if (state.currentScreen === 'tela-navegacao') {
        state.cameraFollowing = true;
      }

      const hotelId = state.routeOrder[state.currentIndex];
      const hotel   = HOTELS.find(h => h.id === hotelId);

      if (hotel) {
        obterRota(lat, lng, Number(hotel.lat), Number(hotel.lng))
          .then(rota => {
            if (!rota) return;

            desenharRotaOSRM(rota.geometry.coordinates, 'mapa');

            // BUG 3 CORRIGIDO: só carrega steps uma vez por destino, não a cada tick do GPS
            // Antes chamava carregarSteps(rota) SEMPRE, reiniciando as instruções
            if (!state.currentSteps.length) {
              carregarSteps(rota);
            }

            if (distanceInfo) {
              distanceInfo.textContent = `${(rota.distance / 1000).toFixed(1)} km`;
            }
            if (durationInfo) {
              durationInfo.textContent = `${Math.round(rota.duration / 60)} min`;
            }

            const step = obterStepAtual();
            if (step) {
              const texto = traduzirInstrucao(step);
              if (texto !== state.lastInstruction) {
                state.lastInstruction = texto;
                if (state.voiceNavigation) falar(texto);
              }
            }
          })
          .catch(err => console.error('OSRM erro:', err));
      }

      updateMap(lat, lng, heading, speed);
      verificarInstrucao();
      verificarChegada();
    },
    err => {
      console.error('Erro de leitura do GPS:', err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
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
  if (state.currentIndex >= state.routeOrder.length) return;
  if (state.arrivalConfirmed) return;

  const id    = state.routeOrder[state.currentIndex];
  const hotel = HOTELS.find(h => h.id === id);

  if (!hotel) {
    console.warn(`Hotel com ID ${id} não encontrado`);
    return;
  }

  if (!state.userPosition) return;

  const distance = getDistanceMeters(
    state.userPosition.lat,
    state.userPosition.lng,
    hotel.lat,
    hotel.lng
  );

  if (distance <= 90) {
    state.arrivalConfirmed = true;

    if (state.voiceNavigation) {
      falar(`Você chegou ao hotel ${hotel.name}`);
    }

    const ok = confirm(`Você chegou em: ${hotel.name}?`);

    if (ok) {
      state.routeReport[state.currentIndex].arrival = new Date().toISOString();
      renderizarRelatorioModo();
      atualizarModoUI();
    } else {
      state.arrivalConfirmed = false;
    }
  }
}

// ======================
// VERIFICAR INSTRUÇÃO
// ======================
function verificarInstrucao() {
  const step = obterStepAtual();
  if (!step) return;

  const ponto = step.maneuver.location;
  if (!ponto) return;

  // BUG 4 CORRIGIDO: verificação de segurança — userPosition pode ser null
  // se verificarInstrucao() for chamada antes do primeiro fix do GPS
  if (!state.userPosition) return;

  const distancia = getDistanceMeters(
    state.userPosition.lat,
    state.userPosition.lng,
    ponto[1],
    ponto[0]
  );

  if (
    distancia <= 100 &&
    state.announcedStepIndex !== state.currentStepIndex
  ) {
    const texto = traduzirInstrucao(step, true);
    state.announcedStepIndex = state.currentStepIndex;
    if (state.voiceNavigation) falar(texto);
  }

  if (distancia <= 20) {
    state.currentStepIndex++;
  }
}
