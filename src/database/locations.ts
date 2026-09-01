import { db } from './db'
import { IdRow, Location, LocationRow, LocationTranslation } from './types'

export async function getAllLocations(): Promise<Location[]> {
  const query = db('locations')

  query.select('locations.id', 'locations.implicit_alcohol_meter')

  query.where('locations.deleted', false)

  const rows: LocationRow[] = await query

  return Promise.all(
    rows.map(async row => ({
      id: row.id,
      map_link: row.map_link,
      translations: await getLocationTranslations(row.id),
    })),
  )
}

export const isExistingLocation = async (id: number): Promise<boolean> => {
  const result = await db('locations').where({ id }).select(1).first()
  return !!result
}

/**
 * @returns location id
 */
export async function insertLocation(location: Location): Promise<number> {
  const query = db('locations')

  const row: IdRow = await query.insert(
    {
      map_link: location.map_link,
    },
    'id',
  )

  await Promise.all(
    location.translations.map(translation => {
      insertLocationTranslationIfNotExits(row.id, translation)
    }),
  )

  return row.id
}

export async function insertLocationTranslationIfNotExits(
  location_id: number,
  translation: LocationTranslation,
) {
  const query = db('locations_translations')

  query.insert({
    location_id: location_id,
    locale: translation.locale,
    location: translation.location,
  })

  query.onConflict(['location_id', 'locale']).ignore()

  await query
}

async function getLocationTranslations(
  location_id: number,
): Promise<LocationTranslation[]> {
  const query = db('locations_translations')

  query.select<LocationTranslation[]>(
    'locations_translations.locale',
    'locations_translations.location',
  )

  query.where('locations_translations.location_id', location_id)

  return query
}
