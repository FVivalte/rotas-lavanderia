// services/map.js

import { atualizarCamera } from './map-camera.js';

// Variável escopo global do módulo para guardar a instância do mapa

let mapas = {};
let userMarker = null;

/**
 * Inicializa o mapa na tela. Chamado geralmente no início da sua aplicação (ex: main.js ou index.js)
 * @param {string} containerId - O ID da div HTML (ex: 'map')
 * @param {string} accessToken - Seu token do Mapbox (se aplicável)
 */

export function inicializarMapa(containerId = 'mapa', accessToken = '') {
  if (accessToken) {
    maplibregl.accessToken = accessToken;
  }

  // Ponto inicial padrão (Lavanderia LAVILAGOS) caso o GPS demore a responder
  const defaultLng = -41.8964253;
  const defaultLat = -22.7625969;

  const map = new maplibregl.Map({
  container: containerId,
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [defaultLng, defaultLat],
  zoom: 15,
  pitch: 0
});
mapas[containerId] = map;

  // Cria o marcador do usuário, mas deixa escondido até o GPS rodar
  userMarker = new maplibregl.Marker({ color: '#007AFF' })
    .setLngLat([defaultLng, defaultLat])
    .addTo(map);

  return map;
}

/**
 * Atualiza a posição do marcador do usuário e move a câmera
 */
export function updateMap(
  lat,
  lng,
  heading = 0,
  speed = 0,
  mapId = 'mapa'
) {

  const map = mapas[mapId];

  if (!map) {
    return;
  }

  if (userMarker) {
    userMarker.setLngLat([lng, lat]);
  }

  atualizarCamera(
    map,
    lat,
    lng,
    heading,
    speed
  );

}

// Exporta a instância caso outros arquivos precisem interagir com o mapa diretamente
export { mapas };

export function adicionarMarcadoresHoteis(hoteis = []) {

  const map = mapas['mapa-rota'];

if (!map) return;

  hoteis.forEach(hotel => {

    if (
  hotel.lat == null ||
  hotel.lng == null
) return;

    let lat;
    let lng;

lat = Number(hotel.lat);
lng = Number(hotel.lng);

    // Validação
    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {
      console.warn('Coordenadas inválidas:', hotel);
      return;
    }

    new maplibregl.Marker({
      color: '#e53935'
    })
      .setLngLat([lng, lat])
      .addTo(map);

  });

}

