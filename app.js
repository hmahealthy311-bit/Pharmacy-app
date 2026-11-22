/* =========================================================
   نرس لينك (Nurseline) — منطق النموذج التفاعلي (v2)
   رحلة العميل ١٠ خطوات + دخول بالوجه + بوابة إدارة/تمريض محمية
   مبني على «نرس لينك – وثيقة المفهوم»
   ========================================================= */
'use strict';

/* ---------- أدوات ---------- */
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}
var toastTimer=null;
function toast(msg, type){
  var t=$('#toast'); if(!t) return;
  t.textContent=msg; t.className='toast show '+(type||'info');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){ t.className='toast'; }, 3400);
}

/* ---------- أيقونات SVG ---------- */
var I={
  syringe:'<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
  bandage:'<g transform="rotate(45 12 12)"><rect x="5" y="8.5" width="14" height="7" rx="3.5"/><circle cx="9.2" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="12" r="1" fill="currentColor" stroke="none"/></g>',
  cannula:'<rect x="8" y="2.5" width="8" height="4.5" rx="1.5"/><path d="M12 7v3.5"/><path d="M12 10.5c0 5-7 4.5-7 10"/><path d="M5 20.5h.01"/>',
  iv:'<path d="M9 2.5h6V6H9z"/><path d="M8 6h8a2 2 0 0 1 2 2v8.5a4.5 4.5 0 0 1-4.5 4.5h-3A4.5 4.5 0 0 1 6 16.5V8a2 2 0 0 1 2-2z"/><path d="M12 10s1.8 2.2 1.8 3.5a1.8 1.8 0 1 1-3.6 0C10.2 12.2 12 10 12 10z"/>',
  care:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M7 12h2.5L11 9l2 6 1.5-3H17"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wallet:'<rect x="2.5" y="5.5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/><path d="M16 14.5h.01"/>',
  star:'<path d="m12 2.5 3 6 6.6 1-4.8 4.6 1.2 6.6L12 17.6 6 20.7l1.2-6.6L2.4 9.5l6.6-1z"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 11.5 2 2 4-4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M14 20h1"/><path d="M19 14h2"/><path d="M19 19h2v2h-2z"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13 1 .37 2 .72 2.9a2 2 0 0 1-.45 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.35 1.9.6 2.9.72A2 2 0 0 1 22 16.9z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>'
};
function icon(name, cls){
  return '<svg class="ic ' + (cls||'') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (I[name]||'') + '</svg>';
}

/* ---------- الخدمات ---------- */
var SERVICES=[
  {id:'injection', name:'إعطاء حقنة',   desc:'حقن مسموحة فقط — زي فيتامينات وديكسا وأفيل.', icon:'syringe'},
  {id:'wound',     name:'تغيير على جرح', desc:'تنظيف الجرح وتغيير الشاش.', icon:'bandage'},
  {id:'cannula',   name:'تركيب كانيولا', desc:'تركيب كانيولا بشكل صحي وآمن.', icon:'cannula'},
  {id:'iv',        name:'إعطاء محلول',  desc:'زي محلول ملحي أو دكستروز.', icon:'iv'},
  {id:'care',      name:'رعاية مريض',   desc:'الممرض يقعد مع المريض ويتابع حالته.', icon:'care'}
];
var SERVICE_BY={};
SERVICES.forEach(function(s){ SERVICE_BY[s.id]=s; });

/* ---------- الحالة (تخزين محلي — نسخة ٢) ---------- */
var LS_KEY='nurseline_state_v2';
var DEFAULTS={
  session:null,
  adminTab:'dash',
  nurseTab:'visits',
  completedVisits:2,
  seq:1004,
  admins:[
    {id:1, name:'المدير العام', username:'admin', pass:'Admin@123'}
  ],
  nurses:[
    {id:1, name:'سارة عبد الله', username:'sara', pass:'Sara@123', region:'مدينة نصر', rating:4.8, visits:34, phone:'01001112233', onShift:true},
    {id:2, name:'منى إبراهيم', username:'mona', pass:'Mona@123', region:'المعادي', rating:4.6, visits:21, phone:'01002223344', onShift:true}
  ],
  customers:[],
  requests:[
    {id:1001, patient:'كريم حسن', phone:'01001234567', region:'مدينة نصر', service:'injection', detail:'فيتامين B12', extra:0, dur:30, price:190, address:'12 شارع عباس العقاد، مدينة نصر', note:'', date:'2025-01-16', time:'17:30', payment:'انستا باي', status:'new', nurse:null, nurseId:null, overdue:true},
    {id:1002, patient:'أميرة سامي', phone:'01112345678', region:'المعادي', service:'iv', detail:'محلول ملحي', extra:0, dur:60, price:340, address:'9 شارع رقم 9، المعادي', note:'', date:'2025-01-15', time:'13:00', payment:'كاش', status:'onway', nurse:'منى إبراهيم', nurseId:2},
    {id:1003, patient:'محمود عيد', phone:'01223456789', region:'المهندسين', service:'wound', detail:'جرح بعد عملية', extra:0, dur:30, price:250, address:'4 شارع الجيزة', note:'الجرح في اليد اليمين', date:'2025-01-12', time:'10:00', payment:'دفع أونلاين', status:'done', nurse:'سارة عبد الله', nurseId:1, rated:5}
  ],
  ratings:[
    {nurse:'سارة عبد الله', stars:5, comment:'محترم وفعّال، الله يبارك.', when:'2025-01-12'},
    {nurse:'منى إبراهيم', stars:4, comment:'قدوم كانت متأخرة شوية.', when:'2025-01-10'},
    {nurse:'سارة عبد الله', stars:5, comment:'ممتازة مع ماما.', when:'2025-01-08'}
  ],
  prices:{
    injection:{price:150,dur:30,extra:100},
    wound:{price:200,dur:30,extra:100},
    cannula:{price:200,dur:30,extra:100},
    iv:{price:300,dur:60,extra:100},
    care:{price:250,dur:60,extra:100}
  },
  items:{
    injection:[{n:'فيتامين B12',p:40},{n:'فيتامين D',p:45},{n:'ديكسا',p:25},{n:'أفيل',p:20}],
    wound:[{n:'مستلزمات تغيير شاش',p:50}],
    cannula:[{n:'كانيولا معقمة',p:30}],
    iv:[{n:'محلول ملحي',p:40},{n:'دكستروز 5%',p:55},{n:'رينجر لاكتات',p:60}],
    care:[]
  },
  allowed:['فيتامين B12','فيتامين D','ديكسا','أفيل'],
  fees:{'مدينة نصر':25,'المعادي':30,'المهندسين':30,'حلوان':45,'شبرا':35,'مدينة نصر الجديدة':35,'6 أكتوبر':50,'الدقي':30},
  lock:{attempts:0, until:0}
};
function hydrate(s){
  Object.keys(DEFAULTS).forEach(function(k){
    if(s[k]===undefined) s[k]=JSON.parse(JSON.stringify(DEFAULTS[k]));
  });
}
function loadState(){
  try{
    var raw=localStorage.getItem(LS_KEY);
    if(raw){ var s=JSON.parse(raw); hydrate(s); return s; }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULTS));
}
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
}
var state=loadState();

/* ---------- الأمان: تشفير كلمات المرور (hash + salt) ---------- */
function makeSalt(){
  return Math.random().toString(36).slice(2,10)+Date.now().toString(36);
}
function hashPassword(pass, salt){
  var s=(salt||'')+'|'+String(pass==null?'':pass);
  var h1=5381, h2=52711, i, ch, r;
  for(i=0;i<s.length;i++){
    ch=s.charCodeAt(i);
    h1=(((h1<<5)+h1)^ch)>>>0;
    h2=(((h2<<5)+h2)^((ch+i)&0xffff))>>>0;
  }
  for(r=0;r<500;r++){
    h1=(((h1<<5)+h1)^h2)>>>0;
    h2=(((h2<<5)+h2)^h1)>>>0;
  }
  return ('00000000'+h1.toString(16)).slice(-8)+('00000000'+h2.toString(16)).slice(-8);
}
function setPassword(acc, plain){
  acc.salt=makeSalt();
  acc.passHash=hashPassword(plain, acc.salt);
}
function checkPassword(acc, plain){
  return !!acc && !!acc.passHash && acc.passHash===hashPassword(plain==null?'':plain, acc.salt||'');
}
function migratePasswords(){
  [].concat(state.admins||[], state.nurses||[]).forEach(function(a){
    if(a && a.pass){ setPassword(a, a.pass); delete a.pass; }
  });
  if(!state.lock) state.lock={attempts:0,until:0};
}
function passStrength(p){
  if(!p) return 0;
  var s=0;
  if(p.length>=8) s++;
  if(p.length>=12) s++;
  if(/[A-Za-z]/.test(p) && /[0-9]/.test(p)) s++;
  if(/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s,4);
}
function passValid(p){
  return typeof p==='string' && p.length>=8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p);
}
function usernameTaken(un, exceptId){
  var taken=false;
  [].concat(state.admins, state.nurses).forEach(function(a){
    if(a.username===un && a.id!==exceptId) taken=true;
  });
  return taken;
}

/* ---------- قفل المحاولات ---------- */
var MAX_ATTEMPTS=5, LOCK_MS=60000;
function isLocked(){ return !!(state.lock && state.lock.until>Date.now()); }
function lockRemaining(){ return Math.max(0, Math.ceil((state.lock.until-Date.now())/1000)); }
function registerFail(){
  state.lock=state.lock||{attempts:0,until:0};
  state.lock.attempts++;
  var locked=false;
  if(state.lock.attempts>=MAX_ATTEMPTS){ state.lock.until=Date.now()+LOCK_MS; state.lock.attempts=0; locked=true; }
  save();
  return locked;
}
function resetLock(){ state.lock={attempts:0,until:0}; save(); }

/* ---------- الجلسة + قفل الخمول ---------- */
var IDLE_MS=5*60*1000;
var idleTimer=null;
var session=null;
function setSession(s){ session=s; state.session=s; save(); }
function validateSession(){
  if(!session) return;
  var ok=false;
  var list=(session.role==='admin')?state.admins:state.nurses;
  for(var i=0;i<list.length;i++){ if(list[i].username===session.username){ ok=true; break; } }
  if(!ok) setSession(null);
}
function armIdleLogout(){
  clearTimeout(idleTimer);
  if(!session) return;
  idleTimer=setTimeout(function(){ if(session) doLogout(true); }, IDLE_MS);
}
function doLogout(auto){
  clearTimeout(idleTimer);
  setSession(null);
  toast(auto?'تم قفل الجلسة تلقائيًا بعد ٥ دقايق خمول 🔒':'تم الخروج بأمان 🔒','ok');
  if(currentView==='admin') renderPortal();
}

