import { forEach, upperFirst } from 'lodash'
import { Spec } from 'swagger-schema-official'

import { getDefinition } from 'src/tool/getDefinition'
import { HttpMethod, IProject } from 'src/interface'
import { getGlobal, httpMethods } from 'src/global'
// import { traverseSchema } from 'src/tool/traverseSchema'
import { camelCase } from 'src/tool/camelCase'
// import { hasGenericSymbol, parseGenericNames } from 'src/tool/genericType'

/**
 * collect definition
 * collect request, skip deprecated
 * */
export const assembleSchemaToGlobal = (spec: Spec, project: IProject) => {
  const { definitionMap, requestMap } = getGlobal(project)
  const definitions = getDefinition(spec)
  Object.getOwnPropertyNames(definitions).forEach(name => {
    definitionMap[name] = {
      typeName: name,
      schema: definitions[name],
    }
  })
  forEach(spec.paths, (pathSchema /** Path */, pathName) => {
    forEach(httpMethods, httpMethod => {
      const operation = pathSchema[httpMethod]
      if (operation && !operation.deprecated) {
        requestMap[`${httpMethod}${upperFirst(camelCase(pathName))}`] = {
          pathName,
          httpMethod: httpMethod as HttpMethod,
          schema: operation!,
          responses: operation.responses,
          parameters: operation.parameters,
        }
      }
    })
  })
  // traverseSchema(spec.paths, ({ value, key }) => {
  //   if (key === '$ref' && typeof value === 'string') {
  //     if (!(value in definitionMap)) {
  //       definitionMap[value] = {
  //         typeName: value,
  //       }
  //     }
  //     requestRefMap[value] = definitionMap[value]
  //   }
  // })
}
