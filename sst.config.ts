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
    const vpc = new sst.aws.Vpc('Vpc', { nat: 'ec2' });
    const cluster = new sst.aws.Cluster('Cluster', { vpc });

    // バックエンド: Express(静的配信) + Socket.IO
    const service = new sst.aws.Service('Backend', {
      cluster,
      loadBalancer: {
        ports: [
          { listen: '80/http', forward: '3000/http' },
        ],
      },
      image: {
        dockerfile: 'Dockerfile',
      },
      scaling: {
        min: 1,
        max: 2,
      },
      cpu: '0.25 vCPU',
      memory: '0.5 GB',
      dev: {
        command: 'npm run dev -w @wip/backend',
      },
    });

    // CloudFront CDN: ALBの前段に置いてHTTPS化
    // 全リクエストをALBに転送（静的ファイルもSocket.IOもバックエンドが配信）
    const cdn = new sst.aws.Cdn('Cdn', {
      origins: [{
        domainName: service.url.apply(url => new URL(url).hostname),
        originId: 'backend',
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: 'http-only',
          originSslProtocols: ['TLSv1.2'],
        },
      }],
      defaultCacheBehavior: {
        targetOriginId: 'backend',
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
        cachedMethods: ['GET', 'HEAD'],
        cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingDisabled
        originRequestPolicyId: '216adef6-5c7f-47e4-b989-5492eafa07d3', // AllViewer
      },
    });

    return {
      url: cdn.url,
      api: service.url,
    };
  },
});
