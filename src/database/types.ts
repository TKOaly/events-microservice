export interface Event {
  id: number
  title?: string
  description?: string
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

export type EventTranslation = {
  title: string
  description: string
  locale: string
}

export type CustomField = {
  id: number
  registration_quota_id?: number
  name: string
  type: 'textarea' | 'radio' | 'checkbox' | 'text'
  options?: string[]
  required?: boolean
}

export type CustomFieldAnswer = {
  id: number
  question: string
  answer: string
}

export type CustomFieldTemplate = Pick<
  CustomField,
  'registration_quota_id' | 'type' | 'options' | 'required'
> & {
  translations: Translation[]
}

export type Translation = {
  locale: string
  name: string
}

export type Registration = {
  user_id?: number
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

export type EventTemplate = Pick<
  Event,
  | 'starts'
  | 'registration_starts'
  | 'registration_ends'
  | 'cancellation_starts'
  | 'cancellation_ends'
  | 'alcohol_meter'
  | 'price'
  | 'membership_required'
  | 'outsiders_allowed'
  | 'responsible'
  | 'show_responsible'
  | 'avec'
> & {
  eventTranslations?: EventTranslation[]
  customFieldTemplates?: CustomFieldTemplate[]
}

export type EventTypeRow = {
  id: number
  implicit_alcohol_meter?: number
}

export type EventType = EventTypeRow & {
  eventTypeTranslations: EventTypeTranslation[]
}

export type EventTypeTranslation = {
  locale: string
  event_type: string
}
