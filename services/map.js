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
//TESTE AQUI
  console.log(
  'CRIANDO MAPA ROTA'
);
  //TESTE AQUI
  // Guardamos a instância usando o ID fornecido (ex: 'mapa')
  mapas[containerId] = map;

  // Cria o marcador do usuário
const el =
  document.createElement(
    'div'
  );

el.className =
  'user-marker';

userMarker =
  new maplibregl.Marker({
    element: el
  })
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
const el =
  userMarker.getElement();

el.style.transform =
  `rotate(${heading}deg)`;
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

// Cria o mapa-rota se ainda não existe, ou devolve o existente.
// Responsabilidade única: instância do mapa. Não faz resize.
export function inicializarMapaRota(){

  const container = document.getElementById('mapa-rota');
  if (!container) return null;

  // Reutiliza se o canvas ainda está montado no container
  if (mapas['mapa-rota'] && container.querySelector('canvas')) {
    return mapas['mapa-rota'];
  }

  // Container foi recriado ou primeiro acesso — destroi instância velha
  if (mapas['mapa-rota']) {
    try { mapas['mapa-rota'].remove(); } catch(e) {}
    delete mapas['mapa-rota'];
  }

  const map = new maplibregl.Map({
    container: 'mapa-rota',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [-42.0541382, -22.8601498],
    zoom: 12,
    pitch: 0,
    attributionControl: false
  });

  mapas['mapa-rota'] = map;
  return map;
}

// Devolve uma Promise que resolve com o mapa já carregado E com
// dimensões corretas — dois rAFs garantem que o browser processou
// o layout antes do resize(), eliminando o bug de marcadores
// fora do viewport após remover/reordenar hotéis.
export function mapaRotaPronto() {
  return new Promise((resolve, reject) => {

    const mapa = inicializarMapaRota();
    if (!mapa) { reject(new Error('container #mapa-rota não encontrado')); return; }

    const continuar = () => {
      requestAnimationFrame(() => {       // 1º rAF: CSS/visibilidade aplicados
        requestAnimationFrame(() => {     // 2º rAF: layout calculado, dimensões reais
          mapa.resize();
          resolve(mapa);
        });
      });
    };

    if (mapa.loaded()) {
      continuar();
    } else {
      mapa.once('load', continuar);
    }
  });
}

export function desenharRotaPlanejada(coordenadas = []) {
  const map = mapas['mapa-rota'];
  if (!map || !map.loaded()) return;

  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordenadas
    }
  };

  // Se a source existe, apenas atualiza os dados
  if (map.getSource('rota-planejada')) {
    map.getSource('rota-planejada').setData(geojson);
  } else {
    // Source não existe: cria source + layer juntos
    map.addSource('rota-planejada', {
      type: 'geojson',
      data: geojson
    });
    map.addLayer({
      id: 'rota-planejada',
      type: 'line',
      source: 'rota-planejada',
      paint: {
        'line-color': '#0b63b7',
        'line-width': 5
      }
    });
    return; // layer já criada, sai
  }

  // Garante que a layer existe mesmo que a source já existisse
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
