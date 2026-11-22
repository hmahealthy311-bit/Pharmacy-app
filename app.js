/* =========================================================
   نرس لينك (Nurseline) — منطق النموذج التفاعلي
   رحلة المريض ٩ خطوات + تطبيق الممرض + لوحة الإدارة
   مبني على «نرس لينك – وثيقة المفهوم»
   ========================================================= */
'use strict';

/* ---------- أدوات ---------- */
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
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
  return '<svg class="ic '+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(I[name]||'')+'</svg>';
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

/* ---------- الحالة (مع تخزين محلي) ---------- */
var LS_KEY='nurseline_state_v1';
var DEFAULTS={
  session:null,
  completedVisits:2,
  seq:1004,
  nurses:[
    {id:1,name:'سارة عبد الله',region:'مدينة نصر',rating:4.8,visits:34,phone:'01001112233'},
    {id:2,name:'منى إبراهيم',region:'المعادي',rating:4.6,visits:21,phone:'01002223344'},
    {id:3,name:'أحمد فتحي',region:'المهندسين',rating:4.9,visits:40,phone:'01003334455'},
    {id:4,name:'هدى مصطفى',region:'حلوان',rating:4.5,visits:12,phone:'01004445566'},
    {id:5,name:'نهى كمال',region:'6 أكتوبر',rating:4.7,visits:18,phone:'01005556677'}
  ],
  requests:[
    {id:1001,patient:'كريم حسن',phone:'01001234567',region:'مدينة نصر',service:'injection',detail:'فيتامين B12',extra:0,dur:30,price:190,address:'12 شارع عباس العقاد، مدينة نصر',date:'',time:'17:30',payment:'انستا باي',status:'new',nurse:null,overdue:true},
    {id:1002,patient:'أميرة سامي',phone:'01112345678',region:'المعادي',service:'iv',detail:'محلول ملحي',extra:0,dur:60,price:340,address:'9 شارع رقم 9، المعادي',date:'',time:'13:00',payment:'كاش',status:'onway',nurse:'منى إبراهيم'},
    {id:1003,patient:'محمود عيد',phone:'01223456789',region:'المهندسين',service:'wound',detail:'جرح بعد عملية',extra:0,dur:30,price:250,address:'4 شارع الجيزة',date:'',time:'10:00',payment:'دفع أونلاين',status:'done',nurse:'أحمد فتحي',rated:5}
  ],
  ratings:[
    {nurse:'أحمد فتحي',stars:5,comment:'محترم وفعّال، الله يبارك.',when:'2025-01-12'},
    {nurse:'منى إبراهيم',stars:4,comment:'قدوم كانت متأخرة شوية.',when:'2025-01-10'},
    {nurse:'سارة عبد الله',stars:5,comment:'ممتازة مع ماما.',when:'2025-01-08'}
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
  fees:{'مدينة نصر':25,'المعادي':30,'المهندسين':30,'حلوان':45,'شبرا':35,'مدينة نصر الجديدة':35,'6 أكتوبر':50,'الدقي':30}
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
var nurseSession=state.session||null;

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
  if(v==='nurse') renderNurse();
  if(v==='admin') renderAdmin();
}
function scrollToServices(){
  var el=document.getElementById('home-services');
  if(el) el.scrollIntoView({behavior:'smooth'});
}
function refreshAll(){
  if(currentView==='patient' && booking.step>=7) renderStep();
  if(currentView==='nurse') renderNurse();
  if(currentView==='admin') renderAdmin();
}

/* ---------- كود QR تجريبي ---------- */
function drawQR(el){
  var size=21, h='';
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
      h+='<span class="'+(dark?'qd':'')+'"></span>';
    }
  }
  el.style.gridTemplateColumns='repeat('+size+',1fr)';
  el.innerHTML=h;
}

/* =========================================================
   رحلة المريض — ٩ خطوات
   ========================================================= */
var STEPS=['مسح الكود','اختيار الخدمة','التفاصيل','المدة والإضافات','العنوان والموعد','المراجعة','الدفع','التتبع','التقييم'];
var PAYL={cash:'كاش',insta:'انستا باي',online:'دفع أونلاين'};
var STATUSL={new:'في انتظار القبول',accepted:'تم القبول',onway:'في الطريق',arrived:'وصل',done:'خلصت'};
var NEXTL={onway:'في الطريق',arrived:'وصلت',done:'خلصت الزيارة'};
var ORDER=['new','accepted','onway','arrived','done'];
var NEXT={accepted:'onway',onway:'arrived',arrived:'done'};

function freshBooking(){
  return {step:1,scanned:false,service:null,choice:null,itemIdx:-1,selfName:'',rx:false,notes:'',extra:0,
    region:'',address:'',phone:'',date:'',time:'',transport:false,
    payment:null,proof:false,paid:false,reqId:null,stars:0,comment:''};
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
  if(booking.step<9){ booking.step++; renderStep(); }
}
function prevStep(){ if(booking.step>1){ booking.step--; renderStep(); } }

function canPass(s){
  switch(s){
    case 1: return booking.scanned;
    case 2: return !!booking.service;
    case 3: return detailValid();
    case 4: return true;
    case 5: return !!booking.region && booking.address.trim().length>=5 && /^01[0-9]{9}$/.test(booking.phone) && !!booking.date && !!booking.time;
    case 6: return true;
    case 7: return paymentValid();
    case 8: { var r=findReq(booking.reqId); return !!(r && r.status==='done'); }
    case 9: return booking.stars>0;
  }
  return false;
}
function detailValid(){
  if(!booking.service) return false;
  if(booking.service==='injection'){
    if(!booking.choice) return false;
    if(booking.choice==='self'){
      if(isAntibiotic(booking.selfName)) return false;
      if(booking.selfName.trim().length<2) return false;
    }
  } else if(!booking.choice){ booking.choice='none'; }
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
      return 'الدواء مع المريض: '+(booking.selfName.trim()||'—')+(booking.rx?' (روشتة مرفقة)':'');
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
  }
  body.innerHTML=html;
  var q=$('#qrbox'); if(q) drawQR(q);
}

