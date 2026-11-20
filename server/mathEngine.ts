/**
 * Deterministic Symbolic & Matrix Math Engine
 * Integrated directly into the Smart Math Tutor for exact computations.
 */

export interface EngineResult {
  handled: boolean;
  summary: string;
  latexSteps: string[];
  finalAnswer: string;
}

function parseMatrixBlock(raw: string): number[][] | null {
  // Matches [[1,2],[3,4]] or [1 2; 3 4]
  const clean = raw.trim();
  if (clean.startsWith('[[') && clean.endsWith(']]')) {
    try {
      const parsed = JSON.parse(clean);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (row) =>
            Array.isArray(row) &&
            row.length === parsed[0].length &&
            row.every((v) => typeof v === 'number' && Number.isFinite(v))
        )
      ) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  if (clean.includes(';') && clean.startsWith('[') && clean.endsWith(']')) {
    const inner = clean.slice(1, -1);
    const rows = inner.split(';').map((r) =>
      r
        .trim()
        .split(/[\s,]+/)
        .map(Number)
    );
    if (
      rows.length > 0 &&
      rows.every(
        (r) =>
          r.length === rows[0].length &&
          r.every((v) => Number.isFinite(v))
      )
    ) {
      return rows;
    }
  }
  return null;
}

function matrixToLatex(m: number[][]): string {
  const rows = m
    .map((r) => r.map((v) => (Number.isInteger(v) ? v.toString() : v.toFixed(3).replace(/\.?0+$/, ''))).join(' & '))
    .join(' \\\\ ');
  return `\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

export function determinant(m: number[][]): number | null {
  const n = m.length;
  if (n === 0 || m[0].length !== n) return null;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (n === 3) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }
  // General Laplace / Gaussian reduction for small n <= 6
  if (n > 6) return null;
  const copy = m.map((r) => [...r]);
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(copy[pivot][i]) < 1e-10) pivot++;
    if (pivot === n) return 0;
    if (pivot !== i) {
      [copy[i], copy[pivot]] = [copy[pivot], copy[i]];
      det *= -1;
    }
    det *= copy[i][i];
    for (let j = i + 1; j < n; j++) {
      const factor = copy[j][i] / copy[i][i];
      for (let k = i; k < n; k++) {
        copy[j][k] -= factor * copy[i][k];
      }
    }
  }
  return det;
}

export function transpose(m: number[][]): number[][] {
  return m[0].map((_, c) => m.map((r) => r[c]));
}

export function inverse2x2(m: number[][]): number[][] | null {
  if (m.length !== 2 || m[0].length !== 2) return null;
  const det = determinant(m);
  if (det === null || Math.abs(det) < 1e-10) return null;
  return [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det],
  ];
}

export function inverse3x3(m: number[][]): number[][] | null {
  if (m.length !== 3 || m[0].length !== 3) return null;
  const det = determinant(m);
  if (det === null || Math.abs(det) < 1e-10) return null;
  const adj: number[][] = Array.from({ length: 3 }, () => [0, 0, 0]);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const minor: number[][] = [];
      for (let r = 0; r < 3; r++) {
        if (r === i) continue;
        const row: number[] = [];
        for (let c = 0; c < 3; c++) {
          if (c === j) continue;
          row.push(m[r][c]);
        }
        minor.push(row);
      }
      const cofactor = ((i + j) % 2 === 0 ? 1 : -1) * (determinant(minor) ?? 0);
      adj[j][i] = cofactor / det;
    }
  }
  return adj;
}

export function multiplyMatrices(a: number[][], b: number[][]): number[][] | null {
  if (a[0].length !== b.length) return null;
  const result: number[][] = Array.from({ length: a.length }, () =>
    Array(b[0].length).fill(0)
  );
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function solveQuadratic(a: number, b: number, c: number): EngineResult {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) {
      return {
        handled: true,
        summary: Math.abs(c) < 1e-12 ? 'المعادلة محققة لجميع قيم x' : 'المعادلة مستحيلة الحل',
        latexSteps: [],
        finalAnswer: Math.abs(c) < 1e-12 ? 'x \\in \\mathbb{R}' : '\\emptyset',
      };
    }
    const x = -c / b;
    return {
      handled: true,
      summary: 'معادلة من الدرجة الأولى',
      latexSteps: [`${b}x + (${c}) = 0`, `x = \\frac{${-c}}{${b}} = ${Number(x.toFixed(4))}`],
      finalAnswer: `x = ${Number(x.toFixed(4))}`,
    };
  }
  const delta = b * b - 4 * a * c;
  const steps = [
    `\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${Number(delta.toFixed(4))}`,
  ];
  if (delta > 0) {
    const sqrtD = Math.sqrt(delta);
    const x1 = (-b - sqrtD) / (2 * a);
    const x2 = (-b + sqrtD) / (2 * a);
    steps.push(`\\Delta > 0 \\implies \\text{للمعادلة جذران حقيقيان مختلفان}`);
    steps.push(`x_1 = ${Number(x1.toFixed(4))}, \\quad x_2 = ${Number(x2.toFixed(4))}`);
    return {
      handled: true,
      summary: 'حل معادلة من الدرجة الثانية عبر المميز دلتا',
      latexSteps: steps,
      finalAnswer: `S = \\{${Number(x1.toFixed(4))}, ${Number(x2.toFixed(4))}\\}`,
    };
  }
  if (Math.abs(delta) < 1e-10) {
    const x0 = -b / (2 * a);
    steps.push(`\\Delta = 0 \\implies \\text{للمعادلة جذر حقيقي مضاعف}`);
    steps.push(`x_0 = \\frac{-b}{2a} = ${Number(x0.toFixed(4))}`);
    return {
      handled: true,
      summary: 'حل معادلة من الدرجة الثانية ذات جذر مضاعف',
      latexSteps: steps,
      finalAnswer: `S = \\{${Number(x0.toFixed(4))}\\}`,
    };
  }
  const real = -b / (2 * a);
  const imag = Math.sqrt(-delta) / (2 * a);
  steps.push(`\\Delta < 0 \\implies \\text{في } \\mathbb{R} \\text{ لا توجد حلول، وفي } \\mathbb{C} \\text{ جذران عقديان مترافقان}`);
  return {
    handled: true,
    summary: 'حل معادلة من الدرجة الثانية بمميز سالب',
    latexSteps: steps,
    finalAnswer: `z_{1,2} = ${Number(real.toFixed(3))} \\pm ${Number(imag.toFixed(3))}i`,
  };
}

export function runMathEngine(input: string): EngineResult | null {
  const trimmed = input.trim();

  // Check for explicit matrix inputs e.g. [[1,2],[3,4]]
  const matrixMatches = trimmed.match(/\[\[[^\]]+\](?:\s*,\s*\[[^\]]+\])*\]|\[[^\]]+;[^\]]+\]/g);
  if (matrixMatches && matrixMatches.length >= 1) {
    const m1 = parseMatrixBlock(matrixMatches[0]);
    if (m1) {
      if (matrixMatches.length >= 2) {
        const m2 = parseMatrixBlock(matrixMatches[1]);
        if (m2) {
          const prod = multiplyMatrices(m1, m2);
          if (prod) {
            return {
              handled: true,
              summary: 'جداء مصفوفتين بواسطة محرك المصفوفات',
              latexSteps: [
                `A = ${matrixToLatex(m1)}, \\quad B = ${matrixToLatex(m2)}`,
                `A \\cdot B = ${matrixToLatex(prod)}`,
              ],
              finalAnswer: matrixToLatex(prod),
            };
          }
        }
      }
      const det = determinant(m1);
      const trans = transpose(m1);
      const inv = m1.length === 2 ? inverse2x2(m1) : m1.length === 3 ? inverse3x3(m1) : null;
      const steps = [`A = ${matrixToLatex(m1)}`, `A^T = ${matrixToLatex(trans)}`];
      if (det !== null) {
        steps.push(`\\det(A) = ${Number(det.toFixed(4))}`);
      }
      if (inv) {
        steps.push(`A^{-1} = ${matrixToLatex(inv)}`);
      } else if (det !== null && Math.abs(det) < 1e-10) {
        steps.push(`\\det(A) = 0 \\implies \\text{المصفوفة غير قابلة للعكس (شاذة)}`);
      }
      return {
        handled: true,
        summary: 'تحليل المصفوفة (المحدد، المنقول، والمعكوس)',
        latexSteps: steps,
        finalAnswer: det !== null ? `\\det(A) = ${Number(det.toFixed(4))}` : matrixToLatex(trans),
      };
    }
  }

  // Check simple quadratic equation: e.g. 2x^2 - 5x + 2 = 0 or x^2 - 5x + 6 = 0
  const normalized = trimmed.replace(/\s+/g, '').replace(/−/g, '-');
  const quadMatch = normalized.match(
    /^([+-]?\d*(?:\.\d+)?)x\^2([+-]\d*(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)=0$/i
  );
  if (quadMatch) {
    const parseCoeff = (s: string) => {
      if (s === '' || s === '+') return 1;
      if (s === '-') return -1;
      return Number(s);
    };
    const a = parseCoeff(quadMatch[1]);
    const b = parseCoeff(quadMatch[2]);
    const c = Number(quadMatch[3]);
    if ([a, b, c].every(Number.isFinite)) {
      return solveQuadratic(a, b, c);
    }
  }

  // Check simple linear equation: e.g. 2x + 4 = 10 or 3x - 5 = 7
  const linMatch = normalized.match(
    /^([+-]?\d*(?:\.\d+)?)x([+-]\d+(?:\.\d+)?)?=([+-]?\d+(?:\.\d+)?)$/i
  );
  if (linMatch) {
    const parseCoeff = (s: string) => {
      if (s === '' || s === '+') return 1;
      if (s === '-') return -1;
      return Number(s);
    };
    const a = parseCoeff(linMatch[1]);
    const b = linMatch[2] ? Number(linMatch[2]) : 0;
    const rhs = Number(linMatch[3]);
    if ([a, b, rhs].every(Number.isFinite) && Math.abs(a) > 1e-12) {
      const x = (rhs - b) / a;
      const bText = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return {
        handled: true,
        summary: 'حل معادلة من الدرجة الأولى بمجهول واحد',
        latexSteps: [
          `${a}x ${b !== 0 ? bText : ''} = ${rhs}`,
          `${a}x = ${rhs - b}`,
          `x = \\frac{${rhs - b}}{${a}} = ${Number(x.toFixed(4))}`,
        ],
        finalAnswer: `x = ${Number(x.toFixed(4))}`,
      };
    }
  }

  return null;
}
