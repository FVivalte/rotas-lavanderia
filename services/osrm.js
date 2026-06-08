export async function obterRota(
  origemLat,
  origemLng,
  destinoLat,
  destinoLng
){

  const url = `
https://router.project-osrm.org/route/v1/driving/
${origemLng},${origemLat};
${destinoLng},${destinoLat}
?overview=full
&steps=true
&geometries=geojson
`.replace(/\s+/g,'');

  const resp =
    await fetch(url);

  const data =
    await resp.json();

  if(
    !data.routes ||
    !data.routes.length
  ){
    return null;
  }

  return data.routes[0];

}

export async function obterRotaCompleta(
  hoteis = []
){

  if(hoteis.length < 2){
    return null;
  }

  const coords = hoteis
    .map(h =>
      `${h.lng},${h.lat}`
    )
    .join(';');

  const url =
`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const resp =
    await fetch(url);

  const data =
    await resp.json();

  if(
    !data.routes ||
    !data.routes.length
  ){
    return null;
  }

  return {

    coordinates:
      data.routes[0]
      .geometry
      .coordinates,

    distance:
      data.routes[0]
      .distance,

    duration:
      data.routes[0]
      .duration

  };

}