/* ---------- الخطوة ١: سكان الكود ---------- */
function step1(){
  return '<div class="step-title">'+icon('qr')+' الخطوة ١ — سكان الكود</div>'+
  '<p class="muted">العميل يمسح كود QR من كارت، أو إعلان، أو ستيكر — فيفتح الموقع ويظهر ترحيب باسم المنصة.</p>'+
  '<div class="scan-wrap">'+
    '<div class="qr-card"><div class="qr" id="qrbox"></div><div class="qr-cap">كود QR — نرس لينك</div></div>'+
    '<div>'+(booking.scanned ?
      '<div class="loc-found">'+icon('pin')+' تم تحديد موقعك التقريبي: <b>القاهرة، مصر</b></div>'+
      '<div class="welcome-big">أهلاً بيك في <b>نرس لينك</b> 👋</div>'+
      '<p>تمريض منزلي بثقة — اختار خدمتك ووصلنا لحد بيتك.</p>'+
      '<button class="btn btn-success btn-lg" onclick="nextStep()">ابدأ الحجز ←</button>'
      :
      '<button class="btn btn-primary btn-lg" onclick="scanCode()">📱 امسح الكود (محاكاة)</button>'+
      '<p class="muted small">دي محاكاة لخطوة المسح — في التطبيق الحقيقي الكاميرا بتفتح تلقائي.</p>'
    )+'</div>'+
  '</div>';
}
function scanCode(){ booking.scanned=true; renderStep(); toast('تم مسح الكود بنجاح ✔','ok'); }

/* ---------- الخطوة ٢: اختيار الخدمة ---------- */
function step2(){
  var cards=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return '<button class="svc-card '+(booking.service===s.id?'sel':'')+'" onclick="pickService(\''+s.id+'\')">'+
      icon(s.icon,'svc-ic')+
      '<b>'+s.name+'</b>'+
      '<span class="muted small">'+s.desc+'</span>'+
      '<span class="svc-meta">'+icon('clock')+' '+c.dur+' دقيقة · '+c.price+' ج</span>'+
    '</button>';
  }).join('');
  return '<div class="step-title">'+icon('check')+' الخطوة ٢ — اختيار الخدمة</div>'+
  '<p class="muted">كروت كبيرة بأيقونات واضحة — زي ما الوثيقة حددت لسهولة الاستخدام حتى لكبار السن.</p>'+
  '<div class="svc-grid">'+cards+'</div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">التالي ←</button></div>';
}
function pickService(id){
  booking.service=id; booking.choice=null; booking.itemIdx=-1;
  booking.selfName=''; booking.rx=false; booking.extra=0;
  renderStep();
}

