let rotaAtual = {
    ativa: false,
    iniciadaEm: null,
    hotelAtual: null,
    indiceAtual: 0,
    chegadaEm: null,
    locais: [],
    historico: []
};

function iniciarRota(ids){

    rotaAtual = {
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

    return rotaAtual.locais[rotaAtual.indiceAtual];
}

function registrarChegada(id){

    if(rotaAtual.chegadaEm) return;

    rotaAtual.chegadaEm = Date.now();

    salvarRota();

    iniciarCronometro();
}

function avancarProximoHotel(){

    const entrega = document.getElementById("check-entrega")?.checked || false;
    const coleta = document.getElementById("check-coleta")?.checked || false;

    rotaAtual.historico.push({
        hotelId: obterHotelAtual(),
        chegada: rotaAtual.chegadaEm,
        saida: Date.now(),
        entrega,
        coleta
    });

    rotaAtual.indiceAtual++;

    rotaAtual.chegadaEm = null;

    if(rotaAtual.indiceAtual >= rotaAtual.locais.length){

        finalizarRota();

        return;
    }

    rotaAtual.hotelAtual = obterHotelAtual();

    salvarRota();

    animarSaidaHotel();

    renderizarModoRota();
}

function obterProximosHoteis(){

    return rotaAtual.locais.slice(
        rotaAtual.indiceAtual + 1,
        rotaAtual.indiceAtual + 3
    );
}

function atualizarOrdemRota(ids){

    rotaAtual.locais = ids;

    salvarRota();
}

function finalizarRota(){

    rotaAtual.ativa = false;

    salvarRota();

    gerarTextoRelatorio();

    alert("Rota finalizada!");
}
