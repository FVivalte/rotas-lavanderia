// =========================
// MAPA
// =========================

let map;

let markers = [];

let routeLine;

// =========================
// INIT
// =========================

function initMap(){

  map =
    L.map('map').setView(

      [-22.757, -41.889],

      12
    );

  L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {

      attribution:'OSM'
    }

  ).addTo(map);

  renderHotelsMap();
}

// =========================
// HOTÉIS MAPA
// =========================

function renderHotelsMap(){

  HOTELS.forEach(h => {

    const partes =
      h.coords.split(',');

    const lat =
      parseFloat(partes[0]);

    const lng =
      parseFloat(partes[1]);

    const marker =
      L.marker([lat, lng])

      .addTo(map)

      .bindPopup(

        `<strong>${h.name}</strong>`
      );

    markers.push(marker);
  });
}

// =========================
// CRIAR ROTA
// =========================

function createRoute(){

  routeReport = [];

  const coords = [];

  HOTELS.forEach(h => {

    const partes =
      h.coords.split(',');

    const lat =
      parseFloat(partes[0]);

    const lng =
      parseFloat(partes[1]);

    coords.push([lat,lng]);

    routeReport.push({

      id:h.id,

      chegada:new Date(),

      saida:null,

      entrega:false,

      coleta:false,

      fotos:[]
    });
  });

  if(routeLine){

    map.removeLayer(routeLine);
  }

  routeLine =
    L.polyline(

      coords,

      {

        color:'blue'
      }

    ).addTo(map);

  renderReportMode();
}

// =========================
// LIMPAR
// =========================

function clearRoute(){

  if(routeLine){

    map.removeLayer(routeLine);
  }
}