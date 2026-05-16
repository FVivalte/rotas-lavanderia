let rota_atual = {
    ativa: false,
    iniciadaEm: null,
    hotelAtual: null,
    indiceAtual: 0,
    chegadaEm: null,
    locais: [],
    historico: []
};

function iniciarRota(ids){

    rota_atual = {
        ativa: true,
        iniciadaEm: Date.now(),
        hotelAtual: ids[0] || null,
        indiceAtual: 0,
        chegadaEm: null,
        locais: ids,
        historico: []
    };

    salvarRota();

    renderizarModoRota();
}

function obterHotelAtual(){

    return rota_atual.locais[rotaAtual.indiceAtual];
}

function registrarChegada(id){

    if(rota_atual.chegadaEm) return;

    rota_atual.chegadaEm = Date.now();

    salvarRota();

    iniciarCronometro();
}

function avancarProximoHotel(){

    const entrega = document.getElementById("check-entrega")?.checked || false;

    const coleta = document.getElementById("check-coleta")?.checked || false;

    rotaAtual.historico.push({
        hotelId: obterHotelAtual(),
        chegada: rota_atual.chegadaEm,
        saida: Date.now(),
        entrega,
        coleta
    });

    rota_atual.indiceAtual++;

    rota_atual.chegadaEm = null;

    if(rota_atual.indiceAtual >= rota_atual.locais.length){

        finalizarRota();

        return;
    }

    rota_atual.hotelAtual = obterHotelAtual();

    salvarRota();

    animarSaidaHotel();

    renderizarModoRota();
}

function obterProximosHoteis(){

    return rota_atual.locais.slice(
        rota_atual.indiceAtual + 1,
        rota_atual.indiceAtual + 3
    );
}

function atualizarOrdemRota(ids){

    rota_atual.locais = ids;

    salvarRota();
}

function finalizarRota(){

    rota_atual.ativa = false;

    salvarRota();

    gerarTextoRelatorio();

    alert("Rota finalizada!");
}

function gerarRota(){

    const ids = Array.from(
        document.querySelectorAll('.toggle-rota:checked')
    ).map(c => String(c.value));

    console.log("IDs:", ids);

    if(ids.length === 0){

        alert("Selecione os hotéis da rota.");

        return;
    }

    alert("ANTES iniciarRota");

    iniciarRota(ids);

    alert("DEPOIS iniciarRota");

    document.getElementById('view-selecao').style.display = 'none';

    document.getElementById('view-rota-ativa').style.display = 'block';
}