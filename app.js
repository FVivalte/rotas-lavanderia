window.addEventListener("load", () => {

    if(typeof carregarSelecao === "function"){
        carregarSelecao();
    }

    carregarRota();
    if(rotaAtual.ativa){
        document.getElementById('view-selecao').style.display = 'none';
        document.getElementById('view-rota-ativa').style.display = 'block';
    }

    iniciarMonitoramentoGPS();

    renderizarModoRota();

});