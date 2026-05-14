function gerarRota(){

    const ids = Array.from(
        document.querySelectorAll('.toggle-rota:checked')
    ).map(c => parseInt(c.value));

    if(ids.length === 0){

        alert("Selecione os locais para gerar a rota.");

        return;
    }

    const todos = [
        ...locaisBase,
        ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
    ];

    rotaAtual = todos.filter(l => ids.includes(l.id));

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(ids)
    );

    document.getElementById('view-selecao')
        .style.display = 'none';

    document.getElementById('view-rota-ativa')
        .style.display = 'block';

    renderizarRotaAtiva(rotaAtual);

    iniciarGPS();
}


function detectarHotelMaisProximo() {

    if (rotaAtual.length === 0 || !userLat) return;

    let menorDistancia = Infinity;
    let hotelMaisProximo = null;

    rotaAtual.forEach(hotel => {  
        const card = document.querySelector(`.card[data-id="${hotel.id}"]`);  
        if (card && card.classList.contains('concluido')) return;  
        const dist = calcularDistancia(userLat, userLng, hotel.lat, hotel.lon);  
        if (dist < menorDistancia) {  
            menorDistancia = dist;  
            hotelMaisProximo = hotel;  
        }  
    });  
    const box = document.getElementById("hotel-proximo");  
    if (hotelMaisProximo && box) {  
        box.style.display = "block";  
        const tempoMin = Math.round((menorDistancia / 35) * 60);  
        box.innerHTML = `<div style="border-left: 4px solid #33ccff; padding-left: 10px;"><b style="color:#33ccff">📍 Próximo:</b><br>${hotelMaisProximo.nome}<br><small>${menorDistancia.toFixed(2)} km | ~${tempoMin} min</small></div>`;  
    }  
}