import fs from 'fs';
const log = s => fs.appendFileSync('dbg_progress.txt', s + '\n');
fs.writeFileSync('dbg_progress.txt', '');
log('start read');
const html = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('style.css','utf8');
const js = fs.readFileSync('script.js','utf8');
log('read ok');
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
const rulesRe = /([^{}]+)\{([^{}]*)\}/g;
let mm; let n=0;
const cssClasses=new Set(), cssIds=new Set(), cssTags=new Set();
const cssVarsDefined=new Set(), cssVarsUsed=new Set();
const fontFaces=new Set();
log('start rules');
while ((mm = rulesRe.exec(cssNoComments))) {
  const sel = mm[1].trim(), body = mm[2];
  n++;
  if(/@font-face/.test(sel)){
    const fam = body.match(/font-family\s*:\s*['"]?([^'"};]+?)['"]?\s*;/);
    if(fam) fontFaces.add(fam[1].trim());
    continue;
  }
  log('rule '+n);
  let v;
  while ((v = /(--[a-zA-Z0-9-]+)\s*:/g.exec(body))) cssVarsDefined.add(v[1]);
  while ((v = /var\(\s*(--[a-zA-Z0-9-]+)/g.exec(body))) cssVarsUsed.add(v[1]);
}
log('rules done '+n);
const jsClassState=new Set();
const clRe=/classList\.(?:add|toggle|remove|contains)\(\s*["']([^"']+)["']/g;
while((mm=clRe.exec(js))) jsClassState.add(mm[1]);
log('jsClassState '+jsClassState.size);
fs.writeFileSync('rpt_test.txt', [...cssVarsDefined].sort().join('\n'));
log('wrote');
