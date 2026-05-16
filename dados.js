let locaisBase = [  
    {id:1, nome:"Hotel Aretê", regiao:"Baía Formosa / Rasa", endereco:"Alameda Andorinhas – Loteamento Praia Baía Formosa", lat:-22.7490005, lng:-41.9561384, plus:"722V+9GX Armação dos Búzios, RJ", prioridade:1},  
    {id:2, nome:"Pousada Manaaki", regiao:"Praia Rasa", endereco:"Av. Greta Blanck do Rio, 82", lat:-22.7632675, lng:-41.9422559, plus:"63P5+M3 Armação dos Búzios, RJ", prioridade:2},  
    {id:3, nome:"Pousada Maré Búzios", regiao:"Vila Luiza", endereco:"Rua do Começo, 162", lat:-22.7597922, lng:-41.9441392, plus:"63R4+38 Armação dos Búzios, RJ", prioridade:2},  
    {id:4, nome:"Casa da Ruth Pousada", regiao:"Geribá", endereco:"Rua Gerbert Périssé, 10", lat:-22.7798199, lng:-41.9146731, plus:"63CP+34 Armação dos Búzios, RJ", prioridade:2},  
    {id:5, nome:"Maravista Hotel e Spa", regiao:"Geribá", endereco:"Rua Gerbert Périssé, 276", lat:-22.7796447, lng:-41.9143854, plus:"63CP+46 Armação dos Búzios, RJ", prioridade:2},  
    {id:6, nome:"Le Relais La Borie", regiao:"Geribá", endereco:"Rua Gerbert Périssé, 554", lat:-22.7783015, lng:-41.9118299, plus:"63CQ+M7 Armação dos Búzios, RJ", prioridade:2},  
    {id:7, nome:"Carmel", regiao:"Ferradura", endereco:"Rua Parque, 17", lat:-22.7709027, lng:-41.8910921, plus:"64H5+JH Armação dos Búzios, RJ", prioridade:4},  
    {id:8, nome:"Lavanderia LAVILAGOS", regiao:"Ferradura", endereco:"Av. José Bento Ribeiro Dantas, 1195", lat:-22.7625969, lng:-41.8964253, plus:"64P3+XC Armação dos Búzios, RJ", prioridade:2.5},  
    {id:9, nome:"Aroma", regiao:"Village", endereco:"Rua Quinze, 379-221", lat:-22.7533440, lng:-41.8780750, plus:"64WC+MQ Armação dos Búzios, RJ", prioridade:3},  
    {id:10, nome:"Hibiscus Beach", regiao:"Village", endereco:"Rua 01, 22", lat:-22.7442026, lng:-41.8758089, plus:"744F+8M Armação dos Búzios, RJ", prioridade:4},  
    {id:11, nome:"Condomínio Praia Brava", regiao:"Village", endereco:"Rua Dezessete, 2-60", lat:-22.7570727, lng:-41.8766645, plus:"64VF+58 Armação dos Búzios, RJ", prioridade:4},  
    {id:12, nome:"Vale das Emas", regiao:"Village", endereco:"Rua Miguelote Viana", lat:-22.7485933, lng:-41.8805990, plus:"7429+HQ Armação dos Búzios, RJ", prioridade:4},  
    {id:13, nome:"Mainá", regiao:"Village", endereco:"Travessa Vilage, 36", lat:-22.7475234, lng:-41.8791968, plus:"742C+X8V Armação dos Búzios, RJ", prioridade:4},  
    {id:14, nome:"Azeda", regiao:"Azeda / Ossos", endereco:"Praia da Azeda", lat:-22.7458674, lng:-41.8783928, plus:"743C+MJ Armação dos Búzios, RJ", prioridade:4}  
];
function criarNovoLocal(nome, endereco, lat, lon) {
    return {
        id: Date.now(),
        nome,
        regiao: "Extra",
        endereco,
        lat,
        lon,
        custom: true,
        prioridade: 99
    };
}