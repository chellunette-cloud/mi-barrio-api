import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv } from 'ajv';
import { parse } from 'yaml';

const contract = parse(
  readFileSync(join(process.cwd(), 'contracts/internal.openapi.yaml'), 'utf8')
) as Record<string, unknown>;

const ajv = new Ajv({ strict: false, validateFormats: false, allErrors: true });
ajv.addSchema(contract, 'internal');

export function validateInternal<T>(schemaName: string, data: unknown): T {
  if (schemaName.endsWith('[]')) {
    const itemName = schemaName.slice(0, -2);
    if (!Array.isArray(data)) throw new Error(`Respuesta interna inválida: se esperaba un arreglo`);
    for (const item of data) {
      const validate = ajv.getSchema(`internal#/components/schemas/${itemName}`);
      if (!validate) throw new Error(`El contrato interno no define ${itemName}`);
      if (!validate(item)) {
        throw new Error(`Respuesta interna inválida para ${itemName}: ${ajv.errorsText(validate.errors)}`);
      }
    }
    return data as T;
  }
  const validate = ajv.getSchema(`internal#/components/schemas/${schemaName}`);
  if (!validate) throw new Error(`El contrato interno no define ${schemaName}`);
  if (!validate(data)) {
    throw new Error(`Respuesta interna inválida para ${schemaName}: ${ajv.errorsText(validate.errors)}`);
  }
  return data as T;
}
