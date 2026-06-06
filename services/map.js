// services/map.js
import { atualizarCamera } from './map-camera.js';

// Variável escopo global do módulo
let mapas = {};
let userMarker = null;
let marcadoresSequencia = [];
let marcadoresStatus = [];

/**
 * Inicializa o mapa na tela.
 */
export function getMapa(id = 'mapa'){
  return mapas[id];
}

export function inicializarMapa(containerId = 'mapa', accessToken = '') {
  if (accessToken) {
    maplibregl.accessToken = accessToken;
  }

  // Ponto inicial padrão
  const defaultLng = -42.0541382;
  const defaultLat = -22.8601498;

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
  mapId = 'mapa'
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

export function atualizarMarcadoresStatus(
  hoteis = [],
  indiceAtual = 0
){

  const map =
    mapas['mapa-rota'];

  if(!map) return;

  marcadoresStatus.forEach(
    m => m.remove()
  );

  marcadoresStatus = [];

  hoteis.forEach(
    (hotel,index)=>{

      const el =
        document.createElement('div');

      el.className =
        'marker-status';

      el.textContent =
        index + 1;

      if(index < indiceAtual){

        el.classList.add(
          'concluido'
        );

      }
      else if(index === indiceAtual){

        el.classList.add(
          'atual'
        );

      }
      else{

        el.classList.add(
          'pendente'
        );

      }

      const marker =
        new maplibregl.Marker({
          element: el
        })
        .setLngLat([
          Number(hotel.lng),
          Number(hotel.lat)
        ])
        .addTo(map);

      marcadoresStatus.push(
        marker
      );

    }
  );

}

// Exporta a instância
export { mapas };

let rotaSource = null;

export function desenharRotaOSRM(
  coordenadas,
  mapId = 'mapa'
) {

  const map =
    mapas[mapId];

  if (!map) return;

  const geojson = {

    type: 'Feature',

    geometry: {

      type: 'LineString',

      coordinates:
        coordenadas

    }

  };

  if (
    map.getSource(
      'osrm-route'
    )
  ) {

    map
      .getSource(
        'osrm-route'
      )
      .setData(
        geojson
      );

    return;

  }

  map.addSource(
    'osrm-route',
    {
      type: 'geojson',
      data: geojson
    }
  );

  map.addLayer({

    id: 'osrm-route',

    type: 'line',

    source:
      'osrm-route',

    paint: {

      'line-color':
        '#007AFF',

      'line-width':
        6

    }

  });

}

// ======================
// MAPA DA TELA 2
// ======================

export function inicializarMapaRota(){

  if(mapas['mapa-rota']){

    return mapas['mapa-rota'];

  }

  return inicializarMapa(
    'mapa-rota'
  );

}

export function desenharRotaPlanejada(coordenadas = []) {
  const map = mapas['mapa-rota'];
  if (!map) return;

  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordenadas
    }
  };

  // Se a source existe, apenas atualiza
  if (map.getSource('rota-planejada')) {
    map.getSource('rota-planejada').setData(geojson);
  } else {
    // Se não existe, cria a source
    map.addSource('rota-planejada', {
      type: 'geojson',
      data: geojson
    });
  }

  // CRÍTICO: Sempre verifique se a layer existe. Se não existir, crie-a.
  // Isso resolve o problema de quando você deleta a layer no limparMapaRota
  if (!map.getLayer('rota-planejada')) {
    map.addLayer({
      id: 'rota-planejada',
      type: 'line',
      source: 'rota-planejada',
      paint: {
        'line-color': '#0b63b7',
        'line-width': 5
      }
    });
  }
}

export function ajustarMapaRota(
  hoteis = []
){

  const map =
    mapas['mapa-rota'];

  if(!map) return;

  const bounds =
    new maplibregl.LngLatBounds();

  hoteis.forEach(h=>{

    bounds.extend([

      Number(h.lng),
      Number(h.lat)

    ]);

  });

  map.fitBounds(
    bounds,
    {
      padding:50
    }
  );

}
// ======================
// MARCADORES NUMERADOS
// ======================

export function adicionarMarcadoresSequencia(
  hoteis = []
){

  const map =
    mapas['mapa-rota'];

  if(!map) return;

  marcadoresSequencia.forEach(
    marker => marker.remove()
  );

  marcadoresSequencia = [];

  hoteis.forEach(
    (hotel,index)=>{

      const el =
        document.createElement('div');

      el.className =
        'marker-sequencia';

      el.textContent =
        index + 1;

      const marker =
        new maplibregl.Marker({
          element: el
        })
        .setLngLat([

          Number(hotel.lng),
          Number(hotel.lat)

        ])
        .addTo(map);

      marcadoresSequencia.push(
        marker
      );

    }
  );

}

export function limparMapaRota(){

  const map = mapas['mapa-rota'];

  // Remove marcadores numerados do DOM
  marcadoresSequencia.forEach(m => {
    try { m.remove(); } catch(e) {}
  });
  marcadoresSequencia = [];

  // Remove marcadores de status do DOM
  marcadoresStatus.forEach(m => {
    try { m.remove(); } catch(e) {}
  });
  marcadoresStatus = [];

  if(!map || !map.loaded()) return;

  // Limpa a linha da rota sem remover source/layer
  // setData com LineString vazia é mais seguro que removeLayer+removeSource
  if(map.getSource('rota-planejada')){
    map.getSource('rota-planejada').setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] }
    });
  }

}
