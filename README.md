# gts-repo-guardian 🛡️

> MCP (Model Context Protocol) para gestión y revisión automática de repositorios GitHub

[![npm version](https://img.shields.io/npm/v/gts-repo-guardian)]()
[![License](https://img.shields.io/badge/Licencia-MIT-green)]()

---

## 📋 Descripción

**gts-repo-guardian** es un servidor MCP que automatiza la gestión de calidad de repositorios GitHub. Diseñado para mantener el estándar de documentación en los proyectos de @planetazuzu y GTS SOFTWARE.

## ⚡ Características

### Herramientas Disponibles

| Herramienta | Descripción |
|------------|-------------|
| `review_repository` | Analiza un repo y genera informe de calidad (0-100) |
| `generate_readme` | Genera README profesional automáticamente |
| `clean_repository` | Limpia y estructura el repositorio |
| `review_all_repositories` | Revisión masiva de todos los repos de un usuario |
| `apply_improvements` | Aplica mejoras automáticamente |
| `watch_repositories` | Monitoriza repos y alerta sobre problemas |

## 🚀 Instalación

```bash
git clone https://github.com/PlanetaZero/gts-repo-guardian.git
cd gts-repo-guardian
npm install
npm run build
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Genera un token de GitHub en:
   https://github.com/settings/tokens

3. Asigna el token en `.env`:
```env
GITHUB_TOKEN=tu_token_aqui
```

## 🔧 Uso con OpenCode

Añade a tu configuración de OpenCode:

```json
{
  "mcpServers": {
    "gts-repo-guardian": {
      "command": "node",
      "args": ["/ruta/a/gts-repo-guardian/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "tu_token_aqui"
      }
    }
  }
}
```

## 🔧 Uso con Claude Desktop

Añade a `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gts-repo-guardian": {
      "command": "node",
      "args": ["/ruta/a/gts-repo-guardian/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "tu_token_aqui"
      }
    }
  }
}
```

## 📊 Sistema de Puntuación

| Puntuación | Color | Significado |
|------------|-------|-------------|
| 80-100 | 🟢 Verde | Excelente |
| 50-79 | 🟡 Amarillo | Necesita mejoras |
| 0-49 | 🔴 Rojo | Necesita trabajo urgente |

### Reglas de Calidad

- README.md existe y tiene >200 palabras: 30 pts
- Repo tiene descripción en GitHub: 15 pts
- Repo tiene al menos 3 topics: 10 pts
- Licencia presente: 10 pts
- .gitignore apropiado al stack: 10 pts
- package.json con nombre y descripción: 10 pts
- Carpetas organizadas correctamente: 10 pts
- .env.example presente si hay variables: 5 pts

## 📁 Estructura del Proyecto

```
gts-repo-guardian/
├── src/
│   ├── index.ts              # Servidor MCP principal
│   ├── tools/
│   │   ├── review.ts         # Revisión de repos
│   │   ├── readme.ts          # Generación de READMEs
│   │   ├── clean.ts           # Limpieza y estructura
│   │   ├── batch.ts           # Revisión masiva
│   │   ├── improve.ts         # Aplicar mejoras
│   │   └── monitor.ts         # Monitorización continua
│   ├── templates/
│   │   ├── readme-sanitario.md
│   │   ├── readme-tech.md
│   │   └── readme-lab.md
│   └── config/
│       ├── rules.ts          # Reglas de calidad
│       └── profiles.ts       # Configuración de perfiles
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 👤 Autor

**Javier Fernández** · [@planet://github.com/azuzu](httpsplanetazuzu)
Técnico de Emergencias Sanitarias · +25 años · La Rioja, España
GTS SOFTWARE

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/f-javier-fernandez-lopez)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github)](https://github.com/planetazuzu)

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.
