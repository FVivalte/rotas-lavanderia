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
  step
){

  if(
    !step ||
    !step.maneuver
  ){
    return null;
  }

  const type =
    step.maneuver.type;

  const modifier =
    step.maneuver.modifier;

  // Curvas

  if(type === 'turn'){

    if(
      modifier === 'right'
    ){
      return 'Vire à direita';
    }

    if(
      modifier === 'left'
    ){
      return 'Vire à esquerda';
    }

    if(
      modifier === 'slight right'
    ){
      return 'Mantenha-se à direita';
    }

    if(
      modifier === 'slight left'
    ){
      return 'Mantenha-se à esquerda';
    }

  }

  // Rotatória

  if(
    type === 'roundabout'
  ){
    return 'Entre na rotatória';
  }

  // Chegada

  if(
    type === 'arrive'
  ){
    return 'Você chegou ao destino';
  }

  // Continuar

  if(
    type === 'new name'
  ){
    return 'Continue em frente';
  }

  if(
    type === 'continue'
  ){
    return 'Continue em frente';
  }

  if(
    type === 'depart'
  ){
    return 'Siga em frente';
  }

  return 'Continue em frente';

}