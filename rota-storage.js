function salvarRota(){

    localStorage.setItem(
        "rota_atual",
        JSON.stringify(rotaAtual)
    );
}

function carregarRota(){

    const salva = localStorage.getItem("rota_atual");

    if(!salva) return;

    rotaAtual = JSON.parse(salva);
}

function limparRota(){

    localStorage.removeItem("rota_atual");
}
