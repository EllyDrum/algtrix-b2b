import type { FaqItem } from '@/types'

/**
 * FAQ orientado a objeções reais de compra (não institucional),
 * conforme a seção 28 do briefing.
 */
export const faqItems: FaqItem[] = [
  {
    question: 'O que estou comprando, exatamente?',
    answer:
      'Acesso a uma base de dados empresariais estruturada, filtrável por critérios como localização, segmento, porte e situação cadastral, entregue em formato digital para uso em prospecção comercial.',
  },
  {
    question: 'O que está incluído na oferta?',
    answer:
      'Os itens exatos incluídos na entrega estão descritos na seção "O que está incluído", acima da oferta. Essa lista é a fonte de verdade sobre o que você recebe.',
  },
  {
    question: 'Quais dados estão disponíveis?',
    answer:
      'Informações estruturadas de empresas, como CNPJ, razão social, nome fantasia, CNAE, porte, natureza jurídica, capital social, localização e dados de contato disponíveis publicamente, conforme os campos apresentados na seção de amostra.',
  },
  {
    question: 'Qual é o formato dos arquivos?',
    answer:
      'Os formatos de entrega estão detalhados na seção da oferta. Eles são pensados para uso direto em planilhas e ferramentas de prospecção, sem exigir conhecimento técnico.',
  },
  {
    question: 'Como e quando eu recebo o acesso?',
    answer:
      'Após a confirmação do pagamento, você recebe as instruções de acesso e download na página de confirmação e por e-mail. O prazo exato de liberação será exibido no momento da compra.',
  },
  {
    question: 'Os dados são atualizados?',
    answer:
      'A periodicidade de atualização será informada de forma clara antes da compra, na seção da oferta, para que você saiba exatamente o que esperar.',
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
      'Sim. Os canais de suporte disponíveis estão descritos na seção da oferta e na confirmação de compra.',
  },
  {
    question: 'Como funciona a garantia?',
    answer:
      'As condições de garantia, quando aplicáveis, são exibidas de forma clara na seção de garantia, antes da finalização da compra.',
  },
  {
    question: 'Existe alguma restrição de uso dos dados?',
    answer:
      'O uso deve respeitar a legislação aplicável, incluindo a LGPD. Orientações de uso responsável dos dados estão disponíveis na Política de Privacidade.',
  },
]
