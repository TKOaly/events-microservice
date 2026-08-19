export interface Event {
  id: number
  title?: string
  user_id?: number
  created?: Date
  starts?: Date
  registration_starts?: Date
  registration_ends?: Date
  cancellation_starts?: Date
  cancellation_ends?: Date
  alcohol_meter?: number
  location?: string
  category?: string
  price?: string
  map_link?: string
  membership_required?: boolean
  outsiders_allowed?: boolean
  responsible?: string
  show_responsible?: boolean
  avec?: boolean
}

export type ListEvent = Pick<
  Event,
  | 'id'
  | 'title'
  | 'location'
  | 'starts'
  | 'registration_starts'
  | 'registration_ends'
>

export type CustomField = {
  id: number
  registration_quota_id?: number
  name: string
  type: 'textarea' | 'radio' | 'checkbox' | 'text'
  options?: string[]
  required?: boolean
}

export type CustomFieldAnswer = {
  question_id: number
  question: string
  answer: string
}

export type Registration = {
  user_id?: number,
  name: string
  email: string
  phone: string
  customFieldAnswers?: CustomFieldAnswer[]
  avecRegistration?: Registration
}

export type RegistrationRow = {
  registration_id: number
  user_id: number
  name: string
  email: string
  phone: string
  avec_registration_id: number
  avec_name: string
  avec_email: string
  avec_phone: string
}


export type EventTemplateTitle = Pick<Event, 'id' | 'title'>

export type EventTemplate = Event & { custom_fields: CustomField[] }