/* ---------- الكلمات الممنوعة (مضادات حيوية) ---------- */
var AB_WORDS=['مضاد','حيوي','antibiotic','augmentin','أوجمنتين','اوجمنتين','اموكسيل','اموكسيسلين','amoxicillin','azithro','زيثرو','cipro','سيبرو','كلافيك','كلاف','فلوك','cefix','سيف','أموكس','أموكسيسلين'];
function isAntibiotic(t){
  t=(t||'').toLowerCase();
  for(var i=0;i<AB_WORDS.length;i++){ if(t.indexOf(AB_WORDS[i].toLowerCase())!==-1) return true; }
  return false;
}

/* ---------- خصم الولاء ---------- */
var DISC={0:0,1:1,2:2,3:3,4:5};
function cyclePos(){ return state.completedVisits%5; }
function discPercent(){ return DISC[cyclePos()]; }
function cycleVisit(){ return cyclePos()+1; }

/* ---------- التنقل ---------- */
var currentView='home';
function showView(v){
  currentView=v;
  $$('.view').forEach(function(el){ el.classList.toggle('active', el.id==='view-'+v); });
  $$('.navbtn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-view')===v); });
  window.scrollTo({top:0,behavior:'smooth'});
  if(v==='patient') renderWizard();
  if(v==='admin') renderPortal();
}
function scrollToServices(){
  var el=document.getElementById('home-services');
  if(el) el.scrollIntoView({behavior:'smooth'});
}
function refreshAll(){
  if(currentView==='patient' && booking.step>=9) renderStep();
  if(currentView==='admin' && session){
    if(session.role==='admin') renderManager();
    else renderNursePortal();
  }
}

/* ---------- كود QR تجريبي ---------- */
function drawQR(el){
  var size=21;
  var cells=[];
  for(var r=0;r<size;r++){
    for(var c=0;c<size;c++){
      var dark=false;
      var inF=(r<7&&c<7)||(r<7&&c>=size-7)||(r>=size-7&&c<7);
      if(inF){
        var rr=r<7?r:r-(size-7);
        var cc=c<7?c:c-(size-7);
        dark=(rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4));
      } else {
        dark=(((r*31+c*17+r*c*3)%7)<3);
      }
      cells.push('<span class="'+(dark?'qd':'')+'"></span>');
    }
  }
  el.style.gridTemplateColumns='repeat('+size+',1fr)';
  el.innerHTML=cells.join('');
}

/* =========================================================
   رحلة العميل — ١٠ خطوات
   ========================================================= */
var STEPS=['سكان الكود','تسجيل بالوجه','الخدمة','الأدوية والتفاصيل','المدة والإضافات','العنوان والملحوظة','المراجعة','الدفع','التتبع','التقييم'];
var PAYL={cash:'كاش',insta:'انستا باي',online:'دفع أونلاين'};
var STATUSL={new:'في انتظار التوزيع',assigned:'اتسندت لممرض',accepted:'تم القبول',onway:'في الطريق',arrived:'وصل',done:'خلصت'};
var NEXTL={accepted:'🚗 في الطريق',onway:'📍 وصلت',arrived:'✅ خلصت الزيارة'};
var ORDER=['new','assigned','accepted','onway','arrived','done'];
var NEXT={accepted:'onway',onway:'arrived',arrived:'done'};

function freshBooking(){
  return {step:1,scanned:false,faceState:'idle',customer:null,service:null,choice:null,itemIdx:-1,selfName:'',rx:false,extra:0,addressIdx:null,newAddr:null,note:'',region:'',address:'',date:'',time:'',transport:false,payment:null,proof:false,paid:false,reqId:null,stars:0,comment:''};
}
var booking=freshBooking();

function renderWizard(){ renderStep(); }
function renderSteps(){
  $('#wiz-steps').innerHTML=STEPS.map(function(s,i){
    var n=i+1;
    var cls=(n===booking.step)?'cur':(n<booking.step?'done':'');
    return '<button class="wstep '+cls+'" onclick="goStep('+n+')"><span class="wnum">'+n+'</span><span>'+s+'</span></button>';
  }).join('');
}
function goStep(n){
  if(n>booking.step && !canPass(booking.step)){ toast('كمّل الخطوة الحالية الأول','warn'); return; }
  booking.step=n; renderStep();
}
function nextStep(){
  if(!canPass(booking.step)){ toast('كمّل بيانات الخطوة دي الأول','warn'); return; }
  if(booking.step<10){ booking.step++; renderStep(); }
}
function prevStep(){ if(booking.step>1){ booking.step--; renderStep(); } }

function canPass(s){
  switch(s){
    case 1: return booking.scanned;
    case 2: return !!(booking.customer && booking.customer.name && booking.customer.phone);
    case 3: return !!booking.service;
    case 4: return detailValid();
    case 5: return true;
    case 6: return !!booking.region && !!booking.address && !!booking.date && !!booking.time;
    case 7: return true;
    case 8: return paymentValid();
    case 9: { var r=findReq(booking.reqId); return !!(r && r.status==='done'); }
    case 10: return booking.stars>0;
  }
  return false;
}
function detailValid(){
  if(!booking.service) return false;
  if(booking.service==='injection'){
    if(!booking.choice) return false;
    if(booking.choice==='bring' && booking.itemIdx<0) return false;
    if(booking.choice==='self'){
      if(isAntibiotic(booking.selfName)) return false;
      if(booking.selfName.trim().length<2) return false;
    }
  } else {
    if(!booking.choice) booking.choice='none';
    if(booking.choice==='bring' && state.items[booking.service] && state.items[booking.service].length && booking.itemIdx<0) return false;
  }
  return true;
}
function paymentValid(){
  if(!booking.payment) return false;
  if(booking.payment==='insta' && !booking.proof) return false;
  if(booking.payment==='online' && !booking.paid) return false;
  return true;
}
function findReq(id){
  for(var i=0;i<state.requests.length;i++){ if(state.requests[i].id===id) return state.requests[i]; }
  return null;
}

function calc(){
  var empty={base:0,extraCost:0,items:0,transport:0,sub:0,disc:0,discAmt:0,total:0};
  if(!booking.service) return empty;
  var cfg=state.prices[booking.service];
  var base=cfg.price;
  var extraCost=booking.extra*(cfg.extra||100);
  var items=0;
  if(booking.service==='injection'){
    if(booking.choice==='bring' && booking.itemIdx>=0 && state.items.injection[booking.itemIdx]) items=state.items.injection[booking.itemIdx].p;
  } else if(booking.choice==='bring' && state.items[booking.service] && booking.itemIdx>=0 && state.items[booking.service][booking.itemIdx]){
    items=state.items[booking.service][booking.itemIdx].p;
  }
  var transport=(booking.transport && booking.region)?(state.fees[booking.region]||0):0;
  var sub=base+extraCost+items+transport;
  var disc=discPercent();
  var discAmt=Math.round(sub*disc/100);
  return {base:base,extraCost:extraCost,items:items,transport:transport,sub:sub,disc:disc,discAmt:discAmt,total:sub-discAmt};
}

function detailText(){
  var s=SERVICE_BY[booking.service];
  if(s.id==='injection'){
    if(booking.choice==='bring' && booking.itemIdx>=0 && state.items.injection[booking.itemIdx]){
      return state.items.injection[booking.itemIdx].n+' — الممرض يجيبه';
    }
    if(booking.choice==='self'){
      return 'الدواء مع العميل: '+(booking.selfName.trim()||'—')+(booking.rx?' (روشتة مرفقة)':'');
    }
    return 'من غير دواء';
  }
  var arr=state.items[s.id];
  if(booking.choice==='bring' && arr && booking.itemIdx>=0 && arr[booking.itemIdx]){
    return arr[booking.itemIdx].n+' — الممرض يجيبها';
  }
  return 'المستلزمات موجودة';
}

function renderStep(){
  renderSteps();
  var body=$('#wiz-body');
  var html='';
  switch(booking.step){
    case 1: html=step1(); break;
    case 2: html=step2(); break;
    case 3: html=step3(); break;
    case 4: html=step4(); break;
    case 5: html=step5(); break;
    case 6: html=step6(); break;
    case 7: html=step7(); break;
    case 8: html=step8(); break;
    case 9: html=step9(); break;
    case 10: html=step10(); break;
  }
  body.innerHTML=html;
  var q=$('#qrbox'); if(q) drawQR(q);
}

/* ---------- الخطوة ١: سكان الكود ---------- */
function step1(){
  if(booking.scanned){
    return `<div class="step-title">${icon('qr')} الخطوة ١ — سكان الكود</div>
    <div class="scan-wrap">
      <div class="qr-card"><div class="qr" id="qrbox"></div><div class="qr-cap">كود QR — نرس لينك</div></div>
      <div>
        <div class="loc-found">${icon('pin')} تم تحديد موقعك التقريبي: <b>القاهرة، مصر</b></div>
        <div class="welcome-big">أهلاً بيك في <b>نرس لينك</b> 👋</div>
        <p>الخطوة الجاية: تسجيل الدخول بالوجه عشان نفتح ملفك وتقدر تحجز.</p>
        <button class="btn btn-success btn-lg" onclick="nextStep()">تسجيل الدخول بالوجه ←</button>
      </div>
    </div>`;
  }
  return `<div class="step-title">${icon('qr')} الخطوة ١ — سكان الكود</div>
  <p class="muted">العميل يمسح كود QR من كارت، أو إعلان، أو ستيكر — فيفتح الموقع ويظهر ترحيب باسم المنصة.</p>
  <div class="scan-wrap">
    <div class="qr-card"><div class="qr" id="qrbox"></div><div class="qr-cap">كود QR — نرس لينك</div></div>
    <div>
      <button class="btn btn-primary btn-lg" onclick="scanCode()">📱 امسح الكود (محاكاة)</button>
      <p class="muted small">دي محاكاة لخطوة المسح — في التطبيق الحقيقي الكاميرا بتفتح تلقائي.</p>
    </div>
  </div>`;
}
function scanCode(){ booking.scanned=true; renderStep(); toast('تم مسح الكود بنجاح ✔','ok'); }

