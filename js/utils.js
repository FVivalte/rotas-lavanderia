// ===============================
// UTILS
// ===============================

// Converter string "lat,lng" em objeto
function parseCoords(coords){

  if(!coords) return null;

  const parts = coords.split(',');

  if(parts.length !== 2){
    return null;
  }

  const lat = Number(parts[0].trim());
  const lng = Number(parts[1].trim());

  if(
    isNaN(lat) ||
    isNaN(lng)
  ){
    return null;
  }

  return {
    lat,
    lng
  };

}


// ===============================
// DISTÂNCIA ENTRE 2 PONTOS
// ===============================

function getDistanceMeters(
  lat1,
  lon1,
  lat2,
  lon2
){

  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ =
    (lat2 - lat1) * Math.PI / 180;

  const Δλ =
    (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) *
    Math.sin(Δφ / 2)
    +
    Math.cos(φ1) *
    Math.cos(φ2) *
    Math.sin(Δλ / 2) *
    Math.sin(Δλ / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;

}


// ===============================
// DATA FORMATADA RELATÓRIO
// ===============================

function getFormattedDateTitle(){

  const now = new Date();

  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  const weekday =
    weekdays[now.getDay()];

  const day =
    String(now.getDate())
      .padStart(2,'0');

  const month =
    String(now.getMonth() + 1)
      .padStart(2,'0');

  const year =
    now.getFullYear();

  return `
ROTA do dia ${weekday}, ${day}/${month}/${year}
`.trim();

}


// ===============================
// URL GOOGLE MAPS
// ===============================

function buildGoogleMapsUrl(order){

  if(order.length === 0){
    return '';
  }

  const coords = order
    .map(id => {

      const hotel =
        HOTELS.find(
          h => h.id === id
        );

      if(!hotel){
        return null;
      }

      const parsed =
        parseCoords(hotel.coords);

      if(!parsed){
        return null;
      }

      return `${parsed.lat},${parsed.lng}`;

    })
    .filter(Boolean);

  if(coords.length === 0){
    return '';
  }

  const origin =
    coords[0];

  const destination =
    coords[coords.length - 1];

  const waypoints =
    coords
      .slice(1, coords.length - 1)
      .join('|');

  const base =
    'https://www.google.com/maps/dir/?api=1';

  const params =
    new URLSearchParams();

  params.set(
    'origin',
    origin
  );

  params.set(
    'destination',
    destination
  );

  if(waypoints){

    params.set(
      'waypoints',
      waypoints
    );

  }

  params.set(
    'travelmode',
    'driving'
  );

  return (
    base +
    '&' +
    params.toString()
  );

}


// ===============================
// FORMATAR HORÁRIO
// ===============================

function formatTime(dateString){

  if(!dateString){
    return '--:--';
  }

  return new Date(dateString)
    .toLocaleTimeString(
      'pt-BR',
      {
        hour:'2-digit',
        minute:'2-digit'
      }
    );

}


// ===============================
// GERAR ID ÚNICO
// ===============================

function generateId(prefix='id'){

  return `
${prefix}_${Date.now()}_${Math.random()}
`.trim();

}


// ===============================
// ABRIR GOOGLE MAPS
// ===============================

function openGoogleMaps(coords){

  if(!coords){
    return;
  }

  window.open(
    `https://www.google.com/maps?q=${coords}`,
    '_blank'
  );

}


// ===============================
// ESPERAR
// ===============================

function delay(ms){

  return new Promise(resolve => {

    setTimeout(resolve, ms);

  });

}
