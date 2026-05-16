function iniciarMonitoramentoGPS(){

    if(!navigator.geolocation) return;

    navigator.geolocation.watchPosition(pos => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        verificarChegada(lat, lng);

    });
}

function calcularDistancia(lat1, lng1, lat2, lng2){

    const R = 6371e3;

    const toRad = v => v * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng/2) *
        Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

function verificarChegada(userLat, userLng){

    if(!rotaAtual.ativa) return;

    const hotel = obterLocalPorId(obterHotelAtual());

    if(!hotel) return;

    const distancia = calcularDistancia(
        userLat,
        userLng,
        hotel.lat,
        hotel.lng
    );

    if(distancia < 50){

        registrarChegada(hotel.id);
    }
}

function abrirNavegacao(lat, lng){

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );
}
