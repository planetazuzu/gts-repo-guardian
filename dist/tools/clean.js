import { Octokit } from 'octokit';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const GITIGNORE_TEMPLATES = {
    node: `node_modules/
dist/
build/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
*.log
coverage/
.nyc_output/
`,
    python: `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/
.env
.env.local
.pytest_cache/
`,
    rust: `target/
Cargo.lock
.env
.env.local
*.swp
*.swo
*~
.DS_Store
`,
    go: `vendor/
*.exe
*.exe~
*.dll
*.so
*.dylib
.env
.env.local
bin/
pkg/
`,
};
export async function cleanRepository(owner, repo) {
    try {
        const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path: '' });
        const files = Array.isArray(contents) ? contents.map(f => f.name) : [];
        const improvements = [];
        let newContent = '';
        if (!files.includes('.gitignore')) {
            const stack = detectStack(files);
            const gitignore = GITIGNORE_TEMPLATES[stack] || GITIGNORE_TEMPLATES.node;
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: '.gitignore',
                message: 'docs: Add .gitignore [gts-repo-guardian]',
                content: Buffer.from(gitignore).toString('base64'),
            });
            improvements.push('✅ Creado .gitignore');
        }
        if (!files.includes('.env.example') && files.includes('.env')) {
            improvements.push('⚠️ Crear .env.example desde .env (manual)');
        }
        if (!files.includes('LICENSE')) {
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

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: 'LICENSE',
                message: 'docs: Add MIT license [gts-repo-guardian]',
                content: Buffer.from(license).toString('base64'),
            });
            improvements.push('✅ Creado LICENSE (MIT)');
        }
        return {
            content: [{
                    type: 'text',
                    text: `# 🧹 Limpieza de Repo: ${owner}/${repo}

## Mejoras Aplicadas

${improvements.join('\n')}

## Recomendaciones Adicionales

${!files.includes('src') && !files.includes('lib') ? '- 📁 Considera reorganizar en carpeta src/' : ''}
${!files.includes('docs') ? '- 📚 Considera crear carpeta docs/' : ''}
${!files.includes('README.md') ? '- 📝 Falta README.md - usa generate_readme' : ''}
`,
                }],
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error limpiando repo: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
}
function detectStack(files) {
    if (files.includes('Cargo.toml'))
        return 'rust';
    if (files.includes('go.mod'))
        return 'go';
    if (files.includes('requirements.txt') || files.includes('pyproject.toml'))
        return 'python';
    if (files.includes('pom.xml'))
        return 'java';
    return 'node';
}
//# sourceMappingURL=clean.js.map