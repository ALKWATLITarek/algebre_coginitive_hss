(function(){
  'use strict';
  const C=AlgebraCore;
  const $=s=>document.querySelector(s);
  // Compléter ces trois informations avant le recrutement.
  const STUDY_INFO={contact:'',conservation:'',remise:''};
  const researcherMode=/chercheur\.html$/.test(location.pathname);
  const participantMode=!researcherMode;
  const scope='algebre:'+location.pathname.replace(/[^/]*$/,'');
  const KEY={draft:scope+'draft-v1',sessions:scope+'sessions-v1',imports:scope+'imports-v1'};
  let storageOK=true,session=null,clock=null,timer=null,trainingTick=null,trainingLast=null,selected=null,firstChoice=null,busy=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=n=>n===null||!Number.isFinite(n)?'—':Math.round(n*100)+' %';
  const read=(key,fallback)=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):fallback;}catch{storageOK=false;return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{storageOK=false;toast('La sauvegarde locale est indisponible. Gardez cet onglet ouvert et téléchargez le CSV à la fin.');return false;}};
  const remove=key=>{try{localStorage.removeItem(key);}catch{storageOK=false;}};
  const persist=()=>{if(session)write(KEY.draft,session);};
  const arrow='';
  function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',7000);}
  function download(name,text,type='text/csv;charset=utf-8'){
    const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
  }
  function triangle(p=[1,2,3],label='',large=false){
    const pts=[[150,27],[258,201],[42,201]],labels=C.inverse(p);
    return `<svg viewBox="0 0 300 240" role="img" aria-label="${esc(label||'Triangle : sommets '+labels.join(', '))}"><polygon points="150,27 258,201 42,201" fill="#f4f4f4" stroke="#555" stroke-width="1.5"/>${pts.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${large?17:16}" fill="white" stroke="#555"/><text x="${x}" y="${y+5}" fill="#111" font-size="14" text-anchor="middle" font-family="Georgia,serif">${labels[i]}</text>`).join('')}<g fill="#555" font-size="10" text-anchor="middle"><text x="150" y="5">place 1</text><text x="258" y="235">place 2</text><text x="42" y="235">place 3</text></g></svg>`;
  }
  function header(page,active=false){
    document.body.classList.toggle('participant-mode',participantMode||active);
    $('#header').innerHTML=`<div class="bar"><span>Étude sur le raisonnement mathématique</span>${researcherMode&&!active?'<nav aria-label="Navigation expérimentateur"><a href="#accueil">Préparation</a><a href="#donnees">Données</a></nav>':''}</div>`;
    $('#footer').textContent=`Protocole ${C.VERSION} · Participation volontaire · Enregistrement local`;
    document.querySelector('.storage-warning')?.remove();
    if(!storageOK)$('#header').insertAdjacentHTML('afterend','<p class="storage-warning">La sauvegarde locale est indisponible. Gardez cet onglet ouvert jusqu’au téléchargement du CSV.</p>');
  }
  function participantLink(){return new URL('index.html',location.href).href;}
  function home(){
    header('accueil');
    $('#main').innerHTML=`<div class="container"><h1>Préparation de l’expérience</h1><p>Comparer un apprentissage symbolique à un apprentissage accompagné de schémas. Les participants arrivent directement sur l’information et le consentement.</p><h2>Passation</h2><ol><li>Prétest : 6 questions.</li><li>Apprentissage : 6 pages, 45 secondes visibles minimum par page.</li><li>Test final : 12 questions, sans figures.</li><li>Transfert : 4 questions sur quatre éléments.</li><li>Questionnaire et téléchargement du CSV.</li></ol><p>Attribution aléatoire à deux conditions. Durée indicative : 12 à 18 minutes.</p><div class="actions"><a class="btn" href="index.html">Ouvrir une passation</a><button class="btn secondary" id="demo-symbolic">Démo symbolique</button><button class="btn secondary" id="demo-visual">Démo visuelle</button></div><p class="small-note">Les démonstrations n’imposent pas d’attente et sont exclues de l’analyse.</p><h2>Avant la collecte</h2><p>Faire 3 à 5 essais techniques. Compléter contact, conservation et remise dans <code>STUDY_INFO</code>, au début de <code>app.js</code>.</p><p><strong>Contact :</strong> ${esc(STUDY_INFO.contact||'à compléter')}<br><strong>Conservation :</strong> ${esc(STUDY_INFO.conservation||'à compléter')}<br><strong>Remise des fichiers :</strong> ${esc(STUDY_INFO.remise||'à compléter')}</p><h2>Documents</h2><ul><li><a href="docs/PROTOCOLE.md">Protocole détaillé</a></li><li><a href="docs/DICTIONNAIRE.md">Dictionnaire des données</a></li><li><a href="docs/BANQUE_CORRIGEE.md">Banque corrigée (expérimentateur)</a></li><li><a href="analysis/analyse.py" download>Script d’analyse Python</a></li></ul><h2>Adresse à transmettre</h2><div class="link-copy"><input id="participant-url" type="text" aria-label="Adresse participant" readonly value="${esc(participantLink())}"><button class="btn secondary" id="copy-link">Copier</button></div><p class="small-note">Les données restent dans chaque navigateur. Récupérer les CSV manuellement. Cette page d’expérimentation est distincte de la passation, mais ne constitue pas un espace protégé par mot de passe.</p></div>`;
    $('#demo-symbolic').onclick=()=>startDemo('symbolique');
    $('#demo-visual').onclick=()=>startDemo('visuel');
    $('#copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(participantLink());toast('Adresse copiée.');}catch{$('#participant-url').select();toast('Adresse sélectionnée : utilisez Copier.');}};
  }
  function allRows(){return C.mergeRows(read(KEY.sessions,[]).flatMap(C.rows),read(KEY.imports,[]));}
  function dashboard(){
    header('donnees');let data=[];try{data=allRows();}catch(e){toast(e.message);}
    const ps=C.participants(data),real=ps.filter(p=>!p.demo&&p.complete);
    $('#main').innerHTML=`<div class="container"><h1>Données de l’expérience</h1><p>${real.length} passation(s) réelle(s) complète(s) : ${real.filter(p=>p.condition==='symbolique').length} symbolique(s), ${real.filter(p=>p.condition==='visuel').length} visuelle(s).</p><p>Les CSV importés et les réponses de cet appareil sont regroupés ici. Les doublons identiques ne sont comptés qu’une fois.</p><div class="actions"><label class="btn secondary import-label">Importer des CSV<input type="file" id="csv-import" accept=".csv,text/csv" multiple></label><button class="btn" id="export-all" ${!data.some(r=>Number(r.is_demo)===0)?'disabled':''}>Exporter la collecte réelle</button></div>${ps.length?`<div class="table-wrap"><table><thead><tr><th>Identifiant</th><th>Condition</th><th>Prétest</th><th>Test final</th><th>État</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${esc(p.id.slice(0,8))}</td><td>${esc(p.condition)}</td><td>${pct(p.pre)}</td><td>${pct(p.post)}</td><td>${p.demo?'Démo exclue':p.complete?'Complète':'Partielle'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">Aucune réponse enregistrée ou importée.</p>'}<p class="small-note">${ps.filter(p=>p.demo).length} démonstration(s) exclue(s). Les contradictions bloquent l’import. Aucun envoi automatique.</p><h2>Analyse</h2><p>Le script Python fourni agrège les réponses par participant, calcule la comparaison prévue et produit le rapport. Les chiffres affichés ici sont descriptifs.</p><p><a href="analysis/analyse.py" download>Télécharger le script</a> · <a href="docs/DICTIONNAIRE.md">Dictionnaire des variables</a></p><hr><button class="text-button" id="clear-data">Effacer les copies de ce navigateur</button></div>`;
    $('#csv-import').onchange=async e=>{try{
      let merged=allRows();const files=[...e.target.files];let total=0;
      for(const f of files){if(f.size>10*1024*1024)throw Error('Fichier trop volumineux (limite : 10 Mo).');const incoming=C.parseCSV(await f.text());total+=incoming.length;merged=C.mergeRows(merged,incoming);}
      if(write(KEY.imports,merged)){toast(files.length+' fichier(s) importé(s), '+total+' lignes vérifiées.');dashboard();}
    }catch(err){toast(err.message);}finally{e.target.value='';}};
    $('#export-all').onclick=()=>download('collecte_algebre.csv',C.csv(allRows().filter(r=>Number(r.is_demo)===0)));
    $('#clear-data').onclick=()=>modal('Effacer les copies locales ?','Les passations et imports de ce navigateur seront supprimés. Les CSV téléchargés restent sur votre ordinateur.',()=>{remove(KEY.sessions);remove(KEY.imports);dashboard();toast('Copies locales effacées.');},'Effacer');
  }
  function modal(title,text,action,label='Confirmer'){
    const d=$('#dialog');d.innerHTML=`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="actions"><button class="btn danger" id="dialog-confirm">${esc(label)}</button><button class="btn secondary" id="dialog-cancel">Revenir</button></div>`;d.showModal();$('#dialog-cancel').onclick=()=>d.close();$('#dialog-confirm').onclick=()=>{d.close();action();};
  }
  function intro(){
    header('experience',true);const draft=read(KEY.draft,null);
    $('#main').innerHTML=`<div class="study-shell"><div class="study-card"><div class="eyebrow">Avant de commencer</div><h1>Information et consentement</h1><p class="lead">Cette étude porte sur la compréhension de petites transformations mathématiques. Vous suivrez un court apprentissage, puis répondrez à des questions individuelles.</p><div class="callout green">Durée indicative : 12 à 18 minutes. Utilisez un ordinateur, dans un endroit calme, sans aide extérieure, calculatrice ni prise de notes. Vous pouvez arrêter à tout moment.</div><p>La présentation du cours vous sera attribuée au hasard. Nous enregistrons vos réponses, les temps de réponse et vos changements d’onglet. Aucun nom, adresse e-mail ou enregistrement audio n’est demandé.</p><p>Les réponses restent dans ce navigateur. À la fin, vous pourrez télécharger un fichier CSV et le remettre vous-même à l’expérimentateur selon les modalités annoncées. Le fichier n’est pas envoyé automatiquement.</p>${STUDY_INFO.contact||STUDY_INFO.conservation||STUDY_INFO.remise?`<p class="study-info">${STUDY_INFO.contact?`Contact : ${esc(STUDY_INFO.contact)}<br>`:''}${STUDY_INFO.conservation?`Conservation : ${esc(STUDY_INFO.conservation)}<br>`:''}${STUDY_INFO.remise?`Remise du CSV : ${esc(STUDY_INFO.remise)}`:''}</p>`:''}<form id="consent-form"><div class="form-row"><label class="field">Formation mathématique<select id="math-level" required><option value="">Choisir…</option><option value="secondaire">Secondaire / lycée</option><option value="superieur_non_scientifique">Supérieur, hors filière scientifique</option><option value="superieur_scientifique">Supérieur scientifique / prépa</option><option value="mathematiques_avancees">Formation avancée en mathématiques</option></select></label><label class="field">Familiarité avec les permutations et groupes<select id="familiarity" required><option value="">Choisir…</option><option value="0">Aucune</option><option value="1">Quelques notions</option><option value="2">Déjà étudiés et manipulés</option><option value="3">Pratique régulière</option></select></label></div><label class="checkbox"><input id="consent" type="checkbox" required><span>J’ai 18 ans ou plus, j’ai lu ces informations et j’accepte volontairement de participer. J’ai compris comment mes réponses seront conservées et remises à l’expérimentateur.</span></label><div class="actions"><button class="btn" type="submit">Commencer la passation ${arrow}</button></div></form><p class="small-note">Les questions n’ont pas de limite de temps. Il n’y a pas de correction entre les questions. La notation sera expliquée avant le prétest.</p>${draft?`<div class="callout" style="margin-top:20px">Une passation ${draft.demo?'de démonstration ':''}est en cours sur cet appareil.<div class="actions"><button class="btn secondary" id="resume">Reprendre</button><button class="text-button" id="discard-draft">Supprimer cette passation</button></div></div>`:''}</div></div>`;
    $('#consent-form').onsubmit=e=>{e.preventDefault();if(draft){toast('Reprenez ou supprimez d’abord la passation en cours.');return;}begin(false,null,$('#math-level').value,Number($('#familiarity').value));};
    if(draft){$('#resume').onclick=()=>{session=draft;session.resumed_count=(session.resumed_count||0)+1;persist();showSession();};$('#discard-draft').onclick=()=>modal('Supprimer la passation en cours ?','Les réponses non téléchargées de cette passation seront effacées.',()=>{remove(KEY.draft);intro();},'Supprimer');}
  }
  function startDemo(condition){
    if(read(KEY.draft,null)){toast('Une passation est déjà en cours. Reprenez-la ou supprimez-la avant une démo.');location.hash='experience';return;}
    begin(true,condition,'demonstration',0);
  }
  function begin(demo,condition,math_level,familiarity){
    const bytes=new Uint32Array(3);crypto.getRandomValues(bytes);
    const id=typeof crypto.randomUUID==='function'?crypto.randomUUID():[...bytes].map(x=>x.toString(16).padStart(8,'0')).join('-');
    const now=new Date().toISOString();
    session={id,demo,condition:condition||C.CONDITIONS[bytes[0]%2],seed:bytes[1],consent_utc:now,started_utc:now,math_level,familiarity,stage:'notation',index:0,trials:[],training_times:[0,0,0,0,0,0],resumed_count:0,completed:false};
    persist();location.hash='experience';showSession();
  }
  const STAGE_INFO={notation:['Préparation',0],pre:['Prétest',1],learn:['Apprentissage',2],post:['Test final',3],transfer:['Nouvelles permutations',4],survey:['Votre expérience',5],done:['Passation terminée',6],stopped:['Passation arrêtée',6]};
  function shell(content){
    header('experience',true);const [label,progress]=STAGE_INFO[session.stage];
    $('#main').innerHTML=`<div class="study-shell">${session.demo?'<div class="demo-bar"><strong>DÉMONSTRATION</strong> · '+(session.condition==='visuel'?'Avec schémas':'Symbolique')+' · Attente désactivée. Ces réponses seront exclues des analyses.</div>':''}<div class="study-head"><span>Étape ${Math.min(progress+1,6)} / 6 · ${label}</span>${!['done','stopped'].includes(session.stage)?'<button id="stop-session">Arrêter la passation</button>':''}</div><div class="progress" aria-label="Progression"><span style="width:${progress/6*100}%"></span></div><section class="study-card">${content}</section></div>`;
    if($('#stop-session'))$('#stop-session').onclick=()=>modal('Arrêter la passation ?','Vous pourrez télécharger les réponses déjà données. La passation sera marquée comme partielle et écartée de l’analyse principale.',()=>{stopTraining();session.stage='stopped';session.completed=false;session.completed_utc=new Date().toISOString();finishStore();showSession();},'Arrêter');
    $('#main').focus({preventScroll:true});
  }
  function stopTraining(){if(trainingTick){clearInterval(trainingTick);trainingTick=null;}trainingLast=null;}
  function showSession(){
    stopTraining();clock=null;selected=null;firstChoice=null;busy=false;
    if(session.stage==='notation')notation();
    else if(['pre','post','transfer'].includes(session.stage))trial();
    else if(session.stage==='learn')learn();
    else if(session.stage==='survey')survey();
    else end();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function nextStage(stage){session.stage=stage;session.index=0;persist();showSession();}
  function notation(){
    shell(`<div class="eyebrow">Une notation commune</div><h1>Les règles pour répondre.</h1><p>Une permutation change la place d’éléments numérotés. Pour trois éléments, <span class="math-inline">[2, 3, 1]</span> signifie : <strong>1 va à la place 2, 2 à la place 3 et 3 à la place 1.</strong></p><div class="formula">p = [2, 3, 1]<br>p(1) = 2 · p(2) = 3 · p(3) = 1</div><p><strong>Composition :</strong> dans <span class="math-inline">p ∘ q</span>, on applique <strong>q d’abord, puis p</strong>. Pour chaque élément <span class="math-inline">i</span>, le résultat est <span class="math-inline">p(q(i))</span>.</p><p><strong>Inverse :</strong> l’opération qui annule une permutation. <strong>Ordre :</strong> le plus petit nombre positif de répétitions nécessaires pour revenir à la disposition initiale.</p><div class="callout">Choisissez une réponse, puis confirmez. Travaillez sans aide extérieure ni brouillon. Donnez votre meilleure réponse même si vous hésitez. Une légende restera disponible pendant les questions.</div><div class="actions"><button class="btn" id="notation-next">Passer au prétest ${arrow}</button></div>`);
    $('#notation-next').onclick=()=>nextStage('pre');
  }
  function trial(){
    const stage=session.stage,trials=C.stageTrials(stage,session.seed),t=trials[session.index];
    shell(`<div class="eyebrow">Question ${session.index+1} / ${trials.length} · ${stage==='transfer'?'4 éléments':'3 éléments'}</div><h1>${esc(t.prompt)}</h1>${stage==='transfer'&&session.index===0?'<p>On utilise maintenant quatre éléments. Les règles et la notation restent les mêmes.</p>':''}<div class="formula">${t.ops.map((p,i)=>`${String.fromCharCode(112+i)} = ${C.fmt(p)}`).join('<br>')}</div><p class="legend"><strong>Rappel.</strong> [a, b, c${t.n===4?', d':''}] donne les images de 1, 2, 3${t.n===4?', 4':''}. Dans p ∘ q, appliquer q puis p. Inverse = annuler. Ordre = nombre minimal positif de répétitions pour revenir à l’identité.</p><div class="option-grid" role="group" aria-label="Choisir une réponse">${t.options.map((o,i)=>`<button class="option" data-index="${i}" aria-pressed="false">${esc(o)}</button>`).join('')}</div><div class="study-actions"><span class="hint">Répondez à votre rythme.<br>Aucune correction pendant le test.</span><button class="btn" id="confirm-answer" disabled>Confirmer ${arrow}</button></div>`);
    clock={start:performance.now(),hidden_events:document.hidden?1:0,hidden_ms:0,hidden_start:document.hidden?performance.now():null};
    document.querySelectorAll('.option').forEach(b=>b.onclick=()=>{if(busy)return;selected=t.options[Number(b.dataset.index)];if(firstChoice===null)firstChoice=performance.now()-clock.start;document.querySelectorAll('.option').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#confirm-answer').disabled=false;});
    $('#confirm-answer').onclick=()=>{
      if(busy||selected===null)return;busy=true;
      const now=performance.now();let hidden_ms=clock.hidden_ms;if(clock.hidden_start!==null)hidden_ms+=now-clock.hidden_start;
      session.trials.push({...t,stage,response:selected,correct:selected===t.answer,rt:now-clock.start,first_choice_ms:firstChoice,hidden_events:clock.hidden_events,hidden_ms});
      session.index++;
      if(session.index===trials.length){nextStage({pre:'learn',post:'transfer',transfer:'survey'}[stage]);}
      else{persist();showSession();}
    };
  }
  const lessons=[
    {title:'Une permutation est une transformation.',text:'Chaque élément de départ reçoit une image différente. La permutation p envoie 1 vers 2, 2 vers 3 et 3 vers 1.',formula:'p = [2, 3, 1]',example:'Images successives : 1 → 2, 2 → 3, 3 → 1.',p:[2,3,1],caption:'Le sommet 1 va à la place 2 ; 2 à la place 3 ; 3 à la place 1.'},
    {title:'Composer : appliquer de droite à gauche.',text:'Dans p ∘ q, q agit en premier. On calcule l’image de chaque élément par q, puis l’image du résultat par p.',formula:'p = [2, 3, 1] ; q = [1, 3, 2]<br>p ∘ q = [2, 1, 3]',example:'Pour 2 : q(2) = 3, puis p(3) = 1. Ainsi (p ∘ q)(2) = 1.',p:[2,1,3],caption:'Disposition finale après q, puis p. Les mêmes trois images sont représentées.'},
    {title:'Répéter peut ramener au départ.',text:'L’identité e laisse chaque élément à sa place. Répéter trois fois p ramène chaque élément à son point de départ.',formula:'p = [2, 3, 1]<br>p² = [3, 1, 2] ; p³ = e = [1, 2, 3]',example:'En suivant 1 : 1 → 2 → 3 → 1. Le plus petit nombre de répétitions est 3 : p est d’ordre 3.',p:[1,2,3],caption:'Après trois applications de p, les sommets retrouvent leur position initiale.'},
    {title:'L’inverse annule la transformation.',text:'La permutation inverse fait le chemin en sens contraire. Appliquer p, puis p⁻¹ donne l’identité.',formula:'p = [2, 3, 1]<br>p⁻¹ = [3, 1, 2]<br>p⁻¹ ∘ p = e',example:'Comme p(1) = 2, on a p⁻¹(2) = 1. On retrouve de la même façon les trois images de l’inverse.',p:[3,1,2],caption:'L’inverse replace les éléments déplacés par p dans leur position initiale.'},
    {title:'Changer l’ordre peut changer le résultat.',text:'Deux permutations ne commutent pas toujours. Il faut respecter l’ordre de composition indiqué.',formula:'p = [2, 3, 1] ; q = [1, 3, 2]<br>p ∘ q = [2, 1, 3]<br>q ∘ p = [3, 2, 1]',example:'L’image de 1 vaut 2 pour p ∘ q, mais 3 pour q ∘ p. Les deux compositions sont différentes.',p:[2,1,3],q:[3,2,1],caption:'À gauche : p ∘ q. À droite : q ∘ p. Les dispositions finales diffèrent.'},
    {title:'Les mêmes règles pour toutes les permutations.',text:'Les six permutations de trois éléments forment un groupe : on peut les composer, chaque permutation possède un inverse et l’identité ne change rien.',formula:'e = [1, 2, 3]<br>q = [1, 3, 2] ; q² = e<br>p = [2, 3, 1] ; p³ = e',example:'q est d’ordre 2 ; p est d’ordre 3 ; e est d’ordre 1. Pour une composée, calculer d’abord la permutation obtenue.',p:[1,3,2],caption:'Une même permutation décrit le déplacement des numéros et celui des sommets.'}
  ];
  function learn(){
    const i=session.index,l=lessons[i],visual=session.condition==='visuel';
    const diagram=visual?`<div class="learn-diagram">${l.q?`<div style="display:flex">${triangle(l.p,l.caption)}${triangle(l.q,'Résultat q composé avec p')}</div>`:triangle(l.p,l.caption)}<p>${l.caption}</p><p>Numéros cerclés : éléments. Repères gris : places fixes.</p></div>`:'';
    shell(`<div class="eyebrow">Apprentissage · Page ${i+1} / 6</div><h1>${l.title}</h1><p>${l.text}</p><div class="formula">${l.formula}</div><div class="${visual?'learn-grid':''}"><div class="learn-example"><h3>Le même calcul, pas à pas</h3><p>${l.example}</p><p>Départ : 1, 2, 3.<br>Images : ${C.fmt(l.p)}.</p></div>${diagram}</div><div class="callout">Lisez et étudiez cette page. Les questions suivantes n’auront aucun schéma. Chaque page doit rester visible au moins 45 secondes.</div><div class="study-actions"><span class="hint" id="learning-time" role="status" aria-live="off"></span><button class="btn" id="lesson-next" ${session.demo?'':'disabled'}>${i===5?'Passer au test final':'Page suivante'} ${arrow}</button></div>`);
    const update=()=>{
      const remain=session.demo?0:Math.max(0,Math.ceil((C.TRAINING_MS-session.training_times[i])/1000));
      $('#learning-time').textContent=session.demo?'Démo : attente désactivée.':remain?'Temps de lecture restant : '+remain+' s'+(document.hidden?' · en pause':''):'Vous pouvez continuer.';
      $('#lesson-next').disabled=remain>0;
    };
    trainingLast=performance.now();let saveCounter=0;update();
    trainingTick=setInterval(()=>{const now=performance.now();if(!document.hidden)session.training_times[i]+=now-trainingLast;trainingLast=now;update();if(++saveCounter%4===0)persist();},250);
    $('#lesson-next').onclick=()=>{if(!session.demo&&session.training_times[i]<C.TRAINING_MS)return;stopTraining();if(i===5)nextStage('post');else{session.index++;persist();showSession();}};
  }
  function survey(){
    shell(`<div class="eyebrow">Dernière étape</div><h1>Comment avez-vous raisonné ?</h1><p>Il n’y a pas de bonne réponse ici. Indiquez ce qui décrit le mieux votre expérience.</p><form id="survey-form"><label class="field">Stratégie utilisée le plus souvent<select id="strategy" required><option value="">Choisir…</option><option value="calcul_symbolique">J’ai suivi les images des nombres et calculé</option><option value="visualisation_mentale">J’ai imaginé des déplacements ou une figure</option><option value="mixte">J’ai combiné calcul et images mentales</option><option value="autre">Autre stratégie / difficile à décrire</option></select></label><div class="form-row"><label class="field">Confiance dans vos réponses<select id="confidence" required><option value="">Choisir…</option>${[1,2,3,4,5].map(x=>`<option value="${x}">${x} / 5${x===1?' · très faible':x===5?' · très forte':''}</option>`).join('')}</select></label><label class="field">Difficulté ressentie<select id="difficulty" required><option value="">Choisir…</option>${[1,2,3,4,5].map(x=>`<option value="${x}">${x} / 5${x===1?' · très facile':x===5?' · très difficile':''}</option>`).join('')}</select></label></div><button type="submit" class="btn">Terminer et récupérer mes réponses ${arrow}</button></form>`);
    $('#survey-form').onsubmit=e=>{e.preventDefault();session.strategy=$('#strategy').value;session.confidence=Number($('#confidence').value);session.difficulty=Number($('#difficulty').value);session.completed=true;session.completed_utc=new Date().toISOString();session.stage='done';finishStore();showSession();};
  }
  function finishStore(){
    const ss=read(KEY.sessions,[]).filter(s=>s.id!==session.id);ss.push(session);write(KEY.sessions,ss);remove(KEY.draft);
  }
  function end(){
    const done=session.completed,ps=C.participants(C.rows(session))[0];
    shell(`<div class="eyebrow">${done?'Merci pour votre participation':'Participation interrompue'}</div><h1>${done?'Fin de la passation.':'Passation interrompue.'}</h1><p>${done?'Vous avez terminé l’expérience.':'Vous avez arrêté l’expérience ; cette passation sera exclue de l’analyse principale.'} Aucun fichier n’a été envoyé.</p><div class="callout green"><strong>Prochaine étape :</strong> téléchargez le CSV, puis remettez-le vous-même à l’expérimentateur. Gardez une copie jusqu’à confirmation de réception.</div><div class="actions"><button class="btn" id="download-session" ${session.trials.length?'':'disabled'}>Télécharger ${session.demo?'le CSV de démonstration':'mes réponses CSV'} ↓</button><button class="btn secondary" id="download-json">Copie de sauvegarde JSON ↓</button></div><p class="small-note">Identifiant de passation : ${esc(session.id)}<br>${session.demo?'Démonstration exclue des analyses.':'Conservez cet identifiant pour demander le retrait de vos données à l’expérimentateur.'}</p>${done?`<h3 style="margin-top:30px">Ce que cherchait l’expérience</h3><p>Nous comparons deux présentations d’un même apprentissage : symbolique ou accompagnée de schémas. Nous regardons ensuite si l’aide reçue se retrouve dans les réponses à des questions sans figures, puis sur quatre éléments.</p><div class="score-bars">${['pre','post','transfer'].map((s,i)=>`<div class="score-row"><span>${['Prétest','Test final','Transfert'][i]}</span><div class="score-track"><i style="width:${(ps?.[s]||0)*100}%"></i></div><strong>${pct(ps?.[s])}</strong></div>`).join('')}</div><p class="small-note">Ces scores décrivent cette passation et ne constituent pas une mesure générale de vos capacités mathématiques.</p>`:''}<div class="actions">${!participantMode?'<button class="btn secondary" id="back-project">Revenir à la préparation</button>':''}<button class="text-button" id="delete-session">Supprimer ma copie de ce navigateur</button></div>`);
    $('#download-session').disabled=false;
    $('#download-session').onclick=()=>download((session.demo?'DEMO_':'reponses_')+session.id.slice(0,8)+'.csv',C.csv(C.rows(session)));
    $('#download-json').onclick=()=>download((session.demo?'DEMO_':'sauvegarde_')+session.id.slice(0,8)+'.json',JSON.stringify(session,null,2),'application/json');
    if($('#back-project'))$('#back-project').onclick=()=>{session=null;location.hash='accueil';render();};
    $('#delete-session').onclick=()=>modal('Supprimer votre copie locale ?','Téléchargez d’abord le CSV si vous souhaitez le remettre à l’expérimentateur. Les fichiers déjà téléchargés ne seront pas supprimés.',()=>{write(KEY.sessions,read(KEY.sessions,[]).filter(s=>s.id!==session.id));write(KEY.imports,read(KEY.imports,[]).filter(r=>r.participant_id!==session.id));session=null;intro();toast('Copie locale supprimée.');},'Supprimer');
  }
  function render(){
    if(session){showSession();return;}
    const page=participantMode?'experience':location.hash.slice(1)||'accueil';
    if(page==='experience')intro();else if(page==='donnees')dashboard();else home();
    window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('visibilitychange',()=>{
    const now=performance.now();
    if(clock){if(document.hidden){clock.hidden_events++;clock.hidden_start=now;}else if(clock.hidden_start!==null){clock.hidden_ms+=now-clock.hidden_start;clock.hidden_start=null;}}
    if(trainingTick){if(document.hidden&&trainingLast!==null)session.training_times[session.index]+=now-trainingLast;trainingLast=now;persist();}
  });
  window.addEventListener('beforeunload',e=>{if(session&&!['done','stopped'].includes(session.stage)){persist();e.preventDefault();e.returnValue='';}});
  window.addEventListener('hashchange',render);
  try{localStorage.setItem('va-storage-test','1');localStorage.removeItem('va-storage-test');}catch{storageOK=false;}
  render();
})();
