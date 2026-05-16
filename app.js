window.addEventListener("load", () => {

    if(typeof carregarSelecao === "function"){
        carregarSelecao();
    }

    carregarRota();

    iniciarMonitoramentoGPS();

    renderizarModoRota();

});