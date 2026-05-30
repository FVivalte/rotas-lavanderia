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
