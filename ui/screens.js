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

  // 1. Garante que a tela de destino realmente existe no HTML
  if (!tela) return;

  telas.forEach(el => {
    // 2. Garante que o elemento da lista existe antes de tentar esconder
    if (el) {
      el.classList.add('hidden');
    }
  });

  tela.classList.remove('hidden');
  window.scrollTo(0,0);

}
