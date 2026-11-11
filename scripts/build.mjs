import { readFile,writeFile,mkdir,copyFile,cp,stat } from 'node:fs/promises';
import { resolve,dirname,extname,relative,isAbsolute,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../', import.meta.url)));
const insideProject=(p)=>{const r=relative(root,p);return r!=='' && r!=='..' && !r.startsWith('..'+sep) && !isAbsolute(r);};
const norm=(p)=>{
  const src=p.startsWith('/vendor/')||p.startsWith('/media/')||p.startsWith('/fonts/')?resolve(root,'public',p.slice(1)):resolve(root,p.replace(/^\//,''));
  if(!insideProject(src))throw Error('Invalid local asset '+p);
  return src;
};
const mime=(p)=>({'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'}[extname(p)]||'application/octet-stream');
let html=await readFile(resolve(root,'index.html'),'utf8');
for(const m of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)]){
  const href=m[0].match(/href="([^"]+)"/)?.[1];if(!href)continue;
  let css=await readFile(norm(href),'utf8');
  for(const f of [...css.matchAll(/url\((["']?)([^)'"\n]+)\1\)/g)]){
    const url=f[2];if(url.startsWith('data:')||url.startsWith('https:'))continue;
    const bytes=await readFile(norm(url));
    css=css.replace(f[0],`url("data:${mime(url)};base64,${bytes.toString('base64')}")`);
  }
  html=html.replace(m[0],`<style>${css}</style>`);
}
for(const m of [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)]){
  const url=m[1]; if(url.startsWith('data:')||url.startsWith('https:'))continue;
  const bytes=await readFile(norm(url));
  html=html.replace(m[0],m[0].replace(`src="${url}"`,`src="data:${mime(url)};base64,${bytes.toString('base64')}"`));
}
for(const m of [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)]){
  const src=m[1];const script=await readFile(norm(src),'utf8');
  html=html.replace(m[0],`<script>${script.replace(/<\/script/gi,'<\\/script')}</script>`);
}
const notices='GSAP 3.15.1 — Copyright (c) 2008–2026, GreenSock. Standard license: https://gsap.com/standard-license';
html=html.replace('</head>',`<script type="text/plain" id="third-party-notices">${notices.replace(/<\/script/gi,'<\\/script')}</script></head>`);
await mkdir(resolve(root,'delivery'),{recursive:true});
await writeFile(resolve(root,'delivery/FingerPro_Mashcore_R2.html'),html);
await mkdir(resolve(root,'dist'),{recursive:true});
await copyFile(resolve(root,'index.html'),resolve(root,'dist/index.html'));
await cp(resolve(root,'src'),resolve(root,'dist/src'),{recursive:true});
await cp(resolve(root,'public'),resolve(root,'dist/public'),{recursive:true});
// 웹 배포 시 /vendor,/media,/fonts 루트 경로를 그대로 사용할 수 있도록 배치
for(const folder of ['vendor','media'])await cp(resolve(root,'public',folder),resolve(root,'dist',folder),{recursive:true});
console.log('Built offline standalone + static dist:',((await stat(resolve(root,'delivery/FingerPro_Mashcore_R2.html'))).size/1024).toFixed(0)+'KB');
