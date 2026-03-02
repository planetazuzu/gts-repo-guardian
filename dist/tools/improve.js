import { Octokit } from 'octokit';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });
export async function applyImprovements(owner, repo, improvements) {
    try {
        const results = [];
        for (const improvement of improvements) {
            const lower = improvement.toLowerCase();
            if (lower.includes('readme') && !lower.includes('generar')) {
                results.push('⚠️ Para crear README, usa la herramienta generate_readme');
                continue;
            }
            if (lower.includes('gitignore')) {
                const gitignore = `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
`;
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: '.gitignore',
                    message: 'docs: Add .gitignore [gts-repo-guardian]',
                    content: Buffer.from(gitignore).toString('base64'),
                });
                results.push('✅ Actualizado .gitignore');
            }
            if (lower.includes('license')) {
                const license = `MIT License

Copyright (c) ${new Date().getFullYear()} ${owner}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`;
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: 'LICENSE',
                    message: 'docs: Add MIT license [gts-repo-guardian]',
                    content: Buffer.from(license).toString('base64'),
                });
                results.push('✅ Creado LICENSE');
            }
            if (lower.includes('env.example')) {
                const envExample = `# Environment variables
# Copia este archivo a .env y completa los valores

DATABASE_URL=
API_KEY=
`;
                await octokit.rest.repos.createOrUpdateFileContents({
                    owner,
                    repo,
                    path: '.env.example',
                    message: 'docs: Add .env.example [gts-repo-guardian]',
                    content: Buffer.from(envExample).toString('base64'),
                });
                results.push('✅ Creado .env.example');
            }
        }
        return {
            content: [{
                    type: 'text',
                    text: `# ✅ Mejoras Aplicadas: ${owner}/${repo}

${results.join('\n')}

${results.length === 0 ? 'No se aplicaron mejoras automáticamente.' : 'Revisa los cambios en GitHub.'}
`,
                }],
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error aplicando mejoras: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
}
//# sourceMappingURL=improve.js.map