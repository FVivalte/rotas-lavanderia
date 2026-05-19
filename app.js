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

      <!-- SWITCH -->

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
// FOTOS
// =========================

async function handlePhotos(){

  if(

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

    const img =
      document.createElement('img');

    img.src = base64;

    img.className =
      'preview-image';

    photoPreview.appendChild(img);
  }

  routeReport[
    currentRouteIndex
  ].fotos = imagens;

  renderReportMode();
}

// =========================
// EVENTOS
// =========================

btnGenerate?.addEventListener(

  'click',

  () => {

    currentRouteIndex = 0;

    createRoute();
  }
);

btnReset?.addEventListener(

  'click',

  () => {

    clearRoute();

    routeReport = [];

    reportMode.innerHTML = '';

    photoPreview.innerHTML = '';
  }
);

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