// =========================
// MAPA / LEAFLET
// =========================

function initMap(){

  if(map) return;

  map = L.map('map',{

    zoomControl:true,
    dragging:true,
    touchZoom:true,
    doubleClickZoom:true,
    scrollWheelZoom:true

  }).setView(
    [-22.75, -41.88],
    13
  );

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:'© OpenStreetMap'
    }
  ).addTo(map);

}


// =========================
// ROTAÇÃO MAPA
// =========================

function rotateMap(angle){

  if(!map) return;

  const mapPane =
    map.getPane('mapPane');

  if(!mapPane) return;

  mapPane.style.transformOrigin =
    '50% 50%';

  mapPane.style.transition =
    'transform 0.5s linear';

  mapPane.style.transform =
    `rotate(${-angle}deg)`;

}


// =========================
// ATUALIZAR MAPA / ROTA
// =========================

function updateMap(){

  if(!map) return;

  if(currentIndex >= routeOrder.length)
    return;

  const currentHotel =
    HOTELS.find(
      h => h.id === routeOrder[currentIndex]
    );

  if(!currentHotel) return;

  const parsed =
    parseCoords(currentHotel.coords);

  if(!parsed){

    alert(
      `Coordenadas inválidas em ${currentHotel.name}`
    );

    return;

  }

  const hotelLat = parsed.lat;
  const hotelLng = parsed.lng;

  // =========================
  // WAYPOINTS
  // =========================

  const waypoints = [];

  // usuário

  if(userPosition){

    waypoints.push(
      L.latLng(
        userPosition.lat,
        userPosition.lng
      )
    );

  }

  // hotel atual

  waypoints.push(
    L.latLng(
      hotelLat,
      hotelLng
    )
  );

  // próximos hotéis

  for(let i = 1; i <= 2; i++){

    const idx = currentIndex + i;

    if(idx < routeOrder.length){

      const nextHotel =
        HOTELS.find(
          h => h.id === routeOrder[idx]
        );

      if(!nextHotel) continue;

      const nextParsed =
        parseCoords(nextHotel.coords);

      if(nextParsed){

        waypoints.push(
          L.latLng(
            nextParsed.lat,
            nextParsed.lng
          )
        );

      }

    }

  }

  // =========================
  // REMOVE ROTA ANTIGA
  // =========================

  if(routingControl){

    map.removeControl(routingControl);

  }

  // =========================
  // NOVA ROTA
  // =========================

  routingControl = L.Routing.control({

    waypoints,

    routeWhileDragging:false,

    addWaypoints:false,

    draggableWaypoints:false,

    fitSelectedRoutes:false,

    show:false,

    createMarker:(i, wp)=>{

      return L.marker(wp.latLng);

    }

  }).addTo(map);

  // =========================
  // INSTRUÇÕES DE VOZ
  // =========================

  routingControl.on(
    'routesfound',
    function(e){

      const route = e.routes[0];

      if(
        route.instructions &&
        route.instructions.length
      ){

        const instruction =
          route.instructions[0].text;

        speak(instruction);

      }

    }
  );

}
