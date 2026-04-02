import type { RoomRecord } from '@wip/shared';
import type { RoomRepository } from './types.js';

export function createMemoryRepository(): RoomRepository {
  const store = new Map<string, RoomRecord>();

  return {
    async getRoom(roomCode: string) {
      return store.get(roomCode) ?? null;
    },
    async saveRoom(record: RoomRecord) {
      store.set(record.roomCode, record);
    },
  };
}
