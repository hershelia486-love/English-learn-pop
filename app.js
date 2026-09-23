// SONGS 인덱스: [0]번호 [1]제목 [2]아티스트 [3]카테고리 [4]영어 [5]발음 [6]한국어 [7]핵심표현

// ── 상태 ──────────────────────────────────────
let bookmarks = JSON.parse(localStorage.getItem('pf_bm') || '[]');
let done      = JSON.parse(localStorage.getItem('pf_done') || '[]');
let currentTab = 'list';
let searchQ    = '';
let catFilter  = -1;   // -1=전체, 0~9=카테고리, 'star','done'
let cardOrder  = SONGS.map((_,i)=>i);
let cardIdx    = 0;
let cardFlipped= false;
let blankCat   = 'all';

function save(){
  localStorage.setItem('pf_bm', JSON.stringify(bookmarks));
  localStorage.setItem('pf_done', JSON.stringify(done));
}

function updateProgress(){
  const pct = Math.round(done.length / 1000 * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('totalBadge').textContent = done.length + ' / 1000';
}

// ── TTS (안정화) ─────────────────────────────
const SONG_MAP = {}; SONGS.forEach(s=>SONG_MAP[s[0]]=s);
let voices = [], curUtter = null, speakTimer = null, watchTimer = null, activeBtn = null;

function loadVoices(){ if('speechSynthesis' in window) voices = speechSynthesis.getVoices(); }
if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

function pickVoice(){
  if(!voices.length) loadVoices();
  return voices.find(v=>v.lang==='en-US' && v.localService)
      || voices.find(v=>v.lang==='en-US')
      || voices.find(v=>/^en/i.test(v.lang)) || null;
}

function setPlaying(on){
  document.body.classList.toggle('playing', on);
  if(activeBtn) activeBtn.classList.toggle('speak-on', on);
  if(!on) activeBtn = null;
}

function speak(text, btn){
  if(!text || !('speechSynthesis' in window)) return;
  const ss = window.speechSynthesis;
  clearTimeout(speakTimer); clearTimeout(watchTimer);
  if(activeBtn) activeBtn.classList.remove('speak-on');
  activeBtn = btn || null;
  ss.cancel();                         // 이전 재생 정리
  speakTimer = setTimeout(()=>startSpeak(text, 0), 150);  // cancel 직후 바로 speak하면 먹통 → 지연
}

function startSpeak(text, retry){
  const ss = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.82;
  const v = pickVoice(); if(v) u.voice = v;
  let started = false;
  u.onstart = ()=>{ started = true; setPlaying(true); };
  u.onend = u.onerror = ()=>{ if(curUtter===u){ curUtter=null; setPlaying(false); } };
  curUtter = u;                        // 전역 보관 (가비지 수집으로 끊기는 버그 방지)
  if(ss.paused) ss.resume();
  ss.speak(u);
  // 1.5초 안에 시작 안 되면 엔진 초기화 후 1회 재시도
  watchTimer = setTimeout(()=>{
    if(!started && curUtter===u){
      ss.cancel();
      if(retry < 1) setTimeout(()=>startSpeak(text, retry+1), 200);
      else { curUtter=null; setPlaying(false); }
    }
  }, 1500);
}

function speakNum(n, btn){ const s = SONG_MAP[n]; if(s) speak(s[4], btn); }

// ── 유틸 ──────────────────────────────────────
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function ea(s){ return String(s||'').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function padNum(n){ return String(n).padStart(4,'0'); }

// ── 탭 전환 ────────────────────────────────────
function setTab(t){
  currentTab = t;
  document.querySelectorAll('.tab').forEach((el,i)=>{
    el.classList.toggle('on', ['list','card','blank','fav'][i] === t);
  });
  ['viewList','viewCard','viewBlank','viewFav'].forEach(id=>{
    document.getElementById(id).style.display =
      id === 'view' + t.charAt(0).toUpperCase() + t.slice(1) ? 'block' : 'none';
  });
  if(t==='list')  renderList();
  if(t==='card')  renderCard();
  if(t==='blank') renderBlank();
  if(t==='fav')   renderFav();
}

// ── 목록 ──────────────────────────────────────
function getFiltered(){
  let list = SONGS;
  if(searchQ){
    const q = searchQ.toLowerCase();
    list = list.filter(s=>
      s[1].toLowerCase().includes(q) ||
      s[2].toLowerCase().includes(q) ||
      s[4].toLowerCase().includes(q) ||
      s[6].includes(searchQ)
    );
  }
  if(catFilter === 'star') list = list.filter(s=>bookmarks.includes(s[0]));
  else if(catFilter === 'done') list = list.filter(s=>done.includes(s[0]));
  else if(catFilter >= 0) list = list.filter(s=>s[3]===catFilter);
  return list;
}

function renderList(){
  const list = getFiltered();
  document.getElementById('listInfo').textContent = list.length + '곡';
  const c = document.getElementById('listContainer');
  c.innerHTML = '';
  list.slice(0, 60).forEach((s, vi)=>{   // 60개씩 렌더
    const isBm = bookmarks.includes(s[0]);
    const isDone = done.includes(s[0]);
    const div = document.createElement('div');
    div.className = 'song-item' + (isBm?' bookmarked':'');
    div.style.animationDelay = (vi % 20 * 0.02) + 's';
    div.innerHTML = `
      <div class="song-top">
        <span class="song-num">#${padNum(s[0])}</span>
        <div class="song-meta">
          <div class="song-title">${esc(s[1])}${isDone?'<span class="s-btn ok" style="pointer-events:none;margin-left:6px">✓</span>':''}</div>
          <div class="song-artist">${esc(s[2])}</div>
        </div>
        <span class="song-cat">${CATS[s[3]]}</span>
      </div>
      <div class="song-lyric">${esc(s[4])}</div>
      <div class="song-phonetic" id="ph${s[0]}">${esc(s[5])}</div>
      <div class="song-ko" id="ko${s[0]}">${esc(s[6])}</div>
      <div class="song-key" id="kp${s[0]}">💡 ${esc(s[7])}</div>
      <div class="song-actions">
        <button class="s-btn" onclick="toggleExpand(${s[0]},this)">📖 번역 보기</button>
        <button class="s-btn" onclick="speakNum(${s[0]},this)">🔊</button>
        <button class="s-btn ${isBm?'star':''}" id="bm${s[0]}" onclick="toggleBm(${s[0]},this)">${isBm?'★':'☆'}</button>
        <button class="s-btn ${isDone?'ok':''}" id="dn${s[0]}" onclick="toggleDone(${s[0]},this)">${isDone?'✅':'○'}</button>
      </div>`;
    c.appendChild(div);
  });
  if(list.length > 60){
    const more = document.createElement('div');
    more.style.cssText = 'text-align:center;padding:16px;color:var(--muted);font-size:12px';
    more.textContent = `검색으로 좁혀보세요 (${list.length}곡 중 60개 표시)`;
    c.appendChild(more);
  }
}

function toggleExpand(n, btn){
  const ph = document.getElementById('ph'+n);
  const ko = document.getElementById('ko'+n);
  const kp = document.getElementById('kp'+n);
  const showing = ko.classList.toggle('show');
  ph.classList.toggle('show', showing);
  kp.classList.toggle('show', showing);
  btn.textContent = showing ? '📖 접기' : '📖 번역 보기';
}

function toggleBm(n, btn){
  const idx = bookmarks.indexOf(n);
  if(idx===-1) bookmarks.push(n); else bookmarks.splice(idx,1);
  save();
  const isBm = bookmarks.includes(n);
  btn.textContent = isBm ? '★' : '☆';
  btn.classList.toggle('star', isBm);
  btn.closest('.song-item').classList.toggle('bookmarked', isBm);
}

function toggleDone(n, btn){
  const idx = done.indexOf(n);
  if(idx===-1) done.push(n); else done.splice(idx,1);
  save(); updateProgress();
  const isDone = done.includes(n);
  btn.textContent = isDone ? '✅' : '○';
  btn.classList.toggle('ok', isDone);
}

function onSearch(v){
  searchQ = v;
  document.getElementById('searchClear').style.display = v ? 'block' : 'none';
  renderList();
}
function clearSearch(){
  searchQ = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  renderList();
}
function setCat(f, el){
  catFilter = f;
  document.querySelectorAll('#catRow .cat-chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  renderList();
}

// ── 카드 ──────────────────────────────────────
function curSong(){ return SONGS[cardOrder[cardIdx]]; }

function renderCard(){
  const s = curSong(); if(!s) return;
  cardFlipped = false;
  document.getElementById('cardInfo').textContent = (cardIdx+1) + ' / ' + cardOrder.length;
  document.getElementById('cNum').textContent    = '#' + padNum(s[0]);
  document.getElementById('cTitle').textContent  = s[1];
  document.getElementById('cArtist').textContent = s[2];
  document.getElementById('cEn').textContent     = s[4];
  document.getElementById('cPhonetic').textContent = s[5];
  document.getElementById('cKo').textContent     = s[6];
  document.getElementById('cKey').textContent    = '💡 ' + s[7];
  ['cPhonetic','cKo','cKey'].forEach(id=>document.getElementById(id).classList.remove('show'));
  document.getElementById('cHint').textContent   = '▼ 탭해서 한국어 확인';
  const isBm   = bookmarks.includes(s[0]);
  const isDone = done.includes(s[0]);
  document.getElementById('cStar').textContent = isBm   ? '★ 즐겨찾기' : '☆ 즐겨찾기';
  document.getElementById('cDone').textContent = isDone ? '✅ 암기됨'   : '○ 암기완료';
  document.getElementById('cDone').classList.toggle('ok', isDone);
}

function flipCard(){
  cardFlipped = !cardFlipped;
  ['cPhonetic','cKo','cKey'].forEach(id=>
    document.getElementById(id).classList.toggle('show', cardFlipped)
  );
  document.getElementById('cHint').textContent = cardFlipped ? '' : '▼ 탭해서 한국어 확인';
}
function nextCard(){ cardIdx = (cardIdx+1) % cardOrder.length; renderCard(); }
function prevCard(){ cardIdx = (cardIdx-1+cardOrder.length) % cardOrder.length; renderCard(); }

function shuffleCards(){
  const arr = SONGS.map((_,i)=>i);
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  cardOrder=arr; cardIdx=0; renderCard();
}
function resetCards(){ cardOrder=SONGS.map((_,i)=>i); cardIdx=0; renderCard(); }
function speakCard(){ const s=curSong(); if(s) speak(s[4],document.getElementById('cSpeak')); }
function toggleCardStar(){
  const s=curSong(); if(!s) return;
  const idx=bookmarks.indexOf(s[0]);
  if(idx===-1) bookmarks.push(s[0]); else bookmarks.splice(idx,1);
  save();
  document.getElementById('cStar').textContent = bookmarks.includes(s[0]) ? '★ 즐겨찾기' : '☆ 즐겨찾기';
}
function toggleCardDone(){
  const s=curSong(); if(!s) return;
  const idx=done.indexOf(s[0]);
  if(idx===-1) done.push(s[0]); else done.splice(idx,1);
  save(); updateProgress();
  const isDone=done.includes(s[0]);
  document.getElementById('cDone').textContent = isDone ? '✅ 암기됨' : '○ 암기완료';
  document.getElementById('cDone').classList.toggle('ok', isDone);
}

// ── 빈칸 ──────────────────────────────────────
function getBlankList(){
  let list = SONGS;
  if(blankCat==='star') list = list.filter(s=>bookmarks.includes(s[0]));
  else if(blankCat==='todo') list = list.filter(s=>!done.includes(s[0]));
  // 랜덤 30개
  const arr=[...list];
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr.slice(0,30);
}

function makeBlank(en){
  const words = en.split(' ');
  if(words.length < 3) return {html: esc(en), word:''};
  const stopwords = ['that','this','with','from','have','been','your','will','just','like','when','what','them','they','some','into','than','about','would','could','should','there','their','here','where','which'];
  const cands = words.map((w,i)=>({w,i})).filter(({w})=>{
    const c = w.replace(/[^a-zA-Z]/g,'');
    return c.length >= 4 && !stopwords.includes(c.toLowerCase());
  });
  if(!cands.length) return {html: esc(en), word:''};
  const pick = cands[Math.floor(Math.random()*cands.length)];
  const blanks = '_'.repeat(pick.w.replace(/[^a-zA-Z]/g,'').length);
  const slot = `<span class="blank-slot" data-w="${ea(pick.w)}" onclick="revealBlank(this)">${blanks}</span>`;
  const parts = [...words];
  parts[pick.i] = slot;
  return {html: parts.map((w,i)=>i===pick.i?w:esc(w)).join(' '), word: pick.w};
}

function renderBlank(){
  const list = getBlankList();
  const c = document.getElementById('blankContainer');
  c.innerHTML = '';
  list.forEach(s=>{
    const {html} = makeBlank(s[4]);
    const div = document.createElement('div');
    div.className = 'blank-card';
    div.innerHTML = `
      <div class="blank-top">
        <span class="blank-num">#${padNum(s[0])}</span>
      </div>
      <div class="blank-title">${esc(s[1])}</div>
      <div class="blank-artist">${esc(s[2])}</div>
      <div style="height:10px"></div>
      <div class="blank-ko">${esc(s[6])}</div>
      <div class="blank-en-wrap">${html}</div>
      ${s[7]?`<div class="blank-key">💡 ${esc(s[7])}</div>`:''}
      <div class="blank-actions">
        <button class="s-btn" onclick="speakNum(${s[0]},this)">🔊 듣기</button>
        <button class="s-btn ${bookmarks.includes(s[0])?'star':''}" onclick="toggleBmBlank(${s[0]},this)">${bookmarks.includes(s[0])?'★':'☆'}</button>
        <button class="s-btn ${done.includes(s[0])?'ok':''}" onclick="toggleDoneBlank(${s[0]},this)">${done.includes(s[0])?'✅':'○'}</button>
        <span class="blank-tip">빈칸 탭 → 정답</span>
      </div>`;
    c.appendChild(div);
  });
}

function revealBlank(el){
  el.textContent = el.dataset.w;
  el.classList.add('revealed');
}
function setBlankCat(f, el){
  blankCat = f;
  document.querySelectorAll('#viewBlank .cat-chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  renderBlank();
}
function toggleBmBlank(n,btn){
  const idx=bookmarks.indexOf(n);
  if(idx===-1)bookmarks.push(n);else bookmarks.splice(idx,1);
  save();
  btn.textContent=bookmarks.includes(n)?'★':'☆';
  btn.classList.toggle('star',bookmarks.includes(n));
}
function toggleDoneBlank(n,btn){
  const idx=done.indexOf(n);
  if(idx===-1)done.push(n);else done.splice(idx,1);
  save();updateProgress();
  btn.textContent=done.includes(n)?'✅':'○';
  btn.classList.toggle('ok',done.includes(n));
}

// ── 즐겨찾기 ──────────────────────────────────
function renderFav(){
  const list = SONGS.filter(s=>bookmarks.includes(s[0]));
  const c = document.getElementById('favContainer');
  document.getElementById('favInfo').textContent = '즐겨찾기 ' + list.length + '곡';
  if(!list.length){
    c.innerHTML = `<div class="fav-empty"><div class="fav-empty-icon">💿</div>목록에서 ☆ 눌러 즐겨찾기 추가</div>`;
    return;
  }
  c.innerHTML = '';
  list.forEach(s=>{
    const div = document.createElement('div');
    div.className = 'song-item bookmarked';
    div.innerHTML = `
      <div class="song-top">
        <span class="song-num">#${padNum(s[0])}</span>
        <div class="song-meta">
          <div class="song-title">${esc(s[1])}</div>
          <div class="song-artist">${esc(s[2])}</div>
        </div>
      </div>
      <div class="song-lyric">${esc(s[4])}</div>
      <div class="song-ko show">${esc(s[6])}</div>
      ${s[7]?`<div class="song-key show">💡 ${esc(s[7])}</div>`:''}
      <div class="song-actions">
        <button class="s-btn" onclick="speakNum(${s[0]},this)">🔊 듣기</button>
        <button class="s-btn star" onclick="removeFav(${s[0]})">★ 제거</button>
        <button class="s-btn ${done.includes(s[0])?'ok':''}" onclick="toggleDone(${s[0]},this)">${done.includes(s[0])?'✅':'○'}</button>
      </div>`;
    c.appendChild(div);
  });
}

function removeFav(n){
  bookmarks = bookmarks.filter(b=>b!==n);
  save(); renderFav();
}

// ── 초기화 ────────────────────────────────────
updateProgress();
renderList();
