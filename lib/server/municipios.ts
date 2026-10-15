import { STATS_UF } from '../catalog'
import type { ItemRecorte, MunicipiosPorUf, MunicipiosUf } from '../pricing-engine'

/** Carrega as estatísticas por município de uma UF (arquivos em data/municipios, gerados da base). */
export async function carregarMunicipios(uf: string): Promise<MunicipiosUf | undefined> {
  if (!STATS_UF[uf] || !/^[A-Z]{2}$/.test(uf)) return undefined
  const mod = (await import(`../../data/municipios/${uf}.json`)) as {
    default?: { municipios: MunicipiosUf }
    municipios?: MunicipiosUf
  }
  return (mod.default ?? mod).municipios
}

/** Carrega os municípios de todas as UFs que aparecem em itens com filtro de cidade. */
export async function municipiosDosItens(itens: ItemRecorte[]): Promise<MunicipiosPorUf> {
  const ufs = Array.from(new Set(itens.filter((i) => i.municipio).map((i) => i.uf)))
  const pares = await Promise.all(ufs.map(async (uf) => [uf, await carregarMunicipios(uf)] as const))
  return Object.fromEntries(pares)
}