/* ---------- الخطوة ٢: تسجيل الدخول بالوجه ---------- */
function step2(){
  var st=booking.faceState||'idle';
  if(st!=='done'){
    return `<div class="step-title">الخطوة ٢ — تسجيل الدخول بالوجه</div>
    <div class="face-scan ${st}">
      <div class="face-ring">${icon('user','face-ic')}<div class="face-line"></div></div>
      <div class="face-status">${st==='scanning'?'⏳ جاري تحليل الوجه…':'حط وشك قدام الكاميرا وامسح'}</div>
    </div>
    <button class="btn btn-primary btn-lg" ${st==='scanning'?'disabled':''} onclick="scanFace()">${st==='scanning'?'جاري المسح…':'🙂 امسح بوجهك (محاكاة)'}</button>
    <p class="muted small">المسح بالوجه بيعمل تسجيل دخول ببياناتك — وبيفتح ملف فيه عناوينك المحفوظة.</p>`;
  }
  var cName=(booking.customer&&booking.customer.name)?esc(booking.customer.name):'';
  var cPhone=(booking.customer&&booking.customer.phone)?esc(booking.customer.phone):'';
  return `<div class="step-title">الخطوة ٢ — تسجيل الدخول بالوجه</div>
  <div class="loc-found">${icon('check')} تم التحقق من الوجه ✔ — كمّل بياناتك</div>
  <div class="field"><label>الاسم</label><input id="fc-name" class="inp" placeholder="اسمك بالكامل" value="${cName}"></div>
  <div class="field"><label>رقم الموبايل</label><input id="fc-phone" class="inp" type="tel" placeholder="01xxxxxxxxx" value="${cPhone}"></div>
  <button class="btn btn-success btn-lg" onclick="faceContinue()">متابعة ←</button>
  <p class="muted small">لو أول مرة: هنفتحلك ملف عميل جديد. لو كنت مسجل قبل كده: هنكتشف حسابك من رقم موبايلك وعناوينك هتظهر تلقائي.</p>`;
}
function scanFace(){
  if(booking.faceState!=='idle') return;
  booking.faceState='scanning';
  renderStep();
  setTimeout(function(){
    booking.faceState='done';
    renderStep();
    var cu=state.customers[0];
    var nm=$('#fc-name'), ph=$('#fc-phone');
    if(cu && nm && ph){
      nm.value=cu.name; ph.value=cu.phone;
      toast('تم التعرف على الوجه ✔ — راجع بياناتك وكمّل','ok');
    } else {
      toast('تم المسح بنجاح ✔ — كمّل بياناتك لأول مرة','ok');
    }
  },1800);
}
function faceContinue(){
  var nm=($('#fc-name')||{}).value||'';
  var ph=($('#fc-phone')||{}).value||'';
  nm=nm.trim(); ph=ph.trim();
  if(nm.length<2){ toast('اكتب اسمك','warn'); return; }
  if(!/^01[0-9]{9}$/.test(ph)){ toast('رقم الموبايل لازم ١١ رقم ويبدأ بـ 01','warn'); return; }
  var cu=null;
  for(var i=0;i<state.customers.length;i++){ if(state.customers[i].phone===ph) cu=state.customers[i]; }
  if(cu){
    cu.name=nm;
    toast('تم التعرف على ملفك — أهلاً بعودتك يا '+nm+' 👋','ok');
  } else {
    cu={id:Date.now(),name:nm,phone:ph,addresses:[]};
    state.customers.unshift(cu);
    toast('تم إنشاء ملف عميل جديد ✔ — عناوينك هتتحفظ فيه','ok');
  }
  booking.customer=cu;
  save();
  nextStep();
}

/* ---------- الخطوة ٣: اختيار الخدمة ---------- */
function step3(){
  var cards=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return `<button class="svc-card ${booking.service===s.id?'sel':''}" onclick="pickService('${s.id}')">
      ${icon(s.icon,'svc-ic')}
      <b>${s.name}</b>
      <span class="muted small">${s.desc}</span>
      <span class="svc-meta">${icon('clock')} ${c.dur} دقيقة · ${c.price} ج</span>
    </button>`;
  }).join('');
  return `<div class="step-title">${icon('check')} الخطوة ٣ — اختيار الخدمة</div>
  <p class="muted">أهلاً <b>${esc(booking.customer?booking.customer.name:'')}</b> — كروت كبيرة بأيقونات واضحة لسهولة الاستخدام حتى لكبار السن.</p>
  <div class="svc-grid">${cards}</div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">التالي ←</button></div>`;
}
function pickService(id){
  booking.service=id; booking.choice=null; booking.itemIdx=-1;
  booking.selfName=''; booking.rx=false; booking.extra=0;
  renderStep();
}

/* ---------- الخطوة ٤: الأدوية والتفاصيل ---------- */
function step4(){
  var s=SERVICE_BY[booking.service];
  var inner='';
  if(s.id==='injection'){
    var medList='';
    if(booking.choice==='bring'){
      medList='<div class="med-list">'+state.items.injection.map(function(m,i){
        return `<label class="opt small ${booking.itemIdx===i?'sel':''}"><input type="radio" name="med" ${booking.itemIdx===i?'checked':''} onchange="setItemIdx(${i})"><span>${esc(m.n)} <b class="price-tag">+${m.p} ج</b></span></label>`;
      }).join('')+'</div>';
    }
    var selfBox='';
    if(booking.choice==='self'){
      selfBox=`<div class="self-box">
        <input class="inp" type="text" placeholder="اكتب اسم الدواء اللي معاك…" value="${esc(booking.selfName)}" oninput="selfChanged(this)">
        <label class="file-btn">${booking.rx?'✔ روشتة مرفقة':'📎 ارفق صورة الروشتة'}<input type="file" accept="image/*" hidden onchange="rxPicked(this)"></label>
        <div id="self-alerts">${selfAlerts()}</div>
        <p class="muted small">أي حقنة مش في القائمة بتتم مراجعتها من الإدارة قبل التنفيذ — واسم الدواء اللي الإدارة تقرره هو المعتمد.</p>
      </div>`;
    }
    inner=`<div class="rule-box ok">${icon('shield')} الحقن المسموحة على المنصة (عضلة فقط): ${state.allowed.map(esc).join('، ')}.</div>
    <div class="rule-box bad">${icon('alert')} الحقن المضادة الحيوية بكل أنواعها <b>ممنوعة</b> على المنصة.</div>
    <label class="opt ${booking.choice==='none'?'sel':''}"><input type="radio" name="ch" ${booking.choice==='none'?'checked':''} onchange="setChoice('none')"><span>مش محتاج دواء — الدواء موجود عندي</span></label>
    <label class="opt ${booking.choice==='bring'?'sel':''}"><input type="radio" name="ch" ${booking.choice==='bring'?'checked':''} onchange="setChoice('bring')"><span>الممرض يجيب معاه الدواء (سعره بيتضاف على الفاتورة)</span></label>
    ${medList}
    <label class="opt ${booking.choice==='self'?'sel':''}"><input type="radio" name="ch" ${booking.choice==='self'?'checked':''} onchange="setChoice('self')"><span>هجيب الدواء بنفسي (مطلوب روشتة من الدكتور)</span></label>
    ${selfBox}`;
  } else if(state.items[s.id] && state.items[s.id].length){
    var supList='';
    if(booking.choice==='bring'){
      supList='<div class="med-list">'+state.items[s.id].map(function(m,i){
        return `<label class="opt small ${booking.itemIdx===i?'sel':''}"><input type="radio" name="med" ${booking.itemIdx===i?'checked':''} onchange="setItemIdx(${i})"><span>${esc(m.n)} <b class="price-tag">+${m.p} ج</b></span></label>`;
      }).join('')+'</div>';
    }
    inner=`<label class="opt ${booking.choice==='bring'?'sel':''}"><input type="radio" name="ch" ${booking.choice==='bring'?'checked':''} onchange="setChoice('bring')"><span>الممرض يجيب معاه المستلزمات (بتتضاف على الفاتورة)</span></label>
    ${supList}
    <label class="opt ${booking.choice==='none'?'sel':''}"><input type="radio" name="ch" ${booking.choice==='none'?'checked':''} onchange="setChoice('none')"><span>المستلزمات موجودة عندي</span></label>`;
  } else {
    if(!booking.choice) booking.choice='none';
    inner=`<div class="rule-box ok">${icon('shield')} رعاية المريض بتتحدد بالساعات — هتحدد المدة في الخطوة الجاية، وتقدر تكتب ملحوظة للممرض في خطوة العنوان.</div>`;
  }
  return `<div class="step-title">${icon('alert')} الخطوة ٤ — الأدوية والتفاصيل</div>
  <p class="muted">الخدمة المختارة: <b>${s.name}</b></p>
  ${inner}
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" ${detailValid()?'':'disabled'} onclick="nextStep()">التالي ←</button></div>`;
}
function setChoice(v){ booking.choice=v; if(v!=='bring') booking.itemIdx=-1; renderStep(); }
function setItemIdx(i){ booking.itemIdx=i; renderStep(); }
function selfAlerts(){
  var t=booking.selfName.trim();
  var h='';
  if(t.length>=2){
    if(isAntibiotic(t)){
      h=`<div class="alert bad">${icon('alert')} <b>خدمة دي غير متاحة حالياً</b> — الحقن المضادة الحيوية مش متاحة عبر نرس لينك. لو دكتورك وصفلك حقنة مضاد حيوي، نفّذها بره المنصة أو استشير الدكتور في بديل.</div>`;
    } else if(state.allowed.indexOf(t)===-1){
      h=`<div class="alert warn">${icon('alert')} الحقنة دي مش في القائمة المسموحة — هتحتاج مراجعة من الإدارة قبل التنفيذ.</div>`;
    }
  }
  return h;
}
function selfChanged(inp){
  booking.selfName=inp.value;
  var box=$('#self-alerts'); if(box) box.innerHTML=selfAlerts();
  var nb=$('#wiz-body .wiz-actions .btn-primary');
  if(nb) nb.disabled=!detailValid();
}
function rxPicked(inp){
  booking.rx=!!(inp.files && inp.files.length);
  if(booking.rx) toast('تم إرفاق الروشتة ✔','ok');
  renderStep();
}

