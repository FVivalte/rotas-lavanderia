function inicializarDadosSalvos() {  
    const idsSalvos = JSON.parse(localStorage.getItem('rota_salva') || '[]');  
    if (idsSalvos.length > 0) {  
        const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
        rotaGerada = todos.filter(l => idsSalvos.includes(l.id));  
    }  
}

function salvarNovoLocal(){  
    const nome = document.getElementById('novo-nome').value;  
    const end = document.getElementById('novo-end').value;  
    const coords = document.getElementById('novo-coords').value.split(',');  
    if(!nome || !end || coords.length < 2){  
        alert("Preencha tudo corretamente. Ex: -22.7490005, -41.9561384");  
        return;  
    }  
    const novo = {  
        id:Date.now(),  
        nome,  
        regiao:"Extra",  
        endereco:end,  
        lat:parseFloat(coords[0].trim()),  
        lon:parseFloat(coords[1].trim()),  
        custom:true,  
        prioridade: 99  
    };  
    let extras = JSON.parse(localStorage.getItem('locais_extras') || '[]');  
    extras.push(novo);  
    localStorage.setItem('locais_extras', JSON.stringify(extras));  
    document.getElementById('novo-nome').value = '';  
    document.getElementById('novo-end').value = '';  
    document.getElementById('novo-coords').value = '';  
    toggleCadastro();  
    carregarSelecao();  
}