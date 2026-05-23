// ===============================
// HOTELS.JS
// ===============================
const HOTELS = window.HOTELS;
// Render seleção (Tela 1)

function renderSelection(){

  hotelListEl.innerHTML = '';

  HOTELS.forEach(h => {

    const div = document.createElement('div');

    div.className = 'item';

    div.innerHTML = `

      <div class="info">

        <div class="name">${h.name}</div>

        <div class="addr">
          ${h.region} • ${h.address}
        </div>

      </div>

      <div class="right">

        ${
          h.custom
          ? `
            <button
              class="delete-hotel"
              data-delete="${h.id}"
            >
              🗑️
            </button>
          `
          : ''
        }

        <label class="switch">

          <input
            type="checkbox"
            data-id="${h.id}"
            ${activeSet.has(h.id) ? 'checked' : ''}
          >

          <span class="slider"></span>

        </label>

      </div>

    `;

    hotelListEl.appendChild(div);

  });

  // ===============================
  // TOGGLES
  // ===============================

  hotelListEl
    .querySelectorAll('input[type=checkbox]')
    .forEach(cb => {

      cb.addEventListener('change', e => {

        const id = Number(e.target.dataset.id);

        if(e.target.checked){

          activeSet.add(id);

        }else{

          activeSet.delete(id);

        }

        const text =
          `${activeSet.size} hotéis ativos`;

        activeCountSelectEl.textContent = text;

        activeCountRouteEl.textContent = text;

        saveAppState();

      });

    });

  // ===============================
  // DELETE HOTEL
  // ===============================

  hotelListEl
    .querySelectorAll('[data-delete]')
    .forEach(btn => {

      btn.addEventListener('click', ()=>{

        const id =
          Number(btn.dataset.delete);

        deleteCustomHotel(id);

      });

    });

  const text =
    `${activeSet.size} hotéis ativos`;

  activeCountSelectEl.textContent = text;

  activeCountRouteEl.textContent = text;

  saveAppState();

}

// ===============================
// SAVE CUSTOM HOTELS
// ===============================

function saveCustomHotels(){

  const customHotels =
    HOTELS.filter(h => h.custom);

  localStorage.setItem(
    CUSTOM_HOTELS_KEY,
    JSON.stringify(customHotels)
  );

}

// ===============================
// LOAD CUSTOM HOTELS
// ===============================

function loadCustomHotels(){

  const saved =
    localStorage.getItem(
      CUSTOM_HOTELS_KEY
    );

  if(!saved) return;

  try{

    const customHotels =
      JSON.parse(saved);

    customHotels.forEach(h => {

      const alreadyExists =
        HOTELS.some(x => x.id === h.id);

      if(!alreadyExists){

        HOTELS.push(h);

      }

    });

  }catch(err){

    console.log(
      'Erro carregando hotéis',
      err
    );

  }

}

// ===============================
// DELETE CUSTOM HOTEL
// ===============================

function deleteCustomHotel(id){

  const index =
    HOTELS.findIndex(
      h => h.id === id
    );

  if(index === -1) return;

  const hotel = HOTELS[index];

  if(!hotel.custom) return;

  const ok = confirm(
    `Excluir ${hotel.name}?`
  );

  if(!ok) return;

  HOTELS.splice(index,1);

  activeSet.delete(id);

  routeOrder =
    routeOrder.filter(x => x !== id);

  routeReport =
    routeReport.filter(r => r.id !== id);

  saveCustomHotels();

  renderSelection();

  renderRoute();

}

// ===============================
// MODAL ADD HOTEL
// ===============================

const modal =
  document.getElementById('hotelModal');

document
.getElementById('btn-add-hotel')
.addEventListener('click', ()=>{

  modal.classList.add('active');

});

document
.getElementById('closeModal')
.addEventListener('click', ()=>{

  modal.classList.remove('active');

});

// ===============================
// SAVE HOTEL
// ===============================

document
.getElementById('saveHotel')
.addEventListener('click', ()=>{

  const name =
    document.getElementById('newName').value;

  const region =
    document.getElementById('newRegion').value;

  const address =
    document.getElementById('newAddress').value;

  const coords =
    document.getElementById('newCoords').value;

  const parsedCoords =
    parseCoords(coords);

  if(
    !name ||
    !address ||
    !parsedCoords
  ){

    alert(
      'Preencha nome, endereço e coordenadas válidas.'
    );

    return;

  }

  HOTELS.push({

    id: Date.now(),

    name,

    region,

    address,

    coords,

    custom: true

  });

  saveCustomHotels();

  renderSelection();

  modal.classList.remove('active');

});
