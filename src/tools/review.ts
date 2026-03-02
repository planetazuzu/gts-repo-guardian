import { Octokit } from 'octokit';
import { QUALITY_RULES } from '../config/rules.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function reviewRepository(owner: string, repo: string) {
  try {
    const { data: repository } = await octokit.rest.repos.get({ owner, repo });
    const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path: '' });

    const files = Array.isArray(contents) ? contents.map(f => f.name) : [];
    
    const checks: Record<string, { passed: boolean; details: string }> = {};
    let totalScore = 0;
    let maxScore = 0;

    for (const rule of QUALITY_RULES) {
      maxScore += rule.weight;
      let passed = false;
      let details = '';

      switch (rule.id) {
        case 'readme':
          passed = files.includes('README.md');
          if (passed) {
            const readme = await octokit.rest.repos.getContent({ owner, repo, path: 'README.md' });
            const content = Buffer.from((readme.data as any).content, 'base64').toString();
            passed = content.length > 200;
            details = passed ? `README con ${content.length} caracteres` : 'README demasiado corto';
          }
          break;
        case 'description':
          passed = !!repository.description;
          details = repository.description || 'Sin descripción';
          break;
        case 'topics':
          passed = (repository.topics?.length || 0) >= 3;
          details = `${repository.topics?.length || 0} topics`;
          break;
        case 'license':
          passed = !!repository.license;
          details = repository.license?.name || 'Sin licencia';
          break;
        case 'gitignore':
          passed = files.includes('.gitignore');
          break;
        case 'package':
          passed = files.includes('package.json');
          if (passed) {
            const pkg = await octokit.rest.repos.getContent({ owner, repo, path: 'package.json' });
            const pkgData = JSON.parse(Buffer.from((pkg.data as any).content, 'base64').toString());
            passed = !!(pkgData.name && pkgData.description);
            details = pkgData.name || 'Sin nombre';
          }
          break;
        case 'structure':
          const hasSrc = files.includes('src') || files.includes('lib') || files.includes('app');
          const hasDocs = files.includes('docs') || files.includes('documentation');
          passed = hasSrc && hasDocs;
          details = hasSrc ? 'Estructura correcta' : 'Falta carpeta src/';
          break;
        case 'env':
          passed = files.includes('.env.example') || files.includes('.env.template');
          break;
      }

      checks[rule.id] = { passed, details };
      if (passed) totalScore += rule.weight;
    }

    const percentage = Math.round((totalScore / maxScore) * 100);
    const grade = percentage >= 80 ? '🟢' : percentage >= 50 ? '🟡' : '🔴';

    const report = `
# 📊 Informe de Calidad: ${owner}/${repo}

## Puntuación: ${percentage}/100 ${grade}

### Detalle de Comprobaciones

| Regla | Estado | Detalles |
|--------|--------|----------|
${QUALITY_RULES.map(r => `| ${r.check} | ${checks[r.id].passed ? '✅' : '❌'} | ${checks[r.id].details} |`).join('\n')}

### Archivos Detectados
${files.slice(0, 20).map(f => `- ${f}`).join('\n')}${files.length > 20 ? `\n... y ${files.length - 20} más` : ''}

### Información del Repo
- ⭐ Stars: ${repository.stargazers_count}
- 🍴 Forks: ${repository.forks_count}
- 👁️ Visitas: ${repository.watchers_count}
- 📅 Actualizado: ${new Date(repository.updated_at).toLocaleDateString()}
- �许可证: ${repository.license?.name || 'Sin licencia'}
`;

    return {
      content: [{ type: 'text', text: report }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error revisando repo: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
