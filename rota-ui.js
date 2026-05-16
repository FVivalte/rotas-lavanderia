function renderizarModoRota(){

    const container = document.getElementById("lista-rota-ativa");

    if(!container) return;

    if(!rotaAtual.ativa){

        container.innerHTML = "<p>Nenhuma rota ativa.</p>";

        return;
    }
alert("1");
    const hotelAtual = obterLocalPorId(
        rotaAtual.locais[rotaAtual.indiceAtual]
    );

    if(!hotelAtual){

        container.innerHTML = "<p>Hotel atual não encontrado.</p>";

        return;
    }
alert("2");
    const proximos = obterProximosHoteis()
        .map(id => obterLocalPorId(id)?.nome || "")
        .filter(Boolean);
alert("3");
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

function animarSaidaHotel(){

    const card = document.getElementById("hotel-card-atual");

    if(!card) return;

    card.classList.add("saindo");
}