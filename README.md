# ワードインディアンポーカー

テーマに沿った会話をしながら、自分に割り当てられた「秘密のワード」を言わないように立ち回るマルチプレイヤーパーティーゲーム。他のプレイヤーの秘密のワードを推測してチャレンジし、最後まで生き残った人が勝ち。

## ゲームルール

1. ホストがルームを作成し、他のプレイヤーが合言葉（4桁コード）で参加
2. テーマを選択（学校・食べ物・動物・一般）してゲーム開始
3. 各プレイヤーに秘密のワードが割り当てられる（自分のワードは見えない）
4. テーマに沿ってチャットで会話する
5. **自分のワードを発言してしまうと即脱落！**
6. 他プレイヤーのワードを推測して「チャレンジ」できる（1ゲーム最大5回）
7. 2分ごとに新しいワードが追加される（ドルボン）
8. 最後の1人になったプレイヤーが勝利

**プレイ人数**: 2〜6人

## セットアップ

```bash
npm install
```

## 開発

```bash
# バックエンド + フロントエンドを同時起動
npm run dev

# http://localhost:5173 でアクセス
```

バックエンド（Express）がポート3001、フロントエンド（Vite）がポート5173で起動します。フロントエンドの `/graphql` リクエストはバックエンドにプロキシされます。

## テスト

```bash
# 全テスト実行
npm run test

# watchモード（パッケージ指定）
npm run test:watch -w @wip/backend
npm run test:watch -w @wip/shared
```

## ビルド・デプロイ

```bash
# 全パッケージビルド
npm run build

# AWSにデプロイ（SST）
npx sst deploy
npx sst deploy --stage production
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 19, Vite, Tailwind CSS 4 |
| バックエンド | Express (dev), AWS Lambda (prod) |
| API | AppSync GraphQL |
| データベース | DynamoDB (24h TTL自動削除) |
| インフラ | SST, CloudFront + S3 |
| テスト | Vitest |
| 言語 | TypeScript (strict) |

## プロジェクト構成

```
packages/
├── shared/    # 型定義、ゲーム定数、ワードリスト、ワード検出ロジック
├── backend/   # ゲームロジック(GameRoom)、GraphQLリゾルバ、リポジトリ
└── frontend/  # React SPA、ゲームUI、APIフック
```