/* ---------- الخطوة ٥: المدة والإضافات ---------- */
function step5(){
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[s.id];
  var unit=(s.id==='care')?'ساعة':'نصف ساعة';
  var c=calc();
  return `<div class="step-title">${icon('clock')} الخطوة ٥ — المدة والإضافات</div>
  <p class="muted">المدة الأساسية لـ<b>${s.name}</b>: <b>${cfg.dur} دقيقة</b> — وكل إضافة ثابتة السعر وبتظهر فورًا.</p>
  <div class="dur-box">
    <div>المدة الأساسية: <b>${cfg.dur} د</b> · السعر: <b>${cfg.price} ج</b></div>
    <div class="stepper">
      <button class="btn btn-ghost" onclick="addExtra(-1)">−</button>
      <div class="dur-val">+ ${booking.extra} ${unit}</div>
      <button class="btn btn-success" onclick="addExtra(1)">+</button>
    </div>
    <div class="muted small">كل ${unit} إضافية: <b>+${cfg.extra} ج</b></div>
    <div class="price-live">السعر الحالي: <b>${c.base+c.extraCost+c.items} ج</b></div>
  </div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">التالي ←</button></div>`;
}
function addExtra(d){ booking.extra=Math.max(0, booking.extra+d); renderStep(); }

/* ---------- الخطوة ٦: العنوان والملحوظة ---------- */
function step6(){
  var cu=booking.customer||{addresses:[]};
  var list='';
  if(cu.addresses && cu.addresses.length){
    list='<div class="addr-list">'+cu.addresses.map(function(a,i){
      return `<label class="opt ${booking.addressIdx===i?'sel':''}"><input type="radio" name="addr" ${booking.addressIdx===i?'checked':''} onchange="pickAddr(${i})"><span>${icon('pin')} <b>${esc(a.region)}</b> — ${esc(a.text)}</span></label>`;
    }).join('')+'</div>';
  } else {
    list='<p class="muted">لسه مفيش عناوين محفوظة في ملفك — ضيف عنوان جديد.</p>';
  }
  var selInfo=(booking.addressIdx!=null && cu.addresses && cu.addresses[booking.addressIdx])?`<div class="loc-found">${icon('check')} العنوان المختار: <b>${esc(cu.addresses[booking.addressIdx].region)}</b> — ${esc(cu.addresses[booking.addressIdx].text)}</div>`:'';
  var addForm;
  if(booking.newAddr){
    var regionOpts=Object.keys(state.fees).map(function(r){
      return `<option ${booking.newAddr.region===r?'selected':''}>${r}</option>`;
    }).join('');
    addForm=`<div class="self-box">
      <div class="field"><label>المنطقة</label><select class="inp" onchange="booking.newAddr.region=this.value"><option value="">اختار المنطقة…</option>${regionOpts}</select></div>
      <div class="field"><label>العنوان بالتفصيل</label><textarea class="inp" rows="2" placeholder="المبنى، الدور، علامة مميزة…" oninput="booking.newAddr.text=this.value">${esc(booking.newAddr.text||'')}</textarea></div>
      <button class="btn btn-success" onclick="saveNewAddr()">💾 احفظ العنوان في ملفي</button>
    </div>`;
  } else {
    addForm='<button class="btn btn-ghost" onclick="showNewAddr()">➕ استخدم عنوان جديد</button>';
  }
  return `<div class="step-title">${icon('pin')} الخطوة ٦ — تأكيد العنوان والملحوظة</div>
  <div class="nurse-mini">${icon('user')} ${esc(cu.name||'')} · ${icon('phone')} ${esc(cu.phone||'')}</div>
  <h3 class="sec-t">عناوينك المحفوظة — أكّد العنوان أو اختار عنوان تاني</h3>
  ${list}
  ${selInfo}
  ${addForm}
  <div class="field"><label>📝 ملحوظة للممرض (اختياري)</label><textarea class="inp" rows="2" placeholder="أي تفاصيل مهمة: الدور، الباب مفتوح، فيه مريض ساكت…" oninput="booking.note=this.value">${esc(booking.note||'')}</textarea></div>
  <div class="field"><label>الموعد</label><div class="grid2"><input class="inp" type="date" value="${esc(booking.date)}" onchange="booking.date=this.value"><input class="inp" type="time" value="${esc(booking.time)}" onchange="booking.time=this.value"></div></div>
  <div class="field"><label class="chk"><input type="checkbox" ${booking.transport?'checked':''} onchange="booking.transport=this.checked; renderStep()"> أضف رسوم مواصلات الممرض (اختياري)</label>${booking.transport&&booking.region?`<div class="muted small">رسوم المنطقة: <b>${state.fees[booking.region]} ج</b></div>`:''}</div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">المراجعة ←</button></div>`;
}
function pickAddr(i){
  booking.addressIdx=i;
  var a=booking.customer.addresses[i];
  booking.region=a.region; booking.address=a.text;
  renderStep();
}
function showNewAddr(){ booking.newAddr={region:'',text:''}; renderStep(); }
function saveNewAddr(){
  var na=booking.newAddr||{};
  var rg=na.region||'';
  var txt=(na.text||'').trim();
  if(!rg){ toast('اختار المنطقة','warn'); return; }
  if(txt.length<5){ toast('اكتب العنوان بالتفصيل','warn'); return; }
  booking.customer.addresses.push({region:rg,text:txt});
  booking.addressIdx=booking.customer.addresses.length-1;
  booking.region=rg; booking.address=txt; booking.newAddr=null;
  save();
  renderStep();
  toast('تم حفظ العنوان في ملفك ✔','ok');
}

/* ---------- الخطوة ٧: المراجعة ---------- */
function step7(){
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[booking.service];
  var c=calc();
  var unitTxt=(s.id==='care')?(booking.extra+' ساعة إضافية'):(booking.extra+' × ٣٠ دقيقة إضافية');
  var disc=discPercent();
  return `<div class="step-title">الخطوة ٧ — مراجعة الطلب</div>
  <div class="review">
    <div class="rev-row"><span>العميل</span><b>${esc(booking.customer.name)} · ${esc(booking.customer.phone)}</b></div>
    <div class="rev-row"><span>الخدمة</span><b>${s.name}</b></div>
    <div class="rev-row"><span>التفاصيل</span><b>${esc(detailText())}</b></div>
    <div class="rev-row"><span>المدة</span><b>${cfg.dur} د${booking.extra?' + '+unitTxt:''}</b></div>
    <div class="rev-row"><span>المنطقة</span><b>${esc(booking.region)}</b></div>
    <div class="rev-row"><span>العنوان</span><b>${esc(booking.address)}</b></div>
    <div class="rev-row"><span>ملحوظة</span><b>${esc(booking.note||'—')}</b></div>
    <div class="rev-row"><span>الموعد</span><b>${esc(booking.date||'—')} · ${esc(booking.time||'—')}</b></div>
    <div class="rev-row"><span>المواصلات</span><b>${booking.transport?(state.fees[booking.region]+' ج'):'بدون'}</b></div>
  </div>
  <div class="price-box">
    <div class="pr-row"><span>الخدمة الأساسية</span><span>${c.base} ج</span></div>
    <div class="pr-row"><span>وقت إضافي</span><span>${c.extraCost} ج</span></div>
    <div class="pr-row"><span>دواء / مستلزمات</span><span>${c.items} ج</span></div>
    <div class="pr-row"><span>مواصلات</span><span>${c.transport} ج</span></div>
    <div class="pr-row disc"><span>خصم الولاء (${disc}%)</span><span>−${c.discAmt} ج</span></div>
    <div class="pr-row total"><span>الإجمالي</span><span>${c.total} ج</span></div>
  </div>
  <div class="loyalty">${icon('star')} دي الزيارة رقم <b>${cycleVisit()}</b> من ٥ في دورة الخصم — خصم الولاء الحالي: <b>${disc}%</b> <span class="small">(الخصم بيزيد ١٪ مع كل زيارة مكتملة، الخامسة ٥٪ وبعدها الدورة تصفر)</span></div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-success" onclick="nextStep()">اعتماد والانتقال للدفع ←</button></div>`;
}

/* ---------- الخطوة ٨: الدفع ---------- */
function step8(){
  var pay=booking.payment;
  var methods=[
    ['cash','كاش','الممرض يستلم المبلغ عند وصوله ويوثق القيمة المطلوبة.','wallet'],
    ['insta','انستا باي','يظهرلك رقم أو عنوان الدفع، وتحوّل وتطلب إثبات التحويل.','phone'],
    ['online','دفع أونلاين من الموقع','دفع مباشر داخل الموقع قبل الزيارة.','shield']
  ];
  var cards=methods.map(function(m){
    return `<button class="pay-card ${pay===m[0]?'sel':''}" onclick="pickPayment('${m[0]}')">${icon(m[3])}<b>${m[1]}</b><span class="muted small">${m[2]}</span></button>`;
  }).join('');
  var panel='';
  if(pay==='insta'){
    panel=`<div class="insta-box"><div>${icon('phone')} رقم انستا باي: <b class="mono">0100 000 0000</b> — عنوان الدفع: <b class="mono">nurseline@instapay</b></div><label class="chk"><input type="checkbox" ${booking.proof?'checked':''} onchange="booking.proof=this.checked; syncPayBtn()"> بعت صورة إثبات التحويل ✔</label></div>`;
  } else if(pay==='online'){
    panel=booking.paid
      ? '<div class="insta-box"><div class="alert ok" style="margin:0">تم الدفع أونلاين بنجاح ✔</div></div>'
      : `<div class="insta-box"><button class="btn btn-primary" onclick="payOnline()">💳 ادفع الآن (${calc().total} ج) — محاكاة</button></div>`;
  } else if(pay==='cash'){
    panel=`<div class="insta-box">المبلغ المطلوب عند الوصول: <b>${calc().total} ج</b> — الممرض هيوثق الاستلام.</div>`;
  }
  return `<div class="step-title">الخطوة ٨ — طريقة الدفع</div>
  <p class="muted">٣ طرق دفع — بعد التأكيد الطلب يروح مباشرة للإدارة للتوزيع.</p>
  <div class="pay-grid">${cards}</div>
  ${panel}
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button id="wiz-confirm" class="btn btn-success" ${paymentValid()?'':'disabled'} onclick="confirmOrder()">تأكيد الطلب وإرساله للإدارة ✔</button></div>`;
}
function pickPayment(m){ booking.payment=m; renderStep(); }
function payOnline(){ booking.paid=true; renderStep(); toast('تم الدفع (محاكاة) ✔','ok'); }
function syncPayBtn(){ var b=$('#wiz-confirm'); if(b) b.disabled=!paymentValid(); }
function confirmOrder(){
  if(booking.reqId){ booking.step=9; renderStep(); return; }
  if(!paymentValid()){ toast('كمّل اختيار طريقة الدفع','warn'); return; }
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[booking.service];
  var c=calc();
  var req={
    id:state.seq++, patient:booking.customer.name, phone:booking.customer.phone,
    region:booking.region, service:booking.service, detail:detailText(), extra:booking.extra,
    dur:cfg.dur + booking.extra*(s.id==='care'?60:30),
    price:c.total, address:booking.address, note:booking.note||'',
    date:booking.date, time:booking.time,
    payment:PAYL[booking.payment], status:'new', nurse:null, nurseId:null
  };
  state.requests.unshift(req);
  booking.reqId=req.id;
  save();
  simulateRequest(req);
  booking.step=9;
  renderStep();
  toast('الطلب وصل للإدارة 🎉 — هتتوزع على ممرض في الشيفت حسب موقعك','ok');
}

