// ui/route.js

import { HOTELS }
from '../data/dados.js';

import { state }
from '../core/state.js';

import {

  routeListEl,
  activeCountSelectEl,
  activeCountRouteEl

} from './elements.js';

import {

  renderSelection

} from './selection.js';

import {

  renderReport

} from './report.js';

import {

  saveAppState

} from '../storage/storage.js';


// ======================
// CONTADORES
// ======================

function updateCounters(){

  const text =
    `${state.activeSet.size} hotéis ativos`;

  activeCountSelectEl.textContent =
    text;

  activeCountRouteEl.textContent =
    text;

}


// ======================
// RENDER ROTA
// ======================

export function renderRoute(){

  routeListEl.innerHTML = '';

  state.routeOrder.forEach(
    (id, idx)=>{

      const hotel =
        HOTELS.find(
          h => h.id === id
        );

      if(!hotel) return;

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

          renderRoute();

          saveAppState();

        }
      );


      // ======================
      // DRAG MOBILE
      // ======================

      const dragHandle =
        item.querySelector('.drag');

      let draggingItem = null;

      dragHandle.addEventListener(
        'touchstart',
        ()=>{

          draggingItem = item;

          item.classList.add(
            'dragging-mobile'
          );

        },
        { passive:true }
      );

      dragHandle.addEventListener(
        'touchmove',
        e=>{

          if(!draggingItem)
            return;

          const currentY =
            e.touches[0].clientY;

          const items = [
            ...routeListEl.querySelectorAll(
              '.route-item'
            )
          ];

          items.forEach(other=>{

            other.classList.remove(
              'over'
            );

            if(other === draggingItem)
              return;

            const rect =
              other.getBoundingClientRect();

            const middle =
              rect.top +
              rect.height / 2;

            if(currentY < middle){

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

          if(!draggingItem)
            return;

          const currentY =
            e.changedTouches[0].clientY;

          const items = [
            ...routeListEl.querySelectorAll(
              '.route-item'
            )
          ];

          let targetIndex = null;

          items.forEach(
            (other,index)=>{

              other.classList.remove(
                'over'
              );

              if(other === draggingItem)
                return;

              const rect =
                other.getBoundingClientRect();

              const middle =
                rect.top +
                rect.height / 2;

              if(
                currentY < middle &&
                targetIndex === null
              ){

                targetIndex = index;

              }

            }
          );

          const fromIndex =
            state.routeOrder.indexOf(id);

          if(targetIndex !== null){

            state.routeOrder.splice(
              targetIndex,
              0,
              state.routeOrder.splice(
                fromIndex,
                1
              )[0]
            );

          }

          draggingItem.classList.remove(
            'dragging-mobile'
          );

          draggingItem = null;

          renderRoute();

          saveAppState();

        },
        { passive:true }
      );

      routeListEl.appendChild(item);

    }
  );


  // ======================
  // CRIA REPORT VAZIO
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


  updateCounters();

  renderReport();

  saveAppState();

}
