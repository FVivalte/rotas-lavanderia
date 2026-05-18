const app = {
    hoteis: [],
    rotaAtual: [],
    relatorio: [],
    modoMapa: 'mapa'
};

const hoteisBase = [
    {
        id:1,
        nome:'Hotel Atlântico',
        bairro:'Centro',
        tipo:'Entrega',
        ativo:true,
        lat:-22.7580,
        lng:-41.8870,
        chegada:null,
        saida:null
    },
    {
        id:2,
        nome:'Pousada Brisa',
        bairro:'João Fernandes',
        tipo:'Coleta',
        ativo:true,
        lat:-22.7425,
        lng:-41.8758,
        chegada:null,
        saida:null
    },
    {
        id:3,
        nome:'Rio Búzios Resort',
        bairro:'Geribá',
        tipo:'Entrega',
        ativo:true,
        lat:-22.7794,
        lng:-41.9182,
        chegada:null,
        saida:null
    }
];