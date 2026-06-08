// services/navigation.js

import { state } from '../core/state.js';

// ======================
// CARREGAR STEPS DA ROTA
// ======================

export function carregarSteps(
  rota
){

  if(
    !rota ||
    !rota.legs ||
    !rota.legs.length
  ){
    return;
  }

  state.currentSteps =
    rota.legs[0].steps || [];

  state.currentStepIndex = 0;

}

// ======================
// STEP ATUAL
// ======================

export function obterStepAtual(){

  if(
    !state.currentSteps.length
  ){
    return null;
  }

  return state.currentSteps[
    state.currentStepIndex
  ];

}

// ======================
// TRADUZIR INSTRUÇÃO
// ======================

export function traduzirInstrucao(
  step,
  distancia = false
){

  if(
    !step?.maneuver
  ){
    return null;
  }

  const type =
    step.maneuver.type;

  const modifier =
    step.maneuver.modifier;

  let texto =
    'Continue em frente';

  if(type === 'turn'){

    if(modifier === 'right'){
      texto = 'vire à direita';
    }

    else if(modifier === 'left'){
      texto = 'vire à esquerda';
    }

    else if(
      modifier === 'slight right'
    ){
      texto =
        'mantenha-se à direita';
    }

    else if(
      modifier === 'slight left'
    ){
      texto =
        'mantenha-se à esquerda';
    }

  }

  else if(
    type === 'roundabout'
  ){

    texto =
      'entre na rotatória';

  }

  else if(
    type === 'arrive'
  ){

    texto =
      'você chegou ao destino';

  }

  if(distancia){

    return `A 100 metros, ${texto}`;

  }

  return texto;

}