/* ---------- الخطوة ٩: التتبع ---------- */
function step9(){
  var r=findReq(booking.reqId)||{status:'new'};
  var stages=[
    ['assigned','اتسندت لممرض','الإدارة وزعت الطلب حسب المنطقة'],
    ['accepted','تم القبول','الممرض وافق الطلب'],
    ['onway','في الطريق','الممرض نازل ليك'],
    ['arrived','وصل','الممرض وصل عنوانك'],
    ['done','خلصت الزيارة','قيّم الممرض']
  ];
  var idx=-1;
  for(var i=0;i<stages.length;i++){ if(stages[i][0]===r.status) idx=i; }
  var tl=stages.map(function(st,i){
    var cls=((idx>=0 && i<=idx)?'on':'')+(r.status===st[0]?' now':'');
    return `<div class="tl ${cls}"><div class="tl-dot">${i<idx?icon('check'):''}</div><div><b>${st[1]}</b><span class="muted">${st[2]}</span></div></div>`;
  }).join('');
  return `<div class="step-title">الخطوة ٩ — تتبع الطلب</div>
  <p class="muted">الطلب بيروح الأول للإدارة، وهي اللي بتوزعه على ممرض موجود في الشيفت حسب الموقع.</p>
  ${r.status==='new'?`<div class="alert warn">${icon('clock')} الطلب وصل لوحة الإدارة 🔒 — في انتظار التوزيع على ممرض في الشيفت حسب موقعك…</div>`:''}
  ${r.nurse?`<div class="nurse-mini">${icon('user')} الممرض/ة: <b>${esc(r.nurse)}</b> · ${icon('phone')} ${esc(nursePhone(r.nurse))}</div>`:''}
  <div class="timeline">${tl}</div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-ghost" onclick="boost()">⏩ تسريع المحاكاة</button><button class="btn btn-primary" ${r.status==='done'?'':'disabled'} onclick="nextStep()">التقييم ←</button></div>`;
}
function nursePhone(name){
  for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].name===name) return state.nurses[i].phone||'—'; }
  return '—';
}
function setStatus(req,to){
  if(!req) return;
  if(ORDER.indexOf(to)<=ORDER.indexOf(req.status)) return;
  if(to==='assigned' && !req.nurse){
    var cand=null, i, n;
    for(i=0;i<state.nurses.length;i++){ n=state.nurses[i]; if(n.onShift && n.region===req.region){ cand=n; break; } }
    if(!cand){ for(i=0;i<state.nurses.length;i++){ n=state.nurses[i]; if(n.onShift){ cand=n; break; } } }
    if(!cand){ toast('مفيش ممرض في الشيفت — المدير لازم يوزع الطلب من بوابة الإدارة','warn'); return; }
    req.nurse=cand.name; req.nurseId=cand.id;
    toast('الإدارة سندت الطلب #'+req.id+' لـ '+cand.name+' (منطقة '+cand.region+')','ok');
  }
  req.status=to;
  save(); refreshAll();
}
function boost(){
  var r=findReq(booking.reqId);
  if(!r){ return; }
  var i=ORDER.indexOf(r.status);
  if(i<ORDER.length-1){ setStatus(r, ORDER[i+1]); }
  else{ toast('الزيارة خلصت بالفعل'); }
}
function simulateRequest(req){
  var plan=[[3000,'assigned'],[9000,'accepted'],[15000,'onway'],[21000,'arrived'],[27000,'done']];
  plan.forEach(function(p){
    setTimeout(function(){ if(state.requests.indexOf(req)!==-1) setStatus(req,p[1]); }, p[0]);
  });
}

/* ---------- الخطوة ١٠: التقييم ---------- */
function step10(){
  var r=findReq(booking.reqId)||{};
  var stars=[1,2,3,4,5].map(function(n){
    return `<button class="starbtn ${booking.stars>=n?'on':''}" onclick="setStars(${n})">★</button>`;
  }).join('');
  return `<div class="step-title">الخطوة ١٠ — تقييم الممرض</div>
  <p class="muted">قيم الممرض من ١ لـ ٥ نجوم — اختياري مع تعليق، وبيوصل للإدارة مباشرة.</p>
  ${r.nurse?`<div class="nurse-mini">${icon('user')} بتقيّم: <b>${esc(r.nurse)}</b></div>`:''}
  <div class="stars">${stars}</div>
  <div class="field"><label>تعليق (اختياري)</label><textarea class="inp" rows="2" placeholder="رأيك في الخدمة…" oninput="booking.comment=this.value">${esc(booking.comment)}</textarea></div>
  <div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-success" ${booking.stars>0?'':'disabled'} onclick="submitRating()">إرسال التقييم ✔</button></div>`;
}
function setStars(n){ booking.stars=n; renderStep(); }
function submitRating(){
  var r=findReq(booking.reqId); if(!r) return;
  r.rated=booking.stars;
  state.ratings.unshift({nurse:r.nurse,stars:booking.stars,comment:booking.comment||'',when:new Date().toISOString().slice(0,10)});
  var nurse=null;
  if(r.nurseId!=null) nurse=findNurse(r.nurseId);
  if(!nurse){
    for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].name===r.nurse) nurse=state.nurses[i]; }
  }
  if(nurse){
    nurse.visits++;
    var mine=state.ratings.filter(function(x){ return x.nurse===nurse.name; });
    var sum=mine.reduce(function(a,b){ return a+b.stars; },0);
    nurse.rating=Math.round(sum/mine.length*10)/10;
  }
  state.completedVisits++;
  save();
  var pos=cyclePos();
  $('#wiz-body').innerHTML=`<div class="thanks">
    <div class="thanks-ic">✅</div>
    <h3>شكراً ليك!</h3>
    <p>تقييمك وصل للإدارة وهيساعد نحسّن الخدمة.</p>
    <div class="loyalty big">${icon('star')} الزيارات المكتملة في دورتك الحالية: <b>${pos}/5</b> — خصمك في الزيارة الجاية: <b>${DISC[pos]}%</b></div>
    <button class="btn btn-primary btn-lg" onclick="newOrder()">اطلب زيارة جديدة</button>
  </div>`;
  toast('شكراً لتقييمك 🌟','ok');
}
function newOrder(){ booking=freshBooking(); renderWizard(); }

/* =========================================================
   بوابة الإدارة والتمريض — دخول محمي
   ========================================================= */
function renderPortal(){
  var login=$('#portal-login'), app=$('#portal-app');
  if(!login||!app) return;
  if(!session){
    login.classList.remove('hidden'); app.classList.add('hidden');
    login.innerHTML=portalLoginHTML();
    if(isLocked()){ setTimeout(function(){ if(!session && currentView==='admin') renderPortal(); },1000); }
    return;
  }
  login.classList.add('hidden'); app.classList.remove('hidden');
  if(session.role==='admin') renderManager();
  else renderNursePortal();
}
function portalLoginHTML(){
  var locked=isLocked();
  var lockHtml=locked?`<div class="alert bad">${icon('alert')} الدخول مقفول مؤقتًا 🔒 — جرّب تاني بعد <b>${lockRemaining()}</b> ثانية.</div>`:'';
  var attempts=(state.lock && state.lock.attempts)?`<p class="muted small">محاولات خاطئة: ${state.lock.attempts} من ٥</p>`:'';
  return `${lockHtml}
  <div class="portal-split">
    <div class="card portal-card">
      <div class="portal-role">${icon('shield')} دخول المدير</div>
      <p class="muted small">صلاحيات كاملة: توزيع الزيارات حسب الموقع، إدارة الشيفت، حسابات الممرضين، الأسعار، والتقارير.</p>
      <div class="field"><label>اسم المستخدم</label><input id="lu-a-user" class="inp" autocomplete="username" placeholder="admin"></div>
      <div class="field"><label>كلمة المرور</label><div class="pw-row"><input id="lu-a-pass" class="inp" type="password" autocomplete="current-password" placeholder="••••••••"><button type="button" class="eye" onclick="togglePw('lu-a-pass',this)">👁</button></div></div>
      <button class="btn btn-primary btn-lg" ${locked?'disabled':''} onclick="portalLogin('admin','lu-a-user','lu-a-pass')">دخول المدير ←</button>
      <div class="demo-creds">بيانات تجريبية: يوزر <b class="mono">admin</b> — باسورد <b class="mono">Admin@123</b></div>
    </div>
    <div class="card portal-card">
      <div class="portal-role">${icon('user')} دخول التمريض</div>
      <p class="muted small">حساب الممرض اللي هيستلم الزيارة: بيستلم الطلبات المُسندة ليه من الإدارة ويحدّث حالتها، ويقدر يغير اسمه وباسورده.</p>
      <div class="field"><label>اسم المستخدم</label><input id="lu-n-user" class="inp" autocomplete="username" placeholder="sara"></div>
      <div class="field"><label>كلمة المرور</label><div class="pw-row"><input id="lu-n-pass" class="inp" type="password" autocomplete="current-password" placeholder="••••••••"><button type="button" class="eye" onclick="togglePw('lu-n-pass',this)">👁</button></div></div>
      <button class="btn btn-success btn-lg" ${locked?'disabled':''} onclick="portalLogin('nurse','lu-n-user','lu-n-pass')">دخول التمريض ←</button>
      <div class="demo-creds">تجريبي: <b class="mono">sara / Sara@123</b> أو <b class="mono">mona / Mona@123</b></div>
    </div>
  </div>
  ${attempts}
  <div class="alert ok">${icon('shield')} <b>حماية البيانات:</b> كلمات المرور مش متخزنة نص صريح (hash + salt) · قفل تلقائي للدخول بعد ٥ محاولات غلط · الجلسة بتقفل تلقائيًا بعد ٥ دقايق خمول · الطلبات بتعدّي على الإدارة الأول قبل الممرض.</div>`;
}
function togglePw(id, btn){
  var inp=$('#'+id); if(!inp) return;
  var show=(inp.type==='password');
  inp.type=show?'text':'password';
  if(btn) btn.textContent=show?'🙈':'👁';
}
function portalLogin(role, userIn, passIn){
  if(isLocked()){ renderPortal(); return; }
  var u=($('#'+userIn)||{}).value||'';
  var p=($('#'+passIn)||{}).value||'';
  u=u.trim();
  if(!u||!p){ toast('دخّل اليوزر نيم وكلمة المرور','warn'); return; }
  var acc=null;
  var list=(role==='admin')?state.admins:state.nurses;
  for(var i=0;i<list.length;i++){ if(list[i].username===u){ acc=list[i]; break; } }
  if(acc && checkPassword(acc,p)){
    resetLock();
    setSession({role:role, id:acc.id, username:acc.username, name:acc.name});
    if(role==='admin'){ state.adminTab='dash'; } else { state.nurseTab='visits'; }
    save();
    renderPortal();
    armIdleLogout();
    toast('أهلاً '+acc.name+' 👋 — الجلسة محمية وبتقفل تلقائي بعد ٥ دقايق خمول','ok');
  } else {
    var locked=registerFail();
    if(locked){ toast('٥ محاولات خاطئة — الدخول مقفول ٦٠ ثانية 🔒','warn'); }
    else{ toast('يوزر أو كلمة مرور غلط — محاولة '+state.lock.attempts+' من ٥','warn'); }
    renderPortal();
  }
}

