import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
const root = process.cwd();
const dist = resolve(root, 'dist');
const norm = (p) => resolve(dist, p.replace(/^[/.]+/, ''));
const check = (p) => { if (!p.startsWith(dist + '/')) throw new Error('Asset outside dist: ' + p); return p; };
const buffer = (p) => readFile(check(norm(p)));
const mime = (p) => ({ '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }[extname(p)] || 'application/octet-stream');
let html = await readFile(resolve(dist,'index.html'),'utf8');
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]) {
  const href = match[0].match(/href="([^"]+)"/)?.[1];
  if (!href) throw new Error('Stylesheet href missing');
  let css = (await buffer(href)).toString('utf8');
  for (const item of [...css.matchAll(/url\((["']?)([^)'"\n]+)\1\)/g)]) {
    const url = item[2];
    if (/^(data:|https?:|#)/.test(url)) continue;
    const p = url.startsWith('/') ? norm(url) : check(resolve(dist,dirname(href.replace(/^\//,'')),url));
    check(p);
    const bytes = await readFile(p);
    css = css.replace(item[0], `url("data:${mime(p)};base64,${bytes.toString('base64')}")`);
  }
  html = html.replace(match[0], `<style>${css}</style>`);
}
for (const match of [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]) {
  const path = match[1]; if (/^(data:|https?:)/.test(path)) continue;
  const bytes = await buffer(path);
  const dataUri = `data:${mime(path)};base64,${bytes.toString('base64')}`;
  html = html.replace(match[0], match[0].replace(`src="${path}"`, `src="${dataUri}"`));
}
for (const match of [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)]) {
  const js = (await buffer(match[1])).toString('utf8');
  if (/import\s*\(/.test(js)) throw new Error('Dynamic chunks not supported');
  html = html.replace(match[0], '<script type="module">' + js.replace(/<\/script/gi,'<\\/script') + '</script>');
}
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
const notice = 'GSAP 3.15.1 — Copyright (c) 2008–2026, GreenSock. All rights reserved.\nLicense: https://gsap.com/standard-license';
html = html.replace('</head>', `<script type="text/plain" id="third-party-notices">${notice.replace(/<\/script/gi,'<\\/script')}</script></head>`);
const out=resolve(root,'delivery','FingerPro_Mashcore_R2.html');
await mkdir(dirname(out),{recursive:true});
await writeFile(out,html);
console.log('Standalone: ',out,((await stat(out)).size/1024).toFixed(0)+' KB');
