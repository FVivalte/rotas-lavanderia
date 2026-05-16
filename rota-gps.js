function iniciarMonitoramentoGPS(){

    if(!navigator.geolocation) return;

    navigator.geolocation.watchPosition(pos => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        verificarChegada(lat, lon);

    });
}

function calcularDistancia(lat1, lon1, lat2, lon2){

    const R = 6371e3;

    const toRad = v => v * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) *
        Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function verificarChegada(userLat, userLon){

    if(!rotaAtual.ativa) return;

    const hotel = obterLocalPorId(obterHotelAtual());

    if(!hotel) return;

    const distancia = calcularDistancia(
        userLat,
        userLon,
        hotel.lat,
        hotel.lon
    );

    if(distancia < 50){

        registrarChegada(hotel.id);
    }
}

function abrirNavegacao(lat, lon){

    window.open(
        `https://www.google.com/maps?q=${lat},${lon}`,
        "_blank"
    );
}
