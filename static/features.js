(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toast = (message) => { const el=$("#siteToast"); if(el){el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2600);} };
  const cards = $$(".project-card");
  const projectData = cards.map(card => ({name:$("h3",card)?.textContent.trim(), description:$("p",card)?.textContent.trim(), tags:$$('.chips span',card).map(x=>x.textContent.trim()), slug:card.dataset.slug, url:$(".project-live",card)?.href}));
  const readStore=(key, fallback)=>{try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch(_){return fallback}};
  const writeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}};

  // 1-6: Pomodoro timer with start, pause, reset, and break cycle.
  let seconds=1500, timer=null, isBreak=false;
  const timerLabel=$("#pomodoroTime"), timerStatus=$("#pomodoroStatus"), startBtn=$("#pomodoroStart");
  const renderTimer=()=>{if(timerLabel)timerLabel.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`};
  startBtn?.addEventListener("click",()=>{if(timer){clearInterval(timer);timer=null;startBtn.textContent="Продолжить";if(timerStatus)timerStatus.textContent="Пауза";return;}startBtn.textContent="Пауза";if(timerStatus)timerStatus.textContent=isBreak?"Перерыв":"Фокус-сессия";timer=setInterval(()=>{seconds--;renderTimer();if(seconds<=0){clearInterval(timer);timer=null;isBreak=!isBreak;seconds=isBreak?300:1500;renderTimer();startBtn.textContent="Старт";if(timerStatus)timerStatus.textContent=isBreak?"Время отдохнуть! Перерыв 5 минут.":"Перерыв окончен. Новая сессия готова.";toast(timerStatus?.textContent||"Таймер завершён");}},1000);});
  $("#pomodoroReset")?.addEventListener("click",()=>{clearInterval(timer);timer=null;isBreak=false;seconds=1500;renderTimer();if(startBtn)startBtn.textContent="Старт";if(timerStatus)timerStatus.textContent="Готов к работе";});

  // 7-9: persistent notes and text statistics.
  const note=$("#quickNote"), noteStatus=$("#noteStatus"); if(note){note.value=localStorage.getItem("ix-quick-note")||"";}
  $("#saveNote")?.addEventListener("click",()=>{localStorage.setItem("ix-quick-note",note?.value||"");if(noteStatus)noteStatus.textContent="Сохранено в этом браузере ✓";toast("Заметка сохранена");});
  $("#clearNote")?.addEventListener("click",()=>{if(note)note.value="";localStorage.removeItem("ix-quick-note");if(noteStatus)noteStatus.textContent="Заметка очищена";});
  const wordText=$("#wordText");wordText?.addEventListener("input",()=>{const v=wordText.value.trim();const words=v?v.split(/\s+/u).length:0;$("#wordCount").innerHTML=`${words} <small>слов</small>`;$("#charCount").innerHTML=`${wordText.value.length} <small>символов</small>`;$("#readTime").innerHTML=`${words?Math.max(1,Math.ceil(words/200)):0} <small>мин чтения</small>`;});

  // 10: project compare toggles on cards.
  const compare=new Set(readStore("ix-compare",[]));
  cards.forEach(card=>{const b=document.createElement("button");b.type="button";b.className="project-compare";b.textContent="⇄ Сравнить";b.setAttribute("aria-pressed",String(compare.has(card.dataset.slug)));$(".project-card-actions",card)?.append(b);b.addEventListener("click",()=>{if(compare.has(card.dataset.slug))compare.delete(card.dataset.slug);else if(compare.size<3)compare.add(card.dataset.slug);else return toast("Можно сравнить максимум 3 проекта");writeStore("ix-compare",[...compare]);b.setAttribute("aria-pressed",String(compare.has(card.dataset.slug)));renderCompare();});});
  function renderCompare(){const out=$("#compareOutput");if(!out)return;const chosen=projectData.filter(p=>compare.has(p.slug));out.innerHTML=chosen.length?chosen.map(p=>`<div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.tags.join(" · "))}</small></div>`).join(""):"Пока ничего не выбрано.";}
  function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  renderCompare();
  $("#clearCompare")?.addEventListener("click",()=>{compare.clear();writeStore("ix-compare",[]);$$('.project-compare').forEach(b=>b.setAttribute("aria-pressed","false"));renderCompare();});

  // 11-14: random project, JSON export, print, reading mode.
  const randomOut=$("#randomProject");$("#randomProjectButton")?.addEventListener("click",()=>{const p=projectData[Math.floor(Math.random()*projectData.length)];if(p&&randomOut)randomOut.innerHTML=`<b>${escapeHtml(p.name)}</b><br>${escapeHtml(p.description)}<br><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Открыть проект ↗</a>`;});
  $("#exportProjects")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify(projectData,null,2)],{type:"application/json"});downloadBlob(blob,"ixlosbek-projects.json");});
  function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  $("#printPortfolio")?.addEventListener("click",()=>window.print());
  $("#readingMode")?.addEventListener("click",e=>{document.documentElement.classList.toggle("reading-mode");e.currentTarget.textContent=document.documentElement.classList.contains("reading-mode")?"Выключить режим чтения":"Включить режим чтения";});
  $("#fontSizeToggle")?.addEventListener("click",()=>{document.documentElement.classList.toggle("large-type");toast("Размер текста изменён");});

  // 15-18: accent, effects, preferences and favorites management.
  const accents=["#c5ff5a","#62e6df","#a78bfa","#ff9d6c","#ff6fae"];let accentIndex=Number(localStorage.getItem("ix-accent-index")||0)%accents.length;
  const applyAccent=()=>document.documentElement.style.setProperty("--accent",accents[accentIndex]);applyAccent();
  $("#cycleAccent")?.addEventListener("click",()=>{accentIndex=(accentIndex+1)%accents.length;localStorage.setItem("ix-accent-index",accentIndex);applyAccent();toast("Акцентный цвет обновлён");});
  $("#toggleEffects")?.addEventListener("click",e=>{const paused=document.documentElement.dataset.effects!=="paused";document.documentElement.dataset.effects=paused?"paused":"live";e.currentTarget.textContent=`Эффекты: ${paused?"выкл.":"вкл."}`;$("#atmosphereToggle")?.click();});
  $("#resetPreferences")?.addEventListener("click",()=>{localStorage.removeItem("ix-accent-index");localStorage.removeItem("portfolio-theme");accentIndex=0;applyAccent();document.documentElement.dataset.theme="dark";document.documentElement.classList.remove("reading-mode","large-type");toast("Настройки сброшены");});
  function favoriteList(){return readStore("ix-favorites",[])}
  function refreshFavorites(){const list=favoriteList();const summary=$("#favoritesSummary");if(summary)summary.textContent=list.length?`Сохранено проектов: ${list.length} — ${list.join(", ")}`:"Избранных проектов пока нет.";}
  $("#clearFavorites")?.addEventListener("click",()=>{writeStore("ix-favorites",[]);$$('.project-save').forEach(b=>{b.setAttribute("aria-pressed","false");b.textContent="☆";});$("#favoriteCount")&&( $("#favoriteCount").textContent="0");refreshFavorites();toast("Избранное очищено");});refreshFavorites();

  // 19-22: quick navigation, sharing, copy and shortcut support.
  $("#openCommands")?.addEventListener("click",()=>$("#paletteToggle")?.click());
  $("#sharePortfolio")?.addEventListener("click",async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);toast("Ссылка скопирована");}}catch(_){}});
  $("#sharePortfolio")?.addEventListener("dblclick",()=>toast("Ссылка на портфолио"));
  $("#surpriseProject")?.addEventListener("click",()=>{$("#randomProjectButton")?.click();$("#lab")?.scrollIntoView({behavior:"smooth"});});
  document.addEventListener("keydown",e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey){const map={h:"#home",p:"#projects",s:"#skills",l:"#lab",a:"#assistant"};if(map[e.key.toLowerCase()]){e.preventDefault();$(map[e.key.toLowerCase()])?.scrollIntoView({behavior:"smooth"});}}});

  // Local scripted chat: server endpoint, conversation history, export and clear.
  const form=$("#assistantForm"), input=$("#assistantInput"), messages=$("#assistantMessages"), aiMode=$("#aiModeLabel");
  let history=readStore("ix-ai-history",[]);
  const csrf=$("[name=csrfmiddlewaretoken]",form)?.value||"";
  const addChat=(content,role)=>{const p=document.createElement("p");p.className=`assistant-message ${role==="user"?"assistant-question":"assistant-answer"}`;p.textContent=content;messages?.append(p);if(messages)messages.scrollTop=messages.scrollHeight;};
  if(messages&&history.length){messages.replaceChildren();history.slice(-20).forEach(m=>addChat(m.content,m.role));}
  form?.addEventListener("submit",async e=>{e.preventDefault();const message=input?.value.trim();if(!message)return;addChat(message,"user");history.push({role:"user",content:message});if(input)input.value="";const loading=document.createElement("p");loading.className="assistant-message assistant-answer";loading.textContent="IX Assistant подбирает ответ…";messages?.append(loading);if(messages)messages.scrollTop=messages.scrollHeight;const submit=$("button[type=submit]",form);if(submit)submit.disabled=true;
    try{const res=await fetch("/api/ai/chat/",{method:"POST",headers:{"Content-Type":"application/json","X-CSRFToken":csrf},body:JSON.stringify({message,history:history.slice(-8,-1)})});const data=await res.json();loading.remove();if(!res.ok)throw new Error(data.error||"Ошибка чата");addChat(data.reply,"assistant");history.push({role:"assistant",content:data.reply});history=history.slice(-30);writeStore("ix-ai-history",history);if(aiMode)aiMode.textContent="РЕЖИМ: ЛОКАЛЬНЫЙ · БЕЗ API";}
    catch(err){loading.remove();addChat(`${err.message}. Попробуй ещё раз чуть позже.`,"assistant");if(aiMode)aiMode.textContent="ЛОКАЛЬНЫЙ ЧАТ НЕДОСТУПЕН";}finally{if(submit)submit.disabled=false;input?.focus();}});
  $("#clearAiChat")?.addEventListener("click",()=>{history=[];writeStore("ix-ai-history",[]);messages?.replaceChildren();addChat("Чат очищен. Чем могу помочь?","assistant");});
  $("#exportAiChat")?.addEventListener("click",()=>downloadBlob(new Blob([history.map(m=>`${m.role==="user"?"Вы":"IX AI"}: ${m.content}`).join("\n\n")],{type:"text/plain;charset=utf-8"}),"ix-ai-chat.txt"));
  $$("[data-ask]").forEach(b=>b.addEventListener("click",()=>{if(input){input.value=b.dataset.ask;form?.requestSubmit();}}));
})();


  // 23-30: playful mini-games for visitors.
  const reactionBtn=document.querySelector('#reactionStart'), reactionOut=document.querySelector('#reactionResult'), reactionBest=document.querySelector('#reactionBest');
  let reactionTimer=null,reactionStarted=0,reactionWaiting=false;
  if(reactionBest){const best=localStorage.getItem('ix-reaction-best');reactionBest.textContent=`Лучший результат: ${best?best+' мс':'—'}`;}
  reactionBtn?.addEventListener('click',()=>{
    if(reactionWaiting){clearTimeout(reactionTimer);reactionWaiting=false;reactionOut.textContent='Слишком рано! Попробуй ещё раз.';reactionBtn.textContent='Повторить';reactionBtn.disabled=false;return;}
    if(reactionStarted){const ms=Math.round(performance.now()-reactionStarted);reactionStarted=0;reactionOut.classList.remove('is-ready');reactionOut.textContent=`${ms} мс`;reactionBtn.textContent='Повторить';const old=Number(localStorage.getItem('ix-reaction-best')||Infinity);if(ms<old){localStorage.setItem('ix-reaction-best',ms);if(reactionBest)reactionBest.textContent=`Лучший результат: ${ms} мс`;}return;}
    reactionBtn.disabled=true;reactionOut.textContent='Жди зелёный сигнал…';reactionBtn.textContent='ЖДИ';reactionWaiting=true;
    reactionTimer=setTimeout(()=>{reactionWaiting=false;reactionStarted=performance.now();reactionOut.textContent='ЖМИ СЕЙЧАС!';reactionOut.classList.add('is-ready');reactionBtn.disabled=false;reactionBtn.textContent='НАЖМИ!';},900+Math.random()*2600);
  });

  const clickBtn=document.querySelector('#clickStart'),clickScore=document.querySelector('#clickScore'),clickStatus=document.querySelector('#clickStatus');let clickActive=false,clickCount=0,clickEnds=0,clickTick=null;
  clickBtn?.addEventListener('click',()=>{if(!clickActive){clickActive=true;clickCount=0;clickEnds=Date.now()+10000;clickBtn.textContent='ЖМИ!';clickScore.textContent='0 кликов';clickStatus.textContent='Время пошло!';clickTick=setInterval(()=>{const left=Math.max(0,(clickEnds-Date.now())/1000);clickStatus.textContent=`Осталось: ${left.toFixed(1)} сек`;if(left<=0){clearInterval(clickTick);clickActive=false;clickBtn.textContent='Ещё раз';clickStatus.textContent=`Результат: ${clickCount} кликов`; }},80);return;}clickCount++;clickScore.textContent=`${clickCount} кликов`;});

  const memoryPad=document.querySelector('#memoryPad'),memoryStatus=document.querySelector('#memoryStatus'),memoryStart=document.querySelector('#memoryStart');let sequence=[],memoryInput=[],memoryLocked=false,memoryRound=0;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function showSequence(){memoryLocked=true;memoryStatus.textContent=`Запоминай · раунд ${memoryRound}`;for(const n of sequence){const b=memoryPad?.querySelector(`[data-pad="${n}"]`);b?.classList.add('lit');await sleep(430);b?.classList.remove('lit');await sleep(170);}memoryLocked=false;memoryStatus.textContent='Твой ход!';}
  memoryStart?.addEventListener('click',async()=>{sequence=[];memoryRound=0;memoryInput=[];memoryStart.textContent='Начать заново';await nextMemoryRound();});
  async function nextMemoryRound(){memoryRound++;memoryInput=[];sequence.push(Math.floor(Math.random()*4));await showSequence();}
  memoryPad?.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(memoryLocked||!sequence.length)return;const n=Number(b.dataset.pad);b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),150);memoryInput.push(n);const i=memoryInput.length-1;if(memoryInput[i]!==sequence[i]){memoryStatus.textContent=`Не получилось. Ты дошёл до раунда ${memoryRound}.`;sequence=[];return;}if(memoryInput.length===sequence.length){memoryStatus.textContent='Верно! Следующий раунд…';setTimeout(nextMemoryRound,650);}}));

  const typingSamples=['Создавай интересные проекты и не бойся экспериментировать.','Python помогает превращать идеи в полезные приложения.','Каждая новая функция делает цифровой продукт лучше.','Учись каждый день и доводи свои идеи до результата.'];
  const typingPrompt=document.querySelector('#typingPrompt'),typingInput=document.querySelector('#typingInput'),typingWpm=document.querySelector('#typingWpm'),typingAccuracy=document.querySelector('#typingAccuracy');let typingStarted=0,typingTarget='';
  document.querySelector('#typingNew')?.addEventListener('click',()=>{typingTarget=typingSamples[Math.floor(Math.random()*typingSamples.length)];typingPrompt.textContent=typingTarget;typingInput.value='';typingInput.disabled=false;typingInput.focus();typingStarted=0;typingWpm.innerHTML='0 <small>слов/мин</small>';typingAccuracy.innerHTML='100 <small>% точно</small>';});
  typingInput?.addEventListener('input',()=>{if(!typingStarted)typingStarted=Date.now();const val=typingInput.value;let correct=0;for(let i=0;i<Math.min(val.length,typingTarget.length);i++)if(val[i]===typingTarget[i])correct++;const elapsed=Math.max(1,(Date.now()-typingStarted)/60000);const wpm=Math.round((val.trim()?val.trim().split(/\s+/).length:0)/elapsed);const accuracy=val.length?Math.round(correct/val.length*100):100;typingWpm.innerHTML=`${wpm} <small>слов/мин</small>`;typingAccuracy.innerHTML=`${accuracy} <small>% точно</small>`;if(val===typingTarget){typingPrompt.textContent='Отлично! Текст набран без ошибок.';typingInput.disabled=true;}});