/* ---------- بوابة المدير ---------- */
function renderManager(){
  var app=$('#portal-app');
  var tabs=[['dash','📊 لوحة التحكم'],['visits','🩺 الزيارات'],['shift','🕐 الشيفت'],['settings','⚙️ الإعدادات']];
  var tabsHtml=tabs.map(function(t){
    return `<button class="tabbtn ${state.adminTab===t[0]?'on':''}" onclick="setAdminTab('${t[0]}')">${t[1]}</button>`;
  }).join('');
  var body='';
  if(state.adminTab==='dash') body=mgrDash();
  else if(state.adminTab==='visits') body=mgrVisits();
  else if(state.adminTab==='shift') body=mgrShift();
  else body=mgrSettings();
  app.innerHTML=`<div class="nurse-head admin-head">
    <div>${icon('shield')} <b>${esc(session.name)}</b> <span class="badge">مدير</span></div>
    <div class="muted small">جلسة محمية 🔒 — بتقفل تلقائي بعد ٥ دقايق خمول <button class="btn btn-danger btn-sm" onclick="doLogout()">خروج</button></div>
  </div>
  <div class="tabs">${tabsHtml}</div>
  ${body}`;
}
function setAdminTab(t){ state.adminTab=t; save(); renderPortal(); }
function statCard(ic, val, label){
  return `<div class="stat">${icon(ic)}<b>${val}</b><span>${label}</span></div>`;
}
function mgrDash(){
  var news=state.requests.filter(function(r){ return r.status==='new'; });
  var active=state.requests.filter(function(r){ return r.status==='assigned'||r.status==='accepted'||r.status==='onway'||r.status==='arrived'; });
  var done=state.requests.filter(function(r){ return r.status==='done'; });
  var revenue=done.reduce(function(a,r){ return a+r.price; },0);
  var avg=state.ratings.length?(state.ratings.reduce(function(a,b){ return a+b.stars; },0)/state.ratings.length).toFixed(1):'—';
  var onShift=state.nurses.filter(function(n){ return n.onShift; });
  var stats=[
    statCard('check',news.length,'طلبات في انتظار التوزيع'),
    statCard('clock',active.length,'قيد التنفيذ'),
    statCard('check',done.length,'زيارات معمولة'),
    statCard('wallet',revenue+' ج','الإيراد المتحقق'),
    statCard('star',avg,'متوسط التقييم'),
    statCard('user',onShift.length+' من '+state.nurses.length,'ممرضين في الشيفت')
  ].join('');
  return `<div class="stat-grid">${stats}</div>
  <h3 class="sec-t">طلبات محتاجة توزيع على الشيفت</h3>
  ${news.length?news.map(reqCardAdmin).join(''):'<p class="muted">مفيش طلبات في الانتظار ✔</p>'}
  ${active.length?`<h3 class="sec-t">قيد التنفيذ (${active.length})</h3>`+active.map(reqCardAdmin).join(''):''}`;
}
function mgrVisits(){
  var rows=state.requests.map(function(r){
    var s=SERVICE_BY[r.service]||{name:r.service};
    return `<tr><td>#${r.id}</td><td>${esc(r.patient)}</td><td>${esc(r.region)}</td><td>${esc(s.name)}</td><td>${r.price} ج</td><td><span class="badge st-${r.status}">${STATUSL[r.status]}</span></td><td>${r.nurse?esc(r.nurse):assignSel(r)}</td></tr>`;
  }).join('');
  var done=state.requests.filter(function(r){ return r.status==='done'; });
  var doneRows=done.map(function(r){
    var s=SERVICE_BY[r.service]||{name:r.service};
    return `<tr><td>#${r.id}</td><td>${esc(r.patient)}</td><td>${esc(s.name)}</td><td>${esc(r.nurse||'—')}</td><td>${r.price} ج</td><td>${r.rated?'★'.repeat(r.rated)+' ('+r.rated+'/5)':'—'}</td><td>${esc(r.date||'—')}</td></tr>`;
  }).join('');
  return `<h3 class="sec-t">كل الطلبات وحالتها</h3>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>العميل</th><th>المنطقة</th><th>الخدمة</th><th>السعر</th><th>الحالة</th><th>الممرض</th></tr></thead><tbody>${rows}</tbody></table></div>
  <h3 class="sec-t">الزيارات المعمولة (${done.length})</h3>
  ${done.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>العميل</th><th>الخدمة</th><th>الممرض</th><th>السعر</th><th>التقييم</th><th>التاريخ</th></tr></thead><tbody>${doneRows}</tbody></table></div>`:'<p class="muted">لسه مفيش زيارات معمولة.</p>'}
  <h3 class="sec-t">آخر التقييمات</h3>
  ${rateListHtml()}`;
}
function rateListHtml(){
  return state.ratings.slice(0,6).map(function(x){
    return `<div class="req"><div class="req-top"><b>${esc(x.nurse)}</b><div>${'★'.repeat(x.stars)}${'☆'.repeat(5-x.stars)}</div></div><div class="muted small">${esc(x.comment||'—')} · ${esc(x.when)}</div></div>`;
  }).join('');
}
function mgrShift(){
  var onShift=state.nurses.filter(function(n){ return n.onShift; });
  var cards=state.nurses.map(function(n){
    return `<div class="req">
      <div class="req-top"><b>${esc(n.name)}</b>${n.onShift?'<span class="badge st-arrived">في الشيفت</span>':'<span class="badge st-done">خارج الشيفت</span>'}</div>
      <div class="req-grid">
        <span>${icon('pin')} ${esc(n.region)}</span>
        <span>${icon('star')} ${n.rating} · ${n.visits} زيارة</span>
        <span>${icon('user')} يوزر: <b class="mono">${esc(n.username)}</b></span>
        <span></span>
      </div>
      <div class="req-actions"><button class="btn ${n.onShift?'btn-danger':'btn-success'} btn-sm" onclick="toggleShift(${n.id})">${n.onShift?'إخراج من الشيفت':'تشغيل في الشيفت'}</button></div>
    </div>`;
  }).join('');
  var chips=onShift.length?('<div class="chips">'+onShift.map(function(n){ return `<span class="chip">${esc(n.name)} — ${esc(n.region)}</span>`; }).join('')+'</div>'):'<p class="muted">مفيش ممرض في الشيفت حاليًا!</p>';
  return `<h3 class="sec-t">مين موجود في الشيفت دلوقتي (${onShift.length})</h3>
  ${chips}
  <h3 class="sec-t">إدارة الشيفت حسب الموقع</h3>
  ${cards}
  <div class="alert warn small">${icon('alert')} التوزيع بيتم على الممرضين الموجودين في الشيفت فقط — والأولوية للمنطقة اللي نفسها منطقة العميل.</div>`;
}
function mgrSettings(){
  var fees=Object.keys(state.fees);
  var edit=state.editNurseId?findNurse(state.editNurseId):null;
  var feeOpts=fees.map(function(r){ return `<option>${r}</option>`; }).join('');
  var addForm=`<div class="card" style="margin:12px 0">
    <b>➕ إضافة ممرض جديد (يوزر وباسورد خاص بيه)</b>
    <div class="grid2">
      <div class="field"><label>الاسم</label><input id="st-name" class="inp" placeholder="اسم الممرض/ة"></div>
      <div class="field"><label>اسم المستخدم (يوزر نيم)</label><input id="st-user" class="inp" placeholder="مثال: hoda"></div>
      <div class="field"><label>كلمة المرور</label><div class="pw-row"><input id="st-pass" class="inp" type="password" oninput="updatePwMeter('st-pass','st-meter')"><button type="button" class="eye" onclick="togglePw('st-pass',this)">👁</button></div><div id="st-meter"></div></div>
      <div class="field"><label>المنطقة</label><select id="st-region" class="inp">${feeOpts}</select></div>
    </div>
    <button class="btn btn-success" onclick="addNurseAcc()">إنشاء الحساب</button>
    <p class="muted small">كلمة المرور: ٨ حروف على الأقل وفيها حروف وأرقام. الحساب بيتعمل خارج الشيفت — شغّله من تاب «الشيفت».</p>
  </div>`;
  var rows=state.nurses.map(function(n){
    return `<tr><td>${esc(n.name)}</td><td><b class="mono">${esc(n.username)}</b></td><td>${esc(n.region)}</td><td>${n.onShift?'<span class="badge st-arrived">في الشيفت</span>':'<span class="badge st-done">خارج</span>'}</td><td>${n.rating} ${icon('star')}</td><td>${n.visits}</td><td><button class="btn btn-ghost btn-sm" onclick="editNurse(${n.id})">تعديل</button> <button class="btn btn-danger btn-sm" onclick="deleteNurse(${n.id})">حذف</button></td></tr>`;
  }).join('');
  var editor='';
  if(edit){
    var editRegionOpts=fees.map(function(r){ return `<option ${edit.region===r?'selected':''}>${r}</option>`; }).join('');
    editor=`<div class="card" style="border-color:var(--blue);margin:12px 0">
      <b>✏️ تعديل حساب: ${esc(edit.name)}</b>
      <div class="grid2">
        <div class="field"><label>الاسم</label><input id="ed-name" class="inp" value="${esc(edit.name)}"></div>
        <div class="field"><label>اليوزر نيم</label><input id="ed-user" class="inp" value="${esc(edit.username)}"></div>
        <div class="field"><label>المنطقة</label><select id="ed-region" class="inp">${editRegionOpts}</select></div>
        <div class="field"><label>كلمة مرور جديدة (اختياري)</label><div class="pw-row"><input id="ed-pass" class="inp" type="password" placeholder="سيبها فاضية لو مش هتغير"><button type="button" class="eye" onclick="togglePw('ed-pass',this)">👁</button></div></div>
      </div>
      <div class="inline-form"><button class="btn btn-success" onclick="saveNurseEdit()">حفظ التعديلات</button><button class="btn btn-ghost" onclick="cancelEdit()">إلغاء</button></div>
    </div>`;
  }
  var priceRows=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return `<tr><td><b>${s.name}</b></td><td><input class="inp sm" type="number" id="p-${s.id}" value="${c.price}"></td><td><input class="inp sm" type="number" id="d-${s.id}" value="${c.dur}"></td><td><input class="inp sm" type="number" id="x-${s.id}" value="${c.extra}"></td></tr>`;
  }).join('');
  var chips=state.allowed.map(function(a,i){
    return `<span class="chip">${esc(a)} <button onclick="removeAllowed(${i})" title="إزالة">×</button></span>`;
  }).join('');
  return `<h3 class="sec-t">إعدادات الحسابات — المدير يضيف ويعدّل الممرضين من هنا</h3>
  ${addForm}
  ${editor}
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>الاسم</th><th>اليوزر</th><th>المنطقة</th><th>الشيفت</th><th>التقييم</th><th>الزيارات</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <h3 class="sec-t">أمان حساب المدير</h3>
  <div class="card" style="margin:12px 0">
    <b>🔑 تغيير كلمة مرور المدير</b>
    <div class="grid2">
      <div class="field"><label>الحالية</label><input id="ad-old" class="inp" type="password"></div>
      <div class="field"><label>الجديدة</label><div class="pw-row"><input id="ad-new" class="inp" type="password" oninput="updatePwMeter('ad-new','ad-meter')"><button type="button" class="eye" onclick="togglePw('ad-new',this)">👁</button></div><div id="ad-meter"></div></div>
      <div class="field"><label>تأكيد الجديدة</label><input id="ad-new2" class="inp" type="password"></div>
    </div>
    <button class="btn btn-primary" onclick="changeAdminPass()">تحديث كلمة مرور المدير</button>
  </div>
  <h3 class="sec-t">إدارة الأسعار والخدمات</h3>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>الخدمة</th><th>السعر الأساسي (ج)</th><th>المدة الأساسية (د)</th><th>سعر الزيادة (ج)</th></tr></thead><tbody>${priceRows}</tbody></table></div>
  <div class="inline-form"><button class="btn btn-success" onclick="savePrices()">حفظ الأسعار</button><button class="btn btn-ghost btn-sm" onclick="resetDemo()">↺ إعادة ضبط البيانات التجريبية</button></div>
  <h3 class="sec-t">قائمة الحقن المسموحة</h3>
  <div class="chips">${chips}</div>
  <div class="card inline-form"><input id="a-add" class="inp" placeholder="اسم حقنة جديدة…"><button class="btn btn-primary" onclick="addAllowed()">إضافة بعد مراجعة</button></div>
  <div class="alert bad">${icon('alert')} القائمة المنوعة: كل المضادات الحيوية بكل أنواعها + أي حقنة مش في القائمة المسموحة.</div>
  <h3 class="sec-t">تقارير: عدد الطلبات والإيراد حسب المنطقة</h3>
  ${regionBars()}`;
}
function assignSel(r){
  var onShift=state.nurses.filter(function(n){ return n.onShift; });
  if(!onShift.length) return '<span class="badge late">مفيش ممرض في الشيفت</span>';
  var sorted=onShift.slice().sort(function(a,b){
    var ar=(a.region===r.region)?0:1;
    var br=(b.region===r.region)?0:1;
    return ar-br;
  });
  var opts=sorted.map(function(n){
    return `<option value="${n.id}">${esc(n.name)}${n.region===r.region?' — ✅ نفس المنطقة':' — '+esc(n.region)}</option>`;
  }).join('');
  return `<select class="inp sm" onchange="assignReq(${r.id}, this.value)"><option value="">أسند حسب الموقع…</option>${opts}</select>`;
}
function assignReq(id, nidStr){
  var nid=parseInt(nidStr,10);
  if(!nid) return;
  var r=findReq(id);
  var n=findNurse(nid);
  if(!r||!n) return;
  r.nurse=n.name; r.nurseId=n.id;
  if(r.status==='new') r.status='assigned';
  save(); refreshAll();
  toast('تم إسناد الطلب #'+id+' إلى '+n.name+' (منطقة '+n.region+')','ok');
}
function toggleShift(id){
  var n=findNurse(id); if(!n) return;
  n.onShift=!n.onShift;
  save(); renderPortal();
  toast(n.name+(n.onShift?' دخل الشيفت ✔':' خرج من الشيفت'), n.onShift?'ok':'warn');
}
function addNurseAcc(){
  var nm=(($('#st-name')||{}).value||'').trim();
  var un=(($('#st-user')||{}).value||'').trim();
  var pw=(($('#st-pass')||{}).value||'');
  var rg=(($('#st-region')||{}).value||'');
  if(nm.length<2){ toast('اكتب اسم الممرض/ة','warn'); return; }
  if(un.length<3){ toast('اليوزر نيم لازم ٣ حروف على الأقل','warn'); return; }
  if(usernameTaken(un,-1)){ toast('اليوزر نيم مستخدم بالفعل','warn'); return; }
  if(!passValid(pw)){ toast('كلمة المرور: ٨ حروف على الأقل وفيها حروف وأرقام','warn'); return; }
  var n={id:Date.now(),name:nm,username:un,region:rg,rating:5,visits:0,phone:'',onShift:false};
  setPassword(n,pw);
  state.nurses.push(n);
  save(); renderPortal();
  toast('تم إنشاء حساب '+nm+' ✔ — شغّله من تاب «الشيفت» لما يبدأ','ok');
}
function editNurse(id){ state.editNurseId=id; save(); renderPortal(); }
function cancelEdit(){ state.editNurseId=null; save(); renderPortal(); }
function saveNurseEdit(){
  var n=findNurse(state.editNurseId); if(!n) return;
  var nm=(($('#ed-name')||{}).value||'').trim();
  var un=(($('#ed-user')||{}).value||'').trim();
  var rg=(($('#ed-region')||{}).value||'').trim();
  var pw=(($('#ed-pass')||{}).value||'');
  if(nm.length<2||un.length<3){ toast('الاسم واليوزر مطلوبين','warn'); return; }
  if(usernameTaken(un,n.id)){ toast('اليوزر نيم مستخدم بالفعل','warn'); return; }
  n.name=nm; n.username=un; n.region=rg;
  if(pw){
    if(!passValid(pw)){ toast('كلمة المرور الجديدة ضعيفة: ٨ حروف على الأقل وفيها حروف وأرقام','warn'); return; }
    setPassword(n,pw);
  }
  state.requests.forEach(function(r){ if(r.nurseId===n.id) r.nurse=nm; });
  save();
  state.editNurseId=null;
  renderPortal();
  toast('تم تحديث حساب '+nm+' ✔','ok');
}
function deleteNurse(id){
  state.nurses=state.nurses.filter(function(n){ return n.id!==id; });
  save(); renderPortal();
  toast('تم حذف حساب الممرض','ok');
}
function changeAdminPass(){
  var me=null;
  state.admins.forEach(function(a){ if(a.username===session.username) me=a; });
  if(!me) return;
  var old=(($('#ad-old')||{}).value||'');
  var nw=(($('#ad-new')||{}).value||'');
  var nw2=(($('#ad-new2')||{}).value||'');
  if(!checkPassword(me,old)){ toast('كلمة المرور الحالية غلط','warn'); return; }
  if(!passValid(nw)){ toast('كلمة المرور الجديدة ضعيفة: ٨ حروف على الأقل وفيها حروف وأرقام','warn'); return; }
  if(nw!==nw2){ toast('التأكيد مش مطابق','warn'); return; }
  setPassword(me,nw);
  save(); renderPortal();
  toast('تم تغيير كلمة مرور المدير ✔','ok');
}
function savePrices(){
  SERVICES.forEach(function(s){
    var p=$('#p-'+s.id), d=$('#d-'+s.id), x=$('#x-'+s.id);
    if(p) state.prices[s.id].price=Math.max(0, parseInt(p.value,10)||0);
    if(d) state.prices[s.id].dur=Math.max(15, parseInt(d.value,10)||30);
    if(x) state.prices[s.id].extra=Math.max(0, parseInt(x.value,10)||0);
  });
  save(); renderHomeServices(); renderPricing();
  toast('تم حفظ الأسعار ✔','ok');
}
function addAllowed(){
  var v=(($('#a-add')||{}).value||'').trim();
  if(!v) return;
  if(isAntibiotic(v)){ toast('ممنوع إضافة مضاد حيوي للقائمة المسموحة','warn'); return; }
  if(state.allowed.indexOf(v)!==-1){ toast('الاسم موجود بالفعل','warn'); return; }
  state.allowed.push(v); save(); renderPortal();
  toast('تمت إضافة الحقنة بعد المراجعة ✔','ok');
}
function removeAllowed(i){ state.allowed.splice(i,1); save(); renderPortal(); }
function regionBars(){
  var map={};
  state.requests.forEach(function(r){
    if(!map[r.region]) map[r.region]={c:0,v:0};
    map[r.region].c++; map[r.region].v+=r.price;
  });
  var max=1;
  Object.keys(map).forEach(function(k){ if(map[k].v>max) max=map[k].v; });
  var bars=Object.keys(map).map(function(k){
    return `<div class="bar-row"><span class="bar-label">${esc(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(map[k].v/max*100)}%"></div></div><span class="bar-val">${map[k].c} طلب · ${map[k].v} ج</span></div>`;
  }).join('');
  return `<div class="bars">${bars}</div>`;
}
function updatePwMeter(inputId, meterId){
  var p=($('#'+inputId)||{}).value||'';
  var m=$('#'+meterId); if(!m) return;
  var s=passStrength(p);
  var labels=['ضعيفة جدًا','ضعيفة','متوسطة','قوية','قوية جدًا'];
  var colors=['#C62828','#E65100','#F9A825','#2E7D32','#1B5E20'];
  var segs='<span class="seg'+(s>0?' on':'')+'"></span><span class="seg'+(s>1?' on':'')+'"></span><span class="seg'+(s>2?' on':'')+'"></span><span class="seg'+(s>3?' on':'')+'"></span>';
  m.innerHTML='<div class="pw-meter">'+segs+'<span class="pw-label" style="color:'+colors[s]+'">'+labels[s]+'</span></div>';
}
function resetDemo(){
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  location.reload();
}

