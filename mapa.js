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

  // HOTÉIS ATIVOS

  const ativos =
    [
      ...document.querySelectorAll(
        '.hotel-check:checked'
      )
    ];

  // LIMPA LINHA ANTIGA

  if(routeLine){

    map.removeLayer(routeLine);
  }

  ativos.forEach(check => {

    const id =
      Number(
        check.dataset.id
      );

    const h =
      HOTELS.find(
        x => x.id === id
      );

    if(!h){

      return;
    }

    const partes =
      h.coords.split(',');

    const lat =
      parseFloat(partes[0]);

    const lng =
      parseFloat(partes[1]);

    coords.push([lat, lng]);

    routeReport.push({

      id:h.id,

      chegada:new Date(),

      saida:null,

      entrega:false,

      coleta:false,

      fotos:[]
    });
  });

  // DESENHA LINHA

  if(coords.length > 0){

    routeLine =
      L.polyline(

        coords,

        {

          color:'blue',

          weight:5
        }

      ).addTo(map);

    map.fitBounds(coords);
  }

  // RELATÓRIO

  if(

    typeof renderReportMode
    === 'function'

  ){

    renderReportMode();
  }
}

// =========================
// LIMPAR
// =========================

function clearRoute(){

  if(routeLine){

    map.removeLayer(routeLine);
  }
}