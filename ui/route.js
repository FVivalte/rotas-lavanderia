// ui/route.js

import {
  HOTELS
}
from '../data/dados.js';

import {
  state
}
from '../core/state.js';

import {

  listaRota,
  contadorSelecao,
  contadorRota

}
from './elements.js';

import {

  renderSelection

}
from './selection.js';

import {

  renderizarRelatorio

}
from './report.js';

import {

  salvarEstadoApp

}
from '../storage/storage.js';


// ======================
// CONTADORES
// ======================

function atualizarContadores(){

  const texto =
    `${state.activeSet.size} hotéis ativos`;

  if(contadorSelecao){

    contadorSelecao.textContent =
      texto;

  }

  if(contadorRota){

    contadorRota.textContent =
      texto;

  }

}


// ======================
// RENDER ROTA
// ======================

export function renderizarRota(){

  if(!listaRota){
    return;
  }

  listaRota.innerHTML = '';

  state.routeOrder.forEach(
    (id, idx)=>{

      const hotel =
        HOTELS.find(
          h => h.id === id
        );

      if(!hotel){
        return;
      }

      const item =
        document.createElement('div');

      item.className =
        'route-item';

      item.dataset.id = id;

      item.innerHTML = `

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

        <div
          style="
            display:flex;
            gap:8px;
            align-items:center;
          "
        >

          <span class="drag">
            ⋮⋮
          </span>

          <button
            class="ghost"
            data-id="${id}"
          >
            Remover
          </button>

        </div>

      `;


      // ======================
      // REMOVER HOTEL
      // ======================

      item
      .querySelector('button')
      .addEventListener(
        'click',
        ()=>{

          state.activeSet.delete(id);

          state.routeOrder =
            state.routeOrder.filter(
              x => x !== id
            );

          renderSelection();

          renderizarRota();

          salvarEstadoApp();

        }
      );


      // ======================
      // DRAG MOBILE
      // ======================

      const dragHandle =
        item.querySelector('.drag');

      let itemArrastando = null;

      dragHandle.addEventListener(
        'touchstart',
        ()=>{

          itemArrastando = item;

          item.classList.add(
            'dragging-mobile'
          );

        },
        { passive:true }
      );

      dragHandle.addEventListener(
        'touchmove',
        e=>{

          if(!itemArrastando){
            return;
          }

          const posicaoY =
            e.touches[0].clientY;

          const items = [
            ...listaRota.querySelectorAll(
              '.route-item'
            )
          ];

          items.forEach(other=>{

            other.classList.remove(
              'over'
            );

            if(other === itemArrastando){
              return;
            }

            const rect =
              other.getBoundingClientRect();

            const meio =
              rect.top +
              rect.height / 2;

            if(posicaoY < meio){

              other.classList.add(
                'over'
              );

            }

          });

        },
        { passive:true }
      );

      dragHandle.addEventListener(
        'touchend',
        e=>{

          if(!itemArrastando){
            return;
          }

          const posicaoY =
            e.changedTouches[0].clientY;

          const items = [
            ...listaRota.querySelectorAll(
              '.route-item'
            )
          ];

          let indiceDestino = null;

          items.forEach(
            (other,index)=>{

              other.classList.remove(
                'over'
              );

              if(other === itemArrastando){
                return;
              }

              const rect =
                other.getBoundingClientRect();

              const meio =
                rect.top +
                rect.height / 2;

              if(
                posicaoY < meio &&
                indiceDestino === null
              ){

                indiceDestino = index;

              }

            }
          );

          const indiceOrigem =
            state.routeOrder.indexOf(id);

          if(indiceDestino !== null){

            state.routeOrder.splice(
              indiceDestino,
              0,
              state.routeOrder.splice(
                indiceOrigem,
                1
              )[0]
            );

          }

          itemArrastando.classList.remove(
            'dragging-mobile'
          );

          itemArrastando = null;

          renderizarRota();

          salvarEstadoApp();

        },
        { passive:true }
      );

      listaRota.appendChild(item);

    }
  );


  // ======================
  // CRIAR RELATÓRIO VAZIO
  // ======================

  if(
    state.routeReport.length === 0
  ){

    state.routeReport =
      state.routeOrder.map(id=>({

        id,

        arrival:null,
        departure:null,

        entrega:false,
        coleta:false,

        deliveryPhotos:[],
        pickupPhotos:[]

      }));

  }


  atualizarContadores();

  renderizarRelatorio();

  salvarEstadoApp();

}
