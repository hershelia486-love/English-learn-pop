// Make the retained learning controls available to keyboard and screen readers.
const sectionTitles = ['오늘의 문장을 만나보세요', '한 장씩, 기억에 오래 남도록', '빈칸을 채우며 한 번 더', '좋아하는 문장을 모아두세요'];
function enhanceControls(){
  document.querySelectorAll('[onclick]:not(button)').forEach(el=>{
    el.tabIndex=0;
    el.setAttribute('role','button');
    if(!el.dataset.keyboard){
      el.dataset.keyboard='true';
      el.addEventListener('keydown',event=>{
        if((event.key==='Enter'||event.key===' ')&&event.target===el){event.preventDefault();el.click();}
      });
    }
  });
  document.querySelectorAll('.tab,.cat-chip').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('on'))));
  document.querySelectorAll('.s-btn').forEach(el=>{
    const action=el.getAttribute('onclick')||'';
    if(/speakNum/.test(action))el.setAttribute('aria-label','영어 문장 듣기');
    if(/toggleBm/.test(action)){el.setAttribute('aria-label','즐겨찾기');el.setAttribute('aria-pressed',String(el.classList.contains('star')));}
    if(/toggleDone/.test(action)){el.setAttribute('aria-label','암기완료');el.setAttribute('aria-pressed',String(el.classList.contains('ok')));}
    if(/toggleExpand/.test(action))el.setAttribute('aria-expanded',String(el.textContent.includes('접기')));
  });
  document.querySelectorAll('.blank-slot').forEach(el=>el.setAttribute('aria-label',el.classList.contains('revealed')?'정답: '+el.textContent:'빈칸 정답 보기'));
  document.querySelectorAll('.scroll-btn').forEach((el,i)=>el.setAttribute('aria-label',i?'맨 아래로':'맨 위로'));
  const tabs=[...document.querySelectorAll('.tab')];
  document.getElementById('sectionTitle').textContent=sectionTitles[Math.max(0,tabs.findIndex(el=>el.classList.contains('on')))];
  document.querySelector('.welcome').hidden=!tabs[0].classList.contains('on');
  document.querySelector('.progress-bar').setAttribute('aria-valuenow',String(done.length));
}
const observer=new MutationObserver(()=>{observer.disconnect();enhanceControls();observe();});
function observe(){observer.observe(document.getElementById('learningMain'),{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});observer.observe(document.querySelector('.hd'),{subtree:true,attributes:true,attributeFilter:['class'],childList:true});}
enhanceControls();observe();
