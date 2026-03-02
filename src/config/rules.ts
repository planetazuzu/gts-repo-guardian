export const QUALITY_RULES = [
  { id: 'readme', weight: 30, check: 'README.md existe y tiene >200 palabras' },
  { id: 'description', weight: 15, check: 'repo tiene descripción en GitHub' },
  { id: 'topics', weight: 10, check: 'repo tiene al menos 3 topics' },
  { id: 'license', weight: 10, check: 'licencia presente' },
  { id: 'gitignore', weight: 10, check: '.gitignore apropiado al stack' },
  { id: 'package', weight: 10, check: 'package.json con nombre y descripción' },
  { id: 'structure', weight: 10, check: 'carpetas organizadas correctamente' },
  { id: 'env', weight: 5, check: '.env.example presente si hay variables' },
];

export const GRADE_COLORS = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

export const THRESHOLDS = {
  green: 80,
  yellow: 50,
};
