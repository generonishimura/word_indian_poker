import { createDynamoRepository } from './repository/dynamo-repository.js';
import { createResolver } from './resolver.js';

const tableName = process.env.TABLE_NAME!;
const repo = createDynamoRepository(tableName);
const resolve = createResolver(repo);

export const handler = async (event: {
  info: { fieldName: string; parentTypeName: string };
  arguments: Record<string, string>;
}) => {
  return resolve(event);
};