/* ---------- الخطوة ٣: التفاصيل ---------- */
function step3(){
  var s=SERVICE_BY[booking.service];
  var inner='';
  if(s.id==='injection'){
    inner=
      '<div class="rule-box ok">'+icon('shield')+' الحقن المسموحة على المنصة (عضلة فقط): '+state.allowed.map(esc).join('، ')+'.</div>'+
      '<div class="rule-box bad">'+icon('alert')+' الحقن المضادة الحيوية بكل أنواعها <b>ممنوعة</b> على المنصة.</div>'+
      '<label class="opt '+(booking.choice==='none'?'sel':'')+'"><input type="radio" name="ch" '+(booking.choice==='none'?'checked':'')+' onchange="setChoice(\'none\')"><span>مش محتاج دواء — الدواء موجود عندي</span></label>'+
      '<label class="opt '+(booking.choice==='bring'?'sel':'')+'"><input type="radio" name="ch" '+(booking.choice==='bring'?'checked':'')+' onchange="setChoice(\'bring\')"><span>الممرض يجيب معاه الدواء (سعره بيتضاف على الفاتورة)</span></label>'+
      (booking.choice==='bring' ? '<div class="med-list">'+state.items.injection.map(function(m,i){
          return '<label class="opt small '+(booking.itemIdx===i?'sel':'')+'"><input type="radio" name="med" '+(booking.itemIdx===i?'checked':'')+' onchange="setItemIdx('+i+')"><span>'+esc(m.n)+' <b class="price-tag">+'+m.p+' ج</b></span></label>';
        }).join('')+'</div>' : '')+
      '<label class="opt '+(booking.choice==='self'?'sel':'')+'"><input type="radio" name="ch" '+(booking.choice==='self'?'checked':'')+' onchange="setChoice(\'self\')"><span>هجيب الدواء بنفسي (مطلوب روشتة من الدكتور)</span></label>'+
      (booking.choice==='self' ?
        '<div class="self-box">'+
          '<input class="inp" type="text" placeholder="اكتب اسم الدواء اللي معاك…" value="'+esc(booking.selfName)+'" oninput="selfChanged(this)">'+
          '<label class="file-btn">'+(booking.rx?'✔ روشتة مرفقة':'📎 ارفق صورة الروشتة')+'<input type="file" accept="image/*" hidden onchange="rxPicked(this)"></label>'+
          '<div id="self-alerts">'+selfAlerts()+'</div>'+
          '<p class="muted small">أي حقنة مش في القائمة بتتم مراجعتها من الإدارة قبل التنفيذ — واسم الدواء اللي الإدارة تقرره هو المعتمد.</p>'+
        '</div>' : '');
  } else if(state.items[s.id] && state.items[s.id].length){
    inner=
      '<label class="opt '+(booking.choice==='bring'?'sel':'')+'"><input type="radio" name="ch" '+(booking.choice==='bring'?'checked':'')+' onchange="setChoice(\'bring\')"><span>الممرض يجيب معاه المستلزمات (بتتضاف على الفاتورة)</span></label>'+
      (booking.choice==='bring' ? '<div class="med-list">'+state.items[s.id].map(function(m,i){
          return '<label class="opt small '+(booking.itemIdx===i?'sel':'')+'"><input type="radio" name="med" '+(booking.itemIdx===i?'checked':'')+' onchange="setItemIdx('+i+')"><span>'+esc(m.n)+' <b class="price-tag">+'+m.p+' ج</b></span></label>';
        }).join('')+'</div>' : '')+
      '<label class="opt '+(booking.choice==='none'?'sel':'')+'"><input type="radio" name="ch" '+(booking.choice==='none'?'checked':'')+' onchange="setChoice(\'none\')"><span>المستلزمات موجودة عندي</span></label>'+
      '<div class="field"><label>ملاحظات للممرض (اختياري)</label><textarea class="inp" rows="2" placeholder="مثال: الجرح في الرجل الشمال، النقاط اتشالت يوم…" oninput="booking.notes=this.value">'+esc(booking.notes)+'</textarea></div>';
  } else {
    if(!booking.choice) booking.choice='none';
    inner='<div class="field"><label>ملاحظات للممرض (اختياري)</label><textarea class="inp" rows="3" placeholder="حالة المريض، أي تفاصيل مهمة…" oninput="booking.notes=this.value">'+esc(booking.notes)+'</textarea></div>';
  }
  return '<div class="step-title">'+icon('check')+' الخطوة ٣ — تفاصيل الخدمة</div>'+
  '<p class="muted">الخدمة المختارة: <b>'+s.name+'</b></p>'+inner+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" '+(detailValid()?'':'disabled')+' onclick="nextStep()">التالي ←</button></div>';
}
function setChoice(v){ booking.choice=v; if(v!=='bring') booking.itemIdx=-1; renderStep(); }
function setItemIdx(i){ booking.itemIdx=i; renderStep(); }
function selfAlerts(){
  var t=booking.selfName.trim(), h='';
  if(t.length>=2){
    if(isAntibiotic(t)){
      h+='<div class="alert bad">'+icon('alert')+' <b>خدمة دي غير متاحة حالياً</b> — الحقن المضادة الحيوية مش متاحة عبر نرس لينك. لو دكتورك وصفلك حقنة مضاد حيوي، نفّذها بره المنصة أو استشير الدكتور في بديل.</div>';
    } else if(state.allowed.indexOf(t)===-1){
      h+='<div class="alert warn">'+icon('alert')+' الحقنة دي مش في القائمة المسموحة — هتحتاج مراجعة من الإدارة قبل التنفيذ.</div>';
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

/* ---------- الخطوة ٤: المدة والإضافات ---------- */
function step4(){
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[s.id];
  var unit=(s.id==='care')?'ساعة':'نصف ساعة';
  var c=calc();
  return '<div class="step-title">'+icon('clock')+' الخطوة ٤ — المدة والإضافات</div>'+
  '<p class="muted">المدة الأساسية لـ<b>'+s.name+'</b>: <b>'+cfg.dur+' دقيقة</b> — وكل إضافة ثابتة السعر وبتظهر فورًا.</p>'+
  '<div class="dur-box">'+
    '<div>المدة الأساسية: <b>'+cfg.dur+' د</b> · السعر: <b>'+cfg.price+' ج</b></div>'+
    '<div class="stepper">'+
      '<button class="btn btn-ghost" onclick="addExtra(-1)">−</button>'+
      '<div class="dur-val">+ '+booking.extra+' '+unit+'</div>'+
      '<button class="btn btn-success" onclick="addExtra(1)">+</button>'+
    '</div>'+
    '<div class="muted small">كل '+unit+' إضافية: <b>+'+cfg.extra+' ج</b></div>'+
    '<div class="price-live">السعر الحالي: <b>'+(c.base+c.extraCost+c.items)+' ج</b></div>'+
  '</div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">التالي ←</button></div>';
}
function addExtra(d){ booking.extra=Math.max(0, booking.extra+d); renderStep(); }

/* ---------- الخطوة ٥: العنوان والموعد ---------- */
function step5(){
  var regions=Object.keys(state.fees);
  var opts=regions.map(function(r){ return '<option '+(booking.region===r?'selected':'')+'>'+r+'</option>'; }).join('');
  return '<div class="step-title">'+icon('pin')+' الخطوة ٥ — العنوان والموعد</div>'+
  '<div class="grid2">'+
    '<div class="field"><label>المنطقة '+icon('pin')+'</label><select class="inp" onchange="booking.region=this.value; renderStep()"><option value="">اختار منطقتك…</option>'+opts+'</select></div>'+
    '<div class="field"><label>الموعد</label><div class="grid2"><input class="inp" type="date" value="'+esc(booking.date)+'" onchange="booking.date=this.value"><input class="inp" type="time" value="'+esc(booking.time)+'" onchange="booking.time=this.value"></div></div>'+
    '<div class="field wide"><label>العنوان بالتفصيل</label><textarea class="inp" rows="2" placeholder="المبنى، الدور، علامة مميزة…" oninput="booking.address=this.value">'+esc(booking.address)+'</textarea></div>'+
    '<div class="field"><label>رقم الموبايل</label><input class="inp" type="tel" placeholder="01xxxxxxxxx" value="'+esc(booking.phone)+'" oninput="booking.phone=this.value"></div>'+
    '<div class="field"><label class="chk"><input type="checkbox" '+(booking.transport?'checked':'')+' onchange="booking.transport=this.checked; renderStep()"> أضف رسوم مواصلات الممرض (اختياري)</label>'+(booking.transport&&booking.region?'<div class="muted small">رسوم المنطقة: <b>'+state.fees[booking.region]+' ج</b></div>':'')+'</div>'+
  '</div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-primary" onclick="nextStep()">المراجعة ←</button></div>';
}

/* ---------- الخطوة ٦: المراجعة ---------- */
function step6(){
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[booking.service];
  var c=calc();
  var unitTxt=(s.id==='care')?(booking.extra+' ساعة إضافية'):(booking.extra+' × ٣٠ دقيقة إضافية');
  var disc=discPercent();
  return '<div class="step-title">الخطوة ٦ — مراجعة الطلب</div>'+
  '<div class="review">'+
    '<div class="rev-row"><span>الخدمة</span><b>'+s.name+'</b></div>'+
    '<div class="rev-row"><span>التفاصيل</span><b>'+esc(detailText())+'</b></div>'+
    '<div class="rev-row"><span>المدة</span><b>'+cfg.dur+' د'+(booking.extra?' + '+unitTxt:'')+'</b></div>'+
    '<div class="rev-row"><span>المنطقة</span><b>'+esc(booking.region)+'</b></div>'+
    '<div class="rev-row"><span>العنوان</span><b>'+esc(booking.address)+'</b></div>'+
    '<div class="rev-row"><span>الموبايل</span><b>'+esc(booking.phone)+'</b></div>'+
    '<div class="rev-row"><span>الموعد</span><b>'+esc(booking.date||'—')+' · '+esc(booking.time||'—')+'</b></div>'+
    '<div class="rev-row"><span>المواصلات</span><b>'+(booking.transport?(state.fees[booking.region]+' ج'):'بدون')+'</b></div>'+
  '</div>'+
  '<div class="price-box">'+
    '<div class="pr-row"><span>الخدمة الأساسية</span><span>'+c.base+' ج</span></div>'+
    '<div class="pr-row"><span>وقت إضافي</span><span>'+c.extraCost+' ج</span></div>'+
    '<div class="pr-row"><span>دواء / مستلزمات</span><span>'+c.items+' ج</span></div>'+
    '<div class="pr-row"><span>مواصلات</span><span>'+c.transport+' ج</span></div>'+
    '<div class="pr-row disc"><span>خصم الولاء ('+disc+'%)</span><span>−'+c.discAmt+' ج</span></div>'+
    '<div class="pr-row total"><span>الإجمالي</span><span>'+c.total+' ج</span></div>'+
  '</div>'+
  '<div class="loyalty">'+icon('star')+' دي الزيارة رقم <b>'+cycleVisit()+'</b> من ٥ في دورة الخصم — خصم الولاء الحالي: <b>'+disc+'%</b> <span class="small">(الخصم بيزيد ١٪ مع كل زيارة مكتملة، الخامسة ٥٪ وبعدها الدورة تصفر)</span></div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-success" onclick="nextStep()">اعتماد والانتقال للدفع ←</button></div>';
}

/* ---------- الخطوة ٧: الدفع ---------- */
function step7(){
  var pay=booking.payment;
  var methods=[
    ['cash','كاش','الممرض يستلم المبلغ عند وصوله ويوثق القيمة المطلوبة.','wallet'],
    ['insta','انستا باي','يظهرلك رقم أو عنوان الدفع، وتحوّل وتطلب إثبات التحويل.','phone'],
    ['online','دفع أونلاين من الموقع','دفع مباشر داخل الموقع قبل الزيارة.','shield']
  ];
  var cards=methods.map(function(m){
    return '<button class="pay-card '+(pay===m[0]?'sel':'')+'" onclick="pickPayment(\''+m[0]+'\')">'+icon(m[3])+'<b>'+m[1]+'</b><span class="muted small">'+m[2]+'</span></button>';
  }).join('');
  var panel='';
  if(pay==='insta'){
    panel='<div class="insta-box"><div>'+icon('phone')+' رقم انستا باي: <b class="mono">0100 000 0000</b> — عنوان الدفع: <b class="mono">nurseline@instapay</b></div><label class="chk"><input type="checkbox" '+(booking.proof?'checked':'')+' onchange="booking.proof=this.checked; syncPayBtn()"> بعت صورة إثبات التحويل ✔</label></div>';
  } else if(pay==='online'){
    panel=booking.paid
      ? '<div class="insta-box"><div class="alert ok" style="margin:0">تم الدفع أونلاين بنجاح ✔</div></div>'
      : '<div class="insta-box"><button class="btn btn-primary" onclick="payOnline()">💳 ادفع الآن ('+calc().total+' ج) — محاكاة</button></div>';
  } else if(pay==='cash'){
    panel='<div class="insta-box">المبلغ المطلوب عند الوصول: <b>'+calc().total+' ج</b> — الممرض هيوثق الاستلام.</div>';
  }
  return '<div class="step-title">الخطوة ٧ — طريقة الدفع</div>'+
  '<p class="muted">٣ طرق دفع — بتختار واحدة في الخطوة الأخيرة زي ما الوثيقة حددت.</p>'+
  '<div class="pay-grid">'+cards+'</div>'+panel+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button id="wiz-confirm" class="btn btn-success" '+(paymentValid()?'':'disabled')+' onclick="confirmOrder()">تأكيد الطلب ✔</button></div>';
}
function pickPayment(m){ booking.payment=m; renderStep(); }
function payOnline(){ booking.paid=true; renderStep(); toast('تم الدفع (محاكاة) ✔','ok'); }
function syncPayBtn(){ var b=$('#wiz-confirm'); if(b) b.disabled=!paymentValid(); }
function confirmOrder(){
  if(booking.reqId){ booking.step=8; renderStep(); return; }
  if(!paymentValid()){ toast('كمّل اختيار طريقة الدفع','warn'); return; }
  var s=SERVICE_BY[booking.service];
  var cfg=state.prices[booking.service];
  var c=calc();
  var req={
    id:state.seq++, patient:'عميل تجريبي', phone:booking.phone, region:booking.region,
    service:booking.service, detail:detailText(), extra:booking.extra,
    dur:cfg.dur + booking.extra*(s.id==='care'?60:30),
    price:c.total, address:booking.address, date:booking.date, time:booking.time,
    payment:PAYL[booking.payment], status:'new', nurse:null
  };
  state.requests.unshift(req);
  booking.reqId=req.id;
  save();
  simulateRequest(req);
  booking.step=8;
  renderStep();
  toast('تم تأكيد الطلب 🎉 — بنتتبعه الآن','ok');
}

/* ---------- الخطوة ٨: التتبع ---------- */
function step8(){
  var r=findReq(booking.reqId)||{status:'new'};
  var stages=[['accepted','تم القبول','الممرض وافق الطلب'],['onway','في الطريق','الممرض نازل ليك'],['arrived','وصل','الممرض وصل عنوانك'],['done','خلصت الزيارة','مبروك — قيّم الممرض']];
  var idx=-1;
  for(var i=0;i<stages.length;i++){ if(stages[i][0]===r.status) idx=i; }
  var tl=stages.map(function(st,i){
    var cls=((idx>=0 && i<=idx)?'on':'')+(r.status===st[0]?' now':'');
    return '<div class="tl '+cls+'"><div class="tl-dot">'+(i<idx?icon('check'):'')+'</div><div><b>'+st[1]+'</b><span class="muted">'+st[2]+'</span></div></div>';
  }).join('');
  return '<div class="step-title">الخطوة ٨ — تتبع الطلب</div>'+
  '<p class="muted">حالة الطلب بتتحدث هنا مباشرة — ودي نفس الحاجات اللي الممرض شايفها في تطبيقه.</p>'+
  (r.status==='new'?'<div class="alert warn">'+icon('clock')+' في انتظار قبول ممرض من منطقة <b>'+esc(r.region)+'</b>…</div>':'')+
  (r.nurse?'<div class="nurse-mini">'+icon('user')+' الممرض/ة: <b>'+esc(r.nurse)+'</b> · '+icon('phone')+' '+esc(nursePhone(r.nurse))+'</div>':'')+
  '<div class="timeline">'+tl+'</div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-ghost" onclick="boost()">⏩ تسريع المحاكاة</button><button class="btn btn-primary" '+(r.status==='done'?'':'disabled')+' onclick="nextStep()">التقييم ←</button></div>';
}
function nursePhone(name){
  for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].name===name) return state.nurses[i].phone||'—'; }
  return '—';
}
function setStatus(req,to){
  if(!req) return;
  if(ORDER.indexOf(to)<=ORDER.indexOf(req.status)) return;
  req.status=to;
  if(to==='accepted' && !req.nurse){
    var same=null;
    for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].region===req.region){ same=state.nurses[i]; break; } }
    if(same){ req.nurse=same.name; }
    else if(state.nurses.length){
      req.nurse=state.nurses[0].name;
      toast('مفيش ممرض في منطقة '+req.region+' — الإدارة سندت أقرب ممرض يدويًا','warn');
    }
  }
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
  var plan=[[2500,'accepted'],[8500,'onway'],[14500,'arrived'],[20500,'done']];
  plan.forEach(function(p){
    setTimeout(function(){ if(state.requests.indexOf(req)!==-1) setStatus(req,p[1]); }, p[0]);
  });
}

