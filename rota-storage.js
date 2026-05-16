function salvarRota(){

    localStorage.setItem(
        "rotaAtual",
        JSON.stringify(rotaAtual)
    );
}

function carregarRota(){

    const salva = localStorage.getItem("rotaAtual");

    if(!salva) return;

    rotaAtual = JSON.parse(salva);
    
    // Adicione esta linha para renderizar a interface
    if(rotaAtual.ativa){
        renderizarModoRota();
    }
}

function limparRota(){

    localStorage.removeItem("rotaAtual");
}