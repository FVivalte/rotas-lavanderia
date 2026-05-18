// =========================
// DADOS DOS HOTÉIS
// =========================

let HOTELS = JSON.parse(

  localStorage.getItem('rota_hoteis')

) || [

  {
    id:1,
    name:"Hotel Aretê",
    region:"Baía Formosa / Rasa",
    address:"Alameda Andorinhas",
    coords:"-22.7490005,-41.9561384"
  },

  {
    id:2,
    name:"Pousada Manaaki",
    region:"Praia Rasa",
    address:"Av. Greta Blanck do Rio",
    coords:"-22.7632675,-41.9422559"
  }

];

// =========================
// SALVAR HOTÉIS
// =========================

function salvarHoteis(){

  localStorage.setItem(

    'rota_hoteis',

    JSON.stringify(HOTELS)
  );
}

// =========================
// GERAR ID
// =========================

function gerarHotelId(){

  if(HOTELS.length === 0){

    return 1;
  }

  return Math.max(

    ...HOTELS.map(h => h.id)

  ) + 1;
}

// =========================
// ADICIONAR HOTEL
// =========================

function adicionarHotel({

  name,
  region,
  address,
  coords

}){

  const novoHotel = {

    id: gerarHotelId(),

    name,

    region,

    address,

    coords
  };

  HOTELS.push(novoHotel);

  salvarHoteis();

  return novoHotel;
}

// =========================
// REMOVER HOTEL
// =========================

function removerHotel(id){

  HOTELS = HOTELS.filter(

    h => h.id !== id
  );

  salvarHoteis();
}

// =========================
// EDITAR HOTEL
// =========================

function editarHotel(

  id,
  novosDados

){

  const hotel = HOTELS.find(

    h => h.id === id
  );

  if(!hotel) return;

  Object.assign(

    hotel,

    novosDados
  );

  salvarHoteis();
}