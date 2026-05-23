// ======================
// ROUTE.JS
// ======================

// Gera rota (Tela 2)

function generateRoute(){

  const active =
    HOTELS.filter(h => activeSet.has(h.id));

  if(active.length === 0){

    alert('Selecione ao menos um hotel.');

    return;
  }

  // ordem inicial baseada na lista original

  routeOrder =
    HOTELS
      .filter(h => activeSet.has(h.id))
      .map(h => h.id);

  renderRoute();

  // troca telas

  screenSelect.style.display = 'none';

  screenRoute.style.display = 'block';

  screenMode.style.display = 'none';

  saveAppState();
}


// ======================
// RENDER LISTA DA ROTA
// ======================

function renderRoute(){

  routeListEl.innerHTML = '';

  routeOrder.forEach((id, idx)=>{

    const h =
      HOTELS.find(x => x.id === id);

    if(!h) return;

    const item =
      document.createElement('div');

    item.className = 'route-item';

    item.dataset.id = id;

    item.innerHTML = `
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

      <div
        style="
          display:flex;
          gap:8px;
          align-items:center
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
      .addEventListener('click', ()=>{

        activeSet.delete(id);

        routeOrder =
          routeOrder.filter(x => x !== id);

        renderSelection();

        renderRoute();

      });

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
      (e)=>{

        if(!draggingItem) return;

        const currentY =
          e.touches[0].clientY;

        const items = [
          ...routeListEl.querySelectorAll(
            '.route-item'
          )
        ];

        items.forEach(other=>{

          other.classList.remove('over');

          if(other === draggingItem)
            return;

          const rect =
            other.getBoundingClientRect();

          const middle =
            rect.top + rect.height / 2;

          if(currentY < middle){

            other.classList.add('over');

          }

        });

      },
      { passive:true }
    );

    dragHandle.addEventListener(
      'touchend',
      (e)=>{

        if(!draggingItem) return;

        const currentY =
          e.changedTouches[0].clientY;

        const items = [
          ...routeListEl.querySelectorAll(
            '.route-item'
          )
        ];

        let targetIndex = null;

        items.forEach((other,index)=>{

          other.classList.remove('over');

          if(other === draggingItem)
            return;

          const rect =
            other.getBoundingClientRect();

          const middle =
            rect.top + rect.height / 2;

          if(
            currentY < middle &&
            targetIndex === null
          ){

            targetIndex = index;

          }

        });

        const fromIndex =
          routeOrder.indexOf(id);

        if(targetIndex !== null){

          routeOrder.splice(
            targetIndex,
            0,
            routeOrder.splice(fromIndex,1)[0]
          );

        }

        draggingItem.classList.remove(
          'dragging-mobile'
        );

        draggingItem = null;

        renderRoute();

      },
      { passive:true }
    );

    routeListEl.appendChild(item);

  });

  // ======================
  // RELATÓRIO BASE
  // ======================

  routeReport =
    routeOrder.map(id=>({

      id,

      arrival:null,

      departure:null,

      entrega:false,

      coleta:false,

      deliveryPhotos:[],

      pickupPhotos:[]

    }));


  const text =
    `${activeSet.size} hotéis ativos`;

  activeCountSelectEl.textContent =
    text;

  activeCountRouteEl.textContent =
    text;

  saveAppState();
}
