import { useState } from 'react';
import { sanitizeChatInput, isValidChatInput } from '@wip/shared';

interface Props {
  onChallenge: (guess: string) => Promise<{ success: boolean } | null>;
  disabled: boolean;
  challengesRemaining: number;
}

export function ChallengeButton({ onChallenge, disabled, challengesRemaining }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = guess.trim();
    if (!trimmed || !isValidChatInput(trimmed)) return;

    const res = await onChallenge(trimmed);
    if (res) {
      setResult(res.success ? 'success' : 'fail');
      setTimeout(() => {
        setIsOpen(false);
        setGuess('');
        setResult(null);
      }, 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(sanitizeChatInput(e.target.value));
  };

  if (disabled) return null;

  const noChallenges = challengesRemaining <= 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={noChallenges}
        className="bg-amber-500 text-white rounded-full px-4 py-2.5 text-sm font-bold hover:bg-amber-600 transition-colors active:scale-95 whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
      >
        チャレンジ({challengesRemaining})
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-gray-200">
            {result ? (
              <div className="text-center py-4">
                {result === 'success' ? (
                  <>
                    <span className="text-5xl">🎯</span>
                    <p className="text-xl font-bold text-emerald-600 mt-3">チャレンジ成功！</p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl">💥</span>
                    <p className="text-xl font-bold text-red-500 mt-3">チャレンジ失敗…</p>
                    <p className="text-sm text-gray-500 mt-1">ドボンワードが追加されました</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-1">チャレンジ</h2>
                <p className="text-sm text-gray-500 mb-4">
                  自分のドボンワードを当ててみよう！
                  <br />
                  <span className="text-amber-600 font-medium">成功→相手にワード追加 / 失敗→自分にワード追加</span>
                  <br />
                  <span className="text-gray-400">のこり {challengesRemaining} かい</span>
                </p>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={guess}
                    onChange={handleChange}
                    placeholder="ひらがな・カタカナでにゅうりょく"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsOpen(false); setGuess(''); }}
                      className="flex-1 bg-gray-100 text-gray-600 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors"
                    >
                      やめる
                    </button>
                    <button
                      type="submit"
                      disabled={!guess.trim() || !isValidChatInput(guess.trim())}
                      className="flex-1 bg-amber-500 text-white rounded-lg py-3 font-semibold hover:bg-amber-600 transition-colors disabled:opacity-30"
                    >
                      チャレンジ！
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
