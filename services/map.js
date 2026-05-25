// =========================
// MAPA PRINCIPAL
// =========================

let map;

let userMarker;

export function initMap(){

  map = new maplibregl.Map({

    container:'map',

    style:'https://demotiles.maplibre.org/style.json',

    center:[-41.882, -22.757],
    zoom:12,

    pitch:45,
    bearing:0,

    antialias:true

  });

  map.addControl(
    new maplibregl.NavigationControl(),
    'top-right'
  );

  map.on('load',()=>{

    addHotels();

    startLocationTracking();

  });

}

// =========================
// HOTÉIS
// =========================

function addHotels(){

  HOTELS.forEach(hotel=>{

    const el = document.createElement('div');

    el.className='hotel-marker';

    el.innerHTML='🏨';

    new maplibregl.Marker(el)

      .setLngLat([
        hotel.lng,
        hotel.lat
      ])

      .setPopup(

        new maplibregl.Popup({
          offset:25
        })

        .setHTML(`
          <strong>${hotel.name}</strong>
          <br>
          ${hotel.region}
        `)

      )

      .addTo(map);

  });

}

// =========================
// GPS
// =========================

function startLocationTracking(){

  navigator.geolocation.watchPosition(

    position=>{

      const lng = position.coords.longitude;

      const lat = position.coords.latitude;

      updateUserMarker(lng,lat);

      autoCenter(lng,lat);

    },

    error=>{
      console.log(error);
    },

    {
      enableHighAccuracy:true,
      maximumAge:0,
      timeout:10000
    }

  );

}

// =========================
// MARCADOR USUÁRIO
// =========================

function updateUserMarker(lng,lat){

  if(!userMarker){

    const el=document.createElement('div');

    el.className='user-marker';

    el.innerHTML='📍';

    userMarker = new maplibregl.Marker(el)

      .setLngLat([lng,lat])

      .addTo(map);

    return;
  }

  userMarker.setLngLat([lng,lat]);

}

// =========================
// AUTO CENTRALIZAR
// =========================

function autoCenter(lng,lat){

  map.easeTo({

    center:[lng,lat],

    duration:1200,

    zoom:16,

    pitch:60,

    bearing:0

  });

}

export { map };

// =========================
// UPDATE MAP
// =========================

export function updateMap(lng, lat){

  updateUserMarker(lng, lat);

  autoCenter(lng, lat);

}
