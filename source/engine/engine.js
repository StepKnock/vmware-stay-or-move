export class RefusedError extends Error {}
const LIMIT_FILE = 50 * 1024 * 1024, LIMIT_UNZIP = 300 * 1024 * 1024, LIMIT_ROWS = 200000;
const NAMES = ['vInfo', 'vHost', 'vSnapshot', 'vDatastore'];
const decoder = new TextDecoder('utf-8', {fatal:true});
const fail = message => { throw new RefusedError(message); };
const entity = s => s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, x) => {
  if (x[0] === '#') return String.fromCodePoint(x[1].toLowerCase() === 'x' ? parseInt(x.slice(2), 16) : parseInt(x.slice(1), 10));
  return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[x];
});
function attr(s, name) {
  const m = s.match(new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(["\'])(.*?)\\1'));
  return m ? entity(m[2]) : '';
}
// Scan each XML part forward and validate tag nesting before extracting values.
function xmlNodes(s, tabName) {
  const stack=[], nodes=[]; let p=0, rowCount=0;
  while ((p=s.indexOf('<',p)) !== -1) {
    if (s.startsWith('<!--',p)) { const e=s.indexOf('-->',p+4); if(e<0) fail('workbook XML is broken'); p=e+3; continue; }
    if (s.startsWith('<![CDATA[',p)) { const e=s.indexOf(']]>',p+9); if(e<0) fail('workbook XML is broken'); p=e+3; continue; }
    if (s.startsWith('<?',p)) { const e=s.indexOf('?>',p+2); if(e<0) fail('workbook XML is broken'); p=e+2; continue; }
    let e=p+1, quote=''; for(;e<s.length;e++){const c=s[e]; if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='>')break;}
    if(e===s.length) fail('workbook XML is broken');
    const raw=s.slice(p+1,e), closing=raw.startsWith('/'), self=/\/\s*$/.test(raw), m=raw.match(/^\/?([\w:.-]+)(?=\s|\/|$)/);
    if(!m) fail('workbook XML is broken');
    if(closing){const node=stack.pop(); if(!node || node.full!==m[1] || !/^\/[^\s>]+\s*$/.test(raw)) fail('workbook XML is broken'); node.end=p; node.after=e+1;}
    else {const name=m[1].split(':').pop(); if(tabName && name==='row' && ++rowCount>LIMIT_ROWS+1) fail('more than 200,000 rows in '+tabName); if(stack.length>=32 || (['c','si','row','t','v','is'].includes(name) && stack.some(n=>n.name===name))) fail('workbook XML is broken'); const node={full:m[1],name:m[1].split(':').pop(),attrs:raw.slice(m[1].length).replace(/\/\s*$/,''),start:e+1,end:e+1,after:e+1,depth:stack.length};nodes.push(node);if(!self)stack.push(node);}
    p=e+1;
  }
  if(stack.length) fail('workbook XML is broken');
  return nodes;
}
function texts(s) { return xmlNodes(s).filter(n=>n.name==='t').map(n=>{let text=s.slice(n.start,n.end), out='', p=0, i;while((i=text.indexOf('<![CDATA[',p))!==-1){const e=text.indexOf(']]>',i+9);if(e<0)fail('workbook XML is broken');out+=entity(text.slice(p,i))+text.slice(i+9,e);p=e+3;}return out+entity(text.slice(p));}).join(''); }
function timeCheck(start) { if (Date.now() - start > 10000) fail('read time exceeds 10 seconds'); }
function zipDirectory(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length > LIMIT_FILE) fail('file over 50 MB');
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let e = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (d.getUint32(i, true) === 0x06054b50 && i + 22 + d.getUint16(i + 20, true) === bytes.length) { e = i; break; }
  if (e < 0) fail('not a workbook');
  const count = d.getUint16(e + 10, true), offset = d.getUint32(e + 16, true), length = d.getUint32(e + 12, true);
  if (d.getUint16(e + 4, true) || d.getUint16(e + 6, true) || count === 65535 || offset + length > e) fail('unsupported zip directory');
  let p = offset, total = 0; const files = new Map(), offsets = new Set();
  for (let i = 0; i < count; i++) {
    if (p + 46 > e || d.getUint32(p, true) !== 0x02014b50) fail('invalid zip directory');
    const flags = d.getUint16(p+8,true), method = d.getUint16(p+10,true), packed = d.getUint32(p+20,true), size = d.getUint32(p+24,true), nl = d.getUint16(p+28,true), extra = d.getUint16(p+30,true), comment = d.getUint16(p+32,true), local = d.getUint32(p+42,true);
    if (p + 46 + nl + extra + comment > e || flags & 1 || ![0,8].includes(method) || size === 0xffffffff || packed === 0xffffffff) fail('unsupported zip member');
    if (offsets.has(local)) fail('two zip entries share the same stored data'); offsets.add(local);
    total += size; if (total > LIMIT_UNZIP) fail('unzipped size over 300 MB');
    const name = decoder.decode(bytes.subarray(p+46,p+46+nl));
    if (files.has(name)) fail('duplicate zip member');
    files.set(name, {method, packed, size, local}); p += 46 + nl + extra + comment;
  }
  if (p !== offset + length) fail('invalid zip directory');
  return {files, d};
}
async function inflate(bytes, directory, info, start) {
  const {d} = directory, p = info.local;
  if (p + 30 > bytes.length || d.getUint32(p,true) !== 0x04034b50) fail('invalid zip member');
  const begin = p + 30 + d.getUint16(p+26,true) + d.getUint16(p+28,true), end = begin + info.packed;
  if (end > bytes.length) fail('truncated zip member');
  let chunks = [], n = 0;
  if (info.method === 0) { chunks = [bytes.subarray(begin,end)]; n = info.packed; }
  else {
    const reader = new Blob([bytes.subarray(begin,end)]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    try { while (true) { timeCheck(start); const part = await reader.read(); if (part.done) break; n += part.value.length; if (n > info.size || n > LIMIT_UNZIP) { await reader.cancel(); fail('zip size mismatch'); } chunks.push(part.value); } }
    catch (e) { if (e instanceof RefusedError) throw e; fail('invalid compressed member'); }
  }
  if (n !== info.size) fail('zip size mismatch');
  const data = new Uint8Array(n); let at = 0; for (const chunk of chunks) { data.set(chunk, at); at += chunk.length; }
  return data;
}
export async function readWorkbook(bytes) {
  const start = Date.now();
  try {
    const zip = zipDirectory(bytes), contents = new Map();
    for (const [name, info] of zip.files) {
      timeCheck(start); const data = await inflate(bytes, zip, info, start);
      if (data.length>=2 && ((data[0]===0xfe && data[1]===0xff)||(data[0]===0xff && data[1]===0xfe))) fail('workbook part is not UTF-8');
      let s; try { s=decoder.decode(data); } catch { fail('workbook part is not UTF-8'); }
      if (/<!doctype/i.test(s)) fail('workbook contains a DOCTYPE');
      if ((name.endsWith('.xml') || name.endsWith('.rels')) && !/^xl\/worksheets\//.test(name)) xmlNodes(s);
      if (name === 'xl/workbook.xml' || name === 'xl/_rels/workbook.xml.rels' || name === 'xl/sharedStrings.xml' || /^xl\/worksheets\//.test(name)) contents.set(name,s);
    }
    const wb = contents.get('xl/workbook.xml'), rel = contents.get('xl/_rels/workbook.xml.rels');
    if (!wb || !rel) fail('not a workbook');
    const wbNodes=xmlNodes(wb), relNodes=xmlNodes(rel); if(!wbNodes.some(n=>n.name==='workbook')) fail('not a workbook');
    const shared = [], strings = contents.get('xl/sharedStrings.xml') || '';
    for (const n of xmlNodes(strings)) if(n.name==='si') { if((shared.length & 1023)===0) timeCheck(start); shared.push(texts(strings.slice(n.start,n.end))); }
    const relationships = new Map();
    for (const m of relNodes.filter(n=>n.name==='Relationship')) {
      const id = attr(m.attrs,'Id'), target = attr(m.attrs,'Target').replace(/^\/+/, '').replace(/^xl\//,'');
      if (id && target && !target.split('/').includes('..')) relationships.set(id,'xl/'+target);
    }
    const sheetNames=new Map(wbNodes.filter(n=>n.name==='sheet').map(sh=>[relationships.get(attr(sh.attrs,'r:id')),attr(sh.attrs,'name')]));for(const [path,xml] of contents) if(/^xl\/worksheets\//.test(path)) xmlNodes(xml,NAMES.includes(sheetNames.get(path))?sheetNames.get(path):null);
    const tabs = Object.create(null), pr = wbNodes.find(n=>n.name==='workbookPr');
    tabs._date1904 = !!pr && ['1','true'].includes(attr(pr.attrs, 'date1904'));
    for (const sh of wbNodes.filter(n=>n.name==='sheet')) {
      const name = attr(sh.attrs,'name'); if (!NAMES.includes(name)) continue;
      const xml = contents.get(relationships.get(attr(sh.attrs,'r:id'))); if (!xml) fail('missing sheet');
      const rows = [];
      const nodes=xmlNodes(xml); let row=null, vals=null, cells=0;
      for (const node of nodes) {
        if(node.name==='row') {
          if(row) rows.push(Array.from(vals,x=>x ?? ''));
          if(rows.length > LIMIT_ROWS) fail('more than 200,000 rows in '+name);
          if((rows.length & 1023)===0) timeCheck(start);
          row=node; vals=[];
        } else if(node.name==='c' && row && node.start<row.end) {
          if((cells++ & 1023)===0) timeCheck(start); const ref=attr(node.attrs,'r').match(/^[A-Z]+/); if(!ref) fail('invalid cell reference');
          let col=0; for(const ch of ref[0]) col=col*26+ch.charCodeAt(0)-64;
          if(col>16384) fail('invalid cell reference');
          const type=attr(node.attrs,'t'), body=xml.slice(node.start,node.end), parts=xmlNodes(body), v=parts.find(n=>n.name==='v');
          let value=v?entity(body.slice(v.start,v.end)):'';
          if(type==='s'){const idx=Number(value); if(!Number.isInteger(idx)||idx<0||idx>=shared.length) fail('invalid shared string'); value=shared[idx];}
          else if(type==='inlineStr') value=texts(body);
          vals[col-1]=value;
        }
      }
      if(row) rows.push(Array.from(vals,x=>x ?? ''));
      if(rows.length>LIMIT_ROWS+1) fail('more than 200,000 rows in '+name);
      tabs[name] = keepColumns(name, rows);
    }
    if (!tabs.vInfo) fail('wrong file: no vInfo tab');
    return tabs;
  } catch (e) { if (e instanceof RefusedError) throw e; fail('invalid workbook'); }
}
function csv(text, sep) {
  const rows = []; let row = [], value = '', quoted = false;
  for (let i=0; i<text.length; i++) {
    const ch=text[i];
    if (quoted) { if (ch === '"' && text[i+1] === '"') { value+='"'; i++; } else if (ch === '"') quoted=false; else value+=ch; }
    else if (ch === '"' && value === '') quoted=true;
    else if (ch === sep) { row.push(value); value=''; }
    else if (ch === '\r' || ch === '\n') { row.push(value); rows.push(row); row=[]; value=''; if (ch === '\r' && text[i+1] === '\n') i++; if (rows.length > LIMIT_ROWS + 1) fail('more than 200,000 rows'); }
    else value+=ch;
  }
  if (quoted) fail('invalid CSV');
  if (value || row.length) { row.push(value); rows.push(row); }
  if (rows.length > LIMIT_ROWS + 1) fail('more than 200,000 rows');
  return rows;
}
export function readCsvFiles(files) {
  const start=Date.now(), tabs=Object.create(null); let bytes=0;
  for (const file of files) {
    bytes += new TextEncoder().encode(file.text).length; if (bytes > LIMIT_FILE) fail('file over 50 MB');
    const name=NAMES.find(n => file.name === `RVTools_tab${n}.csv`); if (!name) continue;
    const text=file.text.replace(/^\uFEFF/,''), header=text.split(/\r?\n/,1)[0], sep=(header.match(/;/g)||[]).length > (header.match(/,/g)||[]).length ? ';' : ',';
    tabs[name]=keepColumns(name,csv(text,sep)); timeCheck(start);
  }
  if (!tabs.vInfo) fail('wrong file: no vInfo tab'); return tabs;
}
const allowed = {
 vInfo:['VM','Powerstate','Template','CPUs','Memory','Provisioned MiB','Provisioned MB','In Use MiB','In Use MB','Cluster','OS according to the configuration file','OS'],
 vHost:['Host','Cluster','# CPU','Cores per CPU','# Cores','# Memory'],
 vSnapshot:['VM','Date / time','Size MiB (total)','Size MB (total)'],
 vDatastore:['Name','Capacity MiB','Capacity MB','In Use MiB','In Use MB']
};
function keepColumns(name,rows){const allowedNames=new Set(allowed[name].map(x=>x.toLowerCase()));const seen=new Set(), indexes=[];for(const [i,v] of (rows[0]||[]).entries()){const key=String(v).trim().toLowerCase();if(allowedNames.has(key)&&!seen.has(key)){seen.add(key);indexes.push(i);}}return rows.map(row=>indexes.map(i=>row[i]??''));}
const aliases = {
 vInfo:{vm:['VM'],power:['Powerstate'],template:['Template'],cpus:['CPUs'],memory:['Memory'],prov:['Provisioned MiB','Provisioned MB'],used:['In Use MiB','In Use MB']},
 vHost:{sockets:['# CPU'],cps:['Cores per CPU'],cores:['# Cores'],memory:['# Memory']},
 vSnapshot:{vm:['VM'],when:['Date / time'],size:['Size MiB (total)','Size MB (total)']},
 vDatastore:{cap:['Capacity MiB','Capacity MB'],used:['In Use MiB','In Use MB']}
};
function records(name, rows, start) {
 const head=(rows[0] || []).map(x=>String(x).trim().toLowerCase()), fields=[];
 for (const [key,names] of Object.entries(aliases[name])) { for (const n of names) { const i=head.indexOf(n.toLowerCase()); if(i>=0){ fields.push([key,i]); break; } } }
 const out=[]; for(let i=1;i<rows.length;i++){ if((i&1023)===0)timeCheck(start); const r=rows[i]; if(!r.some(x=>String(x).trim())) continue; const o={row:i+1}; for(const [key,j] of fields) o[key]=r[j] ?? ''; out.push(o); } return out;
}
// Decimal inputs are represented as exact rational numbers until the final rounding.
const zero=()=>[0n,1n];
function add(a,b){const d=a[1]>b[1]?a[1]:b[1];return [a[0]*(d/a[1])+b[0]*(d/b[1]),d];}
function mul(a,b){return [a[0]*b[0],a[1]*b[1]];}
function sum(items,fn,start){return items.reduce((a,x,i)=>{if((i&1023)===0)timeCheck(start);return add(a,fn(x));},zero());}
function numeric(value,gaps,label){
 const s=String(value ?? '').replace(/[, ]/g,''); const m=s.match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/);
 if(!m || (m[2] || '').length>30 || (m[3] ?? m[4] ?? '').length>30 || !Number.isFinite(Number(s)) || Math.abs(Number(s))>=1e30 || Math.abs(Number(m[5] || 0))>100){gaps.push(label);return zero();}
 const frac=m[3] ?? m[4] ?? '', digits=(m[2] || '0')+frac, exp=Number(m[5]||0)-frac.length;
 let n=BigInt(digits)*(m[1]==='-'?-1n:1n); return exp>=0?[n*10n**BigInt(exp),1n]:[n,10n**BigInt(-exp)];
}
function rounded(a, divisor, places){let n=a[0]*10n**BigInt(places), d=a[1]*BigInt(divisor), sign=n<0n?-1n:1n; n*=sign; return Number(sign*((n*2n+d)/(2n*d)))/10**places;}
function number(a){return Number(a[0])/Number(a[1]);}
function parseDate(s, date1904){
 s=String(s).trim(); if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) {const base=date1904?new Date(1904,0,1):new Date(1899,11,30); return new Date(base.getTime()+Number(s)*86400000);}
 let m=s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2}):(\d{2})$/), y,mo,d,h,mi,se;
 if(m) [,y,mo,d,h,mi,se]=m; else {m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/i); if(!m)return null; [,mo,d,y,h,mi,se]=m; h=Number(h)%12+(m[7].toUpperCase()==='PM'?12:0);}
 const date=new Date(+y,+mo-1,+d,+h,+mi,+se); return date.getFullYear()===+y && date.getMonth()===+mo-1 && date.getDate()===+d && date.getHours()===+h && date.getMinutes()===+mi && date.getSeconds()===+se ? date : null;
}
export function analyse(tabs,{asOf,snapshotDays}) {
 const start=Date.now(); for(const name of NAMES){if(tabs[name]?.length>LIMIT_ROWS+1) fail('more than 200,000 rows in '+name);} timeCheck(start);
 if (!tabs.vInfo) fail('wrong file: no vInfo tab');
 const total=(items,fn)=>sum(items,fn,start);
 const gaps=[], missing_tabs=NAMES.slice(1).filter(n=>!tabs[n]), vms=records('vInfo',tabs.vInfo,start);
 vms.forEach((v,i)=>{if((i&1023)===0)timeCheck(start);v.masked=`VM-${String(i+1).padStart(3,'0')}`; v.isTemplate=String(v.template||'').trim().toLowerCase()==='true'; v.power=String(v.power||'').trim(); for(const f of ['cpus','memory','prov','used'])v[f]=numeric(v[f],gaps,`vInfo row ${i+2} ${f}`);});
 const real=vms.filter(v=>!v.isTemplate), on=real.filter(v=>v.power==='poweredOn'), off=real.filter(v=>v.power==='poweredOff');
 const have={vms_total:real.length,vms_on:on.length,vms_off:off.length,vms_suspended:real.filter(v=>v.power==='suspended').length,templates:vms.length-real.length,vcpus_on:Math.trunc(number(total(on,v=>v.cpus))),memory_gib_on:rounded(total(on,v=>v.memory),1024,1),provisioned_tib:rounded(total(real,v=>v.prov),1048576,2),in_use_tib:rounded(total(real,v=>v.used),1048576,2)};
 if(tabs.vHost){const hosts=records('vHost',tabs.vHost,start); hosts.forEach((h,i)=>{if((i&1023)===0)timeCheck(start);const s=String(h.sockets||'').replace(/,/g,'').trim(),c=String(h.cps||'').replace(/,/g,'').trim(),t=String(h.cores||'').replace(/,/g,'').trim(); if(s&&c){h.s=numeric(s,gaps,'');h.core=mul(h.s,numeric(c,gaps,''));}else if(s&&t){h.s=numeric(s,gaps,'');h.core=h.s[0]===0n?zero():numeric(t,gaps,'');gaps.push(`vHost row ${i+2} cores per cpu taken from # Cores`);}else if(t){h.s=[1n,1n];h.core=numeric(t,gaps,'');gaps.push(`vHost row ${i+2} sockets missing; counted as 1 socket of # Cores`);}else{h.s=zero();h.core=zero();gaps.push(`vHost row ${i+2} cores`);}h.mem=numeric(h.memory,gaps,`vHost row ${i+2} memory`);}); const cores=total(hosts,h=>h.core); Object.assign(have,{hosts:hosts.length,sockets:Math.trunc(number(total(hosts,h=>h.s))),cores:Math.trunc(number(cores)),host_memory_gib:rounded(total(hosts,h=>h.mem),1024,1),vcpu_per_core:cores[0]===0n?null:rounded([BigInt(have.vcpus_on)*cores[1],cores[0]],1,2)});}
 if(tabs.vDatastore){const ds=records('vDatastore',tabs.vDatastore,start);have.datastore_capacity_tib=rounded(total(ds,d=>numeric(d.cap,gaps,'vDatastore cap')),1048576,2);have.datastore_in_use_tib=rounded(total(ds,d=>numeric(d.used,gaps,'vDatastore used')),1048576,2);}
 const item=v=>({row:v.row,vm:v.masked}), findings={powered_off:{rows:off.map(item),count:off.length,off_provisioned_tib:rounded(total(off,v=>v.prov),1048576,2)}};
 if(tabs.vSnapshot){const snapshots=records('vSnapshot',tabs.vSnapshot,start), masks=new Map(), old=[]; let size=zero(); for(const v of vms)if(!masks.has(String(v.vm||'')))masks.set(String(v.vm||''),v.masked); snapshots.forEach((s,i)=>{if((i&1023)===0)timeCheck(start);const date=parseDate(s.when||'',tabs._date1904);if(!date){gaps.push(`vSnapshot row ${i+2} date`);return;} if(asOf-date>snapshotDays*86400000){old.push({row:s.row,vm:masks.get(String(s.vm||''))||'unknown VM'});size=add(size,numeric(s.size,gaps,`vSnapshot row ${i+2} size`));}});findings.old_snapshots={rows:old,count:old.length,size_gib:rounded(size,1024,1)};}
 findings.biggest=real.map((v,i)=>({v,i})).sort((a,b)=>number(b.v.cpus)-number(a.v.cpus)||number(b.v.memory)-number(a.v.memory)||a.i-b.i).slice(0,10).map(x=>item(x.v));
 timeCheck(start); return {have,findings,missing_tabs,gaps};
}
