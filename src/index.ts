import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { reviewRepository } from './tools/review.js';
import { generateReadme } from './tools/readme.js';
import { cleanRepository } from './tools/clean.js';
import { reviewAllRepositories } from './tools/batch.js';
import { applyImprovements } from './tools/improve.js';
import { watchRepositories } from './tools/monitor.js';

const server = new Server(
  {
    name: 'gts-repo-guardian',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'review_repository',
        description: 'Analiza un repositorio GitHub y genera informe de calidad con puntuación 0-100',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Dueño del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'generate_readme',
        description: 'Genera un README profesional automáticamente basado en el código del repo',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Dueño del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            template: { 
              type: 'string', 
              enum: ['sanitario', 'tech', 'lab'],
              description: 'Tipo de template a usar' 
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'clean_repository',
        description: 'Limpia y estructura un repositorio automáticamente',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Dueño del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'review_all_repositories',
        description: 'Revisa todos los repos públicos de un perfil GitHub',
        inputSchema: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'Usuario de GitHub' },
          },
          required: ['username'],
        },
      },
      {
        name: 'apply_improvements',
        description: 'Aplica las mejoras automáticamente basándose en el informe de review',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Dueño del repositorio' },
            repo: { type: 'string', description: 'Nombre del repositorio' },
            improvements: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Lista de mejoras a aplicar' 
            },
          },
          required: ['owner', 'repo', 'improvements'],
        },
      },
      {
        name: 'watch_repositories',
        description: 'Monitoriza repos y alerta sobre problemas',
        inputSchema: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'Usuario de GitHub a monitorizar' },
            daysInactive: { 
              type: 'number', 
              description: 'Días de inactividad para alertar',
              default: 30 
            },
          },
          required: ['username'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return { content: [{ type: 'text', text: 'Error: Arguments missing' }], isError: true };
  }

  try {
    switch (name) {
      case 'review_repository':
        return await reviewRepository(String(args.owner), String(args.repo));
      case 'generate_readme':
        return await generateReadme(String(args.owner), String(args.repo), args.template ? String(args.template) : 'tech');
      case 'clean_repository':
        return await cleanRepository(String(args.owner), String(args.repo));
      case 'review_all_repositories':
        return await reviewAllRepositories(String(args.username));
      case 'apply_improvements':
        return await applyImprovements(String(args.owner), String(args.repo), Array.isArray(args.improvements) ? args.improvements.map(String) : []);
      case 'watch_repositories':
        return await watchRepositories(String(args.username), args.daysInactive ? Number(args.daysInactive) : 30);
      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
