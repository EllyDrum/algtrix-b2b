// Gera um item com o caminho de Excel grande (streaming em arquivo) usando a base local.
import { gerarArquivoItem } from '@/lib/server/gerador'
const t0 = Date.now()
const a = await gerarArquivoItem('ALG-TESTE-XLSXGRANDE', 0, { uf: 'SP', secoes: [], portes: [], incluirMei: false }, 150_000)
console.log({ linhas: a.linhas, formatos: a.formatos, downloads: a.downloads?.map((d) => `${d.formato}:${(d.bytes / 1e6).toFixed(1)}MB`), segundos: ((Date.now() - t0) / 1000).toFixed(0), memMB: Math.round(process.memoryUsage().rss / 1e6) })
