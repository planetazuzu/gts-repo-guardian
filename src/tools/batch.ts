import { Octokit } from 'octokit';
import { QUALITY_RULES } from '../config/rules.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function reviewAllRepositories(username: string) {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });

    const results = [];

    for (const repo of repos) {
      const score = await calculateScore(repo.name, username);
      results.push({
        name: repo.name,
        score,
        description: repo.description,
        updated: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'N/A',
        stars: repo.stargazers_count,
      });
    }

    results.sort((a, b) => b.score - a.score);

    const report = `# 📊 Revisión Masiva: @${username}

## Resumen

| Total Repos | 🟢 Verde (80+) | 🟡 Amarillo (50-79) | 🔴 Rojo (<50) |
|-------------|----------------|----------------------|---------------|
| ${results.length} | ${results.filter(r => r.score >= 80).length} | ${results.filter(r => r.score >= 50 && r.score < 80).length} | ${results.filter(r => r.score < 50).length} |

## Repos por Prioridad

### 🟢 Necesitan poco trabajo
${results.filter(r => r.score >= 80).map(r => `- **${r.name}** (${r.score}/100) - ${r.description || 'sin descripción'}`).join('\n') || '_Ninguno_'}

### 🟡 Necesitan trabajo moderado
${results.filter(r => r.score >= 50 && r.score < 80).map(r => `- **${r.name}** (${r.score}/100) - ${r.description || 'sin descripción'}`).join('\n') || '_Ninguno_'}

### 🔴 Necesitan trabajo urgente
${results.filter(r => r.score < 50).map(r => `- **${r.name}** (${r.score}/100) - ${r.description || 'sin descripción'}`).join('\n') || '_Ninguno_'}

## Lista Completa

| Repo | Puntuación | Descripción | Actualizado |
|------|------------|-------------|-------------|
${results.map(r => `| ${r.name} | ${r.score}/100 | ${r.description || '-'} | ${r.updated} |`).join('\n')}
`;

    return {
      content: [{ type: 'text', text: report }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error en revisión masiva: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

async function calculateScore(repo: string, owner: string): Promise<number> {
  try {
    const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path: '' });
    const files = Array.isArray(contents) ? contents.map(f => f.name) : [];
    
    let score = 0;
    let maxScore = 0;

    for (const rule of QUALITY_RULES) {
      maxScore += rule.weight;
      let passed = false;

      switch (rule.id) {
        case 'readme':
          passed = files.includes('README.md');
          break;
        case 'description':
          const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
          passed = !!repoData.description;
          break;
        case 'topics':
          const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
          passed = (repoInfo.topics?.length || 0) >= 3;
          break;
        case 'license':
          const { data: repoLic } = await octokit.rest.repos.get({ owner, repo });
          passed = !!repoLic.license;
          break;
        case 'gitignore':
          passed = files.includes('.gitignore');
          break;
        case 'package':
          passed = files.includes('package.json');
          break;
        case 'structure':
          passed = files.includes('src') || files.includes('lib');
          break;
        case 'env':
          passed = files.includes('.env.example') || files.includes('.env.template');
          break;
      }

      if (passed) score += rule.weight;
    }

    return Math.round((score / maxScore) * 100);
  } catch {
    return 0;
  }
}
