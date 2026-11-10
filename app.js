'use strict';
(() => {
  const STORAGE = 'cmdlab-win7-v1';
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
  const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stateDefault = ()=>({ student:'',group:'', steps:{},notes:{}, mini:{}, activeQuiz:null, quizHistory:[] });
  let state;
  try { state = {...stateDefault(),...JSON.parse(localStorage.getItem(STORAGE)||'{}')}; }catch{state=stateDefault();}
  state.steps ||= {}; state.notes ||= {}; state.mini ||= {}; state.quizHistory ||= [];
  let currentLesson='kezdes', activeTab='theory', referenceFilter='', referenceSafety='all', quizJustFinished=false;
  let toastTimer, timerInterval;
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{showToast('A böngésző nem engedte a helyi mentést.');}};
  const modById=id=>LAB.modules.find(m=>m.id===id) || LAB.modules[0];
  const stepKey=(mid,i)=>`${mid}:${i}`;
  const completed=()=>LAB.modules.reduce((n,m)=>n+m.steps.filter((_,i)=>Boolean(state.steps[stepKey(m.id,i)])).length,0);
  const totalSteps=()=>LAB.modules.reduce((n,m)=>n+m.steps.length,0);
  const doneMini=()=>LAB.modules.filter(m=>m.mini.every((q,i)=>Object.prototype.hasOwnProperty.call(state.mini,stepKey(m.id,i)))).length;
  const pct=()=>Math.round(100*(completed()+doneMini())/(totalSteps()+LAB.modules.length));
  const latestResult=()=>state.quizHistory.length?state.quizHistory[0]:null;
  const formatDate=t=>new Date(t).toLocaleString('hu-HU',{dateStyle:'short',timeStyle:'short'});
  const safeHTML=x=>esc(x).replace(/\n/g,'<br>');
  const badge=(kind)=>kind.startsWith('ELMÉLET')?'caution':kind==='CMD'?'safe':kind==='GUI'?'safe':'caution';
  const route=()=>decodeURIComponent(location.hash.replace(/^#\/?/,'')||'home');
  const showToast=msg=>{let el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2900)};
  function go(path){ location.hash='#/'+path; if(route()===path) render(); window.scrollTo({top:0,behavior:'instant'}); }
  function getBaseView(r){return r.startsWith('lesson/')?'lesson':r;}
  function render(){
    const r=route(), base=getBaseView(r);
    const supported=['home','lesson','quiz','reference','report'];
    const where=supported.includes(base)?base:'home';
    $$('.view').forEach(v=>v.hidden=v.id!==({home:'homeView',lesson:'lessonView',quiz:'quizView',reference:'referenceView',report:'reportView'}[where]));
    const lessonId=r.startsWith('lesson/')?r.split('/')[1]:'kezdes';
    if(where==='lesson')currentLesson=modById(lessonId).id;
    renderSidebar(where,currentLesson); renderTop(where);
    if(where==='home')renderHome();
    if(where==='lesson')renderLesson();
    if(where==='quiz')renderQuiz();
    if(where==='reference')renderReference();
    if(where==='report')renderReport();
    if(window.innerWidth<821){$('#sidebar').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false')}
  }
  function renderSidebar(where,lessonId){
    const nav=$('#sidebarNav');
    nav.innerHTML=`<button class="nav-btn ${where==='home'?'active':''}" data-goto="home"><span class="nav-icon">⌂</span>Áttekintés</button><div class="nav-sep"></div>`
      +LAB.modules.map(m=>`<button class="nav-btn ${where==='lesson'&&lessonId===m.id?'active':''}" data-goto="lesson/${m.id}"><span class="nav-icon">${m.number}</span><span>${esc(m.title)}</span>${m.steps.every((_,i)=>state.steps[stepKey(m.id,i)])?'<span class="mini-done">✓</span>':''}</button>`).join('')
      +`<div class="nav-sep"></div><button class="nav-btn ${where==='quiz'?'active':''}" data-goto="quiz"><span class="nav-icon">?</span>Záróteszt • 40 pont</button><button class="nav-btn ${where==='reference'?'active':''}" data-goto="reference"><span class="nav-icon">≡</span>Parancsgyűjtemény</button><button class="nav-btn ${where==='report'?'active':''}" data-goto="report"><span class="nav-icon">▣</span>Eredménylap</button>`;
  }
  function renderTop(where){
    const name=where==='home'?'Áttekintés':where==='lesson'?modById(currentLesson).title:({quiz:'Záróteszt',reference:'Parancsgyűjtemény',report:'Eredményeim'}[where]);
    $('#breadcrumb').innerHTML=`CMD LAB <span>/</span> ${esc(name)}`;
    $('#topProgress').style.width=pct()+'%';$('#topProgressText').textContent=pct()+'%';
  }
  function topology(){return `<div class="topology-wrap card"><div class="topology"><div class="topo-node"><div class="topo-symbol">🖥</div><strong>Windows 7 vendég</strong><small>1 × NAT hálózati kártya<br><b>10.0.2.15/24</b><br>DHCP: automatikus</small></div><div class="topo-link"></div><div class="topo-node nat"><div class="topo-symbol">⇄</div><strong>VirtualBox NAT</strong><small>Átjáró: <b>10.0.2.2</b><br>DNS proxy: gyakran <b>10.0.2.3</b></small></div><div class="topo-link"></div><div class="topo-node"><div class="topo-symbol">◉</div><strong>Külső hálózat</strong><small>Gazdagépen keresztül<br>Internetes szolgáltatások</small></div></div></div>`}
  function moduleCard(m){const n=m.steps.filter((_,i)=>state.steps[stepKey(m.id,i)]).length;let all=n===m.steps.length && m.mini.every((_,i)=>Object.hasOwn(state.mini,stepKey(m.id,i)));return `<div class="card module-card"><div class="module-top"><span class="module-number">MODUL ${m.number}</span><span class="state-text ${all?'complete':''}">${all?'✓ Befejezett':n?`${n}/${m.steps.length} feladat`:'Még nem kezdted'}</span></div><h3 style="margin-top:18px">${esc(m.title)}</h3><p style="font-size:12px;min-height:40px">${esc(m.subtitle)}</p><div class="progress-track"><span style="width:${Math.round(100*n/m.steps.length)}%"></span></div><div class="card-footer"><span>${m.minutes} perc · ${m.steps.length} feladat</span><button class="btn small outline" data-goto="lesson/${m.id}">${n?'Folytatás':'Megnyitás'} →</button></div></div>`}
  function renderHome(){
    $('#homeView').innerHTML=`<div class="hero"><div class="hero-inner"><div class="eyebrow">SZAKMAI GYAKORLAT · INTERAKTÍV TANULÓI MŰHELY</div><h1>CMD <span class="accent">LAB</span><br>Windows 7</h1><p class="lead">A hálózati és rendszeradminisztráció parancsai lépésről lépésre. Rövid elmélet, valódi VirtualBox-feladatok, azonnal javított mini tesztek és 40 pontos záróvizsga.</p><div class="pill-row"><span class="pill">Windows 7</span><span class="pill">1 × VirtualBox NAT</span><span class="pill">10.0.2.15 / DHCP</span><span class="pill">Önállóan, saját tempóban</span></div><div class="action-row"><button class="btn primary" data-goto="lesson/kezdes">Kezdés: laborindítás →</button><button class="btn white" data-goto="quiz">Záróteszt indítása ↗</button></div></div></div>
    <div class="stats"><div class="stat-card"><span class="stat-icon">▣</span><div><strong>${LAB.modules.length}</strong><small>tematikus modul</small></div></div><div class="stat-card"><span class="stat-icon">✓</span><div><strong>${completed()} / ${totalSteps()}</strong><small>elvégzett laborfeladat</small></div></div><div class="stat-card"><span class="stat-icon">★</span><div><strong>${latestResult()?latestResult().score+'/40':'– / 40'}</strong><small>utolsó teszteredmény</small></div></div></div>
    <div class="section-head"><div><div class="eyebrow">EGY GÉP, EGY NAT-KÁRTYA</div><h2>Így épül fel a labor</h2><p>A vendégcímet a NAT DHCP osztja, nem kell statikusan beállítani.</p></div></div>${topology()}
    <div class="callout warning" style="margin-top:15px"><strong>Fontos! Két különböző gyakorlási felület van.</strong><p>A valódi parancsokat a Windows 7 virtuális gépben kell futtatnod. Ez a weboldal a feladatokat, jegyzeteket és teszteket kezeli, de <strong>nem lát rá a virtuális gépedre</strong>, ezért az elvégzést te jelölöd.</p></div>
    <div class="section-head"><div><div class="eyebrow">TANULÁSI ÚTVONAL</div><h2>8 modul, végigvezetett feladatok</h2><p>A fejezeteket elmélettel, CMD-parancsokkal és rövid ellenőrző kérdésekkel dolgozhatod fel.</p></div><button class="btn secondary" data-goto="reference">Parancsok ABC-ben →</button></div>
    <div class="module-grid">${LAB.modules.map(moduleCard).join('')}</div>
    <div class="section-head"><div><div class="eyebrow">GYAKORLÁS KOCKÁZAT NÉLKÜL</div><h2>CMD-gyorspróba – szimuláció</h2><p>Ez <strong>nem valódi Windows terminál</strong>: csak néhány parancs jelentését próbálhatod ki az oldalon.</p></div></div><div class="terminal"><div class="term-bar"><span>CMD LAB / OKTATÁSI SZIMULÁTOR</span><span>Nem módosítja a gépet</span></div><div class="term-out" id="termOutput">Microsoft Windows 7 – oktatási parancsszimulátor\nÍrd be: help\n\n</div><div class="term-input-wrap"><label for="termInput">C:\\&gt;</label><input id="termInput" autocomplete="off" spellcheck="false" aria-label="Szimulált CMD parancs" placeholder="pl. ipconfig /all; ping 10.0.2.2; help"><button class="btn small primary" id="simRun">Futtatás</button></div></div>
    <div class="callout"><strong>GitHub Pages-kompatibilis:</strong> nincs szükség adatbázisra, szerveroldali kódra vagy belépésre. A bejelölt haladás és teszteredmények a böngésző helyi tárában maradnak. Iskolai közös gépen ne hagyj meg személyes adatot.</div>`;
  }
  function lessonTabs(){return `<div class="lesson-tabs" role="tablist" aria-label="Lecke részei"><button class="lesson-tab ${activeTab==='theory'?'active':''}" data-tab="theory">01 · Elmélet</button><button class="lesson-tab ${activeTab==='practice'?'active':''}" data-tab="practice">02 · Gyakorlat</button><button class="lesson-tab ${activeTab==='check'?'active':''}" data-tab="check">03 · Ellenőrző teszt</button></div>`}
  function renderLesson(){
    const m=modById(currentLesson), n=m.steps.filter((_,i)=>state.steps[stepKey(m.id,i)]).length;
    let content=`<div class="lesson-heading"><div class="eyebrow">${esc(m.number)}. MODUL · FELDOLGOZOTT RÉSZ: ${esc(m.pages)}</div><h1>${esc(m.title)}</h1><p>${esc(m.subtitle)}</p><div class="lesson-goals">${m.goals.map(x=>`<span class="goal-chip">✓ ${esc(x)}</span>`).join('')}</div><div class="steps-row"><b>${n}/${m.steps.length}</b> laborfeladat kipipálva <span>·</span> kb. ${m.minutes} perc</div></div>`+lessonTabs();
    if(activeTab==='theory'){
      content+=`<div class="reading">${m.theory.map((b,i)=>`<article class="card theory-block"><span class="eyebrow">TUDNIVALÓ ${String(i+1).padStart(2,'0')}</span><h3 style="margin-top:9px">${esc(b.title)}</h3><p>${b.body}</p></article>`).join('')}<div class="callout success"><strong>Megértetted az alapokat?</strong><p>Nyisd meg a gyakorlati részt, és futtasd a parancsokat a Windows 7 virtuális gépben. Az elvégzett lépéseket jelöld meg.</p><button class="btn primary" data-tab="practice">Tovább a gyakorlathoz →</button></div></div>`;
    }else if(activeTab==='practice'){
      content+=`<div class="callout warning" style="margin-bottom:17px"><strong>Elvégzés ellenőrzése:</strong> a jelölőnégyzetet akkor pipáld ki, ha a feladatot a virtuális gépen valóban megcsináltad vagy a kifejezetten elméleti lépést értelmezted. A jegyzetek mentése automatikus, és csak a böngésződben történik.</div>`;
      content+=m.steps.map((st,i)=>{
        const key=stepKey(m.id,i),kind=st.kind || 'CMD';
        return `<article class="lab-step" id="step-${i}"><div class="step-header"><span class="step-index">${m.number}.${String(i+1).padStart(2,'0')}</span><span class="step-tag ${badge(kind)}">${esc(kind)}</span></div><h3 class="step-title">${esc(st.title)}</h3><div class="step-copy"><p>${st.instruction}</p></div>${st.cmd?`<div class="command-box"><div class="command-head"><span><span class="dots">● ● ●</span> &nbsp; ${kind.startsWith('ELMÉLET')?'PARANCS – CSAK ELEMZÉS':'WINDOWS 7 PARANCSSOR'}</span><button class="copy-code" data-copy="${esc(st.cmd)}">Másolás ⧉</button></div><pre class="command">${esc(st.cmd)}</pre></div>`:''}<div class="step-expected"><strong>Elvárt eredmény: </strong>${esc(st.expected)}</div>${st.hint?`<button class="hint-trigger" data-hint="${esc(key)}">💡 Tipp megjelenítése</button><div class="hint-body" data-hint-body="${esc(key)}" hidden>${esc(st.hint)}</div>`:''}<label class="evidence-label" for="evidence-${i}">Saját megfigyelés / bizonyíték (jelszó nélkül)</label><textarea id="evidence-${i}" class="evidence-input" rows="2" placeholder="Pl. a kapott IPv4-cím, hibaüzenet, megfigyelés…" data-note="${esc(key)}">${esc(state.notes[key]||'')}</textarea><div class="step-actions"><label class="check-row"><input type="checkbox" data-step="${esc(key)}" ${state.steps[key]?'checked':''}><span>Elvégeztem a feladatot</span></label><span class="notice-inline">${state.steps[key]?'✓ Teljesítve':'Még nincs kész'}</span></div></article>`;
      }).join('');
      content+=`<div class="lesson-footer-actions"><button class="btn secondary" data-tab="theory">← Elmélet</button><button class="btn primary" data-tab="check">Ellenőrző kérdések →</button></div>`;
    }else{
      const nanswered=m.mini.filter((_,i)=>Object.hasOwn(state.mini,stepKey(m.id,i))).length;
      content+=`<div class="card mini-quiz"><div class="eyebrow">TUDÁSPRÓBA · AZONNALI VISSZAJELZÉS</div><h2 style="margin-top:10px">${esc(m.title)} – mini teszt</h2><p>${nanswered}/${m.mini.length} kérdés megválaszolva. Ezek nem számítanak bele a 40 pontos zárótesztbe.</p>${m.mini.map((q,i)=>{
         const key=stepKey(m.id,i),saved=state.mini[key],isAnswered=Object.hasOwn(state.mini,key);
         return `<div class="mini-q"><h4>${i+1}. ${esc(q.q)}</h4>${q.a.map((a,j)=>`<label class="mini-choice"><input type="radio" name="mq-${m.id}-${i}" value="${j}" data-mini="${esc(key)}" ${saved===j?'checked':''}><span>${esc(a)}</span></label>`).join('')}<div class="feedback ${isAnswered?(saved===q.correct?'good':'bad'):''}" ${isAnswered?'':'hidden'} id="feedback-${i}">${isAnswered?(saved===q.correct?'✓ Helyes válasz. ':'✗ Nem ez a helyes válasz. ')+esc(q.why):''}</div></div>`
      }).join('')}<div class="lesson-footer-actions"><button class="btn secondary" data-tab="practice">← Gyakorlati feladatok</button><button class="btn dark" data-goto="quiz">40 pontos záróteszt →</button></div></div>`;
    }
    const idx=LAB.modules.findIndex(z=>z.id===m.id), next=LAB.modules[idx+1];
    if(next)content+=`<div class="lesson-footer-actions"><button class="btn outline" data-goto="home">← Modulok</button><button class="btn secondary" data-goto="lesson/${next.id}">Következő: ${esc(next.title)} →</button></div>`;
    $('#lessonView').innerHTML=content;
  }
  function shuffle(input){let a=input.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function startQuiz(){if(state.activeQuiz && !confirm('A folyamatban lévő teszt újrakezdése törli annak válaszait. Új tesztet kezdj?'))return;
    quizJustFinished=false;
    const questions=shuffle(LAB.questions).slice(0,LAB.examCount).map(q=>({id:q.id,order:shuffle([0,1,2,3])}));
    state.activeQuiz={startedAt:Date.now(),endAt:Date.now()+LAB.duration*60000,at:0,questions,answers:{},flags:{}};save();go('quiz');
  }
  function endQuiz(expired=false){const a=state.activeQuiz;if(!a)return;
    const items=a.questions.map(entry=>{const q=LAB.questions.find(z=>z.id===entry.id);let answer=Object.hasOwn(a.answers,q.id)?a.answers[q.id]:null;return {id:q.id,answer,correct:q.correct,good:answer===q.correct};});
    const good=items.filter(x=>x.good).length, score=good*LAB.pointsPerQuestion;
    state.quizHistory.unshift({date:Date.now(),duration:Math.min(LAB.duration*60,Math.round((Date.now()-a.startedAt)/1000)),score,good,total:items.length,items,expired});
    state.quizHistory=state.quizHistory.slice(0,10); state.activeQuiz=null;quizJustFinished=true;save();render();showToast(expired?'Lejárt az idő. A dolgozat automatikusan lezárult.':'A teszt kiértékelése elkészült.');
  }
  const formatTime=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  function updateTimer(){const a=state.activeQuiz;if(!a)return;const rem=Math.max(0,Math.ceil((a.endAt-Date.now())/1000));const target=$('#timeLeft');if(target)target.textContent=formatTime(rem);if(rem<=0)endQuiz(true)}
  function renderQuiz(){const view=$('#quizView');const a=state.activeQuiz;
    if(!a && quizJustFinished && latestResult()){const last=latestResult();view.innerHTML=`<div class="lesson-heading"><div class="eyebrow">ZÁRÓTESZT · KIÉRTÉKELVE</div><h1>Elkészült az eredményed!</h1><p>${last.expired?'Lejárt a rendelkezésre álló 45 perc.':'A tesztet sikeresen lezártad.'} Az alábbi eredmény a válaszaidból automatikusan számítódott.</p></div><div class="card quiz-results"><div class="eyebrow">ELÉRT PONTSZÁM</div><div class="result-number">${last.score}<small> / 40 pont</small></div><h2>${Math.round(last.score/40*100)}% · Javasolt osztályzat: ${grade(last.score)}</h2><p>${last.good} helyes válasz 20 kérdésből. A hibás és kihagyott válaszaidnál láthatod a helyes megoldást és a rövid magyarázatot.</p><div class="action-row"><button class="btn primary" data-goto="report">Részletes eredménylap →</button><button class="btn secondary" data-action="start-quiz">Új gyakorlóteszt</button></div></div><section class="card report-section" style="margin-top:14px"><h3>Megoldások és magyarázatok</h3>${last.items.map((item,i)=>{const q=LAB.questions.find(x=>x.id===item.id);return `<div class="review-q"><strong>${i+1}. ${esc(q.q)}</strong><div class="${item.good?'review-good':'review-bad'}">${item.good?'✓':'✗'} Saját válasz: ${item.answer===null?'Nincs válasz':esc(q.a[item.answer])}</div><div>Helyes válasz: <strong>${esc(q.a[q.correct])}</strong></div><p>${esc(q.why)}</p></div>`}).join('')}</section>`;return;}
    if(!a){const last=latestResult();view.innerHTML=`<div class="lesson-heading"><div class="eyebrow">TUDÁSFELMÉRŐ · 45 PERC</div><h1>CMD LAB záróteszt</h1><p>20 véletlenszerűen kiválasztott kérdés a teljes tananyagból. Minden helyes válasz 2 pontot ér.</p></div><div class="card quiz-setup"><h2>Készen állsz a kihívásra?</h2><p>A kérdések és a válaszok sorrendje minden alkalommal változik. Kihagyhatsz kérdést, visszaléphetsz, és megjelölheted azokat, amelyekre még vissza akarsz térni. Az időmérő oldalfrissítés után is folytatódik.</p><div class="quiz-meta"><div><strong>20</strong><small>kérdés</small></div><div><strong>45:00</strong><small>időkorlát</small></div><div><strong>40</strong><small>maximális pont</small></div></div><div class="callout"><strong>Értékelés:</strong> 85% felett jeles (5), 70%-tól jó (4), 55%-tól közepes (3), 40%-tól elégséges (2); ez <strong>javasolt gyakorlóértékelés</strong>, a tanári szabályozás eltérhet.</div><div class="action-row"><button class="btn primary" data-action="start-quiz">Teszt indítása →</button>${last?'<button class="btn secondary" data-goto="report">Előző eredmény megtekintése</button>':''}</div></div>`;return;}
    const entry=a.questions[a.at],q=LAB.questions.find(x=>x.id===entry.id), val=a.answers[q.id], answered=Object.keys(a.answers).length;
    view.innerHTML=`<div class="lesson-heading"><div class="eyebrow">VIZSGAMÓD · 20 KÉRDÉS · 40 PONT</div><h1>Interaktív záróteszt</h1><p>A megjelölt kérdésekhez a számokra kattintva bármikor visszatérhetsz.</p></div><div class="quiz-toolbar"><div><b>${a.at+1}. / 20. kérdés</b><div class="tag-note">${answered}/20 megválaszolva</div></div><div><span class="tag-note">HÁTRALÉVŐ IDŐ</span> <strong id="timeLeft" style="font:900 19px Consolas;color:#244f9d"></strong></div><button class="btn small outline" data-action="finish-quiz">Befejezés és értékelés</button></div>
      <div class="card quiz-question"><div class="quiz-n">KÉRDÉS ${String(a.at+1).padStart(2,'0')} · 2 PONT</div><h3 style="font-size:21px;margin:12px 0 20px">${esc(q.q)}</h3>${entry.order.map((answerIdx,i)=>`<label class="quiz-option ${val===answerIdx?'selected':''}"><input type="radio" name="exam-choice" data-exam-choice="${answerIdx}" ${val===answerIdx?'checked':''}><strong>${'ABCD'[i]}.</strong><span>${esc(q.a[answerIdx])}</span></label>`).join('')}<div class="quiz-bottom"><button class="btn secondary" data-action="flag-quiz">${a.flags[q.id]?'⚑ Jelölés törlése':'⚑ Megjelölöm későbbre'}</button><button class="btn outline" data-action="clear-answer">Válasz törlése</button></div></div>
      <div class="card" style="padding:17px 20px;margin-bottom:16px"><h4>Ugrás kérdésre</h4><div class="quiz-nav-grid">${a.questions.map((e,i)=>`<button class="quiz-nav-item ${a.answers[e.id]!==undefined?'answered':''} ${a.flags[e.id]?'flagged':''} ${a.at===i?'current':''}" data-quiz-index="${i}" aria-label="${i+1}. kérdés">${i+1}</button>`).join('')}</div><div class="tag-note" style="margin-top:11px">Kék: megválaszolt · Narancs keret: megjelölt · Sötét: aktuális</div></div>
      <div class="quiz-bottom"><button class="btn secondary" data-action="quiz-prev" ${a.at===0?'disabled':''}>← Előző</button><button class="btn primary" data-action="quiz-next">${a.at===19?'Áttekintés és lezárás →':'Következő →'}</button></div>`;
    updateTimer();
  }
  function renderReference(){const items=LAB.reference.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(referenceFilter.toLowerCase())&&(referenceSafety==='all'||(referenceSafety==='safe'?x[2]==='Biztonságos':x[2]!=='Biztonságos')));
    $('#referenceView').innerHTML=`<div class="lesson-heading"><div class="eyebrow">GYORSPUSKA · KERESHETŐ</div><h1>CMD parancsgyűjtemény</h1><p>A feldolgozott 5–14. oldal témái, a Windows 7-es NAT-laborhoz igazítva. A Másolás gomb a saját CMD-ablakodban használható parancsot másolja.</p></div><div class="filter-row"><input class="field" id="referenceSearch" value="${esc(referenceFilter)}" placeholder="Keress parancsot vagy fogalmat…"><select class="field" id="safetyFilter"><option value="all" ${referenceSafety==='all'?'selected':''}>Összes parancs</option><option value="safe" ${referenceSafety==='safe'?'selected':''}>Csak lekérdezések</option><option value="care" ${referenceSafety==='care'?'selected':''}>Körültekintéssel</option></select></div><table class="utility-table"><thead><tr><th>Parancs</th><th>Feladat</th><th>Jelleg</th><th></th></tr></thead><tbody>${items.map(x=>`<tr><td><code>${esc(x[0])}</code></td><td>${esc(x[1])}</td><td><span class="tag-note">${esc(x[2])}</span></td><td><button class="copy-code" data-copy="${esc(x[0])}">Másolás</button></td></tr>`).join('')}</tbody></table>${!items.length?'<p class="empty-state">Nincs találat. Próbálj másik keresőszót!</p>':''}<div class="callout warning" style="margin-top:20px"><strong>Figyelem:</strong> a másolás nem jelent felhatalmazást a futtatásra. A módosító parancsokat kizárólag a tananyag megfelelő, biztonságos feladatában használd.</div>`;
  }
  function grade(score){let p=score/40*100;return p>=85?5:p>=70?4:p>=55?3:p>=40?2:1}
  function renderReport(){const result=latestResult();const mdata=LAB.modules.map(m=>({m,n:m.steps.filter((_,i)=>state.steps[stepKey(m.id,i)]).length}));
    $('#reportView').innerHTML=`<div class="screen-only"><div class="lesson-heading"><div class="eyebrow">SAJÁT HALADÁS · LOKÁLIS ADATOK</div><h1>Tanulói eredménylap</h1><p>A feladatjelölések és a teszteredmények csak ezen az eszközön, ebben a böngészőprofilban láthatók. Az eredménylapot a böngésző Nyomtatás → Mentés PDF-ként funkciójával adhatod le.</p></div><div class="report-grid"><section class="card report-section"><h3>Tanuló adatai</h3><p style="font-size:12px">Az adatokat csak az eredménylap elkészítéséhez tároljuk helyben.</p><div class="form-row"><div><label class="field-label" for="studentName">Név</label><input class="field" id="studentName" value="${esc(state.student)}" placeholder="Tanuló neve"></div><div><label class="field-label" for="studentGroup">Osztály / csoport</label><input class="field" id="studentGroup" value="${esc(state.group)}" placeholder="Pl. 12.A"></div></div></section><section class="card report-section"><h3>Összesített haladás</h3><div class="report-meter"><div><strong>${pct()}%</strong><small>laborhaladás</small></div><div><strong>${completed()}/${totalSteps()}</strong><small>feladatjelölés</small></div><div><strong>${doneMini()}/8</strong><small>mini teszt</small></div></div></section></div>
       <div class="report-grid" style="margin-top:14px"><section class="card report-section"><h3>Modulonként</h3>${mdata.map(d=>`<div class="report-module"><span>${esc(d.m.title)}</span><strong>${d.n}/${d.m.steps.length}</strong></div>`).join('')}</section><section class="card report-section"><h3>Legutóbbi záróteszt</h3>${result?`<span class="achievement">${result.score} / 40 pont</span><div class="result-number" style="margin-top:15px">${result.score}<small> / 40</small></div><p>${Math.round(result.score/40*100)}% · Javasolt osztályzat: <strong>${grade(result.score)}</strong><br>${formatDate(result.date)}</p><button class="btn secondary" data-goto="quiz">Új záróteszt</button>`:`<p>Még nem töltöttél ki zárótesztet.</p><button class="btn primary" data-goto="quiz">Záróteszt megnyitása →</button>`}</section></div>
       <div class="card report-section" style="margin-top:14px"><h3>Teszteredmények (legutóbbi 10)</h3>${state.quizHistory.length?`<table class="utility-table"><thead><tr><th>Dátum</th><th>Pont</th><th>Százalék</th><th>Osztályzat</th></tr></thead><tbody>${state.quizHistory.map(x=>`<tr><td>${formatDate(x.date)}</td><td>${x.score}/40</td><td>${Math.round(x.score/40*100)}%</td><td>${grade(x.score)}</td></tr>`).join('')}</tbody></table>`:'<p>Még nincs kitöltött záróteszt.</p>'}</div>
       ${result?`<div class="card report-section" style="margin-top:14px"><h3>Legutóbbi teszt megoldásai</h3><p>Részletes magyarázat minden kérdéshez.</p>${result.items.map((x,i)=>{const q=LAB.questions.find(z=>z.id===x.id);return `<div class="review-q"><strong>${i+1}. ${esc(q.q)}</strong><div class="${x.good?'review-good':'review-bad'}">${x.good?'✓':'✗'} Saját válasz: ${x.answer===null?'Nincs válasz':esc(q.a[x.answer])}</div><div>Helyes megoldás: <strong>${esc(q.a[q.correct])}</strong></div><p>${esc(q.why)}</p></div>`}).join('')}</div>`:''}
       <div class="action-row"><button class="btn primary" data-action="print-report">⎙ Eredménylap nyomtatása / PDF</button><button class="btn secondary" data-action="export-json">Saját adatok mentése (.json)</button><button class="btn outline" data-action="show-reset">Haladás törlése</button></div><div class="callout warning" style="margin-top:16px"><strong>Iskolai leadás:</strong> az eredménylap önbevallásos feladatjelöléseket tartalmaz, nem bizonyítja automatikusan a VM-ben végrehajtott parancsokat. A tanár kérhet képernyőképeket vagy a virtuális gép bemutatását.</div></div>
       <section id="printReport" class="print-only"><h1>CMD LAB – gyakorlati eredménylap</h1><p><strong>Windows 7 / VirtualBox NAT • 10.0.2.15</strong></p><p><strong>Tanuló:</strong> ${esc(state.student)||'____________________'} &nbsp; <strong>Osztály:</strong> ${esc(state.group)||'_________'}<br><strong>Nyomtatás:</strong> ${new Date().toLocaleDateString('hu-HU')}</p><h2>Feladatok teljesítése</h2><table><thead><tr><th>Modul</th><th>Teljesített</th><th>Összes</th></tr></thead><tbody>${mdata.map(d=>`<tr><td>${esc(d.m.title)}</td><td>${d.n}</td><td>${d.m.steps.length}</td></tr>`).join('')}</tbody></table><h2>Záróteszt</h2>${result?`<p><strong>${result.score} / 40 pont (${Math.round(result.score/40*100)}%)</strong> · javasolt osztályzat: ${grade(result.score)} · ${formatDate(result.date)}</p><table><thead><tr><th>#</th><th>Kérdés</th><th>Saját válasz</th><th>Helyes válasz</th><th>Pont</th></tr></thead><tbody>${result.items.map((x,i)=>{const q=LAB.questions.find(z=>z.id===x.id);return `<tr><td>${i+1}</td><td>${esc(q.q)}</td><td>${x.answer===null?'–':esc(q.a[x.answer])}</td><td>${esc(q.a[q.correct])}</td><td>${x.good?2:0}</td></tr>`}).join('')}</tbody></table>`:'<p>Még nincs megírt záróteszt.</p>'}<p><strong>Fontos:</strong> a gyakorlati teljesítéseket a tanuló jelölte meg; a tényleges VM-beállításokat szükség esetén külön be kell mutatni.</p><div class="signature"><span>____________________________<br>Tanuló</span><span>____________________________<br>Oktató</span></div></section>`;
  }
  function simulate(value){const out=$('#termOutput');if(!out)return;const cmd=value.trim();if(!cmd)return;
    let result='';const c=cmd.toLowerCase();
    if(c==='help')result='Elérhető szimulált parancsok:\nipconfig /all\ngetmac\narp -a\nping 10.0.2.2\nnslookup example.com\nnet user\ntasklist\nsysteminfo\ncls\nhelp\n\nAz igazi műveleteket a Windows 7 VM parancssorában végezd!';
    else if(c==='cls'){out.textContent='';return;}
    else if(c==='ipconfig /all')result='[SZIMULÁLT KIMENET – NEM A VALÓDI GÉPED ADATA]\nWindows IP-konfiguráció\nAdapter: Helyi kapcsolat\nDHCP engedélyezve: Igen\nIPv4-cím: 10.0.2.15\nAlhálózati maszk: 255.255.255.0\nAlapértelmezett átjáró: 10.0.2.2\nDNS: 10.0.2.3 (példa)';
    else if(c==='getmac')result='[SZIMULÁLT KIMENET]\nMAC-cím: 08-00-27-12-34-56 (csak példa)';
    else if(c==='arp -a')result='[SZIMULÁLT KIMENET]\nInternet Address       Physical Address        Type\n10.0.2.2               52-54-00-12-35-02       dynamic';
    else if(c==='ping 10.0.2.2')result='[SZIMULÁLT KIMENET]\nVálasz 10.0.2.2: bájt=32 idő<1ms TTL=64\nKüldött: 4, Fogadott: 4, Elveszett: 0\nAz igazi válasz változhat.';
    else if(c==='nslookup example.com')result='[SZIMULÁLT KIMENET]\nServer: NAT DNS proxy (példa)\nName: example.com\nAddresses: a tényleges értéket a VM-ben kérdezd le!';
    else if(c==='net user')result='[SZIMULÁLT KIMENET]\nAdministrator  Guest  Diak';
    else if(c==='tasklist')result='[SZIMULÁLT KIMENET]\nImage Name           PID\nexplorer.exe         1090\ncmd.exe              1452';
    else if(c==='systeminfo')result='[SZIMULÁLT KIMENET]\nOperációs rendszer: Windows 7 (tanulási példa)\nGép neve: WIN7-LAB';
    else result='Ez a parancs nem szerepel a szimulátorban. A Windows 7 virtuális gépben próbáld ki, vagy írd be: help';
    out.textContent+=`C:\\> ${cmd}\n${result}\n\n`;out.scrollTop=out.scrollHeight;
  }
  function copyText(txt){if(navigator.clipboard?.writeText){navigator.clipboard.writeText(txt).then(()=>showToast('Parancs másolva.')).catch(()=>fallbackCopy(txt));}else fallbackCopy(txt)}
  function fallbackCopy(txt){let ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();let yes=document.execCommand('copy');ta.remove();showToast(yes?'Parancs másolva.':'Jelöld ki a parancsot kézzel.');}
  function exportJson(){const data={application:'CMD LAB Windows 7',generatedAt:new Date().toISOString(),student:state.student,group:state.group,steps:state.steps,notes:state.notes,mini:state.mini,quizHistory:state.quizHistory};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cmdlab-eredmenyek.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
  function handleClick(ev){let el=ev.target.closest('[data-goto],[data-tab],[data-copy],[data-hint],[data-action],[data-quiz-index],#simRun');if(!el)return;
    if(el.dataset.goto){activeTab='theory';go(el.dataset.goto);return}
    if(el.dataset.tab){activeTab=el.dataset.tab;renderLesson();window.scrollTo({top:0,behavior:'instant'});return}
    if(el.dataset.copy){copyText(el.dataset.copy);return}
    if(el.dataset.hint){const body=document.querySelector(`[data-hint-body="${el.dataset.hint}"]`);if(body){body.hidden=!body.hidden;el.textContent=body.hidden?'💡 Tipp megjelenítése':'💡 Tipp elrejtése'}return}
    if(el.dataset.quizIndex!==undefined){state.activeQuiz.at=Number(el.dataset.quizIndex);save();renderQuiz();return}
    if(el.id==='simRun'){const inp=$('#termInput');simulate(inp.value);inp.value='';inp.focus();return}
    const action=el.dataset.action,a=state.activeQuiz;
    if(action==='start-quiz')startQuiz();
    else if(action==='quiz-prev'&&a){a.at=Math.max(0,a.at-1);save();renderQuiz()}
    else if(action==='quiz-next'&&a){if(a.at===19){const missing=a.questions.filter(e=>a.answers[e.id]===undefined).length;if(confirm(`Elérted az utolsó kérdést. ${missing} kérdés még megválaszolatlan. Leadod a tesztet?`))endQuiz();}else{a.at++;save();renderQuiz();}}
    else if(action==='finish-quiz'&&a){const missing=a.questions.filter(e=>a.answers[e.id]===undefined).length;if(confirm(`Biztosan befejezed? ${missing} megválaszolatlan kérdésed van. Ezek 0 pontot érnek.`))endQuiz();}
    else if(action==='flag-quiz'&&a){const id=a.questions[a.at].id;a.flags[id]=!a.flags[id];save();renderQuiz()}
    else if(action==='clear-answer'&&a){delete a.answers[a.questions[a.at].id];save();renderQuiz()}
    else if(action==='print-report'){renderReport();window.print()}
    else if(action==='export-json')exportJson();
    else if(action==='show-reset')$('#confirmModal').hidden=false;
  }
  function handleChange(ev){const t=ev.target;
    if(t.dataset.step){state.steps[t.dataset.step]=t.checked;save();const label=t.closest('.step-actions').querySelector('.notice-inline');label.textContent=t.checked?'✓ Teljesítve':'Még nincs kész';renderTop('lesson');renderSidebar('lesson',currentLesson);return}
    if(t.dataset.mini){state.mini[t.dataset.mini]=Number(t.value);save();renderLesson();return}
    if(t.dataset.examChoice!==undefined&&state.activeQuiz){const a=state.activeQuiz;a.answers[a.questions[a.at].id]=Number(t.dataset.examChoice);save();renderQuiz();return}
    if(t.id==='safetyFilter'){referenceSafety=t.value;renderReference();return}
  }
  function init(){document.addEventListener('click',handleClick);document.addEventListener('change',handleChange);
    document.addEventListener('input',ev=>{const t=ev.target;if(t.dataset.note){state.notes[t.dataset.note]=t.value;save();}else if(t.id==='studentName'){state.student=t.value;save();}else if(t.id==='studentGroup'){state.group=t.value;save();}else if(t.id==='referenceSearch'){referenceFilter=t.value;const start=t.selectionStart;renderReference();const input=$('#referenceSearch');input.focus();input.setSelectionRange(start,start);}});
    document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='termInput'){ev.preventDefault();simulate(ev.target.value);ev.target.value='';}});
    $('#menuToggle').addEventListener('click',()=>{const nav=$('#sidebar');nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(nav.classList.contains('open')))});
    $('#cancelReset').addEventListener('click',()=>$('#confirmModal').hidden=true);
    $('#confirmReset').addEventListener('click',()=>{state=stateDefault();save();$('#confirmModal').hidden=true;go('home');showToast('Helyi adatok és haladás törölve.')});
    $('#confirmModal').addEventListener('click',ev=>{if(ev.target.id==='confirmModal')$('#confirmModal').hidden=true});
    window.addEventListener('hashchange',()=>{activeTab='theory';render()});
    timerInterval=setInterval(updateTimer,1000);
    render();
  }
  init();
})();
