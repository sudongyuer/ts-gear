import { EOL } from 'os'

import { forEach, upperFirst } from 'lodash'

import { getDefinition } from 'src/tool/getDefinition'
import { HttpMethod, JSONSchema } from 'src/interface'
import { refMap, definitionMap, requestMap } from 'src/global'
import { traverseSchema } from 'src/tool/traverseSchema'
import { camelCase } from 'src/tool/camelCase'

/**
 * collect definition
 * collect request
 * */
export const assembleSchemaToGlobal = (schema: JSONSchema) => {
  const definitions = getDefinition(schema)
  for (const name in definitions) {
    definitionMap[name] = {
      typeName: name,
      schema: definitions[name],
    }
  }
  forEach(schema.paths, (pathSchema: JSONSchema, path: string) => {
    forEach(pathSchema, (requestSchema: JSONSchema, httpMethod: string) => {
      requestMap[`${httpMethod}${upperFirst(camelCase(path))}`] = {
        path,
        httpMethod: httpMethod as HttpMethod,
        schema: requestSchema,
        deprecated: requestSchema.deprecated,
        doc: [
          ...requestSchema.tags,
          requestSchema.summary,
          requestSchema.description,
          requestSchema.produces && `produces: ${requestSchema.produces}`,
          requestSchema.consumes && `consumes: ${requestSchema.consumes}`,
        ].filter(Boolean),
        // responses: IResponse
        // parameters: [],
      }
    })
  })
  traverseSchema(schema, ({ value, key }) => {
    if (key === '$ref' && typeof value === 'string') {
      refMap[value] = value
    }
  })
}
