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
  inicializarMapa,
  adicionarMarcadoresHoteis,
  mapas
}
from '../services/map.js';

import {

  listaHoteis,
  contadorSelecao,
  contadorRota,

  telaSelecao,
  telaRota,
  telaNavegacao,
  filtroRegiao

}
from './elements.js';

import {

  salvarEstadoApp,
  salvarHoteisCustomizados

}
from '../storage/storage.js';

import { renderizarRota, atualizarMapa } from './route.js';

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

  mostrarTela(
    telaRota
  );

  renderizarRota();
  atualizarMapa();

  salvarEstadoApp();

}


// ======================
// CONTADORES
// ======================

export function atualizarContadores(){

  // tela de seleção: quantos estão marcados
  if (contadorSelecao) {
    contadorSelecao.textContent =
      `${state.activeSet.size} hotéis ativos`;
  }

  // tela de rota: quantos estão na rota atual
  if (contadorRota) {
    contadorRota.textContent =
      `${state.routeOrder.length} hotéis na rota`;
  }

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

obterHoteisFiltrados()
  .forEach(h=>{

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
  
function renderizarChipsRegioes() {

  const container =
    document.getElementById(
      'filtro-regioes'
    );

  if (!container) return;

  const regioes = [

    'Todas',

    ...new Set(
      HOTELS.map(
        hotel => hotel.region
      )
    )

  ];

  container.innerHTML = '';

  regioes.forEach(regiao => {

    const total =
      regiao === 'Todas'

        ? HOTELS.length

        : HOTELS.filter(
            h =>
              h.region === regiao
          ).length;

    const chip =
      document.createElement(
        'button'
      );

    chip.className =
      'chip-regiao';

    if (
      state.selectedRegion ===
      regiao
    ) {
      chip.classList.add(
        'ativo'
      );
    }

    chip.textContent =
      `${regiao} (${total})`;

    chip.onclick = () => {

      state.selectedRegion =
        regiao;

      renderizarChipsRegioes();

      renderizarSelecao();

    };

    container.appendChild(
      chip
    );

  });

}

function obterHoteisFiltrados() {

  if (
    state.selectedRegion ===
    'Todas'
  ) {
    return HOTELS;
  }

  return HOTELS.filter(
    hotel =>
      hotel.region ===
      state.selectedRegion
  );

}

// ======================
// DELEGAÇÃO DE EVENTOS (Performance Máxima)
// ======================

listaHoteis.addEventListener('click', (e) => {
  // Caso 1: Clique no botão de deletar (ou no emoji dentro dele)
  const btnDelete = e.target.closest('[data-delete]');
  if (btnDelete) {
    const id = Number(btnDelete.dataset.delete);
    removerHotelCustomizado(id);
    return;
  }
});

listaHoteis.addEventListener('change', (e) => {
  // Caso 2: Clique no checkbox
  if (e.target.matches('input[type=checkbox]')) {
    const id = Number(e.target.dataset.id);
    
    if (e.target.checked) {
      state.activeSet.add(id);
    } else {
      state.activeSet.delete(id);
    }
    renderizarChipsRegioes();
    atualizarContadores();
    salvarEstadoApp();
  }
});
// ======================
// FINAL
// ======================

  atualizarContadores();

  salvarEstadoApp();

}