/* ---------- الخطوة ٩: التقييم ---------- */n
function step9(){
  var r=findReq(booking.reqId)||{};
  var stars=[1,2,3,4,5].map(function(n){
    return '<button class="starbtn '+(booking.stars>=n?'on':'')+'" onclick="setStars('+n+')">★</button>';
  }).join('');
  return '<div class="step-title">الخطوة ٩ — تقييم الممرض</div>'+
  '<p class="muted">قيم الممرض من ١ لـ ٥ نجوم — اختياري مع تعليق، وبيوصل للإدارة مباشرة.</p>'+
  (r.nurse?'<div class="nurse-mini">'+icon('user')+' بتقيّم: <b>'+esc(r.nurse)+'</b></div>':'')+
  '<div class="stars">'+stars+'</div>'+
  '<div class="field"><label>تعليق (اختياري)</label><textarea class="inp" rows="2" placeholder="رأيك في الخدمة…" oninput="booking.comment=this.value">'+esc(booking.comment)+'</textarea></div>'+
  '<div class="wiz-actions"><button class="btn btn-ghost" onclick="prevStep()">→ السابق</button><button class="btn btn-success" '+(booking.stars>0?'':'disabled')+' onclick="submitRating()">إرسال التقييم ✔</button></div>';
}
function setStars(n){ booking.stars=n; renderStep(); }
function submitRating(){
  var r=findReq(booking.reqId); if(!r) return;
  var cmt=booking.comment||'';
  r.rated=booking.stars;
  state.ratings.unshift({nurse:r.nurse,stars:booking.stars,comment:cmt,when:new Date().toISOString().slice(0,10)});
  var nurse=null;
  for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].name===r.nurse) nurse=state.nurses[i]; }
  if(nurse){
    nurse.visits++;
    var mine=state.ratings.filter(function(x){ return x.nurse===nurse.name; });
    var sum=mine.reduce(function(a,b){ return a+b.stars; },0);
    nurse.rating=Math.round(sum/mine.length*10)/10;
  }
  state.completedVisits++;
  save();
  var pos=cyclePos();
  $('#wiz-body').innerHTML=
    '<div class="thanks">'+
      '<div class="thanks-ic">✅</div>'+
      '<h3>شكراً ليك!</h3>'+
      '<p>تقييمك وصل للإدارة وهيساعد نحسّن الخدمة.</p>'+
      '<div class="loyalty big">'+icon('star')+' الزيارات المكتملة في دورتك الحالية: <b>'+pos+'/5</b> — خصمك في الزيارة الجاية: <b>'+DISC[pos]+'%</b></div>'+
      '<button class="btn btn-primary btn-lg" onclick="newOrder()">اطلب زيارة جديدة</button>'+
    '</div>';
  toast('شكراً لتقييمك 🌟','ok');
}
function newOrder(){ booking=freshBooking(); renderWizard(); }

