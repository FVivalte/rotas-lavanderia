function inicializarDadosSalvos() {  
    const idsSalvos = JSON.parse(localStorage.getItem('rota_salva') || '[]');  
    if (idsSalvos.length > 0) {  
        const todos = [...locaisBase, ...JSON.parse(localStorage.getItem('locais_extras') || '[]')];  
        rotaGerada = todos.filter(l => idsSalvos.includes(l.id));  
    }  
}