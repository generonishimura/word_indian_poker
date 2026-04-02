import { useState } from 'react';

interface RulesButtonProps {
  variant?: 'dark' | 'light';
}

export function RulesButton({ variant = 'dark' }: RulesButtonProps) {
  const [open, setOpen] = useState(false);

  const className = variant === 'dark'
    ? 'w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-white/30 transition-colors active:scale-95'
    : 'w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        aria-label="ルール説明"
      >
        ?
      </button>
      {open && <RulesDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function RulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">あそびかた</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            aria-label="とじる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <section>
            <h3 className="font-bold text-gray-800 mb-1">ゲームの目的</h3>
            <p>
              自分に割り当てられた「ひみつのワード」を会話中に言わないように気をつけながら、
              他のプレイヤーのワードを当てよう！
            </p>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-1">基本ルール</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>各プレイヤーには他の人だけが見える「ひみつのワード」が配られます</li>
              <li>自分のワードは自分には見えません（インディアンポーカーと同じ！）</li>
              <li>テーマに沿ってみんなで自由に会話します</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-1">ドボン（脱落）</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>会話中に自分のワードをうっかり言ってしまったら<span className="text-red-500 font-bold">ドボン！</span></li>
              <li>ドボンしたプレイヤーは脱落します</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-1">チャレンジ</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>自分のワードがわかったと思ったら「チャレンジ」で宣言できます</li>
              <li>当たれば相手を脱落させられます</li>
              <li>外れると自分が脱落します</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-1">ワード追加</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>2分ごとに新しいワードが追加されます</li>
              <li>ワードが増えるほど会話が難しくなります！</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-800 mb-1">勝利条件</h3>
            <p>最後まで脱落せずに残ったプレイヤーの勝ち！</p>
          </section>

          <section className="bg-indigo-50 rounded-xl p-3">
            <h3 className="font-bold text-indigo-700 mb-1">コツ</h3>
            <ul className="list-disc list-inside space-y-1 text-indigo-600">
              <li>他のプレイヤーの反応をよく観察しよう</li>
              <li>相手のワードをさりげなく言わせるように誘導しよう</li>
              <li>自分のワードのヒントになりそうな話題は避けよう</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
