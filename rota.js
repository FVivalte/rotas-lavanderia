function gerarRota(){

    const ids = Array.from(
        document.querySelectorAll('.toggle-rota:checked')
    ).map(c => parseInt(c.value));

    if(ids.length === 0){

        alert("Selecione os locais para gerar a rota.");

        return;
    }

    localStorage.setItem(
        'rota_salva',
        JSON.stringify(ids)
    );

    renderizarRotaAtiva(ids);

    // ESCONDE BOTÃO +
    document.getElementById('btn-add-hotel')
        .style.display = 'none';

    document.getElementById('view-selecao')
        .style.display = 'none';

    document.getElementById('view-rota-ativa')
        .style.display = 'block';
}


function detectarHotelMaisProximo(){

    if(!userLat || !userLng || rotaAtual.length === 0) return;

    // remove hotéis concluídos
    const pendentes = rotaAtual.filter(h => {

        return !(h.entregue && (h.coletado || h.retornar));

    });

    if(pendentes.length === 0) return;

    // calcula distância
    pendentes.forEach(h => {

        const lat = h.lat || h.latitude;
        const lng = h.lng || h.lon || h.longitude;

        h.distancia = calcularDistancia(
            userLat,
            userLng,
            lat,
            lng
        );

    });

    // ordena por distância
    pendentes.sort((a,b)=>a.distancia - b.distancia);

    // mantém hotel atual fixo
    let atual = pendentes.find(h => h.id === hotelAtualId);

    // primeira definição
    if(!atual){

        atual = pendentes[0];

        hotelAtualId = atual.id;

    }

    // só troca se estiver longe
    if(atual.distancia > 0.08){

        atual = pendentes[0];

        hotelAtualId = atual.id;

    }

    // pega próximos 2
    const proximos = pendentes
        .filter(h => h.id !== atual.id)
        .slice(0,2);

    renderizarCardHotel(atual, proximos);

}

function renderizarCardHotel(atual, proximos){

    const container =
        document.getElementById('hotel-mais-proximo');

    if(!container) return;

    container.innerHTML = `

        <div class="card-proximo">

            <div class="hotel-atual-box">

                <div class="titulo-atual">
                    📍 Hotel Atual
                </div>

                <div class="nome-atual">
                    ${atual.nome}
                </div>

                <div class="dist-atual">
                    ${(atual.distancia * 1000).toFixed(0)}m
                </div>

            </div>

            <div class="lista-proximos">

                <div class="titulo-proximos">
                    Próximos hotéis
                </div>

                ${proximos.map(h => `

                    <div class="item-proximo">

                        <span>${h.nome}</span>

                        <strong>
                            ${(h.distancia * 1000).toFixed(0)}m
                        </strong>

                    </div>

                `).join('')}

            </div>

        </div>

    `;

}