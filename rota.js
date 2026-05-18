function gerarRota(){

    desenharLinhaRota();

    mostrarToast(
        'Rota gerada com sucesso'
    );
}

function mostrarTudoMapa(){

    app.modoMapa = 'tudo';

    atualizarMarcadores();

    mostrarToast(
        'Exibindo todos os hotéis'
    );
}

function ativarModoRota(){

    app.modoMapa = 'rota';

    desenharLinhaRota();

    mostrarToast(
        'Modo rota ativado'
    );
}

function gerarRelatorio(){

    console.table(app.hoteis);

    mostrarToast(
        'Relatório gerado'
    );
}

function finalizarRota(){

    mostrarToast(
        'Rota finalizada'
    );

    if(routeLine){

        routeLine.setStyle({
            color:'green'
        });
    }
}