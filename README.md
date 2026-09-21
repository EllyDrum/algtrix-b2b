# Algtrix B2B — Página comercial

Página de vendas de alta conversão para o produto de dados empresariais **Algtrix B2B**, construída em Next.js 14 (App Router), TypeScript e Tailwind CSS.

Este README documenta o que já está pronto, o que é placeholder e o que precisa de decisão sua antes de publicar.

## Como rodar

```bash
npm install
npm run dev       # ambiente de desenvolvimento em http://localhost:3000
npm run build     # build de produção
npm run typecheck # checagem de tipos
npm run lint      # ESLint
```

Copie `.env.example` para `.env.local` e preencha os valores antes de subir para produção.

> Observação sobre esta verificação: o build de produção foi validado nesta sessão com uma configuração temporária de fontes (o ambiente de build usado aqui bloqueia o acesso a `fonts.googleapis.com`). O `app/layout.tsx` entregue já está com `next/font/google` (Plus Jakarta Sans + IBM Plex Mono) normalmente, que é a forma recomendada — isso vai funcionar sem ajustes no seu ambiente normal, que tem acesso à internet padrão.

## Arquitetura

```
/app          rotas (App Router), layout, SEO (sitemap/robots), páginas legais, API routes
/sections     um arquivo por seção da página (Hero, Pricing, FAQ, etc.)
/components   componentes de UI reutilizáveis (Button, Modal, Accordion, DataExplorerPanel...)
/config       brand.ts, product.ts, pricing.ts, analytics.ts, experiments.ts — única fonte de verdade
/data         dados fictícios de demonstração (empresas, FAQ)
/lib          utils, analytics, A/B test, adapter de pagamento
/hooks        useExitIntent, useCountUp
/types        tipos TypeScript compartilhados
```

Nenhum componente contém o nome "Algtrix" ou o nome do produto hardcoded fora de `config/brand.ts` e `config/product.ts`.

## O que precisa da sua decisão antes de publicar

Estes pontos foram deixados como placeholder de propósito, porque o briefing original é explícito: **"somente informações verdadeiras, se não houver, não inventar."**

1. **Preço, parcelamento e garantia** — `config/pricing.ts`. Hoje `PRICING_IS_PLACEHOLDER = true` e a seção de oferta mostra "Preço em definição"; o botão "Comprar agora" direciona para o formulário de lead em vez de simular uma compra com valor inventado. Quando você definir o preço real, edite apenas esse arquivo (`priceCents`, `installments`, `guarantee`) e o botão passa a acionar o checkout automaticamente.
2. **Provedor de pagamento** — `lib/payments/adapter.ts` define a interface; `lib/payments/mock-adapter.ts` é um adapter de desenvolvimento que não processa pagamento real. Quando você escolher o provedor (Mercado Pago, Stripe, Hotmart/Kiwify), crie um novo adapter implementando a mesma interface e troque em `getPaymentAdapter()`. `app/api/checkout/route.ts` já valida o preço no servidor (nunca confia em valor vindo do cliente).
3. **Formato e periodicidade de entrega** — `config/product.ts` (`deliverable`), marcados com `TODO(Elli)`.
4. **Depoimentos e prova social** — não incluídos, porque nenhum foi fornecido. A página usa demonstração, transparência e a autoridade da marca no lugar, como orientado no briefing.
5. **Textos legais** — `app/politica-de-privacidade`, `app/termos-de-uso`, `app/politica-de-reembolso` contêm apenas uma base sugerida ("recomenda-se", "sugere-se"), não um texto jurídico definitivo. Recomenda-se revisão por um profissional antes da publicação.
6. **Webhook de leads** — `LEAD_WEBHOOK_URL` no `.env`. Sem essa variável, os leads apenas aparecem no log do servidor.
7. **WhatsApp comercial e GA4/GTM** — variáveis `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_GA_MEASUREMENT_ID` no `.env`.

## Decisões de design

