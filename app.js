// =========================
// ELEMENTOS
// =========================

const btnCreate =
  document.getElementById(
    'btn-create'
  );

const btnClear =
  document.getElementById(
    'btn-clear'
  );

const btnBack =
  document.getElementById(
    'btn-back'
  );

const btnStartRoute =
  document.getElementById(
    'btn-start-route'
  );

const btnNext =
  document.getElementById(
    'btn-next'
  );

const hotelList =
  document.getElementById(
    'hotelList'
  );

const routeList =
  document.getElementById(
    'routeList'
  );

const screenSelect =
  document.getElementById(
    'screen-select'
  );

const screenRoute =
  document.getElementById(
    'screen-route'
  );

const screenMode =
  document.getElementById(
    'screen-mode'
  );

const currentHotel =
  document.getElementById(
    'currentHotel'
  );

const photoInput =
  document.getElementById(
    'photoInput'
  );

const photoPreview =
  document.getElementById(
    'photoPreview'
  );

const chkEntrega =
  document.getElementById(
    'chk-entrega'
  );

const chkColeta =
  document.getElementById(
    'chk-coleta'
  );

// =========================
// INDEX HOTEL ATUAL
// =========================

let currentRouteIndex = 0;

// =========================
// BASE64
// =========================

function fileToBase64(file){

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {

      resolve(reader.result);
    };

    reader.onerror = reject;
  });
}

// =========================
// RENDER HOTÉIS
// =========================

function renderHotelList(){

  hotelList.innerHTML = '';

  HOTELS.forEach(h => {

    const div =
      document.createElement('div');

    div.className = 'item';

    div.innerHTML = `

      <div class="info">

        <div class="name">

          ${h.name}

        </div>

        <div class="addr">

          ${h.region}

        </div>

      </div>

      <label class="switch">

        <input
          type="checkbox"
          class="hotel-check"
          data-id="${h.id}"
        />

        <span class="slider"></span>

      </label>
    `;

    hotelList.appendChild(div);
  });
}

// =========================
// RENDER ROTA
// =========================

function renderRouteList(){

  routeList.innerHTML = '';

  routeReport.forEach((r, index) => {

    const h =
      HOTELS.find(
        x => x.id === r.id
      );

    const div =
      document.createElement('div');

    div.className =
      'route-item';

    div.innerHTML = `

      <div>

        <strong>

          ${index + 1}.
          ${h.name}

        </strong>

        <div class="muted">

          ${h.region}

        </div>

      </div>

      <i
        data-lucide="grip"
        class="drag-handle"
      ></i>
    `;

    routeList.appendChild(div);
  });

  // SORTABLE

  new Sortable(

    routeList,

    {

      animation:150,

      handle:'.drag-handle',

      onEnd(){

        const novaRota = [];

        [
          ...routeList.children
        ].forEach(item => {

          const texto =
            item.innerText;

          const hotel =
            HOTELS.find(
              h =>
                texto.includes(
                  h.name
                )
            );

          const rota =
            routeReport.find(
              r =>
                r.id === hotel.id
            );

          novaRota.push(rota);
        });

        routeReport = novaRota;
      }
    }
  );

  lucide.createIcons();
}

// =========================
// HOTEL ATUAL
// =========================

function renderCurrentHotel(){

  const r =
    routeReport[
      currentRouteIndex
    ];

  if(!r){

    return;
  }

  const h =
    HOTELS.find(
      x => x.id === r.id
    );

  currentHotel.innerHTML = `

    <h2>

      ${currentRouteIndex + 1}.
      ${h.name}

    </h2>

    <div class="gps-badge">

      ${h.region}

    </div>
  `;

  chkEntrega.checked =
    r.entrega;

  chkColeta.checked =
    r.coleta;

  photoPreview.innerHTML = '';

  r.fotos.forEach(f => {

    const img =
      document.createElement('img');

    img.src = f;

    photoPreview.appendChild(img);
  });
}

// =========================
// FOTOS
// =========================

async function handlePhotos(){

  const r =
    routeReport[
      currentRouteIndex
    ];

  if(!r){

    return;
  }

  const files =
    [...photoInput.files];

  const imagens = [];

  photoPreview.innerHTML = '';

  for(const file of files){

    const base64 =
      await fileToBase64(file);

    imagens.push(base64);

    const img =
      document.createElement('img');

    img.src = base64;

    img.className =
      'preview-image';

    photoPreview.appendChild(img);
  }

  r.fotos = imagens;

  renderReportMode();
}

// =========================
// EVENTOS
// =========================

// CRIAR ROTA

btnCreate?.addEventListener(

  'click',

  () => {

    createRoute();

    renderRouteList();

    screenSelect.classList.add(
      'hidden'
    );

    screenRoute.classList.remove(
      'hidden'
    );
  }
);

// VOLTAR

btnBack?.addEventListener(

  'click',

  () => {

    screenRoute.classList.add(
      'hidden'
    );

    screenSelect.classList.remove(
      'hidden'
    );
  }
);

// INICIAR VIAGEM

btnStartRoute?.addEventListener(

  'click',

  () => {

    currentRouteIndex = 0;

    screenRoute.classList.add(
      'hidden'
    );

    screenMode.classList.remove(
      'hidden'
    );

    renderCurrentHotel();
  }
);

// PRÓXIMO HOTEL

btnNext?.addEventListener(

  'click',

  () => {

    const r =
      routeReport[
        currentRouteIndex
      ];

    if(r){

      r.entrega =
        chkEntrega.checked;

      r.coleta =
        chkColeta.checked;

      r.saida =
        new Date();
    }

    currentRouteIndex++;

    if(

      currentRouteIndex >=
      routeReport.length

    ){

      alert(
        'Rota finalizada!'
      );

      screenMode.classList.add(
        'hidden'
      );

      screenSelect.classList.remove(
        'hidden'
      );

      return;
    }

    renderCurrentHotel();

    renderReportMode();
  }
);

// LIMPAR

btnClear?.addEventListener(

  'click',

  () => {

    clearRoute();

    routeReport = [];

    currentRouteIndex = 0;

    routeList.innerHTML = '';

    reportMode.innerHTML = '';

    photoPreview.innerHTML = '';
  }
);

// FOTO

photoInput?.addEventListener(

  'change',

  handlePhotos
);

// =========================
// INIT
// =========================

window.addEventListener(

  'load',

  () => {

    initMap();

    renderHotelList();

    lucide.createIcons();
  }
);