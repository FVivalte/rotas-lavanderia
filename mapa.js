let map;
let markers = [];
let routeLine;

function iniciarMapa(){

    map = L.map('map').setView(
        [-22.7565,-41.8890],
        13
    );

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:'OpenStreetMap'
        }
    ).addTo(map);

    atualizarMarcadores();
}

function atualizarMarcadores(){

    markers.forEach(marker=>{
        map.removeLayer(marker);
    });

    markers = [];

    app.hoteis.forEach((hotel,index)=>{

        const marker = L.marker([
            hotel.lat,
            hotel.lng
        ])
        .addTo(map)
        .bindPopup(`
            <div class="map-popup">
                <h3>
                    ${index + 1} • ${hotel.nome}
                </h3>

                <p>${hotel.bairro}</p>
                <p>${hotel.tipo}</p>
            </div>
        `);

        markers.push(marker);
    });
}

function desenharLinhaRota(){

    if(routeLine){
        map.removeLayer(routeLine);
    }

    const coordenadas =
        app.hoteis.map(h=>[
            h.lat,
            h.lng
        ]);

    routeLine = L.polyline(
        coordenadas,
        {
            color:'#2563eb',
            weight:5
        }
    ).addTo(map);

    map.fitBounds(
        routeLine.getBounds(),
        {
            padding:[30,30]
        }
    );
}