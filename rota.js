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
    const btnAddHotel = document.getElementById('btn-add-hotel');

    if(btnAddHotel){
        btnAddHotel.style.display = 'none';
    }

    document.getElementById('view-selecao')
        .style.display = 'none';

    document.getElementById('view-rota-ativa')
        .style.display = 'block';
}


function detectarHotelMaisProximo(){

    if(userLat == null || userLng == null || rotaAtual.length === 0) return;

    const todos = [
        ...locaisBase,
        ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
    ];

    const rotaObjetos = rotaAtual.map(id =>
        todos.find(l => l.id === id)
    ).filter(Boolean);

    const pendentes = rotaObjetos.filter(h => {

        const entrega =
            localStorage.getItem(`entrega_${h.id}`) === 'true';

        const coleta =
            localStorage.getItem(`coleta_${h.id}`) === 'true';

        const retorno =
            localStorage.getItem(`retorno_${h.id}`) === 'true';

        return !(entrega && (coleta || retorno));

    });

    if(pendentes.length === 0) return;

    pendentes.forEach(h => {

        h.distancia = calcularDistancia(
            userLat,
            userLng,
            h.lat,
            h.lng
        );

    });

    pendentes.sort((a,b)=>a.distancia - b.distancia);

    let atual = pendentes.find(h => h.id === hotelAtualId);

    if(!atual){

        atual = pendentes[0];

        hotelAtualId = atual.id;

    }

    if(atual.distancia > 0.08){

        atual = pendentes[0];

        hotelAtualId = atual.id;

    }

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
                            ${h.distancia ? (h.distancia * 1000).toFixed(0) : "0"}m
                        </strong>

                    </div>

                `).join('')}

            </div>

        </div>

    `;

}