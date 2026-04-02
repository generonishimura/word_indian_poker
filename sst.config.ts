/// <reference path="./.sst/platform.ts" />

export default $config({
  app(input) {
    return {
      name: 'word-indian-poker',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage ?? ''),
      home: 'aws',
      providers: {
        aws: {
          profile: 'sandbox',
          region: 'ap-northeast-1',
        },
      },
    };
  },

  async run() {
    // DynamoDB テーブル
    const table = new sst.aws.Dynamo('GameRooms', {
      fields: { roomCode: 'string' },
      primaryIndex: { hashKey: 'roomCode' },
      ttl: 'ttl',
    });

    // AppSync GraphQL API
    const api = new sst.aws.AppSync('GameApi', {
      schema: 'schema.graphql',
    });

    // API Key の取得（AppSync API_KEY 認証で自動作成される）
    const apiKey = new aws.appsync.ApiKey('GameApiKey', {
      apiId: api.id,
    });

    // Lambda データソース
    const lambdaDS = api.addDataSource({
      name: 'gameResolver',
      lambda: {
        handler: 'packages/backend/src/handler.handler',
        runtime: 'nodejs22.x',
        timeout: '10 seconds',
        link: [table],
        environment: {
          TABLE_NAME: table.name,
        },
      },
    });

    // Query リゾルバ
    api.addResolver('Query getGameState', {
      dataSource: lambdaDS.name,
    });

    // Mutation リゾルバ
    const mutations = [
      'createRoom',
      'joinRoom',
      'selectTheme',
      'startGame',
      'sendMessage',
      'restartGame',
    ];
    for (const mutation of mutations) {
      api.addResolver(`Mutation ${mutation}`, {
        dataSource: lambdaDS.name,
      });
    }

    // フロントエンド (Vite SPA)
    const site = new sst.aws.StaticSite('Frontend', {
      path: 'packages/frontend',
      build: {
        command: 'npm run build',
        output: 'dist',
      },
      environment: {
        VITE_APPSYNC_URL: api.url,
        VITE_APPSYNC_API_KEY: apiKey.key,
      },
    });

    return {
      url: site.url,
      apiUrl: api.url,
    };
  },
});
