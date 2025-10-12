import { Hono } from 'hono'; 
import { getRepositoryInfo } from '../services/GithubAPI';
import { createStargazerCard } from '../cards/stargazers'; 
import { encodeBase64 } from 'hono/utils/encode';
import { BACKEND_ROUTES } from './config';
import { mapImageURLToDataURL } from '../utils/common';
import { sha256 } from 'hono/utils/crypto';
 
const app = new Hono<{ Bindings: Cloudflare.Env}>();


app.use('/*', async (c, next) => { 
    if (c.env.ASSETS && !BACKEND_ROUTES.some(path => c.req.path.startsWith(path))) {
      const url = new URL(c.req.raw.url);
      return c.env.ASSETS.fetch(url);
    }
  	await next()
});
app
.get('/github-stargazers/:owner/:repo/*', async (c) => {
  const { owner, repo } = c.req.param();
  // check if owner if on env.ALLOWED_OWNERS (comma separated)
  if (c.env.ALLOWED_GITHUB_OWNERS) {
    const allowedOwners = c.env.ALLOWED_GITHUB_OWNERS.split(',').map(o => o.trim().toLowerCase());
    if (!allowedOwners.includes(owner.toLowerCase())) {
      return c.text('not allowed', { status: 403 });
    }
  }

  const repoInfo = await getRepositoryInfo(owner, repo, 8).catch(() => {});
  
  if (!repoInfo) {
    return c.text('no data');
  }

  const data = repoInfo;
  for (let i = 0; i < data.stargazers.nodes.length; i++) {
    data.stargazers.nodes[i].avatarUrl = await mapImageURLToDataURL(data.stargazers.nodes[i].avatarUrl);
  }
  const show_usernames = c.req.query('show_usernames');
  const shouldShowUsernames = show_usernames === 'true' || show_usernames === '1';
  
  const hash = await sha256(JSON.stringify(data));
  const etag = hash ? hash.substring(0, 16) : undefined;
  const expiresDate = new Date(Date.now() + 10 * 1000);
  return c.body(createStargazerCard(data, {
    shouldShowUsernames: shouldShowUsernames,
    title: "Recent Stargazers",
    showTitle: true,
    extra: {
      owner,
    }
  }), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=10, s-maxage=10, stale-while-revalidate=60',
      'ETag': etag,
      'Expires': expiresDate.toUTCString()
    }
  });
})
.get('/test', async (c) => {
  if (!import.meta.env.PROD) {
    const { longNamesStargazersTestData, originalStargazersTestData } = await import('../.test-data/stargazers-test-data')
    const data = longNamesStargazersTestData();
    for (let i = 0; i < data.stargazers.nodes.length; i++) {
      data.stargazers.nodes[i].avatarUrl = await mapImageURLToDataURL(data.stargazers.nodes[i].avatarUrl);
    }
    const show_usernames = c.req.query('show_usernames');
    const shouldShowUsernames = show_usernames === 'true' || show_usernames === '1';

    return c.body(createStargazerCard(data, {
      shouldShowUsernames: shouldShowUsernames,
      title: "Recent Stargazers",
      showTitle: true,
      extra: {
        owner: 'some-owner',
      }
    }), {
      headers: {
        'Content-Type': 'image/svg+xml'
      }
    });
  }
});

export default app
