const COPY = {
 // Top of every screen
 title: 'VMware: stay or move, at your own prices',
 intro: 'Drop in an RVTools export to see what you have, what sits idle, and what staying or moving costs over 3 years at prices you type in. This page reads the file on your computer and sends nothing anywhere.',

 // Empty state
 drop: 'Drop your RVTools export here',
 open: 'Open file',
 where: 'In RVTools: File, then Export all to Excel.',
 reads: 'This page reads four tabs and only these columns. vInfo: VM, power state, template, CPUs, memory, disk space, cluster, OS. vHost: host, cluster, CPUs, cores, memory. vSnapshot: VM, date, size. vDatastore: name, capacity, space in use. It never keeps IP addresses, DNS names, notes or annotations, and it hides every name until you choose to show them.',
 sample: 'Try the made-up sample',
 reading: 'Reading your file...',
 wrong: 'This does not look like an RVTools export: it has no vInfo tab.',
 fileError: 'Choose one RVTools workbook (.xlsx) or its CSV files.',
 back: 'Start over',

 // Short answer (first block of the result)
 shortTitle: 'Short answer',
 shortCost: '{option} is the lowest 3-year total at your prices, {gap} less than {next}.',
 shortNoCost: 'Add a price to every option below to see which costs least over 3 years.',
 shortWaste: '{n} powered-off VMs still hold {tib} TiB; {s} snapshots are older than {days} days.',
 shortWasteNoSnap: '{n} powered-off VMs still hold {tib} TiB.',
 singularPoweredOff: 'powered-off VM still holds',
 singularSnapshot: 'snapshot is',
 singularDay: 'day',
 singularHour: 'team hour',
 singularCore: 'licensed core',

 // Findings
 findings: 'Findings',
 asOf: 'As of',
 age: 'Snapshot age in days',
 off: 'Powered-off VMs',
 offSpace: 'Space held (TiB)',
 offMeaning: 'These VMs do no work but still take up storage you keep paying for. Check whether anyone still needs them.',
 snapshots: 'Old snapshots',
 snapshotSize: 'Snapshot size (GiB)',
 biggest: 'Biggest VMs - check these first',
 rows: 'Show rows',
 row: 'Sheet row',
 names: 'Show real names',
 gaps: 'Cells this page could not read, counted as 0',

 // Stay or move over 3 years
 compare: 'Stay or move over 3 years',
 assumed: '0 hours assumed for any hours box left blank.',
 minimum: 'Minimum cores counted per CPU',
 minimumHint: 'Broadcom counts at least 16 cores per CPU, as reported by Otava, a hosting provider, 2026; check your own contract',
 order: 'Minimum cores per order',
 orderHint: 'Reports conflict on a 72-core order minimum since April 2025; check your own contract',
 licensed: 'Licensed cores',
 noHost: 'Needs the vHost tab',
 rate: 'Hourly rate for your team ($)',
 stay: 'Stay on VMware',
 hypervisor: 'Another hypervisor',
 cloud: 'Cloud',
 perCore: 'Price per core per year ($)',
 yearly: 'Yearly price ($)',
 yearlyHours: 'Team hours per year',
 oneTime: 'One-time cost ($)',
 oneHours: 'One-time team hours',
 stayHint: 'From your Broadcom renewal or current contract',
 hyperHint: 'What the other hypervisor would cost a year for these hosts',
 cloudHint: 'What a cloud pricing calculator shows a year for the VMs you would move',
 oneTimeHint: 'Migration, training or hardware you would buy once',
 stayOneTimeHint: 'Usually 0 if nothing changes',
 add: 'add your number',
 missingYearly: 'the yearly price',
 missingOneTime: 'the one-time cost',
 missingStay: 'a price per core or a yearly price',
 missingJoin: ' and ',
 missingNone: ' (0 if none)',
 missingRow: 'add {fields}',
 missingShort: 'Add {fields} for {option}{hint} to compare.',
 compareMissing: 'Add a price to every option to compare them.',
 cheapest: 'Lowest 3-year total:',
 zeroMoveHours: 'This assumes 0 hours to move. Add yours to be sure.',
 tableOption: 'Option',
 either: 'Fill in one of these two',
 total: '3-year total',
 inputsNote: 'The person who ran this typed in every price here.',
 rowInputs: '{yearly} a year, {yearlyHours} team hours a year, {oneTime} once, {oneHours} team hours once, at {rate} an hour',
 rowInputsPerCore: '{price} per core a year for {cores} licensed cores, {yearlyHours} team hours a year, {oneTime} once, {oneHours} team hours once, at {rate} an hour',
 invalid: 'Enter a number of 0 or more.',
 both: 'Enter a per-core price or a yearly price, not both.',

 // What you have
 have: 'What you have',
 partial: 'Some tabs are missing:',
 missing: { vHost: 'no core count, so no license count', vSnapshot: 'no snapshot finding', vDatastore: 'no datastore totals' },
 haveLabels: { vms_total: 'VMs', vms_on: 'Powered-on VMs', vms_off: 'Powered-off VMs', vms_suspended: 'Suspended VMs', templates: 'Templates', vcpus_on: 'Powered-on vCPUs', memory_gib_on: 'Powered-on memory (GiB)', provisioned_tib: 'Provisioned space (TiB)', in_use_tib: 'Space in use (TiB)', hosts: 'Hosts', sockets: 'CPU sockets', cores: 'Host cores', host_memory_gib: 'Host memory (GiB)', vcpu_per_core: 'vCPUs per core', datastore_capacity_tib: 'Datastore capacity (TiB)', datastore_in_use_tib: 'Datastore space in use (TiB)' },

 // Limits, actions, footer
 proofTitle: 'What this does not prove',
 proof: "This is not licensing advice. Broadcom's prices and rules change and are not public, so use your own contract. RVTools holds no usage data, so this page cannot tell you a VM is too big, only that it is big. It does not plan a move or map which applications depend on each other.",
 print: 'Print',
 export: 'Export CSV',
 footer: "Made by StepKnock. Nothing you loaded left this page. To check: watch your browser's Network tab, or turn Wi-Fi off before you load the file. To check the file itself, compare its SHA-256 (its fingerprint) with the one on the release page. Version 1.0.0.",
 printDate: 'From an RVTools export, read on {asOf}.',
 printFooter: 'Made by StepKnock. Nothing you loaded left this page. Code and release: {repo}',
 csvFinding: 'Finding',
 csvRow: 'Sheet row',
 csvVm: 'VM',
 download: 'vmware-stay-or-move.csv'
};
const app=document.getElementById('app');
const state={tabs:null,result:null,show:false,fields:{minPerCpu:'16',minPerOrder:'',hourly:'',stay_price_per_core:'',stay_yearly_total:'',stay_yearly_hours:'',stay_one_time:'0',stay_one_time_hours:'',hypervisor_yearly_total:'',hypervisor_yearly_hours:'',hypervisor_one_time:'',hypervisor_one_time_hours:'',cloud_yearly_total:'',cloud_yearly_hours:'',cloud_one_time:'',cloud_one_time_hours:''},asOf:localDate(),days:'30'};
function localDate(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;}
function append(parent,...nodes){parent.append(...nodes);return parent;}
function button(text,fn,cls){const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;}
function shell(){app.replaceChildren();const h=el('h1',COPY.title);h.tabIndex=-1;append(app,h,el('p',COPY.intro));}
function focusHeading(h){h.tabIndex=-1;h.focus();}
function fill(text,values){return text.replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');}
function fmt(n){return typeof n==='number'?n.toLocaleString('en-US'):n;}
function singular(text,count,plural,one){return Number(count)===1?text.replace(plural,one):text;}
function money(value){return value===''||value===COPY.add?COPY.add:Number.isFinite(Number(value))?'$'+fmt(Number(value)):value;}
function end(){append(app,el('h2',COPY.proofTitle),el('p',COPY.proof),el('footer',COPY.footer));}
function empty(){state.tabs=null;state.result=null;state.show=false;for(const key of Object.keys(state.fields))state.fields[key]=key==='minPerCpu'?'16':key==='stay_one_time'?'0':'';state.asOf=localDate();state.days='30';shell();const box=el('section',undefined,'drop no-print');const input=el('input');input.type='file';input.multiple=true;input.accept='.xlsx,.csv';input.hidden=true;input.addEventListener('change',()=>load([...input.files]));box.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('over');});box.addEventListener('dragleave',()=>box.classList.remove('over'));box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('over');load([...e.dataTransfer.files]);});append(box,el('p',COPY.drop),button(COPY.open,()=>input.click()),input,el('p',COPY.where),el('p',COPY.reads),button(COPY.sample,()=>{const bytes=Uint8Array.from(atob(SAMPLE),c=>c.charCodeAt(0));load([new File([bytes],'clean.xlsx')]);},'secondary'));app.append(box);end();focusHeading(app.querySelector('h1'));}
let activeWorker=null;
const workerPolicy=globalThis.trustedTypes?.createPolicy('worker-policy',{createScriptURL:value=>value.startsWith('blob:')?value:null,createHTML:()=>{throw new TypeError('HTML refused');}});
function runWorker(data){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(new Blob([WORKER_SOURCE],{type:'text/javascript'}));let worker;try{worker=new Worker(workerPolicy?workerPolicy.createScriptURL(url):url);}catch(e){URL.revokeObjectURL(url);reject(e);return;}activeWorker=worker;const finish=()=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);if(activeWorker===worker)activeWorker=null;};const timer=setTimeout(()=>{finish();reject(Error('took longer than 10 seconds'));},10000);worker.onmessage=({data})=>{finish();data.error?reject(Error(data.error)):resolve(data);};worker.onerror=()=>{finish();reject(Error('Unable to read this file.'));};worker.postMessage(data);});}
function showError(e){shell();const message=el('p',String(e.message).includes('wrong file: no vInfo')?COPY.wrong:e.message,'error');message.setAttribute('role','alert');app.append(message);app.append(button(COPY.back,empty));end();focusHeading(app.querySelector('h1'));}
async function load(files){if(!files.length)return;state.show=false;shell();const status=el('p',COPY.reading+' '+files.map(f=>f.name).join(', '));status.setAttribute('role','status');app.append(status);end();focusHeading(app.querySelector('h1'));try{const output=await runWorker({files,asOf:state.asOf,days:state.days});state.tabs=output.tabs;state.result=output.result;showResult();}catch(e){showError(e);}}
async function recalculate(){try{const output=await runWorker({tabs:state.tabs,asOf:state.asOf,days:state.days});state.result=output.result;showResult();}catch(e){showError(e);}}
function realName(mask){if(!state.show || mask==='unknown VM')return mask;const match=/^VM-(\d+)$/.exec(mask);if(!match)return mask;const rows=state.tabs.vInfo;const idx=rows[0].findIndex(x=>String(x).trim().toLowerCase()==='vm');const records=rows.slice(1).filter(row=>row.some(value=>String(value).trim()));return idx<0?mask:String(records[Number(match[1])-1]?.[idx]??mask);}
function detailsRows(title,rows){const d=el('details'),s=el('summary',title+' ('+rows.length+')'),list=el('ul');for(const row of rows)list.append(el('li',COPY.row+' '+row.row+': '+realName(row.vm)));append(d,s,list);return d;}
function field(parent,key,label,hint) {const l=el('label',label),i=el('input');i.type='text';i.inputMode='decimal';i.autocomplete='off';i.id=key;i.value=state.fields[key];i.setAttribute('aria-describedby',key+'-hint '+key+'-err');l.append(i);const help=el('small',hint||'');help.id=key+'-hint';l.append(help);const err=el('span','','error');err.id=key+'-err';l.append(err);i.addEventListener('input',()=>{state.fields[key]=i.value;updateCosts();});parent.append(l);return i;}
function showResult(){const r=state.result;shell();const top=el('div',undefined,'row no-print');append(top,button(COPY.back,empty,'secondary'));const nameLabel=el('label',COPY.names,'names-row');const toggle=el('input');toggle.type='checkbox';toggle.checked=state.show;toggle.addEventListener('change',()=>{state.show=toggle.checked;showResult();});nameLabel.prepend(toggle);top.append(nameLabel);app.append(top);const printDate=el('p',fill(COPY.printDate,{asOf:state.asOf}),'print-only');app.append(printDate);const short=el('h2',COPY.shortTitle);app.append(short,el('p','','short-cost'),el('p','','short-waste'),el('p','','zero-move'));
 if(r.missing_tabs.length){const n=el('section',undefined,'note');n.append(el('strong',COPY.partial));const ul=el('ul');for(const tab of r.missing_tabs)ul.append(el('li',tab+': '+COPY.missing[tab]));n.append(ul);app.append(n);}
 app.append(el('h2',COPY.findings));const dates=el('div',undefined,'row no-print');for(const [key,label,type] of [['asOf',COPY.asOf,'date'],['days',COPY.age,'number']]){const l=el('label',label),i=el('input');i.type=type;i.value=state[key];if(type==='number')i.min='0';i.addEventListener('change',()=>{if(i.value && (type!=='number'||Number(i.value)>=0)){state[key]=i.value;recalculate();}});l.append(i);dates.append(l);}app.append(dates);
 const f=r.findings;app.append(el('p',COPY.off+': '+f.powered_off.count+'; '+COPY.offSpace+': '+f.powered_off.off_provisioned_tib));app.append(el('p',COPY.offMeaning,'no-print'),detailsRows(COPY.off,f.powered_off.rows));if(f.old_snapshots){app.append(el('p',COPY.snapshots+': '+f.old_snapshots.count+'; '+COPY.snapshotSize+': '+f.old_snapshots.size_gib));app.append(detailsRows(COPY.snapshots,f.old_snapshots.rows));}app.append(el('p',COPY.biggest+': '+f.biggest.length,'print-only'));app.append(detailsRows(COPY.biggest,f.biggest));if(r.gaps.length){const d=el('details');d.append(el('summary',COPY.gaps+' ('+r.gaps.length+')'));const ul=el('ul');for(const gap of r.gaps)ul.append(el('li',gap));d.append(ul);app.append(d);}
 app.append(el('h2',COPY.compare),el('p',COPY.assumed,'no-print'));const editor=el('section',undefined,'editor');field(editor,'minPerCpu',COPY.minimum,COPY.minimumHint);field(editor,'minPerOrder',COPY.order,COPY.orderHint);field(editor,'hourly',COPY.rate);const cards=el('div',undefined,'cards');for(const name of ['stay','hypervisor','cloud']){const c=el('section',undefined,'card');c.append(el('h3',COPY[name]));const priceBox=el('fieldset',undefined,'price-box');if(name==='stay'){priceBox.append(el('legend',COPY.either));field(priceBox,name+'_price_per_core',COPY.perCore,COPY.stayHint);}field(priceBox,name+'_yearly_total',COPY.yearly,name==='stay'?COPY.stayHint:name==='hypervisor'?COPY.hyperHint:COPY.cloudHint);c.append(priceBox);field(c,name+'_yearly_hours',COPY.yearlyHours);field(c,name+'_one_time',COPY.oneTime,name==='stay'?COPY.stayOneTimeHint:COPY.oneTimeHint);field(c,name+'_one_time_hours',COPY.oneHours);cards.append(c);}editor.append(cards);app.append(editor);app.append(el('p','', 'licensed'));const wrap=el('div',undefined,'table-wrap');const table=el('table');table.id='cost-table';wrap.append(table);app.append(el('p',COPY.inputsNote),wrap,el('p','','winner')); app.append(el('h2',COPY.have));const stats=el('div',undefined,'stats');for(const [key,label] of Object.entries(COPY.haveLabels)){if(!(key in r.have))continue;const item=el('div',undefined,'stat'+(['vms_total','vms_on','hosts','cores','datastore_in_use_tib'].includes(key)?' print-stat':''));append(item,el('span',label),el('strong',fmt(r.have[key]??'-')));stats.append(item);}app.append(stats);
const licensedTile=el('div',undefined,'stat print-only print-stat');append(licensedTile,el('span',COPY.licensed),el('strong','','print-licensed'));stats.append(licensedTile);const actions=el('div',undefined,'row actions no-print');append(actions,button(COPY.print,()=>window.print()),button(COPY.export,exportCsv,'secondary'));app.append(actions);end();app.append(el('p',fill(COPY.printFooter,{repo:'github.com/StepKnock/vmware-stay-or-move'}),'print-only print-footer'));updateCosts();focusHeading(short);}
function missingFields(name,values){const fields=[];if(name==='stay'?!values.stay_price_per_core&&!values.stay_yearly_total:!values[name+'_yearly_total'])fields.push(name==='stay'?COPY.missingStay:COPY.missingYearly);const oneTime=!values[name+'_one_time'];if(oneTime)fields.push(COPY.missingOneTime);return {fields:fields.join(COPY.missingJoin),hint:oneTime?COPY.missingNone:''};}
function updateCosts(){if(!state.result)return;const raw=state.fields,v=Object.fromEntries(Object.entries(raw).map(([k,x])=>[k,String(x).replace(/[,\$\s]/g,'')]));let invalid=false;for(const [key,value] of Object.entries(v)){const i=document.getElementById(key);if(!i)continue;const bad=value!==''&&(!Number.isFinite(Number(value))||Number(value)<0);document.getElementById(key+'-err').textContent=bad?COPY.invalid:'';i.setAttribute('aria-invalid',String(bad));if(bad)invalid=true;}const both=v.stay_price_per_core!==''&&v.stay_yearly_total!=='';if(both){document.getElementById('stay_yearly_total-err').textContent=COPY.both;document.getElementById('stay_yearly_total').setAttribute('aria-invalid','true');invalid=true;}const options={};for(const n of ['stay','hypervisor','cloud'])options[n]={price_per_core:v[n+'_price_per_core'],yearly_total:v[n+'_yearly_total'],yearly_hours:v[n+'_yearly_hours']||'0',one_time:v[n+'_one_time'],one_time_hours:v[n+'_one_time_hours']||'0'};const hostMissing=!state.tabs.vHost;let result=costs.cost({hosts:costs.hostsFrom(state.tabs),minPerCpu:v.minPerCpu||'0',minPerOrder:v.minPerOrder,hourly:v.hourly,options});if(hostMissing&&v.stay_price_per_core){result.three_year.stay=null;result.cheapest=null;}if(invalid){result.three_year={stay:null,hypervisor:null,cloud:null};result.cheapest=null;}state.cost=result;document.querySelector('.licensed').textContent=COPY.licensed+': '+(hostMissing?COPY.noHost:fmt(result.licensed_cores));document.querySelector('.print-licensed').textContent=hostMissing?COPY.noHost:fmt(result.licensed_cores);const table=document.getElementById('cost-table');table.replaceChildren();const h=el('tr');append(h,el('th',COPY.tableOption),el('th',COPY.total));table.append(h);for(const n of ['stay','hypervisor','cloud']){const tr=el('tr'),td=el('td',result.three_year[n]===null?(missingFields(n,v).fields?fill(COPY.missingRow,{fields:missingFields(n,v).fields+missingFields(n,v).hint}):(!v.hourly&&(Number(options[n].yearly_hours)>0||Number(options[n].one_time_hours)>0))?'add your hourly rate':COPY.add):'$'+fmt(result.three_year[n]));const data={yearly:money(v[n+'_yearly_total']),price:money(v[n+'_price_per_core']),cores:fmt(result.licensed_cores),yearlyHours:options[n].yearly_hours,oneTime:money(options[n].one_time),oneHours:options[n].one_time_hours,rate:money(v.hourly||'0')};let rowCopy=n==='stay'&&v.stay_price_per_core?COPY.rowInputsPerCore:COPY.rowInputs;rowCopy=singular(rowCopy,options[n].yearly_hours,'{yearlyHours} team hours','{yearlyHours} '+COPY.singularHour);rowCopy=singular(rowCopy,options[n].one_time_hours,'{oneHours} team hours','{oneHours} '+COPY.singularHour);rowCopy=singular(rowCopy,result.licensed_cores,'licensed cores',COPY.singularCore);td.append(el('small',fill(rowCopy,data),'print-only row-inputs'));append(tr,el('td',COPY[n]),td);table.append(tr);}document.querySelector('.winner').textContent=result.cheapest?COPY.cheapest+' '+COPY[result.cheapest]+'.':COPY.compareMissing;const firstMissing=['stay','hypervisor','cloud'].find(n=>result.three_year[n]===null&&missingFields(n,v).fields);const missing=firstMissing?missingFields(firstMissing,v):null;const sorted=Object.keys(result.three_year).sort((a,b)=>result.three_year[a]-result.three_year[b]);document.querySelector('.short-cost').textContent=result.cheapest?fill(COPY.shortCost,{option:COPY[sorted[0]],gap:'$'+fmt(result.three_year[sorted[1]]-result.three_year[sorted[0]]),next:COPY[sorted[1]]}):missing?fill(COPY.missingShort,{fields:missing.fields,option:COPY[firstMissing],hint:missing.hint}):COPY.compareMissing;const f=state.result.findings;let wasteCopy=f.old_snapshots?COPY.shortWaste:COPY.shortWasteNoSnap;wasteCopy=singular(wasteCopy,f.powered_off.count,'powered-off VMs still hold',COPY.singularPoweredOff);wasteCopy=singular(wasteCopy,f.old_snapshots?.count,'snapshots are',COPY.singularSnapshot);wasteCopy=singular(wasteCopy,state.days,'days',COPY.singularDay);document.querySelector('.short-waste').textContent=fill(wasteCopy,{n:fmt(f.powered_off.count),tib:fmt(f.powered_off.off_provisioned_tib),s:fmt(f.old_snapshots?.count),days:state.days});document.querySelector('.zero-move').textContent=result.cheapest&&result.cheapest!=='stay'&&!v[result.cheapest+'_one_time_hours']?COPY.zeroMoveHours:'';}
function exportCsv(){const lines=[[COPY.csvFinding,COPY.csvRow,COPY.csvVm]];const f=state.result.findings;for(const [title,rows] of [[COPY.off,f.powered_off.rows],[COPY.snapshots,f.old_snapshots?.rows||[]],[COPY.biggest,f.biggest]])for(const row of rows)lines.push([title,row.row,realName(row.vm)]);lines.push([], [COPY.compare,COPY.total]);for(const n of ['stay','hypervisor','cloud'])lines.push([COPY[n],state.cost.three_year[n]===null?COPY.add:money(state.cost.three_year[n])]);const csv=lines.map(row=>row.map(value=>{let s=String(value);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');const a=el('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=COPY.download;a.click();URL.revokeObjectURL(a.href);}
empty();
