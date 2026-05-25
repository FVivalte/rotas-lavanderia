// ui/screens.js

import {

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

}
from './elements.js';

const telas = [

  telaSelecao,
  telaRota,
  telaNavegacao,
  telaRelatorio

];

export function mostrarTela(tela){

  telas.forEach(el=>{

    el.classList.add('hidden');

  });

  tela.classList.remove('hidden');

  window.scrollTo(0,0);

}