/* =========================================================
   تطبيق الممرض
   ========================================================= */
function renderNurse(){
  var login=$('#nurse-login'), app=$('#nurse-app');
  if(!nurseSession){
    login.classList.remove('hidden'); app.classList.add('hidden');
    return;
  }
  login.classList.add('hidden'); app.classList.remove('hidden');
  var n=null;
  for(var i=0;i<state.nurses.length;i++){ if(state.nurses[i].name===nurseSession) n=state.nurses[i]; }
  if(!n) n=state.nurses[0];
  var regionNew=state.requests.filter(function(r){ return r.region===n.region && r.status==='new' && !r.nurse; });
  var active=state.requests.filter(function(r){ return r.nurse===n.name && (r.status==='accepted'||r.status==='onway'||r.status==='arrived'); });
  var done=state.requests.filter(function(r){ return r.nurse===n.name && r.status==='done'; });
  app.innerHTML=
    '<div class="nurse-head">'+
      '<div>'+icon('user')+' <b>'+esc(n.name)+'</b> <span class="badge">'+esc(n.region)+'</span></div>'+
      '<div class="muted">'+icon('star')+' '+n.rating+' · '+n.visits+' زيارة <button class="btn btn-ghost btn-sm" onclick="nurseLogout()">خروج</button></div>'+
    '</div>'+
    '<h3 class="sec-t">الطلبات الجديدة في منطقتك ('+regionNew.length+')</h3>'+
    (regionNew.length?regionNew.map(reqCard).join(''):'<p class="muted">مفيش طلبات جديدة حاليًا في منطقتك.</p>')+
    '<h3 class="sec-t">طلباتك النشطة ('+active.length+')</h3>'+
    (active.length?active.map(reqCard).join(''):'<p class="muted">مفيش طلبات نشطة.</p>')+
    '<h3 class="sec-t">سجل الزيارات والتقييمات</h3>'+
    (done.length?done.map(function(r){
      return '<div class="req done"><div class="req-top"><b>#'+r.id+' — '+esc(r.patient)+' · '+SERVICE_BY[r.service].name+'</b><div>'+(r.rated?icon('star')+' '+r.rated+'/5':'<span class="muted small">لسه متقيّمش</span>')+'</div></div><div class="muted small">'+esc(r.address)+'</div></div>';
    }).join(''):'<p class="muted">لسه مفيش زيارات مكتملة.</p>');
}
function reqCard(r){
  var s=SERVICE_BY[r.service]||{name:r.service};
  var isMine=nurseSession && r.nurse===nurseSession;
  var canAccept=(r.status==='new' && !r.nurse);
  var actions='';
  if(canAccept) actions+='<button class="btn btn-success" onclick="acceptReq('+r.id+')">قبول الطلب ✔</button>';
  if(isMine && NEXT[r.status]) actions+='<button class="btn btn-primary" onclick="nurseAdvance('+r.id+')">'+NEXTL[NEXT[r.status]]+' ←</button>';
  if(r.nurse && !isMine) actions+='<span class="muted small">مُسند لـ: '+esc(r.nurse)+'</span>';
  return '<div class="req">'+
    '<div class="req-top"><b>#'+r.id+' — '+esc(r.patient)+'</b><span class="badge st-'+r.status+'">'+STATUSL[r.status]+'</span></div>'+
    '<div class="req-grid">'+
      '<span>'+icon('pin')+' '+esc(r.region)+' — '+esc(r.address)+'</span>'+
      '<span>'+icon('clock')+' '+r.dur+' دقيقة · '+esc(r.date||'اليوم')+' '+esc(r.time||'')+'</span>'+
      '<span>'+icon('check')+' '+esc(s.name)+' — '+esc(r.detail||'')+'</span>'+
      '<span>'+icon('wallet')+' '+r.price+' ج · '+esc(r.payment||'')+'</span>'+
    '</div>'+
    (r.overdue && r.status==='new'?'<div class="alert bad small">'+icon('alert')+' محدش قبلش الطلب — محتاج سند يدوي من الإدارة.</div>':'')+
    '<div class="req-actions">'+actions+'</div>'+
  '</div>';
}
function acceptReq(id){
  var r=findReq(id); if(!r) return;
  r.nurse=nurseSession; r.status='accepted';
  save(); refreshAll();
  toast('قبلت الطلب #'+id+' ✔','ok');
}
function nurseAdvance(id){
  var r=findReq(id);
  if(!r || !NEXT[r.status]) return;
  setStatus(r, NEXT[r.status]);
}
function nurseLogin(){
  var ph=($('#n-phone')||{}).value||'';
  var cd=($('#n-code')||{}).value||'';
  var who=($('#n-who')||{}).value||'';
  if(ph.trim().length<8 || cd.trim().length<3){ toast('دخّل رقم موبايل وكود صحيحين (تجريبي)','warn'); return; }
  nurseSession=who||state.nurses[0].name;
  state.session=nurseSession; save();
  renderNurse();
  toast('أهلاً '+nurseSession+' 👋','ok');
}
function nurseLogout(){ nurseSession=null; state.session=null; save(); renderNurse(); }

