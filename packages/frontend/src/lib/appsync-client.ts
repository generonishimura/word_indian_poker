const APPSYNC_URL = import.meta.env.VITE_APPSYNC_URL as string | undefined;
const API_KEY = import.meta.env.VITE_APPSYNC_API_KEY as string | undefined;

// ローカル開発時は /graphql (Vite proxy → localhost:3001)
// 本番は AppSync のエンドポイント
const endpoint = APPSYNC_URL || '/graphql';

export async function graphql<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // AppSync 本番環境のみ API Key を送信
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}
