// services/map-camera.js
import { state } from '../core/state.js';

// =========================
// CONFIG
// =========================
const CAMERA_CONFIG = {
  zoom: 18,
  pitch: 60,              // BUG 1 CORRIGIDO: era 70 — muito inclinado, escondia a rota à frente
  animationDuration: 700
};

// =========================
// LISTENERS
// =========================
export function configurarListenersCamera(map) {
  if (!map || map.__cameraConfigured) return;

  map.on('dragstart', () => {
    state.cameraFollowing = false;
  });

  map.__cameraConfigured = true;
}

// =========================
// CALCULAR CENTRO
// BUG 1 CORRIGIDO: era 0.70 (marcador ficava 70% do topo, escondendo tudo à frente)
// Valor correto: 0.25 — marcador fica no quarto inferior, mostrando ~75% do mapa à frente
// =========================
function calcularCentroNavegacao(map, lat, lng) {
  const ponto = map.project([lng, lat]);
  const altura = map.getContainer().clientHeight;

  ponto.y -= altura * 0.25;   // desloca o centro para CIMA, empurrando o marcador para BAIXO

  return [
    map.unproject(ponto).lng,
    map.unproject(ponto).lat
  ];
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

  if (!state.cameraFollowing) return;

  map.easeTo({
    center: calcularCentroNavegacao(map, lat, lng),
    zoom: CAMERA_CONFIG.zoom,
    pitch: CAMERA_CONFIG.pitch,
    bearing: heading || 0,
    duration: CAMERA_CONFIG.animationDuration
  });
}
