// =========================
// STORAGE KEY
// =========================

const HOTELS_STORAGE_KEY =
  'rota_hoteis';

// =========================
// HOTÉIS PADRÃO
// =========================

const DEFAULT_HOTELS = [

  {
    id:1,

    name:"Hotel Aretê",

    region:"Baía Formosa / Rasa",

    address:
      "Alameda Andorinhas – Loteamento Praia Baía Formosa, Armação dos Búzios - RJ",

    coords:"-22.7490005,-41.9561384"
  },

  {
    id:2,

    name:"Pousada Manaaki",

    region:"Praia Rasa",

    address:
      "Av. Greta Blanck do Rio, 82 – Praia Rasa, Armação dos Búzios - RJ",

    coords:"-22.7632675,-41.9422559"
  },

  {
    id:3,

    name:"Pousada Maré Búzios",

    region:"Vila Luiza",

    address:
      "Rua do Começo, 162 – Vila Luiza, Armação dos Búzios - RJ",

    coords:"-22.7597922,-41.9441392"
  },

  {
    id:4,

    name:"Casa da Ruth Pousada",

    region:"Geribá",

    address:
      "Rua Gerbert Périssé, 10 – Geribá, Armação dos Búzios - RJ",

    coords:"-22.7798199,-41.9146731"
  },

  {
    id:5,

    name:"Maravista Hotel e Spa",

    region:"Geribá",

    address:
      "Rua Gerbert Périssé, 276 – Praia de Geribá, Armação dos Búzios - RJ",

    coords:"-22.7796447,-41.9143854"
  },

  {
    id:6,

    name:"Le Relais La Borie",

    region:"Geribá",

    address:
      "Rua Gerbert Périssé, 554 – Geribá Beach, Armação dos Búzios - RJ",

    coords:"-22.7783015,-41.9118299"
  },

  {
    id:7,

    name:"Carmel",

    region:"Ferradura",

    address:
      "Rua Parque, 17 – Praia da Ferradura, Armação dos Búzios - RJ",

    coords:"-22.7709027,-41.8910921"
  },

  {
    id:8,

    name:"Lavanderia LAVILAGOS",

    region:"Ferradura",

    address:
      "Av. José Bento Ribeiro Dantas, 1195 – Ferradura, Armação dos Búzios - RJ",

    coords:"-22.7625969,-41.8964253"
  },

  {
    id:9,

    name:"Aroma",

    region:"Village",

    address:
      "Rua Quinze, 379-221 – Village de Búzios, Armação dos Búzios - RJ",

    coords:"-22.7533440,-41.8780750"
  },

  {
    id:10,

    name:"Hibiscus Beach",

    region:"Village",

    address:
      "Rua 01, 22 – Village de Búzios, Armação dos Búzios - RJ",

    coords:"-22.7442026,-41.8758089"
  },

  {
    id:11,

    name:"Condomínio Praia Brava",

    region:"Village",

    address:
      "Rua Dezessete, 2-60 – Village de Búzios - RJ",

    coords:"-22.7570727,-41.8766645"
  },

  {
    id:12,

    name:"Vale das Emas",

    region:"Village",

    address:
      "Rua Miguelote Viana – Village de Búzios, Armação dos Búzios - RJ",

    coords:"-22.7485933,-41.8805990"
  },

  {
    id:13,

    name:"Mainá",

    region:"Village",

    address:
      "Travessa Vilage, 36 – Village de Búzios - RJ",

    coords:"-22.7474848,-41.8793541"
  },

  {
    id:14,

    name:"Azeda",

    region:"Azeda / Ossos",

    address:
      "Código Plus: 743C+MM6 – Armação dos Búzios - RJ",

    coords:"-22.7458674,-41.8783928"
  }
];

// =========================
// CARREGA HOTÉIS
// =========================

function carregarHoteis(){

  const dados =
    localStorage.getItem(
      HOTELS_STORAGE_KEY
    );

  if(!dados){

    localStorage.setItem(

      HOTELS_STORAGE_KEY,

      JSON.stringify(DEFAULT_HOTELS)
    );

    return [...DEFAULT_HOTELS];
  }

  try{

    return JSON.parse(dados);

  }catch(e){

    console.error(e);

    return [...DEFAULT_HOTELS];
  }
}

// =========================
// ARRAY GLOBAL
// =========================

let HOTELS =
  carregarHoteis();

// =========================
// SALVA HOTÉIS
// =========================

function salvarHoteis(){

  localStorage.setItem(

    HOTELS_STORAGE_KEY,

    JSON.stringify(HOTELS)
  );
}

// =========================
// GERAR NOVO ID
// =========================

function gerarNovoId(){

  if(HOTELS.length === 0){

    return 1;
  }

  const maiorId =
    Math.max(
      ...HOTELS.map(h => h.id)
    );

  return maiorId + 1;
}

// =========================
// ADD HOTEL
// =========================

function adicionarHotel(dados){

  const novoHotel = {

    id:gerarNovoId(),

    name:dados.name || 'Sem nome',

    region:dados.region || '',

    address:dados.address || '',

    coords:dados.coords || ''
  };

  HOTELS.push(novoHotel);

  salvarHoteis();

  return novoHotel;
}

// =========================
// EDIT HOTEL
// =========================

function editarHotel(id, novosDados){

  const index =
    HOTELS.findIndex(
      h => h.id === id
    );

  if(index === -1){

    return false;
  }

  HOTELS[index] = {

    ...HOTELS[index],

    ...novosDados
  };

  salvarHoteis();

  return true;
}

// =========================
// REMOVER HOTEL
// =========================

function removerHotel(id){

  HOTELS =
    HOTELS.filter(
      h => h.id !== id
    );

  salvarHoteis();
}

// =========================
// BUSCAR HOTEL
// =========================

function buscarHotel(id){

  return HOTELS.find(
    h => h.id === id
  );
}

// =========================
// LISTAR HOTÉIS
// =========================

function listarHoteis(){

  return [...HOTELS];
}

// =========================
// RESETAR HOTÉIS
// =========================

function resetarHoteis(){

  HOTELS = [...DEFAULT_HOTELS];

  salvarHoteis();
}

// =========================
// EXPORT GLOBAL
// =========================

window.HOTELS = HOTELS;

window.adicionarHotel =
  adicionarHotel;

window.editarHotel =
  editarHotel;

window.removerHotel =
  removerHotel;

window.buscarHotel =
  buscarHotel;

window.listarHoteis =
  listarHoteis;

window.resetarHoteis =
  resetarHoteis;