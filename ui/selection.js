// ui/selection.js

import {
  HOTELS
}
from '../data/dados.js';

import {
  state
}
from '../core/state.js';

import {

  listaHoteis,
  contadorSelecao,
  contadorRota,

  telaSelecao,
  telaRota,
  telaNavegacao

}
from './elements.js';

import {

  salvarEstadoApp,
  salvarHoteisCustomizados

}
from '../storage/storage.js';

import {
  renderizarRota
}
from './route.js';

import {
  mostrarTela
}
from './screens.js';


// ======================
// GERAR ROTA
// ======================

export function gerarRota(){

  const ativos =
    HOTELS.filter(
      h => state.activeSet.has(h.id)
    );

  if(ativos.length === 0){

    alert(
      'Selecione ao menos um hotel.'
    );

    return;

  }

  state.routeOrder =
    ativos.map(h => h.id);

  renderizarRota();

  mostrarTela(
    telaRota
  );

  salvarEstadoApp();

}


// ======================
// CONTADORES
// ======================

export function atualizarContadores(){

  const texto =
    `${state.activeSet.size} hotéis ativos`;

  contadorSelecao.textContent =
    texto;

  contadorRota.textContent =
    texto;

}


// ======================
// REMOVER HOTEL
// ======================

export function removerHotelCustomizado(id){

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

  salvarHoteisCustomizados();

  renderizarSelecao();

  renderizarRota();

}


// ======================
// RENDER SELEÇÃO
// ======================

export function renderizarSelecao(){

  listaHoteis.innerHTML = '';

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

    listaHoteis.appendChild(div);

  });


// ======================
// TOGGLES
// ======================

  listaHoteis
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

        atualizarContadores();

        salvarEstadoApp();

      }
    );

  });


// ======================
// BOTÃO DELETE
// ======================

  listaHoteis
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

        removerHotelCustomizado(id);

      }
    );

  });


// ======================
// FINAL
// ======================

  atualizarContadores();

  salvarEstadoApp();

}
