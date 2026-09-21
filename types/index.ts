export type CompanySize = 'MEI' | 'Pequena' | 'Média' | 'Grande'

export interface FakeCompany {
  cnpj: string
  companyName: string
  tradeName: string
  cnae: string
  activityDescription: string
  size: CompanySize
  legalNature: string
  shareCapital: string
  city: string
  state: string
  zip: string
  phone: string
  mobile: string
  email: string
  partnerName: string
  partnerRole: string
  isHeadquarters: boolean
  simplesNacional: boolean
  openedAt: string
}

export interface DataExplorerFilters {
  state: string
  segment: string
  size: string
  status: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface LeadPayload {
  name: string
  email: string
  whatsapp: string
  company: string
  segment?: string
  source?: string
}
