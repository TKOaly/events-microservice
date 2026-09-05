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
