export interface Event {
  id: number
  title?: string
  description?: string
  user_id?: number
  created?: Date
  starts?: Date
  alcohol_meter?: number
  location?: string
  category?: string
  price?: string
  map_link?: string
  outsiders_allowed?: boolean
  responsible?: string
  show_responsible?: boolean
  weekly_event?: boolean
  weekly_event_end_time?: Date
}

export type ListEvent = Pick<Event, 'id' | 'title' | 'location' | 'starts'>

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
  translations: CustomFieldTranslation[]
}

export type CustomFieldTranslation = {
  locale: string
  name: string
}

export type CustomFieldInsertionData = Pick<
  CustomFieldTemplate,
  'type' | 'options' | 'required' | 'translations'
>

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
  | 'alcohol_meter'
  | 'price'
  | 'responsible'
  | 'show_responsible'
  | 'weekly_event'
  | 'weekly_event_end_time'
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

export type LocationRow = {
  id: number
  map_link?: string
}

export type Location = LocationRow & {
  locationTranslations: LocationTranslation[]
}

export type LocationTranslation = {
  locale: string
  location: string
}
