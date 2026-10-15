import type { FaqItem } from '@/types'

/**
 * FAQ orientado a objeções reais de compra (não institucional),
 * conforme a seção 28 do briefing.
 */
export const faqItems: FaqItem[] = [
  {
    question: 'O que estou comprando, exatamente?',
    answer:
      'Uma lista de empresas ativas no recorte que você escolhe (estado ou cidade, segmentos e porte; por exemplo, empresas de saúde em Guarulhos), com dados da Receita Federal, pronta para prospecção. Você vê a quantidade exata e o preço antes de pagar, a partir de R$ 19,90.',
  },
  {
    question: 'O que está incluído na oferta?',
    answer:
      'Cada recorte que você monta (estado ou cidade, segmentos, porte e opção de MEI) vira um arquivo ZIP com a lista em CSV, a mesma lista em Excel (até 1 milhão de empresas), um relatório em PDF e um arquivo LEIA-ME com a data da base.',
  },
  {
    question: 'Quais dados estão disponíveis?',
    answer:
      'CNPJ, razão social, nome fantasia, data de abertura, CNAE principal e secundários, segmento, natureza jurídica, porte, indicação de MEI, capital social, endereço completo, telefones e e-mail, conforme os Dados Abertos do CNPJ da Receita Federal. A base não inclui o quadro de sócios. A amostra exibida no site é ilustrativa.',
  },
  {
    question: 'Qual é o formato dos arquivos?',
    answer:
      'Um arquivo ZIP com a lista em CSV (abre direto no Excel), em Excel (.xlsx, com aba de resumo, para recortes de até 1 milhão de empresas) e um relatório em PDF formatado com resumo por segmento e porte.',
  },
  {
    question: 'Como e quando eu recebo o acesso?',
    answer:
      'Automaticamente. Com Pix ou cartão aprovado, os arquivos são gerados na hora; recortes pequenos ficam prontos em segundos e listas grandes em poucos minutos. O link aparece na página do pedido e chega por e-mail, e continua válido para novos downloads.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Listas a partir de R$ 19,90. O valor depende do tamanho do recorte e é mostrado antes do pagamento, assim que você escolhe a região, os segmentos e o porte. Ao comprar dois ou mais recortes, o carrinho aplica 5% de desconto no total.',
  },
  {
    question: 'Os dados são atualizados?',
    answer:
      'Sim. A base é atualizada a partir dos Dados Abertos da Receita Federal, e a origem dos dados vem informada em cada arquivo.',
  },
  {
    question: 'Preciso saber programação ou SQL para usar?',
    answer:
      'Não. Os dados são entregues em formatos comuns de planilha, prontos para filtrar, ordenar e importar em ferramentas de prospecção ou CRM sem qualquer conhecimento técnico.',
  },
  {
    question: 'Funciona no Excel?',
    answer:
      'Sim. O arquivo é compatível com Excel e outras planilhas eletrônicas, permitindo aplicar filtros, ordenações e fórmulas normalmente.',
  },
  {
    question: 'Posso usar para prospecção comercial ativa?',
    answer:
      'Sim, esse é o uso principal do produto: montar listas segmentadas de empresas para abordagem comercial, com base em critérios que você mesmo define.',
  },
  {
    question: 'Existe suporte caso eu tenha dúvidas?',
    answer:
      'Sim, pelo e-mail informado no rodapé e na página do seu pedido.',
  },
  {
    question: 'Como funciona a garantia?',
    answer:
      'As condições de reembolso estão descritas na Política de Reembolso, disponível no rodapé do site.',
  },
  {
    question: 'Existe alguma restrição de uso dos dados?',
    answer:
      'Sim. A licença é de uso interno e não transferível: a revenda ou redistribuição da lista é proibida. O uso dos contatos deve respeitar a LGPD, incluindo oferecer meio de descadastramento.',
  },
]
