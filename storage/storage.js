// storage/storage.js

import {
  HOTELS
}
from '../data/dados.js';

import {
  state
}
from '../core/state.js';


// =========================
// CHAVES STORAGE
// =========================

const CHAVE_HOTEIS_CUSTOMIZADOS =
  'rotaBuziosCustomHotels';

const CHAVE_ESTADO_APP =
  'rotaBuziosState';


// =========================
// HOTÉIS CUSTOMIZADOS
// =========================

export function salvarHoteisCustomizados(){

  const hoteisCustomizados =
    HOTELS.filter(
      h => h.custom
    );

  localStorage.setItem(

    CHAVE_HOTEIS_CUSTOMIZADOS,

    JSON.stringify(
      hoteisCustomizados
    )

  );

}


export function carregarHoteisCustomizados(){

  const salvo =
    localStorage.getItem(
      CHAVE_HOTEIS_CUSTOMIZADOS
    );

  if(!salvo) return;

  try{

    const hoteisCustomizados =
      JSON.parse(salvo);

    hoteisCustomizados
    .forEach(h=>{

      const jaExiste =
        HOTELS.some(
          x => x.id === h.id
        );

      if(!jaExiste){

        HOTELS.push(h);

      }

    });

  }catch(err){

    console.log(

      'Erro carregando hotéis',

      err

    );

  }

}


// =========================
// ESTADO APP
// =========================

export function salvarEstadoApp(
  telaAtual
){

  const data = {

    activeSet:
      [...state.activeSet],

    speechEnabled:
      state.speechEnabled,

    arrivalConfirmed:
      state.arrivalConfirmed,

    routeOrder:
      state.routeOrder,

    routeReport:
      state.routeReport,

    currentIndex:
      state.currentIndex,

    currentScreen:
      telaAtual

  };

  localStorage.setItem(

    CHAVE_ESTADO_APP,

    JSON.stringify(data)

  );

}


// =========================
// CARREGAR ESTADO
// =========================

export function carregarEstadoApp(){

  const salvo =
    localStorage.getItem(
      CHAVE_ESTADO_APP
    );

  if(!salvo) return null;

  try{

    return JSON.parse(salvo);

  }catch(err){

    console.log(

      'Erro carregando estado',

      err

    );

    return null;

  }

}


// =========================
// RESTAURAR ESTADO
// =========================

export function restaurarEstadoApp(){

  const data =
    carregarEstadoApp();

  if(!data) return;

  state.speechEnabled =
    data.speechEnabled || false;

  state.arrivalConfirmed =
    data.arrivalConfirmed || false;

  state.activeSet =
    new Set(
      data.activeSet || []
    );

  state.routeOrder =
    data.routeOrder || [];

  state.routeReport =
    data.routeReport || [];

  state.currentIndex =
    data.currentIndex || 0;

  state.currentScreen =
    data.currentScreen || 'selecao';

}


// =========================
// LIMPAR STORAGE
// =========================

export function limparEstadoApp(){

  localStorage.removeItem(
    CHAVE_ESTADO_APP
  );

}


export function limparHoteisCustomizados(){

  localStorage.removeItem(
    CHAVE_HOTEIS_CUSTOMIZADOS
  );

}
