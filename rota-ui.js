function renderizarModoRota(){

    const container = document.getElementById("modo-rota");

    if(!container) return;

    if(!rotaAtual.ativa){

        container.innerHTML = "<p>Nenhuma rota ativa.</p>";

        return;
    }
    const hotelAtual = obterLocalPorId(
        rotaAtual.locais[rotaAtual.indiceAtual]
    );

    if(!hotelAtual){

        container.innerHTML = "<p>Hotel atual não encontrado.</p>";

        return;
    }
    const proximos = obterProximosHoteis()
        .map(id => obterLocalPorId(id)?.nome || "")
        .filter(Boolean);
    container.innerHTML = `
        <div class="hotel-card hotel-ativo" id="hotel-card-atual">

            <h2>${hotelAtual.nome}</h2>

            <div id="cronometro-hotel">
                ⏱ 00:00
            </div>

            <label>
                <input type="checkbox" id="check-entrega">
                Entrega
            </label>

            <label>
                <input type="checkbox" id="check-coleta">
                Coleta
            </label>

            <div class="botoes-rota">

                <button onclick="abrirNavegacao(${hotelAtual.lat}, ${hotelAtual.lng})">
                    Navegar
                </button>

                <button onclick="avancarProximoHotel()">
                    Próximo Hotel
                </button>

            </div>

            <div class="proximos-hoteis">

                <strong>Próximos hotéis:</strong>

                <ul>
                    ${proximos.map(h => `<li>${h}</li>`).join("")}
                </ul>

            </div>

        </div>
    `;
}

let intervaloCronometro = null;

function iniciarCronometro(){

    clearInterval(intervaloCronometro);

    intervaloCronometro = setInterval(() => {

        if(!rotaAtual.chegadaEm) return;

        const segundos = Math.floor(
            (Date.now() - rotaAtual.chegadaEm) / 1000
        );

        const min = String(Math.floor(segundos / 60)).padStart(2, "0");

        const seg = String(segundos % 60).padStart(2, "0");

        const el = document.getElementById("cronometro-hotel");

        if(el){

            el.innerText = `⏱ ${min}:${seg}`;
        }

    }, 1000);
}

function renderizarRotaAtiva(ids){

    const container = document.getElementById("lista-rota-ativa");

    if(!container) return;

    const todos = [
        ...locaisBase,
        ...JSON.parse(localStorage.getItem('locais_extras') || '[]')
    ];

    const rota = ids.map(id =>
        todos.find(l => String(l.id) === String(id))
    ).filter(Boolean);

    container.innerHTML = rota.map((hotel, index) => `

        <div class="hotel-card">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

                <div>

                    <strong>
                        ${index + 1}. ${hotel.nome}
                    </strong>

                    <div style="
                        font-size:0.85rem;
                        color:#666;
                    ">
                        ${hotel.regiao || ""}
                    </div>

                </div>

                <button onclick="
                    abrirNavegacao(${hotel.lat}, ${hotel.lng})
                ">
                    🧭
                </button>

            </div>

        </div>

    `).join("");
}

function animarSaidaHotel(){

    const card = document.getElementById("hotel-card-atual");

    if(!card) return;

    card.classList.add("saindo");
}