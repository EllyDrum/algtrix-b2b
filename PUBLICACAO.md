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

- **Pix**: o QR Code e o código Copia e Cola são gerados pela API do Mercado Pago e exibidos
  na página do pedido, com validade de 30 minutos e botão para gerar um novo QR Code.
  Requer chave Pix cadastrada na conta Mercado Pago.
- **Cartão de crédito**: Checkout Pro do Mercado Pago, restrito a cartão (até 12x).
- **Recebimento**: o dinheiro entra no saldo do Mercado Pago; a transferência para a conta
  bancária da empresa é configurada no próprio painel do Mercado Pago (não no código).
