function salvarStorage(){
    localStorage.setItem(
        'rotaProBuzios',
        JSON.stringify(app.hoteis)
    );
}

function carregarStorage(){

    const dados = localStorage.getItem('rotaProBuzios');

    if(dados){
        app.hoteis = JSON.parse(dados);
    }else{
        app.hoteis = hoteisBase;
        salvarStorage();
    }
}