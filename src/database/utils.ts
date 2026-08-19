import { Knex } from 'knex'

function addTableNameToColumnName(tableName: string, column: string): string {
  const [realColumn, aliasPart] = column.split(/\s+as\s+/i).map(s => s.trim())
  return aliasPart
    ? `${tableName}.${realColumn} as ${aliasPart}`
    : `${tableName}.${realColumn}`
}

export function addTranslations(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columns: string[],
) {
  const translationTable = `${tableName}_translation`
  const baseFkColumn = `${tableName.replace(/s$/, '')}_id`
  const knex = query.client

  const selectColumns = [
    `${tableName}.${baseFkColumn}`,
    `${translationTable}.locale`,
    ...columns.map(column =>
      addTableNameToColumnName(translationTable, column),
    ),
  ]

  const translationSubquery =
    locale === 'fi'
      ? knex
          .queryBuilder()
          .select(selectColumns)
          .from(translationTable)
          .where('locale', 'fi')
      : knex
          .queryBuilder()
          .select(selectColumns)
          .from(translationTable)
          .whereIn('locale', [locale, 'fi'])
          .distinctOn(baseFkColumn)
          .orderBy([
            baseFkColumn,
            knex.raw('(locale = ?) desc', [locale]),
            'locale desc',
          ])

  query.leftJoin(translationSubquery.as(translationTable), function () {
    this.on(`${translationTable}.${baseFkColumn}`, '=', `${tableName}.id`)
  })

  return query
}

export function addEventCategory(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columnsToSelect: { category?: boolean; implicit_alcohol_meter?: boolean },
) {
  const knex = query.client

  query.leftJoin(tableName, function () {
    this.on(`${tableName}.type_id`, '=', 'event_types.id').andOn(
      knex.raw('event_types.deleted = false'),
    )
  })

  if (columnsToSelect.category) {
    addTranslations(query, locale, 'event_types', ['name as category'])
  }

  if (columnsToSelect.implicit_alcohol_meter) {
    query.select('event_types.implicit_alcohol_meter')
  }

  return query
}

export function addLocation(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columnsToSelect: { location?: boolean; map_link?: boolean },
) {
  const knex = query.client

  query.leftJoin(tableName, function () {
    this.on(`${tableName}.location_id`, '=', 'locations.id').andOn(
      knex.raw('locations.deleted = false'),
    )
  })

  if (columnsToSelect.location) {
    addTranslations(query, locale, 'locations', ['name as location'])
  }

  if (columnsToSelect.map_link) {
    query.select('event_type.map_link')
  }

  return query
}
