// ui/report.js

import {
  HOTELS
}
from '../data/dados.js';

import {
  state
}
from '../core/state.js';

import {

  listaRelatorioRota,
  listaRelatorioFinal,
  relatorioModo,
  telaRelatorio,
  tituloRelatorio

}
from './elements.js';

import {
  mostrarTela
}
from './screens.js';

import {
  getPhoto
}
from '../storage/database.js';

import { getFormattedDateTitle }
from '../utils/utils.js';

// ======================
// RELATÓRIO TELA ROTA
// ======================

export function renderizarRelatorio(){

  if(!listaRelatorioRota){
    return;
  }

  listaRelatorioRota.innerHTML = '';

  state.routeReport.forEach((r, idx)=>{

    const hotel =
      HOTELS.find(
        x => x.id === r.id
      );

    if(!hotel) return;

    const div =
      document.createElement('div');

    div.className =
      'report-row';

    div.innerHTML = `

      <div>

        <strong>
          ${idx + 1}. ${hotel.name}
        </strong>

        <div
          class="muted"
          style="font-size:0.85rem"
        >
          ${hotel.address}
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

          ${r.entrega ? 'Entrega ' : ''}
          ${r.coleta ? 'Coleta' : ''}

        </div>

      </div>

    `;

    listaRelatorioRota
      .appendChild(div);

  });

}


// ======================
// RELATÓRIO MODO GPS
// ======================

export function renderizarRelatorioModo(){

  if(!relatorioModo){
    return;
  }

  relatorioModo.innerHTML = '';

  state.routeReport.forEach((r, idx)=>{

    const hotel =
      HOTELS.find(
        x => x.id === r.id
      );

    if(!hotel) return;

    const div =
      document.createElement('div');

    div.className =
      'report-row';

    div.innerHTML = `

      <div>

        <strong>
          ${idx + 1}. ${hotel.name}
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

    relatorioModo
      .appendChild(div);

  });

}


// ======================
// RELATÓRIO FINAL
// ======================

export async function renderizarRelatorioFinal(
  dadosRota
){

  if(!listaRelatorioFinal){
    return;
  }

  listaRelatorioFinal.innerHTML = '';

  if(tituloRelatorio){

    tituloRelatorio.textContent =
      obterTituloData();

  }

  for(
    const [index, hotel]
    of dadosRota.entries()
  ){

    const imagensEntrega = [];

    for(
      const photoId
      of hotel.deliveryPhotos || []
    ){

      const photo =
        await getPhoto(photoId);

      if(photo?.image){

        imagensEntrega.push(
          photo.image
        );

      }

    }

    const imagensColeta = [];

    for(
      const photoId
      of hotel.pickupPhotos || []
    ){

      const photo =
        await getPhoto(photoId);

      if(photo?.image){

        imagensColeta.push(
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
              imagensEntrega.length
              ? imagensEntrega
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
              imagensColeta.length
              ? imagensColeta
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

    listaRelatorioFinal
      .appendChild(card);

  }

}


// ======================
// ABRIR RELATÓRIO
// ======================

export async function abrirTelaRelatorio(
  dadosRota
){

  mostrarTela(
    telaRelatorio
  );

  await renderizarRelatorioFinal(
    dadosRota
  );

}
