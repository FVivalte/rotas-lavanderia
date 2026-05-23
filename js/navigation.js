// ==============================
// navigation.js
// ==============================

// Voz navegação

function speak(text){

  if(!speechEnabled) return;

  if(text === lastInstruction) return;

  lastInstruction = text;

  const utter =
    new SpeechSynthesisUtterance(text);

  utter.lang = 'pt-BR';

  utter.rate = 1;

  speechSynthesis.speak(utter);

}


// ==============================
// INICIAR MODO ROTA
// ==============================

function startModeRoute(){

  if(routeOrder.length === 0){

    alert('Gere a rota primeiro.');

    return;

  }

  currentIndex = 0;

  routeReport = routeOrder.map(id => ({

    id,

    arrival:null,

    departure:null,

    entrega:false,

    coleta:false,

    deliveryPhotos:[],

    pickupPhotos:[]

  }));

  screenSelect.style.display = 'none';

  screenRoute.style.display = 'none';

  screenMode.style.display = 'block';

  initMap();

  updateMap();

  startGpsTracking();

  updateModeUI();

  renderReportMode();

  renderPhotoPreviews();

  saveAppState();

}


// ==============================
// UPDATE UI MODO NAVEGAÇÃO
// ==============================

function updateModeUI(){

  if(currentIndex >= routeOrder.length){

    currentHotelEl.innerHTML = `
      <div>
        <strong>Rota finalizada</strong>
      </div>
    `;

    nextTwoEl.innerHTML = '';

    return;

  }

  const id = routeOrder[currentIndex];

  const hotel =
    HOTELS.find(x => x.id === id);

  currentHotelEl.innerHTML = `
    <div style="font-weight:700">
      ${hotel.name}
    </div>

    <div class="muted">
      ${hotel.address}
    </div>
  `;

  // próximos hotéis

  nextTwoEl.innerHTML = '';

  for(let i = 1; i <= 2; i++){

    const idx = currentIndex + i;

    if(idx < routeOrder.length){

      const nextHotel =
        HOTELS.find(
          x => x.id === routeOrder[idx]
        );

      const div =
        document.createElement('div');

      div.className = 'next-card';

      div.innerHTML = `
        <strong>${nextHotel.name}</strong>

        <div
          class="muted"
          style="font-size:0.85rem"
        >
          ${nextHotel.address}
        </div>
      `;

      nextTwoEl.appendChild(div);

    }

  }

  // checkbox entrega/coleta

  const entry = routeReport[currentIndex];

  document.getElementById(
    'chk-entrega'
  ).checked = entry.entrega;

  document.getElementById(
    'chk-coleta'
  ).checked = entry.coleta;

  // botão próximo/finalizar

  const nextBtn =
    document.getElementById('btn-next');

  if(currentIndex === routeOrder.length - 1){

    nextBtn.textContent = 'Finalizar';

  }else{

    nextBtn.textContent = 'Próximo hotel';

  }

}


// ==============================
// BOTÃO PRÓXIMO HOTEL
// ==============================

document
.getElementById('btn-next')
.addEventListener('click', ()=>{

  if(currentIndex >= routeOrder.length)
    return;

  const entrega =
    document.getElementById(
      'chk-entrega'
    ).checked;

  const coleta =
    document.getElementById(
      'chk-coleta'
    ).checked;

  const now = new Date();

  const entry =
    routeReport[currentIndex];

  if(!entry.arrival){

    entry.arrival = now.toISOString();

  }

  entry.entrega = entrega;

  entry.coleta = coleta;

  entry.departure =
    new Date().toISOString();

  arrivalConfirmed = false;

  currentIndex++;

  // terminou rota

  if(currentIndex >= routeOrder.length){

    document
      .getElementById('btn-finish')
      .click();

    return;

  }

  updateModeUI();

  renderPhotoPreviews();

  updateMap();

  renderReportMode();

  saveAppState();

});


// ==============================
// BOTÃO GOOGLE MAPS
// ==============================

document
.getElementById('btn-open-maps')
.addEventListener('click', ()=>{

  if(currentIndex >= routeOrder.length)
    return;

  const id =
    routeOrder[currentIndex];

  const hotel =
    HOTELS.find(h => h.id === id);

  window.open(
    `https://www.google.com/maps?q=${hotel.coords}`,
    '_blank'
  );

});


// ==============================
// FINALIZAR ROTA
// ==============================

document
.getElementById('btn-finish')
.addEventListener('click', ()=>{

  stopGpsTracking();

  const finalData =
    routeReport.map(r => {

      const hotel =
        HOTELS.find(
          h => h.id === r.id
        );

      return {

        name: hotel.name,

        arrival: r.arrival
          ? new Date(r.arrival)
              .toLocaleTimeString(
                'pt-BR',
                {
                  hour:'2-digit',
                  minute:'2-digit'
                }
              )
          : '--:--',

        departure: r.departure
          ? new Date(r.departure)
              .toLocaleTimeString(
                'pt-BR',
                {
                  hour:'2-digit',
                  minute:'2-digit'
                }
              )
          : '--:--',

        deliveryPhotos:
          r.deliveryPhotos || [],

        pickupPhotos:
          r.pickupPhotos || []

      };

    });

  openReportScreen(finalData);

});


// ==============================
// TOGGLE VOZ
// ==============================

const voiceToggle =
  document.getElementById(
    'voiceToggle'
  );

voiceToggle.addEventListener(
  'click',
  ()=>{

    speechEnabled =
      !speechEnabled;

    if(speechEnabled){

      voiceToggle.classList.remove('off');

      voiceToggle.classList.add('on');

      voiceToggle.textContent =
        '🔊 Voz ligada';

    }else{

      voiceToggle.classList.remove('on');

      voiceToggle.classList.add('off');

      voiceToggle.textContent =
        '🔇 Voz desligada';

      speechSynthesis.cancel();

    }

  }
);
