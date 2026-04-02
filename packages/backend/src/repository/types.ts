import type { RoomRecord } from '@wip/shared';

export interface RoomRepository {
  getRoom(roomCode: string): Promise<RoomRecord | null>;
  saveRoom(record: RoomRecord): Promise<void>;
}
