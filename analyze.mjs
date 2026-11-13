import fs from 'fs';

const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('style.css','utf8');
const js = fs.readFileSync('script.js','utf8');

// ---------- HTML extraction ----------
const classes = new Set(), ids = new Set(), tags = new Set(), dataAttrs = new Set(), inlineVars = new Set();
let m;
const clsRe = /\bclass\s*=\s*["']([^"']*)["']/g;
while ((m = clsRe.exec(html))) m[1].split(/\s+/).forEach(c => { if (c) classes.add(c); });
const idRe = /\bid\s*=\s*["']([^"']*)["']/g;
while ((m = idRe.exec(html))) ids.add(m[1]);
const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)/g;
while ((m = tagRe.exec(html))) tags.add(m[1]);
const dataRe = /\b(data-[a-z0-9-]+)\s*=\s*["']([^"']*)["']/g;
while ((m = dataRe.exec(html))) { dataAttrs.add(m[1]); dataAttrs.add(m[1] + '=' + m[2]); }
const varRe = /--[a-zA-Z0-9-]+/g;
while ((m = varRe.exec(html))) inlineVars.add(m[0]);

// ---------- Proper CSS rule parse (brace-depth) ----------
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
function parseCss(src) {
  const rules = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    // skip until next '{'
    while (i < n && src[i] !== '{') i++;
    if (i >= n) break;
    // find start of selector: back to after previous '}' or start
    // collect selector text (chars before '{' since last boundary)
    let selStart = i;
    // simple: walk back to previous '}' or ';' boundary (crude but ok for top-level + media)
    // Better: track via stack. We'll do a stack-based scan.
    break;
  }
  // stack-based
  let stack = 0;
  let selStart = -1;
  let sel = '';
  let body = '';
  let inSel = false;
  const out = [];
  let j = 0;
  while (j < n) {
    const ch = src[j];
    if (ch === '{') {
      if (stack === 0) { sel = src.slice(selStart, j).trim(); body = ''; inSel = false; }
      stack++;
    } else if (ch === '}') {
      stack--;
      if (stack === 0) {
        out.push({ sel, body });
        selStart = j + 1;
        sel = ''; body = '';
      }
    } else {
      if (stack === 0) {
        if (selStart < 0) selStart = j;
        // track selStart when we cross a '}' boundary -> set at j+1 above
      } else {
        body += ch;
      }
    }
    j++;
  }
  return out;
}
const rules = parseCss(cssNoComments);

const cssClasses = new Set(), cssIds = new Set(), cssTags = new Set();
const cssVarsDefined = new Set(), cssVarsUsed = new Set();
const fontFaces = new Set();
for (const r of rules) {
  const sel = r.sel, body = r.body;
  if (/@font-face/.test(sel)) {
    const fam = body.match(/font-family\s*:\s*['"]?([^'"};]+?)['"]?\s*;/);
    if (fam) fontFaces.add(fam[1].trim());
    continue;
  }
  let v;
  while ((v = /(--[a-zA-Z0-9-]+)\s*:/g.exec(body))) cssVarsDefined.add(v[1]);
  while ((v = /var\(\s*(--[a-zA-Z0-9-]+)/g.exec(body))) cssVarsUsed.add(v[1]);
  const attrIds = sel.match(/#[a-zA-Z0-9_-]+/g) || [];
  attrIds.forEach(a => cssIds.add(a.slice(1)));
  const attrClasses = sel.match(/\.[a-zA-Z0-9_-]+/g) || [];
  attrClasses.forEach(a => cssClasses.add(a.slice(1)));
  const elementNames = sel.match(/(^|[\s>+~,(])([a-zA-Z][a-zA-Z0-9]*)(?=\s*[.#:\[\s>+~,]|$)/g) || [];
  elementNames.forEach(e => {
    let t = e.trim().replace(/^[,+\s>~]/,'');
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(t)) cssTags.add(t);
  });
}

// JS-added classes via classList
const jsClassState = new Set();
const clRe = /classList\.(?:add|toggle|remove|contains)\(\s*["']([^"']+)["']/g;
while ((m = clRe.exec(js))) jsClassState.add(m[1]);

const unusedCssClasses = [...cssClasses].filter(c => !classes.has(c) && !jsClassState.has(c));
const unusedCssIds = [...cssIds].filter(id => !ids.has(id));
const unusedTags = [...cssTags].filter(t => !tags.has(t));
const unusedVars = [...cssVarsDefined].filter(v => !cssVarsUsed.has(v));

fs.writeFileSync('rpt_classes_html.txt', [...classes].sort().join('\n'));
fs.writeFileSync('rpt_ids_html.txt', [...ids].sort().join('\n'));
fs.writeFileSync('rpt_classes_css.txt', [...cssClasses].sort().join('\n'));
fs.writeFileSync('rpt_ids_css.txt', [...cssIds].sort().join('\n'));
fs.writeFileSync('rpt_tags_css.txt', [...cssTags].sort().join('\n'));
fs.writeFileSync('rpt_js_classstate.txt', [...jsClassState].sort().join('\n'));
fs.writeFileSync('rpt_rules.txt', rules.map((r,idx)=>idx+': '+r.sel).join('\n'));

console.log('--- REPORT ---');
console.log('HTML classes:', classes.size, '| ids:', ids.size, '| tags:', tags.size);
console.log('CSS rules:', rules.length, '| css classes:', cssClasses.size, '| ids:', cssIds.size, '| tags:', cssTags.size);
console.log('HTML data attrs:', [...dataAttrs].sort().join(' '));
console.log('INLINE VARS in HTML:', [...inlineVars].sort().join(' '));
console.log('\nFONT FACES defined:', [...fontFaces].sort().join(' '));
console.log('\nCSS VARS defined-not-used:', unusedVars.length ? unusedVars.join(' ') : '(none)');
console.log('CSS VARS used-not-defined:', [...cssVarsUsed].filter(v => !cssVarsDefined.has(v)).join(' ') || '(none)');
console.log('\nUNUSED CSS CLASSES (not in HTML, not JS classList):', unusedCssClasses.length ? unusedCssClasses.join(' ') : '(none)');
console.log('\nUNUSED CSS IDS (not in HTML):', unusedCssIds.length ? unusedCssIds.join(' ') : '(none)');
console.log('\nCSS ELEMENT SELECTORS not in HTML (info):', unusedTags.length ? unusedTags.join(' ') : '(none)');
console.log('\nJS classList state classes:', [...jsClassState].sort().join(' '));
