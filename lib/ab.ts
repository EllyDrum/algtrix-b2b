import type { Experiment, ExperimentKey } from '@/config/experiments'
import { experiments } from '@/config/experiments'

const COOKIE_PREFIX = 'algtrix_ab_'

/**
 * Bucketing determinístico por visitante, baseado em um id estável
 * (cookie). Não ativa nenhum experimento por padrão — active precisa
 * ser true em config/experiments.ts. Estrutura pronta para plugar um
 * provedor de A/B test real (ex.: GrowthBook, Statsig) no futuro sem
 * mudar a API usada pelos componentes.
 */
function hashToUnitInterval(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return (hash >>> 0) / 4294967295
}

export function getVariant(experimentKey: ExperimentKey, visitorId: string): string {
  const experiment: Experiment | undefined = experiments.find((e) => e.key === experimentKey)
  if (!experiment || !experiment.active || experiment.variants.length === 0) {
    return 'control'
  }
  const bucket = hashToUnitInterval(`${COOKIE_PREFIX}${experimentKey}:${visitorId}`)
  const index = Math.floor(bucket * experiment.variants.length)
  return experiment.variants[index] ?? 'control'
}