/* =========================================================
   لوحة الإدارة
   ========================================================= */
function renderAdmin(){
  var el=$('#admin-body');
  var revenue=state.requests.filter(function(r){ return r.status==='onway'||r.status==='arrived'||r.status==='done'; }).reduce(function(a,r){ return a+r.price; },0);
  var avg=state.ratings.length?(state.ratings.reduce(function(a,b){ return a+b.stars; },0)/state.ratings.length).toFixed(1):'—';
  var rows=state.requests.map(function(r){
    var s=SERVICE_BY[r.service]||{name:r.service};
    return '<tr>'+​
      '<td>#'+r.id+((r.overdue&&r.status==='new')?' <span class="badge late">متأخر</span>':'')+'</td>'+
      '<td>'+esc(r.patient)+'</td>'+
      '<td>'+esc(r.region)+'</td>'+
      '<td>'+esc(s.name)+'</td>'+
      '<td>'+r.price+' ج</td>'+
      '<td>'+esc(r.payment||'')+'</td>'+
      '<td><span class="badge st-'+r.status+'">'+STATUSL[r.status]+'</span></td>'+
      '<td>'+(r.nurse?esc(r.nurse):assignSel(r))+'</td>'+
    '</tr>';
  }).join('');
  var nurseRows=state.nurses.map(function(n){
    return '<tr><td>'+esc(n.name)+'</td><td>'+esc(n.region)+'</td><td>'+n.rating+' '+icon('star')+'</td><td>'+n.visits+'</td><td><button class="btn btn-danger btn-sm" onclick="removeNurse('+n.id+')">حذف</button></td></tr>';
  }).join('');
  var priceRows=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return '<tr><td><b>'+s.name+'</b></td><td><input class="inp sm" type="number" id="p-'+s.id+'" value="'+c.price+'"></td><td><input class="inp sm" type="number" id="d-'+s.id+'" value="'+c.dur+'"></td><td><input class="inp sm" type="number" id="x-'+s.id+'" value="'+c.extra+'"></td></tr>';
  }).join('');
  var chips=state.allowed.map(function(a,i){
    return '<span class="chip">'+esc(a)+' <button onclick="removeAllowed('+i+')" title="إزالة">×</button></span>';
  }).join('');
  var rateList=state.ratings.slice(0,6).map(function(x){
    return '<div class="req"><div class="req-top"><b>'+esc(x.nurse)+'</b><div>'+'★'.repeat(x.stars)+'☆'.repeat(5-x.stars)+'</div></div><div class="muted small">'+esc(x.comment||'—')+' · '+esc(x.when)+'</div></div>';
  }).join('');
  el.innerHTML=
    '<div class="stat-grid">'+
      '<div class="stat">'+icon('check')+'<b>'+state.requests.length+'</b><span>إجمالي الطلبات</span></div>'+
      '<div class="stat">'+icon('wallet')+'<b>'+revenue+' ج</b><span>الإيراد المتحقق</span></div>'+
      '<div class="stat">'+icon('star')+'<b>'+avg+'</b><span>متوسط التقييم العام</span></div>'+
      '<div class="stat">'+icon('user')+'<b>'+state.nurses.length+'</b><span>الممرضين المسجلين</span></div>'+
    '</div>'+
    '<div class="inline-form"><button class="btn btn-ghost btn-sm" onclick="resetDemo()">↺ إعادة ضبط البيانات التجريبية</button></div>'+
    '<h3 class="sec-t">كل الطلبات وحالتها</h3>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>المريض</th><th>المنطقة</th><th>الخدمة</th><th>السعر</th><th>الدفع</th><th>الحالة</th><th>الممرض</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<h3 class="sec-t">حسابات الممرضين ومناطقهم</h3>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الاسم</th><th>المنطقة</th><th>التقييم</th><th>الزيارات</th><th></th></tr></thead><tbody>'+nurseRows+'</tbody></table></div>'+
    '<div class="card inline-form"><b>إضافة ممرض جديد:</b><input id="a-nname" class="inp" placeholder="اسم الممرض/ة"><select id="a-nregion" class="inp">'+Object.keys(state.fees).map(function(r){ return '<option>'+r+'</option>'; }).join('')+'</select><button class="btn btn-success" onclick="addNurse()">إضافة حساب</button></div>'+
    '<h3 class="sec-t">آخر التقييمات</h3>'+rateList+
    '<h3 class="sec-t">إدارة الأسعار والخدمات</h3>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الخدمة</th><th>السعر الأساسي (ج)</th><th>المدة الأساسية (د)</th><th>سعر الزيادة (ج)</th></tr></thead><tbody>'+priceRows+'</tbody></table></div>'+
    '<div class="inline-form"><button class="btn btn-success" onclick="savePrices()">حفظ الأسعار</button></div>'+
    '<h3 class="sec-t">قائمة الحقن المسموحة</h3>'+
    '<div class="chips">'+chips+'</div>'+
    '<div class="card inline-form"><input id="a-add" class="inp" placeholder="اسم حقنة جديدة…"><button class="btn btn-primary" onclick="addAllowed()">إضافة بعد مراجعة</button></div>'+
    '<div class="alert bad">'+icon('alert')+' القائمة المنوعة: كل المضادات الحيوية بكل أنواعها + أي حقنة مش في القائمة المسموحة.</div>'+
    '<h3 class="sec-t">تقارير: عدد الطلبات والإيراد حسب المنطقة</h3>'+
    regionBars();
}
function assignSel(r){
  var opts=state.nurses.map(function(n){ return '<option value="'+esc(n.name)+'">'+esc(n.name)+' — '+esc(n.region)+'</option>'; }).join('');
  return '<select class="inp sm" onchange="assignReq('+r.id+', this.value)"><option value="">أسند يدويًا…</option>'+opts+'</select>';
}
function assignReq(id,name){
  if(!name) return;
  var r=findReq(id); if(!r) return;
  r.nurse=name;
  if(r.status==='new') r.status='accepted';
  save(); refreshAll();
  toast('تم سند الطلب #'+id+' لـ '+name,'ok');
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
  state.allowed.push(v); save(); renderAdmin();
  toast('تمت إضافة الحقنة بعد المراجعة ✔','ok');
}
function removeAllowed(i){ state.allowed.splice(i,1); save(); renderAdmin(); }
function addNurse(){
  var nm=(($('#a-nname')||{}).value||'').trim();
  var rg=(($('#a-nregion')||{}).value||'').trim();
  if(!nm){ toast('اكتب اسم الممرض/ة','warn'); return; }
  state.nurses.push({id:Date.now(),name:nm,region:rg,rating:5,visits:0,phone:''});
  save(); renderAdmin(); fillNurseSelect();
  toast('تم إضافة حساب الممرض ✔','ok');
}
function removeNurse(id){
  state.nurses=state.nurses.filter(function(n){ return n.id!==id; });
  save(); renderAdmin(); fillNurseSelect();
}
function resetDemo(){
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  location.reload();
}
function regionBars(){
  var map={};
  state.requests.forEach(function(r){
    if(!map[r.region]) map[r.region]={c:0,v:0};
    map[r.region].c++; map[r.region].v+=r.price;
  });
  var max=1;
  Object.keys(map).forEach(function(k){ if(map[k].v>max) max=map[k].v; });
  return '<div class="bars">'+Object.keys(map).map(function(k){
    return '<div class="bar-row"><span class="bar-label">'+esc(k)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(map[k].v/max*100)+'%"></div></div><span class="bar-val">'+map[k].c+' طلب · '+map[k].v+' ج</span></div>';
  }).join('')+'</div>';
}

