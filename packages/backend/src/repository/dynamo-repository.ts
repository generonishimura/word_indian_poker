import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { RoomRecord } from '@wip/shared';
import type { RoomRepository } from './types.js';

export function createDynamoRepository(tableName: string): RoomRepository {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: { removeUndefinedValues: true },
  });

  return {
    async getRoom(roomCode: string): Promise<RoomRecord | null> {
      const result = await client.send(new GetCommand({
        TableName: tableName,
        Key: { roomCode },
      }));
      return (result.Item as RoomRecord) ?? null;
    },

    async saveRoom(record: RoomRecord): Promise<void> {
      await client.send(new PutCommand({
        TableName: tableName,
        Item: record,
      }));
    },
  };
}
