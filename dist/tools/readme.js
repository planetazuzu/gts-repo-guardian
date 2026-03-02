import { Octokit } from 'octokit';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const TEMPLATES = {
    sanitario: readFileSync(join(__dirname, '../templates/readme-sanitario.md'), 'utf-8'),
    tech: readFileSync(join(__dirname, '../templates/readme-tech.md'), 'utf-8'),
    lab: readFileSync(join(__dirname, '../templates/readme-lab.md'), 'utf-8'),
};
const AUTHOR_INFO = {
    name: 'Javier Fernández',
    username: '@planetazuzu',
    role: 'Técnico de Emergencias Sanitarias · +25 años · La Rioja, España',
    company: 'GTS SOFTWARE',
    linkedin: 'https://www.linkedin.com/in/f-javier-fernandez-lopez',
    github: 'https://github.com/planetazuzu',
};
const ECOSYSTEM = `
| App | Descripción | Enlace |
|-----|-------------|--------|
| 🧠 salvaia | IA para salvamento y emergencias | [ver repo](https://github.com/planetazuzu/salvaia) |
| 🤖 ia-primeros-auxilios | Asistente IA primeros auxilios | [ver repo](https://github.com/planetazuzu/ia-primeros-auxilios) |
| 🗺️ rioja-ambulancias-mapa-pwa | Mapa PWA ambulancias La Rioja | [ver repo](https://github.com/planetazuzu/rioja-ambulancias-mapa-pwa) |
| 📊 app-glsgow | Escala de Glasgow | [ver repo](https://github.com/planetazuzu/app-glsgow) |
| 💊 app-P10 | Herramienta clínica de apoyo | [ver repo](https://github.com/planetazuzu/app-P10) |
`;
export async function generateReadme(owner, repo, templateType = 'tech') {
    try {
        const { data: repository } = await octokit.rest.repos.get({ owner, repo });
        const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path: '' });
        const files = Array.isArray(contents) ? contents.map(f => f.name) : [];
        const detectedStack = detectStack(files, repository.description || '');
        const isSanitario = detectSanitario(repository.description || '', files);
        if (isSanitario && templateType === 'tech') {
            templateType = 'sanitario';
        }
        let template = TEMPLATES[templateType] || TEMPLATES.tech;
        let readme = template
            .replace(/\{\{REPO_NAME\}\}/g, repository.name)
            .replace(/\{\{DESCRIPTION\}\}/g, repository.description || `Proyecto de ${owner}`)
            .replace(/\{\{STACK\}\}/g, detectedStack)
            .replace(/\{\{AUTHOR_NAME\}\}/g, AUTHOR_INFO.name)
            .replace(/\{\{AUTHOR_USERNAME\}\}/g, AUTHOR_INFO.username)
            .replace(/\{\{AUTHOR_ROLE\}\}/g, AUTHOR_INFO.role)
            .replace(/\{\{AUTHOR_COMPANY\}\}/g, AUTHOR_INFO.company)
            .replace(/\{\{LINKEDIN\}\}/g, AUTHOR_INFO.linkedin)
            .replace(/\{\{GITHUB\}\}/g, AUTHOR_INFO.github)
            .replace(/\{\{ECOSYSTEM\}\}/g, ECOSYSTEM)
            .replace(/\{\{INSTALL_COMMAND\}\}/g, detectedStack.includes('npm') ? 'npm install' : detectedStack.includes('pnpm') ? 'pnpm install' : detectedStack.includes('cargo') ? 'cargo build' : 'make install')
            .replace(/\{\{DEV_COMMAND\}\}/g, detectedStack.includes('npm') ? 'npm run dev' : detectedStack.includes('pnpm') ? 'pnpm dev' : detectedStack.includes('cargo') ? 'cargo run' : 'make dev');
        return {
            content: [{
                    type: 'text',
                    text: readme,
                }],
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: `Error generando README: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
}
function detectStack(files, description) {
    const stack = [];
    const desc = description.toLowerCase();
    if (files.includes('package.json')) {
        stack.push('Node.js');
        if (files.includes('next.config.js') || files.includes('next.config.mjs'))
            stack.push('Next.js');
        else if (files.includes('vite.config.ts'))
            stack.push('Vite');
        else if (files.includes('astro.config.mjs'))
            stack.push('Astro');
    }
    if (files.includes('Cargo.toml'))
        stack.push('Rust');
    if (files.includes('requirements.txt') || files.includes('pyproject.toml'))
        stack.push('Python');
    if (files.includes('go.mod'))
        stack.push('Go');
    if (files.includes('pom.xml'))
        stack.push('Java');
    if (files.includes('Gemfile'))
        stack.push('Ruby');
    if (files.includes('composer.json'))
        stack.push('PHP');
    if (files.includes('angular.json'))
        stack.push('Angular');
    if (files.includes('ionic.config.json'))
        stack.push('Ionic');
    if (desc.includes('react'))
        stack.push('React');
    if (desc.includes('vue'))
        stack.push('Vue');
    if (desc.includes('typescript'))
        stack.push('TypeScript');
    if (desc.includes('python'))
        stack.push('Python');
    return stack.length > 0 ? stack.join(' · ') : 'JavaScript · Node.js';
}
function detectSanitario(description, files) {
    const keywords = ['sanitario', 'emergencia', 'tes', 'ambulancia', 'salud', 'médico',
        'enfermero', 'rcp', 'resucitación', 'trauma', 'clínico', 'hospital', 'paciente',
        'primeros auxilios', 'glasgow', 'vademécum'];
    const desc = description.toLowerCase();
    return keywords.some(k => desc.includes(k)) || files.some(f => f.toLowerCase().includes('protocolo') || f.toLowerCase().includes('vademecum'));
}
//# sourceMappingURL=readme.js.map