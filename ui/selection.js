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

  setTimeout(()=>{

    if(!mapas['mapa-rota']){

      inicializarMapa(
        'mapa-rota'
      );

    }

    adicionarMarcadoresHoteis(
      ativos,
      'mapa-rota'
    );

    const bounds =
      new maplibregl.LngLatBounds();

    ativos.forEach(h=>{

      if(
        h.lat != null &&
        h.lng != null
      ){

        bounds.extend([
          Number(h.lng),
          Number(h.lat)
        ]);

      }

    });

    if(
      !bounds.isEmpty()
    ){

      mapas['mapa-rota']
        .fitBounds(
          bounds,
          {
            padding:50,
            maxZoom:16
          }
        );

    }

  },200);

  salvarEstadoApp();

}


// ======================
// CONTADORES
// ======================

export function atualizarContadores(){

  const texto = `${state.activeSet.size} hotéis ativos`;

  // Só injeta o texto se o contador existir
  if (contadorSelecao) {
    contadorSelecao.textContent = texto;
  }

  if (contadorRota) {
    contadorRota.textContent = texto;
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
