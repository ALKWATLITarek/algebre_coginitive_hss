/* Mathématiques, banque et données. Sans dépendances, utilisable hors ligne. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AlgebraCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '1.0.0';
  const BANK_VERSION = 's3-transfer-s4-1';
  const TRAINING_MS = 45000;
  const CONDITIONS = ['symbolique', 'visuel'];
  const identity = n => Array.from({length:n}, (_, i) => i + 1);
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  function assertPermutation(p) {
    if (!Array.isArray(p) || [...p].sort((a,b)=>a-b).some((v,i)=>v!==i+1)) throw Error('Permutation invalide');
  }
  function compose(a,b) {
    assertPermutation(a); assertPermutation(b);
    if (a.length!==b.length) throw Error('Tailles différentes');
    return b.map(v=>a[v-1]); // a ∘ b : appliquer b, puis a.
  }
  function product(ops) {
    return ops.reduce((acc,p)=>compose(acc,p),identity(ops[0].length));
  }
  function inverse(p) { assertPermutation(p); const q=[]; p.forEach((v,i)=>q[v-1]=i+1); return q; }
  function order(p) {
    assertPermutation(p); let q=identity(p.length);
    for(let k=1;k<=10000;k++){q=compose(q,p);if(same(q,identity(p.length))) return k;}
    throw Error('Ordre hors limites');
  }
  function permutations(a) {
    if (!a.length) return [[]];
    return a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(p=>[v,...p]));
  }
  function rng(seed) {
    let a=seed>>>0;
    return function(){a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  }
  function shuffle(items,rand) {
    const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
  }
  const P = {
    e:[1,2,3],r:[2,3,1],rr:[3,1,2],a:[2,1,3],b:[1,3,2],c:[3,2,1],
    u:[2,3,4,1],v:[2,1,3,4],w:[3,4,1,2],x:[1,3,4,2]
  };
  const make=(id,family,n,keys)=>({id,family,n,ops:keys.map(k=>P[k])});
  const BANK = {
    pre:[make('pre-c1','composition',3,['rr','a']),make('pre-c2','composition',3,['b','rr']),make('pre-i1','inverse',3,['a']),make('pre-i2','inverse',3,['c','r']),make('pre-o1','ordre',3,['a','b']),make('pre-o2','ordre',3,['r','b'])],
    post:[make('post-c1','composition',3,['a','rr']),make('post-c2','composition',3,['rr','c']),make('post-c3','composition',3,['b','r','a']),make('post-c4','composition',3,['c','a','r']),make('post-i1','inverse',3,['b']),make('post-i2','inverse',3,['rr']),make('post-i3','inverse',3,['a','rr']),make('post-i4','inverse',3,['c','b']),make('post-o1','ordre',3,['r','rr']),make('post-o2','ordre',3,['c','a']),make('post-o3','ordre',3,['rr','b']),make('post-o4','ordre',3,['a','r','c'])],
    transfer:[make('transfer-c1','composition',4,['u','v']),make('transfer-c2','composition',4,['w','x']),make('transfer-i1','inverse',4,['u','x']),make('transfer-o1','ordre',4,['u','w'])]
  };
  const fmt=p=>'['+p.join(', ')+']';
  function expression(t){return t.ops.map((_,i)=>String.fromCharCode(112+i)).join(' ∘ ');}
  function solve(t) {
    const p=product(t.ops);
    if(t.family==='composition') return fmt(p);
    if(t.family==='inverse') return fmt(inverse(p));
    return String(order(p));
  }
  function prompt(t) {
    const e=expression(t);
    if(t.family==='composition') return 'Quelle permutation obtient-on pour '+e+' ?';
    if(t.family==='inverse') return 'Quelle est la permutation inverse de '+(t.ops.length>1?'('+e+')':e)+' ?';
    return 'Quel est l’ordre de '+(t.ops.length>1?'('+e+')':e)+' ?';
  }
  function stageTrials(stage,seed) {
    const rand=rng((seed ^ ({pre:239,post:983,transfer:3347}[stage]))>>>0);
    return shuffle(BANK[stage],rand).map(t=>{
      const answer=solve(t);
      let pool=t.family==='ordre'?['1','2','3','4','6']:permutations(identity(t.n)).map(fmt);
      const opts=shuffle([answer,...shuffle(pool.filter(s=>s!==answer),rand).slice(0,3)],rand);
      return {...t,prompt:prompt(t),answer,options:opts};
    });
  }
  const COLUMNS=['protocol_version','bank_version','participant_id','is_demo','condition','allocation_method','random_seed','consent_utc','session_started_utc','session_completed_utc','completed','math_level','group_familiarity','stage','trial_id','family','n','prompt','options_json','response','correct_answer','correct','response_time_ms','first_choice_ms','hidden_events','hidden_ms','resumed_count','strategy','confidence','difficulty','training_visible_ms','training_page_times_json'];
  function rows(session) {
    const rs = session.trials.map(t=>({
      protocol_version:VERSION,bank_version:BANK_VERSION,participant_id:session.id,is_demo:session.demo?1:0,condition:session.condition,allocation_method:session.demo?'demonstration':'bernoulli_crypto',random_seed:session.seed,consent_utc:session.consent_utc,session_started_utc:session.started_utc,session_completed_utc:session.completed_utc||'',completed:session.completed?1:0,math_level:session.math_level,group_familiarity:session.familiarity,stage:t.stage,trial_id:t.id,family:t.family,n:t.n,prompt:t.prompt,options_json:JSON.stringify(t.options),response:t.response,correct_answer:t.answer,correct:t.correct?1:0,response_time_ms:Math.round(t.rt),first_choice_ms:Math.round(t.first_choice_ms),hidden_events:t.hidden_events,hidden_ms:Math.round(t.hidden_ms),resumed_count:session.resumed_count||0,strategy:session.strategy||'',confidence:session.confidence||'',difficulty:session.difficulty||'',training_visible_ms:Math.round((session.training_times||[]).reduce((a,b)=>a+b,0)),training_page_times_json:JSON.stringify((session.training_times||[]).map(Math.round))
    }));
    const meta = rs[0] || {protocol_version:VERSION,bank_version:BANK_VERSION,participant_id:session.id,is_demo:session.demo?1:0,condition:session.condition,allocation_method:session.demo?'demonstration':'bernoulli_crypto',random_seed:session.seed,consent_utc:session.consent_utc,session_started_utc:session.started_utc,session_completed_utc:session.completed_utc||'',completed:session.completed?1:0,math_level:session.math_level,group_familiarity:session.familiarity,resumed_count:session.resumed_count||0,strategy:session.strategy||'',confidence:session.confidence||'',difficulty:session.difficulty||'',training_visible_ms:Math.round((session.training_times||[]).reduce((a,b)=>a+b,0)),training_page_times_json:JSON.stringify((session.training_times||[]).map(Math.round))};
    return [{...meta,stage:'session',trial_id:'session-summary',family:'',n:'',prompt:'Résumé de passation',options_json:'[]',response:'',correct_answer:'',correct:'',response_time_ms:'',first_choice_ms:'',hidden_events:'',hidden_ms:''},...rs];
  }
  function csvEscape(v){const s=String(v??'');return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
  function csv(data){return '\uFEFF'+[COLUMNS.join(','),...data.map(r=>COLUMNS.map(k=>csvEscape(r[k])).join(','))].join('\r\n');}
  function parseCSV(text) {
    text=text.replace(/^\uFEFF/,'');const records=[];let record=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell.length)throw Error('Guillemet CSV inattendu');else quoted=!quoted;}
      else if(c===','&&!quoted){record.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;record.push(cell);if(record.some(x=>x!==''))records.push(record);record=[];cell='';}
      else cell+=c;
    }
    if(quoted)throw Error('CSV incomplet : guillemet non fermé');
    if(cell.length||record.length){record.push(cell);records.push(record);}
    if(!records.length)throw Error('Fichier vide');
    const header=records.shift();
    if(COLUMNS.some(k=>!header.includes(k)))throw Error('Colonnes manquantes : utiliser un export de cette expérience');
    return records.map((a,i)=>{
      if(a.length!==header.length)throw Error('Nombre de colonnes incorrect à la ligne '+(i+2));
      const r=Object.fromEntries(header.map((k,j)=>[k,a[j]]));
      if(!CONDITIONS.includes(r.condition)||r.protocol_version!==VERSION||r.bank_version!==BANK_VERSION||!r.participant_id||!r.trial_id)throw Error('Métadonnées incompatibles à la ligne '+(i+2));
      if(r.stage==='session'&&r.trial_id==='session-summary'){
        if(!['0','1'].includes(r.completed)||!['0','1'].includes(r.is_demo)||r.response!==''||r.correct!=='')throw Error('Résumé de passation invalide');
        return r;
      }
      const item=(BANK[r.stage]||[]).find(t=>t.id===r.trial_id);
      if(!item||r.family!==item.family||Number(r.n)!==item.n||r.correct_answer!==solve(item)||!['0','1'].includes(r.correct)||Number(r.correct)!==Number(r.response===r.correct_answer)||!['0','1'].includes(r.is_demo)||!['0','1'].includes(r.completed)||!Number.isFinite(Number(r.response_time_ms))||Number(r.response_time_ms)<0)throw Error('Réponse incohérente à la ligne '+(i+2));
      return r;
    });
  }
  function mergeRows(a,b){
    const map=new Map();
    for(const r of [...a,...b]){
      const k=[r.participant_id,r.stage,r.trial_id].join('|');
      if(map.has(k)&&COLUMNS.some(c=>String(map.get(k)[c]??'')!==String(r[c]??'')))throw Error('Deux réponses différentes pour une même question et un même identifiant. Import annulé.');
      map.set(k,r);
    }
    return [...map.values()];
  }
  function participants(data){
    const grouped=new Map();for(const r of data){if(!grouped.has(r.participant_id))grouped.set(r.participant_id,[]);grouped.get(r.participant_id).push(r);}
    const out=[];
    for(const [id,rs] of grouped){
      const stages={};for(const stage of Object.keys(BANK)){const ss=rs.filter(r=>r.stage===stage);stages[stage]=ss.length?ss.reduce((a,r)=>a+Number(r.correct),0)/ss.length:null;}
      const complete=Object.entries(BANK).every(([s,ts])=>ts.every(t=>rs.some(r=>r.stage===s&&r.trial_id===t.id)))&&rs.every(r=>Number(r.completed)===1);
      out.push({id,condition:rs[0].condition,demo:Number(rs[0].is_demo)===1,complete,...stages,count:rs.filter(r=>r.stage!=='session').length});
    }return out;
  }
  return {VERSION,BANK_VERSION,TRAINING_MS,CONDITIONS,BANK,COLUMNS,identity,compose,product,inverse,order,permutations,same,fmt,rng,shuffle,stageTrials,solve,prompt,expression,rows,csv,parseCSV,mergeRows,participants};
});
