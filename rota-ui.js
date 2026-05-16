function renderizarModoRota(){

    const container = document.getElementById("lista-rota-ativa");

    if(!container) return;

    container.innerHTML = `
        <div class="hotel-card">
            TESTE FUNCIONOU
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