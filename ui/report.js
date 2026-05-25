// ui/report.js

import { HOTELS } from '../data/dados.js';

import { state } from '../core/state.js';

import {
  reportRouteList
  reportModeEl,
  screenReport,
  screenSelect,
  screenRoute,
  screenMode,
  reportRouteList,
  reportTitle
} from './elements.js';

import {
  getPhoto
} from '../storage/database.js';


// ======================
// RELATÓRIO TELA ROTA
// ======================

export function renderReport(){

  reportRouteList.innerHTML = '';

  state.routeReport.forEach((r, idx)=>{

    const h =
      HOTELS.find(x => x.id === r.id);

    if(!h) return;

    const div =
      document.createElement('div');

    div.className = 'report-row';

    div.innerHTML = `
      <div>
        <strong>
          ${idx + 1}. ${h.name}
        </strong>

        <div
          class="muted"
          style="font-size:0.85rem"
        >
          ${h.address}
        </div>
      </div>

      <div style="text-align:right">

        <div class="muted">
          ${
            r.arrival
            ? 'Cheg: ' +
              new Date(r.arrival)
                .toLocaleTimeString()
            : 'Cheg: -'
          }
        </div>

        <div class="muted">
          ${
            r.departure
            ? 'Sai: ' +
              new Date(r.departure)
                .toLocaleTimeString()
            : 'Sai: -'
          }
        </div>

        <div class="muted">
          ${r.entrega ? 'Entrega' : ''}
          ${r.coleta ? 'Coleta' : ''}
        </div>

      </div>
    `;

    reportRouteList.appendChild(div);

  });

}


// ======================
// RELATÓRIO TELA GPS
// ======================

export function renderReportMode(){

  reportModeEl.innerHTML = '';

  state.routeReport.forEach((r, idx)=>{

    const h =
      HOTELS.find(x => x.id === r.id);

    if(!h) return;

    const div =
      document.createElement('div');

    div.className = 'report-row';

    div.innerHTML = `
      <div>
        <strong>
          ${idx + 1}. ${h.name}
        </strong>
      </div>

      <div style="text-align:right">

        <div class="muted">
          ${
            r.arrival
            ? new Date(r.arrival)
                .toLocaleTimeString()
            : '-'
          }
        </div>

        <div class="muted">
          ${
            r.departure
            ? new Date(r.departure)
                .toLocaleTimeString()
            : '-'
          }
        </div>

      </div>
    `;

    reportModeEl.appendChild(div);

  });

}


// ======================
// DATA FORMATADA
// ======================

export function getFormattedDateTitle(){

  const now = new Date();

  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  const weekday =
    weekdays[now.getDay()];

  const day =
    String(now.getDate())
      .padStart(2,'0');

  const month =
    String(now.getMonth() + 1)
      .padStart(2,'0');

  const year =
    now.getFullYear();

  return `
    ROTA do dia
    ${weekday},
    ${day}/${month}/${year}
  `;

}


// ======================
// ESCONDER TELAS
// ======================

export function hideAllScreens(){

  screenSelect.style.display = 'none';

  screenRoute.style.display = 'none';

  screenMode.style.display = 'none';

  screenReport.classList.add('hidden');

}


// ======================
// RELATÓRIO FINAL
// ======================

export async function renderFinalReport(routeData){

  reportRouteList.innerHTML = '';

  reportTitle.textContent =
    getFormattedDateTitle();

  for(
    const [index, hotel]
    of routeData.entries()
  ){

    const deliveryImages = [];

    for(
      const photoId
      of hotel.deliveryPhotos || []
    ){

      const photo =
        await getPhoto(photoId);

      if(photo?.image){

        deliveryImages.push(
          photo.image
        );

      }

    }

    const pickupImages = [];

    for(
      const photoId
      of hotel.pickupPhotos || []
    ){

      const photo =
        await getPhoto(photoId);

      if(photo?.image){

        pickupImages.push(
          photo.image
        );

      }

    }

    const card =
      document.createElement('div');

    card.className =
      'report-item';

    card.innerHTML = `

      <div class="report-top-line">

        <span class="report-order">
          ${index + 1}°
        </span>

        <span class="report-hotel-name">
          ${hotel.name}
        </span>

        <div class="report-time">
          🚥 ${hotel.arrival || '--:--'}
          -
          🏁 ${hotel.departure || '--:--'}
        </div>

      </div>

      <div class="report-photos">

        <div class="report-photo-group">

          <div class="report-photo-label">
            Entrega
          </div>

          <div class="report-photo-list">

            ${
              deliveryImages.length
              ? deliveryImages
                  .map(src => `
                    <img src="${src}">
                  `)
                  .join('')
              : `
                <div class="empty-photo">
                  Sem fotos
                </div>
              `
            }

          </div>

        </div>

        <div class="report-photo-group">

          <div class="report-photo-label">
            Coleta
          </div>

          <div class="report-photo-list">

            ${
              pickupImages.length
              ? pickupImages
                  .map(src => `
                    <img src="${src}">
                  `)
                  .join('')
              : `
                <div class="empty-photo">
                  Sem fotos
                </div>
              `
            }

          </div>

        </div>

      </div>

    `;

    reportRouteList.appendChild(card);

  }

}


// ======================
// ABRIR RELATÓRIO
// ======================

export async function openReportScreen(routeData){

  hideAllScreens();

  screenReport.classList.remove(
    'hidden'
  );

  screenReport.style.display =
    'block';

  await renderFinalReport(
    routeData
  );

}