/* =========================================================
   الرئيسية (ديناميكية)
   ========================================================= */
function renderHomeServices(){
  var el=$('#home-services-grid'); if(!el) return;
  el.innerHTML=SERVICES.map(function(s){
    var c=state.prices[s.id];
    return '<button class="svc-card" onclick="startService(\''+s.id+'\')">'+
      icon(s.icon,'svc-ic')+
      '<b>'+s.name+'</b>'+
      '<span class="muted small">'+s.desc+'</span>'+
      '<span class="svc-meta">'+icon('clock')+' '+c.dur+' دقيقة · '+c.price+' ج</span>'+
    '</button>';
  }).join('');
}
function renderPricing(){
  var el=$('#home-prices-body'); if(!el) return;
  el.innerHTML='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الخدمة</th><th>المدة الأساسية</th><th>السعر المقترح (جنيه)</th></tr></thead><tbody>'+
    SERVICES.map(function(s){
      var c=state.prices[s.id];
      return '<tr><td><b>'+s.name+'</b><div class="muted small">'+s.desc+'</div></td><td>'+c.dur+' دقيقة</td><td><b>'+c.price+'</b></td></tr>';
    }).join('')+
  '</tbody></table></div>';
}
function startService(id){
  booking=freshBooking();
  booking.scanned=true;
  booking.step=2;
  booking.service=id;
  showView('patient');
  toast('اخترت '+SERVICE_BY[id].name+' — كمّل التفاصيل','ok');
}
function fillNurseSelect(){
  var sel=$('#n-who'); if(!sel) return;
  sel.innerHTML=state.nurses.map(function(n){
    return '<option value="'+esc(n.name)+'">'+esc(n.name)+' — '+esc(n.region)+'</option>';
  }).join('');
}

/* ---------- الإقلاع ---------- */
function init(){
  $$('.navbtn').forEach(function(b){
    b.addEventListener('click', function(){ showView(b.getAttribute('data-view')); });
  });
  renderHomeServices();
  renderPricing();
  var hq=$('#qr-hero'); if(hq) drawQR(hq);
  fillNurseSelect();
  showView('home');
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
else{ init(); }