/* ---------- بوابة التمريض ---------- */
function renderNursePortal(){
  var app=$('#portal-app');
  var me=findNurse(session.id);
  if(!me){ setSession(null); renderPortal(); return; }
  var tabs=[['visits','🩺 زياراتي'],['log','📒 السجل'],['profile','⚙️ إعدادي']];
  var tabsHtml=tabs.map(function(t){
    return `<button class="tabbtn ${state.nurseTab===t[0]?'on':''}" onclick="setNurseTab('${t[0]}')">${t[1]}</button>`;
  }).join('');
  var mine=state.requests.filter(function(r){ return r.nurseId===me.id; });
  var assigned=mine.filter(function(r){ return r.status==='assigned'; });
  var active=mine.filter(function(r){ return r.status==='accepted'||r.status==='onway'||r.status==='arrived'; });
  var done=mine.filter(function(r){ return r.status==='done'; });
  var body='';
  if(state.nurseTab==='visits'){
    body=`<h3 class="sec-t">طلبات مُسندة ليك — في انتظار قبولك (${assigned.length})</h3>
    ${assigned.length?assigned.map(reqCard).join(''):'<p class="muted">مفيش طلبات جديدة مُسندة ليك.</p>'}
    <h3 class="sec-t">طلباتك النشطة (${active.length})</h3>
    ${active.length?active.map(reqCard).join(''):'<p class="muted">مفيش طلبات نشطة.</p>'}`;
  } else if(state.nurseTab==='log'){
    body=`<h3 class="sec-t">سجل زياراتك والتقييمات</h3>
    ${done.length?done.map(function(r){
      var s=SERVICE_BY[r.service]||{name:r.service};
      return `<div class="req done"><div class="req-top"><b>#${r.id} — ${esc(r.patient)} · ${esc(s.name)}</b><div>${r.rated?icon('star')+' '+r.rated+'/5':'<span class="muted small">لسه متقيّمش</span>'}</div></div><div class="muted small">${esc(r.address)} · ${r.price} ج · ${esc(r.date||'')}</div></div>`;
    }).join(''):'<p class="muted">لسه مفيش زيارات مكتملة.</p>'}`;
  } else {
    body=`<h3 class="sec-t">تغيير الاسم</h3>
    <div class="card inline-form"><input id="np-name" class="inp" value="${esc(me.name)}"><button class="btn btn-primary" onclick="saveNurseName()">حفظ الاسم</button></div>
    <h3 class="sec-t">تغيير كلمة المرور</h3>
    <div class="card">
      <div class="field"><label>كلمة المرور الحالية</label><div class="pw-row"><input id="np-old" class="inp" type="password"><button type="button" class="eye" onclick="togglePw('np-old',this)">👁</button></div></div>
      <div class="field"><label>كلمة المرور الجديدة</label><div class="pw-row"><input id="np-new" class="inp" type="password" oninput="updatePwMeter('np-new','np-meter')"><button type="button" class="eye" onclick="togglePw('np-new',this)">👁</button></div><div id="np-meter"></div></div>
      <div class="field"><label>تأكيد كلمة المرور الجديدة</label><input id="np-new2" class="inp" type="password"></div>
      <button class="btn btn-success" onclick="changeNursePass()">تحديث كلمة المرور</button>
      <p class="muted small">٨ حروف على الأقل وفيها حروف وأرقام.</p>
    </div>
    <div class="alert ok">${icon('shield')} حسابك محمي بيوزر <b class="mono">${esc(me.username)}</b> وكلمة مرور مشفّرة — مفيش حد يقدر يفتحه غيرك.</div>`;
  }
  app.innerHTML=`<div class="nurse-head admin-head">
    <div>${icon('user')} <b>${esc(me.name)}</b> <span class="badge">${esc(me.region)}</span> ${me.onShift?'<span class="badge st-arrived">في الشيفت</span>':'<span class="badge st-done">خارج الشيفت</span>'}</div>
    <div class="muted small">${icon('star')} ${me.rating} · ${me.visits} زيارة · جلسة محمية 🔒 <button class="btn btn-danger btn-sm" onclick="doLogout()">خروج</button></div>
  </div>
  <div class="tabs">${tabsHtml}</div>
  ${body}`;
}
function setNurseTab(t){ state.nurseTab=t; save(); renderPortal(); }
function findNurse(id){
  for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].id===id) return state.nurses[i]; }
  return null;
}
function reqCard(r){
  var s=SERVICE_BY[r.service]||{name:r.service};
  var actions='';
  if(r.status==='assigned') actions+='<button class="btn btn-success" onclick="acceptReq('+r.id+')">قبول الطلب ✔</button>';
  else if(NEXT[r.status]) actions+='<button class="btn btn-primary" onclick="nurseAdvance('+r.id+')">'+NEXTL[NEXT[r.status]]+' ←</button>';
  return `<div class="req">
    <div class="req-top"><b>#${r.id} — ${esc(r.patient)}</b><span class="badge st-${r.status}">${STATUSL[r.status]}</span></div>
    <div class="req-grid">
      <span>${icon('pin')} ${esc(r.region)} — ${esc(r.address)}</span>
      <span>${icon('clock')} ${r.dur} دقيقة · ${esc(r.date||'اليوم')} ${esc(r.time||'')}</span>
      <span>${icon('check')} ${esc(s.name)} — ${esc(r.detail||'')}</span>
      <span>${icon('wallet')} ${r.price} ج · ${esc(r.payment||'')}</span>
    </div>
    ${r.note?`<div class="alert warn small" style="margin-top:0">📝 ملحوظة العميل: ${esc(r.note)}</div>`:''}
    <div class="req-actions">${actions}</div>
  </div>`;
}
function acceptReq(id){
  var r=findReq(id);
  if(!r || r.status!=='assigned' || r.nurseId!==session.id) return;
  setStatus(r,'accepted');
  toast('قبلت الطلب #'+id+' ✔ — كلم العميل وابدأ تروح','ok');
}
function nurseAdvance(id){
  var r=findReq(id);
  if(!r || !NEXT[r.status] || r.nurseId!==session.id) return;
  setStatus(r, NEXT[r.status]);
}
function saveNurseName(){
  var me=findNurse(session.id); if(!me) return;
  var nm=(($('#np-name')||{}).value||'').trim();
  if(nm.length<2){ toast('اكتب الاسم','warn'); return; }
  state.requests.forEach(function(r){ if(r.nurseId===me.id) r.nurse=nm; });
  me.name=nm; session.name=nm; state.session=session;
  save(); renderPortal();
  toast('تم تغيير الاسم ✔','ok');
}
function changeNursePass(){
  var me=findNurse(session.id); if(!me) return;
  var old=(($('#np-old')||{}).value||'');
  var nw=(($('#np-new')||{}).value||'');
  var nw2=(($('#np-new2')||{}).value||'');
  if(!checkPassword(me,old)){ toast('كلمة المرور الحالية غلط','warn'); return; }
  if(!passValid(nw)){ toast('كلمة المرور الجديدة ضعيفة: ٨ حروف على الأقل وفيها حروف وأرقام','warn'); return; }
  if(nw!==nw2){ toast('التأكيد مش مطابق','warn'); return; }
  setPassword(me,nw);
  save(); renderPortal();
  toast('تم تغيير كلمة المرور ✔','ok');
}

/* =========================================================
   الرئيسية (ديناميكية)
   ========================================================= */
function renderHomeServices(){
  var el=$('#home-services-grid'); if(!el) return;
  el.innerHTML=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return `<button class="svc-card" onclick="startBooking()">
      ${icon(s.icon,'svc-ic')}
      <b>${s.name}</b>
      <span class="muted small">${s.desc}</span>
      <span class="svc-meta">${icon('clock')} ${c.dur} دقيقة · ${c.price} ج</span>
    </button>`;
  }).join('');
}
function renderPricing(){
  var el=$('#home-prices-body'); if(!el) return;
  var rows=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return `<tr><td><b>${s.name}</b><div class="muted small">${s.desc}</div></td><td>${c.dur} دقيقة</td><td><b>${c.price}</b></td></tr>`;
  }).join('');
  el.innerHTML=`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الخدمة</th><th>المدة الأساسية</th><th>السعر المقترح (جنيه)</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function startBooking(){
  booking=freshBooking();
  showView('patient');
  toast('ابدأ بمسح الكود وبعدين سجل دخولك بالوجه 🙂','ok');
}

/* ---------- الإقلاع ---------- */
function init(){
  migratePasswords();
  session=state.session||null;
  validateSession();
  $$('.navbtn').forEach(function(b){
    b.addEventListener('click', function(){ showView(b.getAttribute('data-view')); });
  });
  renderHomeServices();
  renderPricing();
  var hq=$('#qr-hero'); if(hq) drawQR(hq);
  showView('home');
  armIdleLogout();
}
document.addEventListener('click', armIdleLogout, true);
document.addEventListener('keydown', armIdleLogout, true);
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
else{ init(); }
