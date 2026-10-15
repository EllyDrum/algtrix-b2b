import { createHmac } from 'node:crypto'
import { assinaturaValida } from '@/lib/payments/mercadopago'
import { pagamentoSimuladoPermitido } from '@/lib/server/site'
process.env.MP_WEBHOOK_SECRET = 'segredo-teste'
const ts = '1704908010', rid = 'req-123', id = '123456'
const v1 = createHmac('sha256', 'segredo-teste').update(`id:${id};request-id:${rid};ts:${ts};`).digest('hex')
console.log('valida', assinaturaValida({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: rid, dataId: id }))
console.log('adulterada', assinaturaValida({ xSignature: `ts=${ts},v1=${v1}`, xRequestId: rid, dataId: '999' }))
process.env.PAYMENT_PROVIDER = 'mock'; process.env.CONTEXT = 'production'
console.log('mock em producao permitido?', pagamentoSimuladoPermitido())
