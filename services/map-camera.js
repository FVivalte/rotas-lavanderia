// services/map-camera.js
import { state } from '../core/state.js';

// =========================
// CONFIG
// =========================
const CAMERA_CONFIG = {
  zoom: 17,
  pitch: 60,
  animationDuration: 1000
};

// =========================
// LISTENERS
// =========================
export function configurarListenersCamera(map) {
  if (!map) return;

  // Se o usuário arrastar o mapa manualmente, para de seguir a câmera do GPS automaticamente
  map.on('dragstart', () => {
    state.cameraFollowing = false;
  });
}

// =========================
// ATUALIZAR CAMERA
// =========================
export function atualizarCamera(map, lat, lng, heading = 0, speed = 0) {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    isNaN(lat) ||
    isNaN(lng)
  ) {
    console.error('Câmera: coordenadas inválidas', { lat, lng });
    return;
  }

  // Se o usuário desativou o modo "seguir", não mexe na câmera
  if (!state.cameraFollowing) {
    return;
  }

  // Transição suave para a nova coordenada do GPS
  map.easeTo({
    center: [lng, lat], // Padrão da biblioteca: [Longitude, Latitude]
    zoom: CAMERA_CONFIG.zoom,
    pitch: CAMERA_CONFIG.pitch,
    bearing: heading || 0, // Rotaciona o mapa baseado na direção que o usuário está andando
    duration: CAMERA_CONFIG.animationDuration
  });
}
