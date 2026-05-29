// services/map.js
import { atualizarCamera } from './map-camera.js';

// Variável escopo global do módulo
let mapas = {};
let userMarker = null;

/**
 * Inicializa o mapa na tela.
 */
export function inicializarMapa(containerId = 'mapa', accessToken = '') {
  if (accessToken) {
    maplibregl.accessToken = accessToken;
  }

  // Ponto inicial padrão
  const defaultLng = -41.8964253;
  const defaultLat = -22.7625969;

  const map = new maplibregl.Map({
    container: containerId,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [defaultLng, defaultLat],
    zoom: 15,
    pitch: 0
  });

  // Guardamos a instância usando o ID fornecido (ex: 'mapa')
  mapas[containerId] = map;

  // Cria o marcador do usuário
  userMarker = new maplibregl.Marker({ color: '#007AFF' })
    .setLngLat([defaultLng, defaultLat])
    .addTo(map);

  return map;
}

/**
 * Atualiza a posição do marcador do usuário
 */
export function updateMap(lat, lng, heading = 0, speed = 0, mapId = 'mapa') {
  const map = mapas[mapId];
  if (!map) return;

  if (userMarker) {
    userMarker.setLngLat([lng, lat]);
  }

  atualizarCamera(map, lat, lng, heading, speed);
}

/**
 * Adiciona marcadores de hotéis usando a mesma chave da inicialização
 */
export function adicionarMarcadoresHoteis(
  hoteis = [],
  mapId = 'mapa-rota'
) {

  const map = mapas[mapId];

  if (!map) {
    console.warn(
      `Mapa ${mapId} não encontrado`
    );
    return;
  }

  hoteis.forEach(hotel => {

    const lat = Number(hotel.lat);
    const lng = Number(hotel.lng);

    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return;
    }

    new maplibregl.Marker({
      color: '#e53935'
    })
      .setLngLat([lng, lat])
      .addTo(map);

  });

} 

  if (!map) {
    console.warn('Mapa não encontrado para adicionar marcadores!');
    return;
  }

  hoteis.forEach(hotel => {
    if (hotel.lat == null || hotel.lng == null) return;

    const lat = Number(hotel.lat);
    const lng = Number(hotel.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    new maplibregl.Marker({ color: '#e53935' })
      .setLngLat([lng, lat])
      .addTo(map);
  });
}

// Exporta a instância
export { mapas };
