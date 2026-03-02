export const PROFILES = {
    planetazuzu: {
        type: 'sanitario',
        repos: [
            'guia-tes-digital',
            'ia-primeros-auxilios',
            'salvaia',
            'app-glsgow',
            'app-P10',
            'rioja-ambulancias-mapa-pwa',
            'revision_ambulancia',
            'rioja-emergencia',
        ],
        template: 'readme-sanitario',
        requiredSections: [
            'advertencia-clinica',
            'protocolos',
            'aviso-legal',
            'como-contribuir',
            'ecosistema',
        ],
    },
    PlanetaZero: {
        type: 'tech',
        repos: [
            'gts-repo-guardian',
            'nexus-gts',
        ],
        template: 'readme-tech',
        requiredSections: ['stack', 'instalacion', 'arquitectura'],
    },
    'gts-dev-lab': {
        type: 'lab',
        repos: [],
        template: 'readme-lab',
        requiredSections: ['estado', 'como-contribuir', 'roadmap'],
    },
};
export const AUTHOR = {
    name: 'Javier Fernández',
    username: '@planetazuzu',
    role: 'Técnico de Emergencias Sanitarias · +25 años · La Rioja, España',
    company: 'GTS SOFTWARE',
    linkedin: 'https://www.linkedin.com/in/f-javier-fernandez-lopez',
    github: 'https://github.com/planetazuzu',
};
//# sourceMappingURL=profiles.js.map