import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root = new URL('../', import.meta.url);
// HTML parsers normalize line endings before checking inline CSP hashes.
const get = async path => (await readFile(new URL(path, root), 'utf8')).replace(/\r\n?/g, '\n').replace(/\uFEFF/g, '');
const [template, style, engine, cost, ui, sample] = await Promise.all([get('page/src/template.html'), get('page/src/style.css'), get('engine/engine.js'), get('engine/cost.js'), get('page/src/ui.js'), readFile(new URL('sample/clean.xlsx', root))]);
const strip = s => s.replace(/\bexport\s+(?=(?:async\s+)?(?:function|class|const)\b)/g, '');
const worker = `${strip(engine)}\nself.onmessage=async ({data})=>{try{let tabs=data.tabs;if(data.files){const files=data.files;if(files.length===1 && /\\.xlsx$/i.test(files[0].name)) tabs=await readWorkbook(new Uint8Array(await files[0].arrayBuffer()));else if(files.every(f=>/\\.csv$/i.test(f.name))){if(files.reduce((n,f)=>n+f.size,0)>50*1024*1024) fail('file over 50 MB');tabs=readCsvFiles(await Promise.all(files.map(async f=>({name:f.name,text:await f.text()}))));}else fail('Choose one workbook or RVTools CSV files.');}const result=analyse(tabs,{asOf:new Date(data.asOf+'T00:00:00'),snapshotDays:Number(data.days)});self.postMessage({tabs,result});}catch(e){self.postMessage({error:e.message});}};`;
const script = `const WORKER_SOURCE = ${JSON.stringify(worker)};\nconst costs = (() => {\n${strip(cost)}\nreturn {hostsFrom, cost};\n})();\nconst SAMPLE = '${sample.toString('base64')}';\n${ui}`;
const hash = value => createHash('sha256').update(value).digest('base64');
const csp = `default-src 'none'; script-src 'sha256-${hash(script)}'; style-src 'sha256-${hash(style)}'; img-src data:; worker-src blob:; connect-src 'none'; form-action 'none'; base-uri 'none'; trusted-types worker-policy; require-trusted-types-for 'script'`;
await mkdir(new URL('dist/', root), {recursive:true});
await writeFile(new URL('dist/vmware-stay-or-move.html', root), template.replace('__CSP__', csp).replace('__STYLE__', () => style).replace('__SCRIPT__', () => script));
console.log('Built dist/vmware-stay-or-move.html');
