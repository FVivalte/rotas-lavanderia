// =========================
// ELEMENTOS
// =========================

const btnGenerate =
  document.getElementById(
    'btn-generate'
  );

const btnReset =
  document.getElementById(
    'btn-reset'
  );

const hotelList =
  document.getElementById(
    'hotelList'
  );

const photoInput =
  document.getElementById(
    'photoInput'
  );

const photoPreview =
  document.getElementById(
    'photoPreview'
  );

// =========================
// HOTEL ATUAL
// =========================

let currentRouteIndex = 0;

// =========================
// FILE -> BASE64
// =========================

function fileToBase64(file){

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {

      resolve(reader.result);
    };

    reader.onerror = error => {

      reject(error);
    };
  });
}

// =========================
// RENDER LISTA HOTÉIS
// =========================

function renderHotelList(){

  if(!hotelList){

    return;
  }

  hotelList.innerHTML = '';

  HOTELS.forEach(h => {

    const item =
      document.createElement('div');

    item.className =
      'hotel-item';

    item.innerHTML = `

      <div class="hotel-info">

        <strong>

          ${h.name}

        </strong>

        <div class="muted">

          ${h.region}

        </div>

      </div>
    `;

    hotelList.appendChild(item);
  });
}

// =========================
// FOTOS
// =========================

async function handlePhotos(){

  if(

    !photoInput ||

    !routeReport[
      currentRouteIndex
    ]

  ){

    return;
  }

  const files =
    [...photoInput.files];

  photoPreview.innerHTML = '';

  const imagens = [];

  for(const file of files){

    const base64 =
      await fileToBase64(file);

    imagens.push(base64);

    // =========================
    // PREVIEW
    // =========================

    const img =
      document.createElement('img');

    img.src = base64;

    img.className =
      'preview-image';

    photoPreview.appendChild(img);
  }

  // =========================
  // SALVA NO HOTEL ATUAL
  // =========================

  routeReport[
    currentRouteIndex
  ].fotos = imagens;

  console.log(

    routeReport[
      currentRouteIndex
    ]
  );
}

// =========================
// EVENTOS
// =========================

// CRIAR ROTA

btnGenerate?.addEventListener(

  'click',

  () => {

    currentRouteIndex = 0;

    createRoute();

    renderReportMode();
  }
);

// LIMPAR ROTA

btnReset?.addEventListener(

  'click',

  () => {

    clearRoute();

    routeReport = [];

    currentRouteIndex = 0;

    if(

      typeof renderReportMode
      === 'function'

    ){

      reportMode.innerHTML = '';
    }

    photoPreview.innerHTML = '';
  }
);

// INPUT FOTO

photoInput?.addEventListener(

  'change',

  handlePhotos
);

// =========================
// BOTÃO PRÓXIMO
// =========================

const btnNext =
  document.getElementById(
    'btn-next'
  );

btnNext?.addEventListener(

  'click',

  () => {

    currentRouteIndex++;

    renderReportMode();
  }
);

// =========================
// START APP
// =========================

window.addEventListener(

  'load',

  () => {

    // MAPA

    initMap();

    // HOTÉIS

    renderHotelList();

    // ÍCONES

    lucide.createIcons();
  }
);