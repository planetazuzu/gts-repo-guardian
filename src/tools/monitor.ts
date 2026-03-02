import { Octokit } from 'octokit';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function watchRepositories(username: string, daysInactive: number = 30) {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 100,
    });

    const now = new Date();
    const inactiveRepos: Array<{
      name: string;
      daysSinceUpdate: number;
      updated: string;
      description?: string;
    }> = [];

    for (const repo of repos) {
      const updated = new Date(repo.updated_at);
      const daysSinceUpdate = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate >= daysInactive) {
        inactiveRepos.push({
          name: repo.name,
          daysSinceUpdate,
          updated: updated.toLocaleDateString(),
          description: repo.description,
        });
      }
    }

    inactiveRepos.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

    const { data: pinnedRepos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'pushed',
      per_page: 6,
    });

    const report = `# 👀 Monitorización: @${username}

## Estado General

- **Total repos:** ${repos.length}
- **Inactivos (>${daysInactive} días):** ${inactiveRepos.length}
- **Repos anclados:** ${pinnedRepos.length}

## ⚠️ Repos Inactivos

${inactiveRepos.length > 0 ? inactiveRepos.map(r => 
  `- **${r.name}** - ${r.daysSinceUpdate} días sin actualizar (${r.updated})`
).join('\n') : '✅ ¡Todos los repos están activos!'}

## 📌 Repos Anclados

${pinnedRepos.map(r => `- ${r.name} - ⭐ ${r.stargazers_count}`).join('\n')}

## Recomendaciones

${inactiveRepos.length > 3 ? `⚠️ Tienes ${inactiveRepos.length} repos sin actualizar. Considera:
- Archivar los que ya no uses
- Añadir说明 a los que estén en pausa
- Destacar los activos en el perfil` : '✅ Buen estado de repositorios'}

---
*Informe generado por gts-repo-guardian*
`;

    return {
      content: [{ type: 'text', text: report }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error en monitorización: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
