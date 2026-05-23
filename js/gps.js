// =============================
// GPS / GEOLOCALIZAÇÃO
// =============================

function startGpsTracking(){

  if(!navigator.geolocation){

    alert('GPS não suportado');

    return;

  }

  watchId = navigator.geolocation.watchPosition(

    pos=>{

      const newPosition = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      const heading = pos.coords.heading;

      userPosition = newPosition;

      // CENTRALIZA APENAS NA PRIMEIRA VEZ
      if(map && !mapInitialized){

        map.setView(
          [
            userPosition.lat,
            userPosition.lng
          ],
          17
        );

        mapInitialized = true;

      }

      // AUTO PAN SUAVE
      if(map){

        map.panTo(
          [
            userPosition.lat,
            userPosition.lng
          ],
          {
            animate:true,
            duration:1
          }
        );

      }

      // ROTAÇÃO DO MAPA
      if(
        heading !== null &&
        !isNaN(heading)
      ){

        rotateMap(heading);

      }

      checkArrival();

      updateMap();

    },

    err=>{

      console.log(err);

    },

    {
      enableHighAccuracy:true,
      maximumAge:1000,
      timeout:5000
    }

  );

}

function stopGpsTracking(){

  if(watchId !== null){

    navigator.geolocation.clearWatch(watchId);

    watchId = null;

  }

}

function checkArrival(){

  if(currentIndex >= routeOrder.length)
    return;

  if(arrivalConfirmed)
    return;

  if(!userPosition)
    return;

  const id = routeOrder[currentIndex];

  const hotel = HOTELS.find(
    h => h.id === id
  );

  if(!hotel)
    return;

  const parsed = parseCoords(hotel.coords);

  if(!parsed)
    return;

  const hotelLat = parsed.lat;
  const hotelLng = parsed.lng;

  const distance = getDistanceMeters(

    userPosition.lat,
    userPosition.lng,

    hotelLat,
    hotelLng

  );

  if(distance <= 90){

    arrivalConfirmed = true;

    const ok = confirm(
      `Você chegou em ${hotel.name}?`
    );

    if(ok){

      routeReport[currentIndex].arrival =
        new Date().toISOString();

      renderReportMode();

      saveAppState();

    }else{

      arrivalConfirmed = false;

    }

  }

}
