// utils/utils.js

// ======================
// COORDENADAS
// ======================

export function parseCoords(coords){

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

  return { lat, lng };

}


// ======================
// DISTÂNCIA
// ======================

export function getDistanceMeters(
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
    Math.sin(Δφ / 2) +

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


// ======================
// GOOGLE MAPS URL
// ======================

export function buildGoogleMapsUrl(
  order,
  hotels
){

  if(order.length === 0){
    return '';
  }

  const coords = order
    .map(id => {

      const hotel =
        hotels.find(h => h.id === id);

      if(!hotel) return null;

      const parsed =
        parseCoords(hotel.coords);

      if(!parsed) return null;

      return `${parsed.lat},${parsed.lng}`;

    })
    .filter(Boolean);

  const origin = coords[0];

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

  params.set('origin', origin);

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

  return base + '&' + params.toString();

}


// ======================
// DATA FORMATADA
// ======================

export function getFormattedDateTitle(){

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
ROTA do dia ${weekday},
${day}/${month}/${year}
`.trim();

}


// ======================
// LEITOR BASE64
// ======================

export function readFilesAsBase64(files){

  return Promise.all(

    [...files].map(file => {

      return new Promise(resolve => {

        const reader =
          new FileReader();

        reader.onload = () => {

          resolve(reader.result);

        };

        reader.readAsDataURL(file);

      });

    })

  );

}


// ======================
// SPEECH
// ======================

export function speak(text,state){

  if(!state.speechEnabled){
    return;
  }

  if(text === state.lastInstruction){
    return;
  }

  state.lastInstruction = text;

  const utter =
    new SpeechSynthesisUtterance(text);

  utter.lang = 'pt-BR';

  utter.rate = 1;

  speechSynthesis.cancel();

  speechSynthesis.speak(utter);

}


// ======================
// DOWNLOAD JSON
// ======================

export function downloadJson(
  filename,
  data
){

  const blob = new Blob(
    [
      JSON.stringify(
        data,
        null,
        2
      )
    ],
    {
      type:'application/json'
    }
  );

  const a =
    document.createElement('a');

  const url =
    URL.createObjectURL(blob);

  a.href = url;

  a.download = filename;

  a.click();

  setTimeout(()=>{

    URL.revokeObjectURL(url);

  },1000);

}
