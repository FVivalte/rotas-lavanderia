// ui/selection.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  hotelListEl,
  activeCountSelectEl,
  activeCountRouteEl

} from './elements.js';

import {

  saveAppState,
  saveCustomHotels

} from '../storage/storage.js';

import {

  renderRoute

} from './route.js';

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import { renderRoute }
from './route.js';

import {
  screenSelect,
  screenRoute,
  screenMode
} from './elements.js';

import {
  saveAppState
} from '../storage/storage.js';


// ======================
// GERAR ROTA
// ======================

export function generateRoute(){

  const active =
    HOTELS.filter(
      h => state.activeSet.has(h.id)
    );

  if(active.length === 0){

    alert(
      'Selecione ao menos um hotel.'
    );

    return;

  }

  state.routeOrder =
    active.map(h => h.id);

  renderRoute();

  screenSelect.style.display = 'none';

  screenRoute.style.display = 'block';

  screenMode.style.display = 'none';

  saveAppState();

}

// ======================
// CONTADORES
// ======================

export function updateCounters(){

  const text =
    `${state.activeSet.size} hotéis ativos`;

  activeCountSelectEl.textContent =
    text;

  activeCountRouteEl.textContent =
    text;

}


// ======================
// REMOVER HOTEL
// ======================

export function deleteCustomHotel(id){

  const index =
    HOTELS.findIndex(
      h => h.id === id
    );

  if(index === -1) return;

  const hotel = HOTELS[index];

  if(!hotel.custom) return;

  const ok =
    confirm(
      `Excluir ${hotel.name}?`
    );

  if(!ok) return;

  HOTELS.splice(index,1);

  state.activeSet.delete(id);

  state.routeOrder =
    state.routeOrder.filter(
      x => x !== id
    );

  state.routeReport =
    state.routeReport.filter(
      r => r.id !== id
    );

  saveCustomHotels();

  renderSelection();

  renderRoute();

}


// ======================
// RENDER SELEÇÃO
// ======================

export function renderSelection(){

  hotelListEl.innerHTML = '';

  HOTELS.forEach(h=>{

    const div =
      document.createElement('div');

    div.className = 'item';

    div.innerHTML = `

      <div class="info">

        <div class="name">
          ${h.name}
        </div>

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

            ${
              state.activeSet.has(h.id)
              ? 'checked'
              : ''
            }
          >

          <span class="slider"></span>

        </label>

      </div>

    `;

    hotelListEl.appendChild(div);

  });


// ======================
// TOGGLES
// ======================

  hotelListEl
  .querySelectorAll(
    'input[type=checkbox]'
  )
  .forEach(cb=>{

    cb.addEventListener(
      'change',
      e=>{

        const id =
          Number(
            e.target.dataset.id
          );

        if(e.target.checked){

          state.activeSet.add(id);

        }else{

          state.activeSet.delete(id);

        }

        updateCounters();

        saveAppState();

      }
    );

  });


// ======================
// BOTÃO DELETE
// ======================

  hotelListEl
  .querySelectorAll(
    '[data-delete]'
  )
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      ()=>{

        const id =
          Number(
            btn.dataset.delete
          );

        deleteCustomHotel(id);

      }
    );

  });


// ======================
// FINAL
// ======================

  updateCounters();

  saveAppState();

}
