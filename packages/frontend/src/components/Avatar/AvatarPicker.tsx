import { AVATARS } from './pixelAvatars.js';
import { PixelAvatar } from './PixelAvatar.js';

interface Props {
  selected: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarPicker({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        アイコン
      </label>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map(avatar => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all active:scale-95 ${
              selected === avatar.id
                ? 'bg-indigo-50 ring-2 ring-indigo-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <PixelAvatar avatarId={avatar.id} size={36} />
            <span className="text-[9px] text-gray-400 leading-tight">{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
