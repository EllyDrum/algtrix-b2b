# Algtrix B2B: venda automática de listas por UF e por cidade

## Como funciona

1. O cliente monta recortes em `/montar-lista` (UF, cidade opcional com busca, segmentos CNAE,
   porte e opção de MEI). Ex.: Guarulhos (SP) + Saúde = 3.605 empresas, R$ 26,90.
   Contagem e preço vêm das estatísticas reais da base (`lib/catalog/stats-uf.ts`).
2. `POST /api/checkout` recalcula o preço no servidor, grava o pedido no Netlify Blobs
   (store `pedidos`) e cria a cobrança no Mercado Pago (Pix gerado na própria página do pedido e cartão de crédito via Checkout Pro).
3. O Mercado Pago chama `POST /api/webhook`. A assinatura `x-signature` é validada e o
   pagamento é consultado na API (Pix e cartão). Se aprovado e o valor conferir, o pedido vira `pago`.
4. O webhook aciona a função em segundo plano `netlify/functions/gerar-pedido.mts`
   (até 15 min), que lê o Parquet da UF no R2, filtra, gera um ZIP por item
   (CSV + XLSX até 100 mil linhas + LEIA-ME) e grava em `pedidos/<id>/` no R2.
5. O cliente acompanha em `/pedido/<id>?t=<token>`; os links de download são
   pré-assinados na hora (24 h) e a página pode ser reaberta sempre. Se o Resend estiver
   configurado, o link chega por e-mail.

A amostra exibida no site continua fictícia (`data/companies.ts`), por decisão comercial.
Os dados reais só saem no arquivo pago.

## Passo a passo recomendado para publicar

1. **Cloudflare R2**: crie o bucket privado `algtrix-base` e um token de API com
   leitura e escrita somente nesse bucket.
2. **Enviar a base** (pasta `algtrix-base-upload_2026-09_<data>` nos seus Downloads, 2,5 GB):
   ```
   rclone copy "C:\Users\ELIELSON\Downloads\algtrix-base-upload_2026-09_20261011-214107" r2:algtrix-base/base/2026-09 --progress
   ```
   O resultado esperado é `base/2026-09/<UF>/parte-<n>-<total>.parquet` (45 arquivos).
3. **Mercado Pago**: em "Suas integrações", crie a aplicação (Checkout Pro), copie o
   Access Token de produção e, em Webhooks, cadastre
   `https://<seu-dominio>/api/webhook` com o evento "Pagamentos". Copie a assinatura
   secreta para `MP_WEBHOOK_SECRET`.
4. **Resend** (opcional): verifique o domínio de envio e crie a chave.
5. **Netlify**: cadastre as variáveis do `.env.example` e faça o deploy pelo GitHub.
6. **Teste em Deploy Preview** com `PAYMENT_PROVIDER=mock` (só nesse contexto) e depois
   uma compra real de R$ 19,90 em produção (ex.: Roraima, um segmento).

## Filtro por cidade

- Estatísticas por município em `data/municipios/<UF>.json`, servidas por `/api/municipios/<UF>`.
- O servidor confere o código do município e usa o nome que está na base (nunca o enviado pelo navegador).
- O gerador filtra a coluna `codigo_municipio_receita` dentro dos arquivos da UF.
- Os nomes exibidos são acentuados (5.521 de 5.572 cidades, a partir do pacote npm `estados-cidades`, gerado do IBGE); as 51 restantes, com grafia diferente na Receita, aparecem sem acento. A busca aceita digitar com ou sem acento.

## Testes locais

```
npx tsx --tsconfig tsconfig.json scripts/dev/teste-preco.mts
npx tsx --tsconfig tsconfig.json scripts/dev/teste-assinatura.mts
R2_LOCAL_DIR=<pasta com base/2026-09/...> npx tsx --tsconfig tsconfig.json --env-file=.env scripts/dev/teste-fluxo.mts
```

## Formas de pagamento

O site aceita duas configurações, que podem coexistir:

| Modo | Variáveis | Como funciona |
| --- | --- | --- |
| **Pix na chave da empresa** | `PIX_CHAVE` (CNPJ), `PIX_NOME`, `PIX_CIDADE` | O site gera o QR Code e o Copia e Cola (padrão BR Code do Banco Central) com o valor e o número do pedido. O cliente paga direto na conta da empresa. A confirmação é manual: confira o extrato e clique em "Confirmar pagamento" em `/admin/pedidos` (chave `INTERNAL_SECRET`). Os arquivos são gerados em seguida. |
| **Mercado Pago** | `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` | Pix com confirmação automática (webhook) e cartão de crédito em até 12x. Quando configurado, o Pix passa a ser cobrado pelo Mercado Pago; o cartão só existe neste modo. |

Para a loja aceitar pedidos é preciso: a entrega configurada (R2 + `ORDER_TOKEN_SECRET` + `INTERNAL_SECRET`) e ao menos um dos modos acima.

## Painel interno

`/admin/pedidos`: lista os pedidos, situação e itens; permite confirmar um Pix recebido na chave da empresa
ou gerar novamente um pedido com erro. O acesso é pela chave `INTERNAL_SECRET` (não compartilhe o link com a chave).

## Arquivos entregues (por recorte)

- `empresas.csv`: lista completa (ponto e vírgula, UTF-8).
- `empresas.xlsx`: aba "Resumo" (recorte, totais por segmento, porte e principais cidades) e aba "Empresas" com cabeçalho fixo, filtro e zebra. Até 100 mil empresas.
- `relatorio.pdf`: A4 paisagem, capa com resumo e tabela paginada (lista completa até 5 mil empresas; acima disso, as primeiras 5 mil).
- `LEIA-ME.txt`: descrição do recorte e licença de uso.
