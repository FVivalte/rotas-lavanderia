// services/navigation.js
import { state } from '../core/state.js';

// ======================
// CARREGAR STEPS DA ROTA
// ======================
export function carregarSteps(rota) {
  if (!rota?.legs?.length) return;

  // BUG 8 CORRIGIDO: a rota tem múltiplos legs quando há waypoints intermediários.
  // Antes pegava só legs[0] — perdia instruções dos trechos seguintes.
  // Agora achata todos os legs num array único de steps.
  state.currentSteps     = rota.legs.flatMap(leg => leg.steps || []);
  state.currentStepIndex = 0;
}

// ======================
// STEP ATUAL
// ======================
export function obterStepAtual() {
  if (!state.currentSteps.length) return null;
  return state.currentSteps[state.currentStepIndex] ?? null;
}

// ======================
// TRADUZIR INSTRUÇÃO
// ======================
export function traduzirInstrucao(step, distancia = false) {
  if (!step?.maneuver) return null;

  const type     = step.maneuver.type;
  const modifier = step.maneuver.modifier;

  let texto = 'Continue em frente';

  if (type === 'turn') {
    if      (modifier === 'right')        texto = 'Vire à direita';
    else if (modifier === 'left')         texto = 'Vire à esquerda';
    else if (modifier === 'slight right') texto = 'Mantenha-se à direita';
    else if (modifier === 'slight left')  texto = 'Mantenha-se à esquerda';
    else if (modifier === 'sharp right')  texto = 'Vire totalmente à direita';
    else if (modifier === 'sharp left')   texto = 'Vire totalmente à esquerda';
    else if (modifier === 'uturn')        texto = 'Faça o retorno';
  } else if (type === 'new name') {
    texto = 'Continue em frente';
  } else if (type === 'depart') {
    texto = 'Siga em frente';
  } else if (type === 'arrive') {
    texto = 'Você chegou ao destino';
  } else if (type === 'merge') {
    texto = 'Entre na via';
  } else if (type === 'on ramp') {
    texto = 'Entre na rampa';
  } else if (type === 'off ramp') {
    texto = 'Saia pela rampa';
  } else if (type === 'fork') {
    if      (modifier === 'right') texto = 'Na bifurcação, mantenha à direita';
    else if (modifier === 'left')  texto = 'Na bifurcação, mantenha à esquerda';
  } else if (type === 'roundabout' || type === 'rotary') {
    texto = 'Entre na rotatória';
    if (step.maneuver.exit) texto += ` e saia na ${step.maneuver.exit}ª saída`;
  } else if (type === 'roundabout turn') {
    texto = 'Na rotatória, vire';
  } else if (type === 'end of road') {
    if      (modifier === 'right') texto = 'No fim da rua, vire à direita';
    else if (modifier === 'left')  texto = 'No fim da rua, vire à esquerda';
  }

  if (distancia) return `Daqui a 100 metros, ${texto.toLowerCase()}`;

  return texto;
}
