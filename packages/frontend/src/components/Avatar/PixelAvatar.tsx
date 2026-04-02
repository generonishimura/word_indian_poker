import { avatarToSvg } from './pixelAvatars.js';

interface Props {
  avatarId: string;
  size?: number;
  className?: string;
}

export function PixelAvatar({ avatarId, size = 40, className = '' }: Props) {
  const svg = avatarToSvg(avatarId);
  if (!svg) {
    return (
      <div
        className={`bg-gray-200 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