- **Identidade visual**: cor institucional da Algtrix (`#1C1533`, extraída de algtrix.com.br) como cor de marca, com variações mais escuras para seções de autoridade (Hero, "Por que Algtrix", CTA final, footer) e branco/neutros no restante. Verde-esmeralda (`#059669`) como única cor de destaque para CTA, com contraste suficiente sobre fundo claro e escuro.
- **Tipografia**: Plus Jakarta Sans (display/body) + IBM Plex Mono (dados/números da tabela), carregadas via `next/font` (sem bloquear o carregamento, com fallback do sistema).
- **Tema**: a página usa um tema claro com seções escuras intencionais (mesma família de cor, nunca trocando de matiz) para pontuar o funil — não há alternância para modo escuro do sistema operacional, decisão deliberada de marca para manter a identidade visual consistente com o site institucional.
- **Demonstração interativa**: o mesmo componente (`components/DataExplorerPanel.tsx`) é usado no Hero (versão compacta) e na seção "Não imagine. Veja como funciona." (versão completa), evitando uma prévia de produto falsa: é uma interface real e funcional, só que com dados fictícios (deixado explícito na própria tela).
- **Dados de demonstração**: nomes de empresas, CNPJs e contatos são 100% fictícios (`data/companies.ts`), usando a raiz de CNPJ `00.000.000`, que nunca é emitida para empresas reais.

## Segurança

- O preço cobrado nunca é aceito do cliente: `app/api/checkout/route.ts` sempre lê `config/pricing.ts` no servidor.
- `app/api/webhook/route.ts` rejeita qualquer chamada até que a assinatura do provedor real seja validada (`verifyWebhookSignature`); hoje, sem provedor configurado, ela sempre retorna `false`.
- Nenhuma chave ou segredo está no código-fonte; tudo fica em variáveis de ambiente do lado do servidor (nunca prefixadas com `NEXT_PUBLIC_`).
- Cabeçalhos de segurança básicos (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) configurados em `next.config.mjs`.
- `middleware.ts` bloqueia o endpoint `/_next/image`, que não é usado neste projeto (não há `next/image` nem imagens remotas). Isso remove de forma proativa a superfície de uma vulnerabilidade crítica de execução remota de código divulgada para a API de otimização de imagens do Next.js em versões anteriores à linha 16.3.x. Recomenda-se reavaliar essa mitigação ao planejar uma futura atualização de versão do Next.js.

## Analytics e funil

Eventos centralizados em `config/analytics.ts` (`hero_cta`, `demo_start`, `filter_used`, `pricing_view`, `lead_started`, `checkout_started`, `purchase`, etc.) e disparados via `lib/analytics.ts`, que hoje envia para `window.dataLayer` (pronto para GTM/GA4). `config/experiments.ts` e `lib/ab.ts` deixam a arquitetura de teste A/B pronta (headline, CTA, preço, layout do hero, ordem de seções), mas nenhum experimento está ativo por padrão.

## Auditoria realizada nesta entrega

- **3 personas do briefing**: (1) visitante decidido consegue ir do hero até "Comprar agora" sem sair da página; hoje, sem preço real definido, esse botão abre a captura de lead de forma transparente em vez de simular uma cobrança inventada. (2) visitante desconfiado encontra comparação, seção "Por que Algtrix", objeções rápidas, garantia (ou o aviso honesto de que ainda não há garantia definida) e FAQ. (3) visitante que não conhece a Algtrix entende o produto em poucos segundos: headline + subtítulo cabem no primeiro impacto de tela, sem precisar rolar.
- **Checklist anti-"site de IA"**: uma cor de destaque única e consistente em toda a página; raio de borda consistente (botões em pílula, cards e imagens com o mesmo raio, inputs com raio menor); nenhum travessão (—) em texto visível ao usuário; nenhuma legenda decorativa, rodapé de versão, tira de fuso horário ou dica de "scroll" artificial; nenhuma prévia de produto falsa (a prévia do Hero é o componente real da demonstração); nenhum depoimento ou número inventado.
- **Verificação técnica**: `npm run typecheck` e `npm run lint` sem erros; `npm run build` validado nesta sessão (com a ressalva de fontes explicada acima).

## Próximos passos sugeridos

1. Definir preço, garantia e provedor de pagamento e atualizar `config/pricing.ts` e o adapter correspondente.
2. Revisar as páginas legais com um profissional jurídico.
3. Conectar `LEAD_WEBHOOK_URL`, WhatsApp e GA4/GTM.
4. Rodar Lighthouse em produção (meta do briefing: performance > 90) — a base já está otimizada (sem imagens pesadas, sem bibliotecas de animação pesadas fora do necessário, JS inicial da home em ~152 kB).
5. Criar o repositório Git e publicar (a publicação em si fica para você, conforme combinado).
