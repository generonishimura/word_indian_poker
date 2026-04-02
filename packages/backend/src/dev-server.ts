import express from 'express';
import { createMemoryRepository } from './repository/memory-repository.js';
import { createResolver } from './resolver.js';

const app = express();
app.use(express.json());

const repo = createMemoryRepository();
const resolve = createResolver(repo);

// GraphQL エンドポイント（AppSync 互換の簡易実装）
app.post('/graphql', async (req, res) => {
  const { query, variables } = req.body;

  // GraphQL クエリ文字列からフィールド名を抽出
  const fieldMatch = query.match(/(?:query|mutation)\s+\w+[^{]*\{\s*(\w+)/);
  if (!fieldMatch) {
    res.json({ errors: [{ message: 'Failed to parse query' }] });
    return;
  }

  const fieldName = fieldMatch[1];
  const parentTypeName = query.trimStart().startsWith('query') ? 'Query' : 'Mutation';

  try {
    const result = await resolve({
      info: { fieldName, parentTypeName },
      arguments: variables ?? {},
    });

    res.json({ data: { [fieldName]: result } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.json({ errors: [{ message }] });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Local GraphQL server running on http://localhost:${PORT}/graphql`);
});
