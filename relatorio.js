// =========================
// MAPA
// =========================

let map;

let markers = [];

let routeLine;

// =========================
// INICIAR MAPA
// =========================

function initMap(){

  map = L.map('map').setView(

    [-22.757, -41.889],

    13
  );

  L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {
      attribution:
        '© OpenStreetMap'
    }

  ).addTo(map);

  renderHotels();
}

// =========================
// RENDERIZAR HOTÉIS
// =========================

function renderHotels(){

  clearMarkers();

  HOTELS.forEach(h => {

    let lat;
    let lng;

    // =========================
    // CONVERTE COORDS
    // =========================

    if(h.coords){

      const partes =
        h.coords.split(',');

      lat =
        parseFloat(partes[0]);

      lng =
        parseFloat(partes[1]);

    }else{

      lat = h.lat;
      lng = h.lng;
    }

    // =========================
    // CRIA MARKER
    // =========================

    const marker = L.marker([

      lat,
      lng

    ])

    .addTo(map)

    .bindPopup(`

      <strong>
        ${h.name}
      </strong>

      <br>

      ${h.region}

      <br>

      ${h.address}
    `);

    markers.push(marker);
  });
}

// =========================
// LIMPAR MARCADORES
// =========================

function clearMarkers(){

  markers.forEach(marker => {

    map.removeLayer(marker);
  });

  markers = [];
}

// =========================
// CRIAR ROTA
// =========================

function createRoute(){

  clearRoute();

  routeReport = [];

  const coords = [];

  HOTELS.forEach(h => {

    let lat;
    let lng;

    // =========================
    // CONVERTE COORDS
    // =========================

    if(h.coords){

      const partes =
        h.coords.split(',');

      lat =
        parseFloat(partes[0]);

      lng =
        parseFloat(partes[1]);

    }else{

      lat = h.lat;
      lng = h.lng;
    }

    // =========================
    // ARRAY DA ROTA
    // =========================

    coords.push([

      lat,
      lng
    ]);

    // =========================
    // RELATÓRIO
    // =========================

    routeReport.push({

      id: h.id,

      chegada:
        new Date(),

      saida:
        null,

      entrega:
        false,

      coleta:
        false,

      fotos: []
    });
  });

  // =========================
  // DESENHAR LINHA
  // =========================

  drawRoute(coords);

  // =========================
  // RELATÓRIO VISUAL
  // =========================

  if(

    typeof renderReportMode
    === 'function'

  ){

    renderReportMode();
  }
}

// =========================
// DESENHAR ROTA
// =========================

function drawRoute(coords){

  routeLine = L.polyline(

    coords,

    {
      weight: 5
    }

  ).addTo(map);

  map.fitBounds(

    routeLine.getBounds()
  );
}

// =========================
// LIMPAR ROTA
// =========================

function clearRoute(){

  if(routeLine){

    map.removeLayer(
      routeLine
    );
  }
}

// =========================
// CENTRALIZAR MAPA
// =========================

function focusMap(){

  if(routeLine){

    map.fitBounds(

      routeLine.getBounds()
    );
  }
}

// =========================
// EXPORT GLOBAL
// =========================

window.initMap =
  initMap;

window.renderHotels =
  renderHotels;

window.createRoute =
  createRoute;

window.clearRoute =
  clearRoute;

window.focusMap =
  focusMap;