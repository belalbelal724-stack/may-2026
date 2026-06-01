/* ===== Qatar Branches Consumption Dashboard — May 2026 ===== */
const D = DASHBOARD_DATA;
const BR = ['الغرافة','النصر','الوكرة','الفروسية'];
const BR_EN = {'الغرافة':'Gharafa','النصر':'Al Nasr','الوكرة':'Al Wakra','الفروسية':'Al Furousiya'};
const COL = {'الغرافة':'#38bdf8','النصر':'#2563eb','الوكرة':'#60a5fa','الفروسية':'#818cf8'};
let activeBranch = 'النصر';
const charts = {};

/* ---------- helpers ---------- */
const fmt = n => (n==null?'-':Number(n).toLocaleString('en-US',{maximumFractionDigits: Math.abs(n)<100?1:0}));
const fmtK = n => Math.abs(n)>=1000 ? (n/1000).toLocaleString('en-US',{maximumFractionDigits:1})+'K' : fmt(n);
function gridColor(){return getComputedStyle(document.body).getPropertyValue('--border').trim();}
function textColor(){return getComputedStyle(document.body).getPropertyValue('--text-dim').trim();}

function cssVar(v){return getComputedStyle(document.body).getPropertyValue(v).trim();}

function baseOpts(extra={}){
  return Object.assign({
    responsive:true,maintainAspectRatio:false,
    plugins:{
      legend:{labels:{color:textColor(),font:{family:'Tajawal',size:12},padding:14,usePointStyle:true,pointStyleWidth:12}},
      tooltip:{backgroundColor:'rgba(8,16,30,.95)',titleColor:'#60a5fa',bodyColor:'#e8eef7',borderColor:'#2563eb',borderWidth:1,padding:11,titleFont:{family:'Cairo'},bodyFont:{family:'Tajawal'},cornerRadius:8}
    },
    scales:{
      x:{ticks:{color:textColor(),font:{family:'Tajawal',size:11}},grid:{color:gridColor()}},
      y:{ticks:{color:textColor(),font:{family:'Tajawal',size:11}},grid:{color:gridColor()}}
    }
  },extra);
}
function mk(id,cfg){
  const el=document.getElementById(id); if(!el)return;
  if(charts[id])charts[id].destroy();
  charts[id]=new Chart(el,cfg);
}

/* ---------- THEME ---------- */
function toggleTheme(){
  const cur=document.documentElement.getAttribute('data-theme');
  const next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  document.getElementById('themeLabel').textContent = next==='dark'?'الوضع الفاتح':'الوضع الغامق';
  document.getElementById('themeIcon').innerHTML = next==='dark'
    ? '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>'
    : '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>';
  setTimeout(renderAll,60);
}

/* ---------- TAB NAV ---------- */
document.querySelectorAll('.tab').forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.sec).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
    setTimeout(renderAll,40);
  };
});

/* signature block reused on every section */
function sigBlock(){
  return `<div class="sig"><div class="name">بلال الأنصاري</div><small>إدارة تشغيل قطر · توقيع المُعِدّ</small></div>`;
}

/* ===================== OVERVIEW ===================== */
function renderOverview(){
  const tCons=BR.reduce((s,b)=>s+D[b].consumption,0);
  const tWaste=BR.reduce((s,b)=>s+D[b].total_waste,0);
  const tAbsVar=BR.reduce((s,b)=>s+D[b].abs_variance,0);
  const avgAcc=(BR.reduce((s,b)=>s+D[b].accuracy,0)/4);
  const tRawWaste=BR.reduce((s,b)=>s+D[b].raw_waste,0);
  const tRawAvail=BR.reduce((s,b)=>s+D[b].raw_available,0);
  const rawWasteRate=100*tRawWaste/tRawAvail;
  const el=document.getElementById('overview');
  el.innerHTML=`
   <div class="sec-title">نظرة عامة شاملة — الفروع الأربعة</div>
   <div class="sec-sub">ملخّص تنفيذي يجمع استهلاكات وهوالك ودقّة جرد فروع (الغرافة · النصر · الوكرة · الفروسية) لشهر مايو 2026، مع أبرز المخاطر التشغيلية المطلوب معالجتها.</div>
   <div class="kpi-grid">
     <div class="kpi"><div class="lbl">إجمالي الاستهلاكات (كل الأصناف)</div><div class="val">${fmt(tCons)} <span class="u">وحدة</span></div><div class="delta neu">▦ ٤ فروع · ${BR.reduce((s,b)=>s+D[b].items_total,0)} صنف نشط</div></div>
     <div class="kpi"><div class="lbl">إجمالي الهوالك (فرع + مصنع)</div><div class="val">${fmt(tWaste)} <span class="u">وحدة</span></div><div class="delta down">نسبة هالك الخامات ${rawWasteRate.toFixed(2)}٪</div></div>
     <div class="kpi"><div class="lbl">متوسط دقّة الجرد</div><div class="val">${avgAcc.toFixed(1)} <span class="u">٪</span></div><div class="delta down">▼ أقل من المستهدف (٩٥٪)</div></div>
     <div class="kpi"><div class="lbl">إجمالي فروقات الجرد (مطلقة)</div><div class="val">${fmtK(tAbsVar)} <span class="u">وحدة</span></div><div class="delta down">عجز + زيادة غير مبرَّرة</div></div>
   </div>

   <div class="grid-2">
     <div class="card"><h3>📊 الاستهلاك حسب الفرع</h3><div class="hint">إجمالي الوحدات المستهلكة لكل فرع — النصر هو الأعلى تشغيلياً يليه الفروسية.</div><div class="chart-box"><canvas id="ov_cons"></canvas></div></div>
     <div class="card"><h3>♻️ الهوالك حسب الفرع</h3><div class="hint">مجموع هالك الفرع + هالك ومرتجع المصنع لكل فرع.</div><div class="chart-box"><canvas id="ov_waste"></canvas></div></div>
   </div>
   <div class="grid-2">
     <div class="card"><h3>🎯 دقّة الجرد لكل فرع (٪)</h3><div class="hint">نسبة الأصناف التي تطابق فيها الرصيد الدفتري مع الجرد الفعلي. مؤشر خطير — جميع الفروع تحت ٧٪.</div><div class="chart-box"><canvas id="ov_acc"></canvas></div></div>
     <div class="card"><h3>🧭 البصمة التشغيلية للفروع</h3><div class="hint">مقارنة رادارية: استهلاك · هالك · فروقات · توفّر مخزون (مُعَيَّرة ١٠٠).</div><div class="chart-box"><canvas id="ov_radar"></canvas></div></div>
   </div>

   <div class="sec-title" style="font-size:20px">🔑 أبرز ٤ مخاطر تشغيلية</div>
   <div class="insight crit"><h4>⚠️ انهيار دقّة الجرد <span class="badge">حرِج</span></h4><p>متوسط دقّة الجرد عبر الفروع ${avgAcc.toFixed(1)}٪ فقط — أي أن ٩٣–٩٨٪ من الأصناف تُظهر فرقاً بين الدفتري والفعلي. هذا يعني أن أرقام المخزون الحالية غير موثوقة لاتخاذ قرار، ويجب إعادة ضبط آلية الجرد فوراً.</p></div>
   <div class="insight crit"><h4>📦 فوضى مستلزمات التغليف (ملاعق / أكياس) <span class="badge">حرِج</span></h4><p>أكبر الفروقات على الإطلاق في «ملاعق الأرز» و«أكياس بلبن تيك أواي» و«أكياس تيك أواي كرتون» — عجوزات وزيادات بعشرات الآلاف. السبب الأرجح: خطأ في وحدة العدّ (عبوة مقابل قطعة) وعدم تسجيل المنصرف الفعلي.</p></div>
   <div class="insight warn"><h4>🏭 الهالك كله «مصنع» والفرع صفر <span class="badge">تنبيه</span></h4><p>هالك الفرع مُسجَّل ≈ صفر في كل الفروع تقريباً، بينما الهالك المُسجَّل بالكامل تحت «هالك ومرتجع المصنع». هذا يخفي مصدر الفاقد الحقيقي ويمنع محاسبة الفرع على تلفه.</p></div>
   <div class="insight warn"><h4>📈 استهلاك يتجاوز المتاح أحياناً <span class="badge">تنبيه</span></h4><p>في بعض الأصناف يتجاوز المُستهلك إجمالي المتاح للاستخدام، ما يولّد رصيداً سالباً — دلالة على وارد غير مُسجَّل أو معايرة وصفة (Recipe) أعلى من الواقع.</p></div>
   ${sigBlock()}
  `;
  // charts
  mk('ov_cons',{type:'bar',data:{labels:BR,datasets:[{label:'استهلاك (وحدة)',data:BR.map(b=>D[b].consumption),backgroundColor:BR.map(b=>COL[b]),borderRadius:8}]},options:baseOpts({plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('ov_waste',{type:'bar',data:{labels:BR,datasets:[
     {label:'هالك المصنع',data:BR.map(b=>D[b].factory_waste),backgroundColor:'#2563eb',borderRadius:6,stack:'w'},
     {label:'هالك الفرع',data:BR.map(b=>D[b].branch_waste),backgroundColor:'#f87171',borderRadius:6,stack:'w'}]},options:baseOpts({scales:{x:{stacked:true,ticks:{color:textColor()},grid:{color:gridColor()}},y:{stacked:true,ticks:{color:textColor()},grid:{color:gridColor()}}}})});
  mk('ov_acc',{type:'bar',data:{labels:BR,datasets:[{label:'دقّة الجرد ٪',data:BR.map(b=>D[b].accuracy),backgroundColor:BR.map(b=>COL[b]),borderRadius:8}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip},scales:{x:{max:20,ticks:{color:textColor()},grid:{color:gridColor()}},y:{ticks:{color:textColor()},grid:{color:gridColor()}}}})});
  // radar normalized
  const maxC=Math.max(...BR.map(b=>D[b].consumption));
  const maxW=Math.max(...BR.map(b=>D[b].total_waste));
  const maxV=Math.max(...BR.map(b=>D[b].abs_variance));
  const maxA=Math.max(...BR.map(b=>D[b].raw_available));
  mk('ov_radar',{type:'radar',data:{labels:['استهلاك','هالك','فروقات','مخزون متاح'],datasets:BR.map(b=>({label:b,data:[100*D[b].consumption/maxC,100*D[b].total_waste/maxW,100*D[b].abs_variance/maxV,100*D[b].raw_available/maxA],borderColor:COL[b],backgroundColor:COL[b]+'22',pointBackgroundColor:COL[b]}))},options:baseOpts({scales:{r:{angleLines:{color:gridColor()},grid:{color:gridColor()},pointLabels:{color:textColor(),font:{family:'Tajawal',size:12}},ticks:{display:false}}}})});
}

/* ===================== BRANCH DETAIL ===================== */
function renderBranchBar(){
  const bar=document.getElementById('branchBar');
  bar.innerHTML=BR.map(b=>`<div class="branch-btn ${b===activeBranch?'active':''}" data-b="${b}">
     <div class="bn" style="color:${COL[b]}">${b}</div><div class="bm">${BR_EN[b]} · ${D[b].items_total} صنف</div></div>`).join('');
  bar.querySelectorAll('.branch-btn').forEach(x=>x.onclick=()=>{activeBranch=x.dataset.b;renderBranchBar();renderBranchDetail();});
}
function renderBranchDetail(){
  const b=activeBranch,o=D[b];
  const rawWasteRate=o.raw_waste_rate;
  const c=document.getElementById('branchContent');
  c.innerHTML=`
   <div class="pill-row">
     <span class="pill">الأصناف النشطة <b>${o.items_total}</b></span>
     <span class="pill">خامات <b>${o.raw_count}</b></span>
     <span class="pill">تغليف/مستلزمات <b>${o.pack_count}</b></span>
     <span class="pill">دقّة الجرد <b>${o.accuracy}٪</b></span>
   </div>
   <div class="kpi-grid">
     <div class="kpi"><div class="lbl">إجمالي الاستهلاك</div><div class="val">${fmt(o.consumption)} <span class="u">وحدة</span></div><div class="delta neu">خامات ${fmt(o.raw_consumption)} · تغليف ${fmtK(o.pack_consumption)}</div></div>
     <div class="kpi"><div class="lbl">إجمالي الهوالك</div><div class="val">${fmt(o.total_waste)} <span class="u">وحدة</span></div><div class="delta down">هالك خامات ${rawWasteRate}٪ من المتاح</div></div>
     <div class="kpi"><div class="lbl">صافي فروقات الجرد</div><div class="val" style="color:${o.net_variance<0?'var(--bad)':'var(--good)'}">${o.net_variance>0?'+':''}${fmtK(o.net_variance)}</div><div class="delta ${o.net_variance<0?'down':'up'}">${o.net_variance<0?'ميل للعجز':'ميل للزيادة'}</div></div>
     <div class="kpi"><div class="lbl">أصناف بعجز / زيادة</div><div class="val">${o.deficit}<span class="u"> / </span>${o.surplus}</div><div class="delta down">مطابق تماماً: ${o.perfect}</div></div>
   </div>

   <div class="grid-2">
     <div class="card"><h3>🔝 أعلى ١٠ أصناف استهلاكاً</h3><div class="hint">الأصناف الأكثر سحباً من المخزون في ${b}.</div><div class="chart-box tall"><canvas id="b_cons"></canvas></div></div>
     <div class="card"><h3>♻️ أعلى الأصناف هالكاً</h3><div class="hint">أكبر مصادر الفاقد (هالك فرع + مصنع).</div><div class="chart-box tall"><canvas id="b_waste"></canvas></div></div>
   </div>
   <div class="grid-2">
     <div class="card"><h3>🔻 أكبر العجوزات (نقص فعلي عن الدفتري)</h3><div class="hint">قيم سالبة = الجرد الفعلي أقل من الرصيد المتوقع — أولوية تدقيق.</div><div class="chart-box"><canvas id="b_def"></canvas></div></div>
     <div class="card"><h3>🔺 أكبر الزيادات (فائض عن الدفتري)</h3><div class="hint">قيم موجبة = الجرد الفعلي أكبر — غالباً خطأ صرف/تسجيل.</div><div class="chart-box"><canvas id="b_sur"></canvas></div></div>
   </div>

   <div class="card" style="margin-bottom:18px"><h3>📋 جدول الخامات الرئيسية — استهلاك / هالك / فروقات</h3>
     <div class="hint">أهم خامات ${b} مرتبة بالاستهلاك (كجم/لتر). علّمنا الفروقات الكبيرة بإشارة تحذير.</div>
     <div class="tbl-wrap"><table>
       <thead><tr><th>الصنف</th><th>الوحدة</th><th>الاستهلاك</th><th>الهالك</th><th>المتاح</th><th>الفرق (عجز/زيادة)</th></tr></thead>
       <tbody>${o.raw_items.map(it=>`<tr><td>${it.name}</td><td>${it.unit}</td><td>${fmt(it.cons)}</td><td>${it.waste>0?`<span class="tag warn">${fmt(it.waste)}</span>`:'-'}</td><td>${fmt(it.avail)}</td><td>${Math.abs(it.var)>5?`<span class="tag ${it.var<0?'bad':'good'}">${it.var>0?'+':''}${fmt(it.var)}</span>`:fmt(it.var)}</td></tr>`).join('')}</tbody>
     </table></div>
   </div>
   ${sigBlock()}
  `;
  mk('b_cons',{type:'bar',data:{labels:o.top_consumption.map(i=>i.name),datasets:[{label:'استهلاك',data:o.top_consumption.map(i=>i.val),backgroundColor:COL[b],borderRadius:6}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('b_waste',{type:'bar',data:{labels:o.top_waste.map(i=>i.name),datasets:[{label:'هالك',data:o.top_waste.map(i=>i.val),backgroundColor:'#f87171',borderRadius:6}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('b_def',{type:'bar',data:{labels:o.top_deficit.map(i=>i.name),datasets:[{label:'عجز',data:o.top_deficit.map(i=>i.val),backgroundColor:'#ef4444',borderRadius:6}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('b_sur',{type:'bar',data:{labels:o.top_surplus.map(i=>i.name),datasets:[{label:'زيادة',data:o.top_surplus.map(i=>i.val),backgroundColor:'#34d399',borderRadius:6}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
}

/* ===================== TOTAL (aggregate of 4 branches) ===================== */
function renderTotal(){
  const tCons=BR.reduce((s,b)=>s+D[b].consumption,0);
  const tRawCons=BR.reduce((s,b)=>s+D[b].raw_consumption,0);
  const tPackCons=BR.reduce((s,b)=>s+D[b].pack_consumption,0);
  const tFW=BR.reduce((s,b)=>s+D[b].factory_waste,0);
  const tBW=BR.reduce((s,b)=>s+D[b].branch_waste,0);
  const tOpen=BR.reduce((s,b)=>s+D[b].opening,0);
  const tIn=BR.reduce((s,b)=>s+D[b].incoming,0);
  const tPur=BR.reduce((s,b)=>s+D[b].purchases,0);
  const tDef=BR.reduce((s,b)=>s+D[b].deficit,0);
  const tSur=BR.reduce((s,b)=>s+D[b].surplus,0);
  const tPerf=BR.reduce((s,b)=>s+D[b].perfect,0);
  const el=document.getElementById('total');
  el.innerHTML=`
   <div class="sec-title">إجمالي الفروع الأربعة</div>
   <div class="sec-sub">تجميع موحَّد لكل بنود حركة المخزون عبر الفروع الأربعة: رصيد أول · وارد · مشتريات · استهلاك · هالك · فروقات الجرد.</div>
   <div class="kpi-grid">
     <div class="kpi"><div class="lbl">إجمالي الوارد للفروع</div><div class="val">${fmtK(tIn)} <span class="u">وحدة</span></div><div class="delta neu">+ رصيد أول ${fmtK(tOpen)}</div></div>
     <div class="kpi"><div class="lbl">إجمالي الاستهلاك</div><div class="val">${fmtK(tCons)} <span class="u">وحدة</span></div><div class="delta neu">خامات ${fmtK(tRawCons)} · تغليف ${fmtK(tPackCons)}</div></div>
     <div class="kpi"><div class="lbl">إجمالي الهوالك</div><div class="val">${fmt(tFW+tBW)} <span class="u">وحدة</span></div><div class="delta down">مصنع ${fmt(tFW)} · فرع ${fmt(tBW)}</div></div>
     <div class="kpi"><div class="lbl">إجمالي المشتريات المحلية</div><div class="val">${fmt(tPur)} <span class="u">وحدة</span></div><div class="delta neu">شراء طارئ خارج المصنع</div></div>
   </div>

   <div class="grid-2">
     <div class="card"><h3>🔄 خريطة حركة المخزون الإجمالية</h3><div class="hint">من المصادر (رصيد أول + وارد + مشتريات) إلى المصارف (استهلاك + هالك).</div><div class="chart-box"><canvas id="t_flow"></canvas></div></div>
     <div class="card"><h3>🥧 تركيبة الاستهلاك: خامات مقابل تغليف</h3><div class="hint">غالبية «الوحدات» المستهلكة هي مستلزمات تغليف معدودة، لا خامات تصنيع.</div><div class="chart-box"><canvas id="t_mix"></canvas></div></div>
   </div>
   <div class="grid-2">
     <div class="card"><h3>📦 مساهمة كل فرع في إجمالي الاستهلاك</h3><div class="hint">حصّة كل فرع من إجمالي الوحدات المستهلكة.</div><div class="chart-box"><canvas id="t_share"></canvas></div></div>
     <div class="card"><h3>🎯 حالة الجرد الإجمالية</h3><div class="hint">توزيع الأصناف عبر الفروع: مطابق · عجز · زيادة.</div><div class="chart-box"><canvas id="t_acc"></canvas></div></div>
   </div>
   <div class="note">ملاحظة منهجية: تختلط وحدات القياس (كجم · لتر · عدد). تجميع «الوحدات» مفيد للاتجاه العام، لكن قرارات الفاقد الدقيقة تُبنى على الخامات بوحداتها (كجم/لتر) كما في جدول كل فرع. نِسَب الهالك المعروضة محسوبة على الخامات فقط لضمان الدقّة.</div>
   ${sigBlock()}
  `;
  mk('t_flow',{type:'bar',data:{labels:['رصيد أول','الوارد','المشتريات','الاستهلاك','الهالك'],datasets:[{label:'وحدة',data:[tOpen,tIn,tPur,tCons,tFW+tBW],backgroundColor:['#64748b','#2563eb','#60a5fa','#38bdf8','#f87171'],borderRadius:8}]},options:baseOpts({plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('t_mix',{type:'doughnut',data:{labels:['تغليف / مستلزمات','خامات تصنيع'],datasets:[{data:[tPackCons,tRawCons],backgroundColor:['#2563eb','#38bdf8'],borderColor:cssVar('--card'),borderWidth:3}]},options:baseOpts({cutout:'62%',scales:{}})});
  mk('t_share',{type:'pie',data:{labels:BR,datasets:[{data:BR.map(b=>D[b].consumption),backgroundColor:BR.map(b=>COL[b]),borderColor:cssVar('--card'),borderWidth:3}]},options:baseOpts({scales:{}})});
  mk('t_acc',{type:'bar',data:{labels:BR,datasets:[
     {label:'مطابق',data:BR.map(b=>D[b].perfect),backgroundColor:'#34d399',stack:'a',borderRadius:5},
     {label:'عجز',data:BR.map(b=>D[b].deficit),backgroundColor:'#f87171',stack:'a',borderRadius:5},
     {label:'زيادة',data:BR.map(b=>D[b].surplus),backgroundColor:'#fbbf24',stack:'a',borderRadius:5}]},options:baseOpts({scales:{x:{stacked:true,ticks:{color:textColor()},grid:{color:gridColor()}},y:{stacked:true,ticks:{color:textColor()},grid:{color:gridColor()}}}})});
}

/* ===================== COMPARE ===================== */
function renderCompare(){
  const el=document.getElementById('compare');
  const rows=BR.map(b=>{const o=D[b];return {b,cons:o.consumption,waste:o.total_waste,rwr:o.raw_waste_rate,acc:o.accuracy,nv:o.net_variance,av:o.abs_variance,def:o.deficit,sur:o.surplus};});
  // rankings
  const best=(arr,key,asc)=>[...arr].sort((x,y)=>asc?x[key]-y[key]:y[key]-x[key]);
  el.innerHTML=`
   <div class="sec-title">المقارنات بين الفروع</div>
   <div class="sec-sub">مقارنة جنباً إلى جنب في الاستهلاك والهوالك ودقّة الجرد والفروقات — لتحديد الفرع الأفضل أداءً والفرع الأكثر احتياجاً للتدخّل.</div>

   <div class="grid-2">
     <div class="card"><h3>⚔️ استهلاك مقابل هالك مقابل فروقات</h3><div class="hint">مقارنة مجمّعة على نفس المحور (مقياس لوغاريتمي لتقريب الفوارق).</div><div class="chart-box tall"><canvas id="c_multi"></canvas></div></div>
     <div class="card"><h3>🎯 دقّة الجرد ونسبة هالك الخامات</h3><div class="hint">عمودان لكل فرع: الدقّة (أعلى أفضل) ونسبة الهالك (أقل أفضل).</div><div class="chart-box tall"><canvas id="c_quality"></canvas></div></div>
   </div>
   <div class="grid-2">
     <div class="card"><h3>📉 صافي فروقات الجرد لكل فرع</h3><div class="hint">سالب = ميل للعجز (نقص فعلي) · موجب = ميل للزيادة. النصر الأكثر عجزاً والغرافة الأكثر زيادة.</div><div class="chart-box"><canvas id="c_netvar"></canvas></div></div>
     <div class="card"><h3>🔀 أصناف العجز مقابل الزيادة</h3><div class="hint">عدد الأصناف ذات العجز مقابل الزيادة لكل فرع.</div><div class="chart-box"><canvas id="c_ds"></canvas></div></div>
   </div>

   <div class="card" style="margin-bottom:18px"><h3>🏁 جدول المقارنة الشامل + الترتيب</h3>
     <div class="hint">جميع المؤشرات الرئيسية في جدول واحد. الأخضر = الأفضل في العمود · الأحمر = الأضعف.</div>
     <div class="tbl-wrap"><table>
       <thead><tr><th>المؤشّر</th>${BR.map(b=>`<th style="color:${COL[b]}">${b}</th>`).join('')}<th>الأفضل</th></tr></thead>
       <tbody>
        ${cmpRow('إجمالي الاستهلاك',rows,'cons',false,fmtK)}
        ${cmpRow('إجمالي الهالك',rows,'waste',true,fmt)}
        ${cmpRow('نسبة هالك الخامات ٪',rows,'rwr',true,v=>v+'٪')}
        ${cmpRow('دقّة الجرد ٪',rows,'acc',false,v=>v+'٪')}
        ${cmpRow('الفروقات المطلقة',rows,'av',true,fmtK)}
        ${cmpRow('أصناف بعجز',rows,'def',true,fmt)}
        ${cmpRow('أصناف بزيادة',rows,'sur',true,fmt)}
       </tbody>
     </table></div>
   </div>

   <div class="insight good"><h4>🥇 الأفضل انضباطاً <span class="badge">الوكرة</span></h4><p>الوكرة تُسجِّل أدنى نسبة هالك خامات (${D['الوكرة'].raw_waste_rate}٪) وأقل فروقات مطلقة، رغم أنها أصغر الفروع استهلاكاً. نموذج يُحتذى في الانضباط.</p></div>
   <div class="insight crit"><h4>🚩 الأكثر احتياجاً للتدخّل <span class="badge">النصر</span></h4><p>النصر الأعلى استهلاكاً (${fmtK(D['النصر'].consumption)} وحدة) لكنه الأدنى في دقّة الجرد (${D['النصر'].accuracy}٪) والأعلى في صافي العجز (${fmtK(D['النصر'].net_variance)}). حجم العمليات يضخّم أثر ضعف الضبط — أولوية أولى.</p></div>
   ${sigBlock()}
  `;
  const labels=BR;
  mk('c_multi',{type:'bar',data:{labels,datasets:[
     {label:'استهلاك',data:BR.map(b=>D[b].consumption),backgroundColor:'#38bdf8',borderRadius:5},
     {label:'فروقات مطلقة',data:BR.map(b=>D[b].abs_variance),backgroundColor:'#2563eb',borderRadius:5},
     {label:'هالك',data:BR.map(b=>D[b].total_waste),backgroundColor:'#f87171',borderRadius:5}]},options:baseOpts({scales:{x:{ticks:{color:textColor()},grid:{color:gridColor()}},y:{type:'logarithmic',ticks:{color:textColor()},grid:{color:gridColor()}}}})});
  mk('c_quality',{type:'bar',data:{labels,datasets:[
     {label:'دقّة الجرد ٪',data:BR.map(b=>D[b].accuracy),backgroundColor:'#34d399',borderRadius:6,yAxisID:'y'},
     {label:'نسبة هالك الخامات ٪',data:BR.map(b=>D[b].raw_waste_rate),backgroundColor:'#fbbf24',borderRadius:6,yAxisID:'y'}]},options:baseOpts()});
  mk('c_netvar',{type:'bar',data:{labels,datasets:[{label:'صافي الفرق',data:BR.map(b=>D[b].net_variance),backgroundColor:BR.map(b=>D[b].net_variance<0?'#ef4444':'#34d399'),borderRadius:7}]},options:baseOpts({plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('c_ds',{type:'bar',data:{labels,datasets:[
     {label:'عجز',data:BR.map(b=>D[b].deficit),backgroundColor:'#f87171',borderRadius:5},
     {label:'زيادة',data:BR.map(b=>D[b].surplus),backgroundColor:'#fbbf24',borderRadius:5}]},options:baseOpts()});
}
function cmpRow(label,rows,key,lowerBetter,f){
  const vals=rows.map(r=>r[key]);
  const best=lowerBetter?Math.min(...vals):Math.max(...vals);
  const worst=lowerBetter?Math.max(...vals):Math.min(...vals);
  const bestBranch=rows.find(r=>r[key]===best).b;
  return `<tr><td><b>${label}</b></td>${rows.map(r=>{
     let cls=r[key]===best?'good':(r[key]===worst?'bad':'');
     return `<td>${cls?`<span class="tag ${cls}">${f(r[key])}</span>`:f(r[key])}</td>`;
  }).join('')}<td style="color:${COL[bestBranch]}"><b>${bestBranch}</b></td></tr>`;
}

/* ===================== ANALYTICS ===================== */
function renderAnalytics(){
  const el=document.getElementById('analytics');
  // efficiency: consumption per unit waste, and variance ratio
  const eff=BR.map(b=>{const o=D[b];return{b,wastePerCons:100*o.total_waste/o.consumption,varRatio:100*o.abs_variance/o.consumption,defRatio:100*o.deficit/o.items_total};});
  el.innerHTML=`
   <div class="sec-title">التحليلات المتقدّمة</div>
   <div class="sec-sub">تحليل ذكي لجذور المشكلة: علاقة الحجم بالانضباط، كفاءة استخدام الخامات، وتركيز الفاقد — لاستخلاص أين تكمن الخسارة الحقيقية.</div>

   <div class="grid-2">
     <div class="card"><h3>🧮 الحجم مقابل دقّة الجرد</h3><div class="hint">كل فقاعة = فرع (حجمها = الفروقات المطلقة). تكشف أن كبر الحجم يقترن بضعف الدقّة — مشكلة عمليات لا مشكلة كمية.</div><div class="chart-box tall"><canvas id="a_bubble"></canvas></div></div>
     <div class="card"><h3>⚙️ كفاءة الفاقد (هالك ÷ استهلاك)</h3><div class="hint">نسبة الهالك إلى الاستهلاك — كلما قلّت كان الفرع أكفأ في تحويل الخامة إلى منتج.</div><div class="chart-box tall"><canvas id="a_eff"></canvas></div></div>
   </div>
   <div class="grid-2">
     <div class="card"><h3>📊 معدّل الفروقات لكل فرع (٪ من الاستهلاك)</h3><div class="hint">حجم «الضوضاء» في الجرد منسوباً لحجم النشاط — مؤشّر جودة بيانات.</div><div class="chart-box"><canvas id="a_varratio"></canvas></div></div>
     <div class="card"><h3>🎯 تركّز الفاقد في أعلى ٥ أصناف</h3><div class="hint">نسبة ما تمثّله أكبر ٥ أصناف هالكاً من إجمالي هالك كل فرع — يُظهر فرص «الفوز السريع».</div><div class="chart-box"><canvas id="a_conc"></canvas></div></div>
   </div>

   <div class="sec-title" style="font-size:20px">🧠 استنتاجات تحليلية</div>
   <div class="insight"><h4>① الجذر تشغيلي وليس كمّياً</h4><p>لا توجد علاقة طردية بين حجم الاستهلاك وجودة البيانات؛ النصر الأكبر هو الأضعف دقّة، والوكرة الأصغر هي الأدق. إذاً المشكلة في <b>إجراءات الجرد والصرف</b> لا في حجم البيع.</p></div>
   <div class="insight"><h4>② الفاقد مركّز في حفنة أصناف</h4><p>الجزء الأكبر من الهالك يتركّز في عدد محدود من الأصناف (مانجة قطع، المتكندرة، الفزعة شيكولاتة، قشطوطة). معالجة أعلى ٥ أصناف فقط في كل فرع تعالج غالبية الفاقد.</p></div>
   <div class="insight"><h4>③ ضوضاء التغليف تُفسد الصورة</h4><p>الفروقات العملاقة في الملاعق والأكياس تُضخّم «الفروقات المطلقة» وتُخفي الفاقد الحقيقي في الخامات. فصل مستلزمات التغليف في جرد مستقل يرفع وضوح بيانات الخامات فوراً.</p></div>
   ${sigBlock()}
  `;
  mk('a_bubble',{type:'bubble',data:{datasets:BR.map(b=>({label:b,data:[{x:D[b].consumption,y:D[b].accuracy,r:8+30*D[b].abs_variance/Math.max(...BR.map(x=>D[x].abs_variance))}],backgroundColor:COL[b]+'cc',borderColor:COL[b]}))},options:baseOpts({scales:{x:{title:{display:true,text:'الاستهلاك (وحدة)',color:textColor()},ticks:{color:textColor()},grid:{color:gridColor()}},y:{title:{display:true,text:'دقّة الجرد ٪',color:textColor()},ticks:{color:textColor()},grid:{color:gridColor()}}}})});
  mk('a_eff',{type:'bar',data:{labels:BR,datasets:[{label:'هالك ÷ استهلاك ٪',data:eff.map(e=>+e.wastePerCons.toFixed(2)),backgroundColor:BR.map(b=>COL[b]),borderRadius:7}]},options:baseOpts({indexAxis:'y',plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip}})});
  mk('a_varratio',{type:'line',data:{labels:BR,datasets:[{label:'فروقات ÷ استهلاك ٪',data:eff.map(e=>+e.varRatio.toFixed(1)),borderColor:'#38bdf8',backgroundColor:'#38bdf833',fill:true,tension:.4,pointRadius:6,pointBackgroundColor:'#2563eb'}]},options:baseOpts()});
  // concentration: top5 waste share
  const conc=BR.map(b=>{const o=D[b];const t5=o.top_waste.slice(0,5).reduce((s,i)=>s+i.val,0);return o.total_waste?100*t5/o.total_waste:0;});
  mk('a_conc',{type:'bar',data:{labels:BR,datasets:[{label:'حصّة أعلى ٥ أصناف من الهالك ٪',data:conc.map(v=>+v.toFixed(1)),backgroundColor:BR.map(b=>COL[b]),borderRadius:7}]},options:baseOpts({plugins:{legend:{display:false},tooltip:baseOpts().plugins.tooltip},scales:{x:{ticks:{color:textColor()},grid:{color:gridColor()}},y:{max:100,ticks:{color:textColor()},grid:{color:gridColor()}}}})});
}

/* ===================== RECOMMENDATIONS & PLAN ===================== */
function renderReco(){
  const el=document.getElementById('reco');
  el.innerHTML=`
   <div class="sec-title">التوصيات وخطة الشهر الجديد</div>
   <div class="sec-sub">توصيات تنفيذية قابلة للقياس مبنية على بيانات مايو 2026، ثم خطة أسبوعية لشهر يونيو، وأخطاء يجب تجنّبها.</div>

   <div class="sec-title" style="font-size:20px">✅ التوصيات الاستراتيجية</div>
   <div class="insight crit"><h4><span class="reco-num">1</span> إصلاح نظام الجرد فوراً</h4><p>دقّة الجرد الحالية (١.٨–٦.٣٪) تجعل المخزون غير قابل للاعتماد. الإجراء: جرد يومي مُصغّر للأصناف عالية الحركة + جرد كامل أسبوعي، مع <b>توحيد وحدة العدّ</b> (عبوة مقابل قطعة) في الشيت. المستهدف: رفع الدقّة إلى ≥٨٥٪ خلال شهر.</p></div>
   <div class="insight crit"><h4><span class="reco-num">2</span> فصل جرد مستلزمات التغليف</h4><p>الملاعق والأكياس تُنتج أكبر الفروقات وتُشوّه الصورة. الإجراء: شيت مستقل للمستلزمات مع معامل تحويل ثابت (قطعة/كرتونة)، وربط صرفها بعدد الطلبات لا بالتقدير اليدوي.</p></div>
   <div class="insight warn"><h4><span class="reco-num">3</span> تفعيل تسجيل «هالك الفرع»</h4><p>هالك الفرع ≈ صفر حالياً وكل التلف يُحمَّل على المصنع. الإجراء: سجلّ هالك يومي في الفرع (سبب + كمية + توقيع) لفصل المسؤولية وقياس الفاقد الحقيقي عند نقطة البيع.</p></div>
   <div class="insight warn"><h4><span class="reco-num">4</span> مراجعة معايرة الوصفات (Recipes)</h4><p>تجاوز الاستهلاك للمتاح ورصيد سالب في أصناف يدل على وصفة أعلى من الواقع أو وارد غير مُسجَّل. الإجراء: إعادة وزن الوصفات الفعلية ومطابقتها بالـ Product Mix.</p></div>
   <div class="insight good"><h4><span class="reco-num">5</span> تعميم نموذج الوكرة</h4><p>الوكرة الأدق والأقل هالكاً. الإجراء: توثيق ممارساتها (توقيت الجرد، انضباط الصرف) كـ SOP موحّد وتدريب باقي الفروع عليه، مع تركيز خاص على النصر.</p></div>
   <div class="insight good"><h4><span class="reco-num">6</span> لوحة متابعة أسبوعية للمدير</h4><p>اعتماد ٤ مؤشّرات فقط لكل فرع أسبوعياً: دقّة الجرد · نسبة هالك الخامات · صافي الفرق · أعلى ٥ أصناف فاقداً. الإجراء: مراجعة كل اثنين مع مديري الفروع.</p></div>

   <div class="sec-title" style="font-size:20px">🗓️ خطة يونيو 2026 — أسبوعية</div>
   <div class="plan">
     <div class="plan-item"><div class="plan-week">الأسبوع<br>الأول<small>التأسيس</small></div><div class="plan-body"><h4>توحيد وحدات القياس + قوالب الجرد</h4><p>توحيد وحدة كل صنف (خاصة التغليف)، فصل شيت المستلزمات، وتدريب أمناء المخازن على الإدخال الصحيح. تثبيت خط أساس للدقّة.</p></div></div>
     <div class="plan-item"><div class="plan-week">الأسبوع<br>الثاني<small>الضبط</small></div><div class="plan-body"><h4>جرد يومي مُصغّر + تسجيل هالك الفرع</h4><p>تشغيل الجرد اليومي لأعلى ٢٠ صنفاً حركةً في كل فرع، وبدء سجل هالك الفرع اليومي بالأسباب والتواقيع.</p></div></div>
     <div class="plan-item"><div class="plan-week">الأسبوع<br>الثالث<small>المعايرة</small></div><div class="plan-body"><h4>مراجعة الوصفات ومطابقة الـ Product Mix</h4><p>إعادة وزن الوصفات الأكثر استهلاكاً ومطابقة المنصرف الفعلي بالمبيعات، ومعالجة الأرصدة السالبة.</p></div></div>
     <div class="plan-item"><div class="plan-week">الأسبوع<br>الرابع<small>التقييم</small></div><div class="plan-body"><h4>قياس النتائج ومراجعة مع المدير العام</h4><p>قياس تحسّن الدقّة ونسبة الهالك مقابل خط الأساس، توثيق ممارسات الوكرة كـ SOP، وإقرار مستهدفات يوليو.</p></div></div>
   </div>

   <div class="sec-title" style="font-size:20px">⛔ أخطاء يجب تجنّبها</div>
   <div class="grid-3">
     <div class="insight crit"><h4>الجرد التقديري</h4><p>إدخال أرقام جرد بالتخمين بدل العدّ الفعلي — هو السبب الجذري للفروقات الحالية.</p></div>
     <div class="insight crit"><h4>خلط وحدة العدّ</h4><p>تسجيل الوارد بالكرتونة والمنصرف بالقطعة (أو العكس) يولّد عجزاً/زيادة وهمية ضخمة.</p></div>
     <div class="insight warn"><h4>تحميل كل الهالك على المصنع</h4><p>يخفي الفاقد عند الفرع ويمنع المحاسبة والتحسين الحقيقي.</p></div>
     <div class="insight warn"><h4>إهمال الأرصدة السالبة</h4><p>تجاهل أن الاستهلاك تجاوز المتاح يعني فقدان رقابة على الوارد والوصفة.</p></div>
     <div class="insight"><h4>الإفراط في الشراء المحلي الطارئ</h4><p>الشراء خارج المصنع دون تخطيط يرفع التكلفة ويكسر تتبّع المخزون.</p></div>
     <div class="insight"><h4>عدم متابعة التوصيات</h4><p>أي خطة بلا مراجعة أسبوعية بمؤشرات واضحة ستعود للنقطة صفر.</p></div>
   </div>
   ${sigBlock()}
  `;
}

function renderAll(){
  renderOverview();
  if(!document.getElementById('branchBar').children.length) renderBranchBar();
  renderBranchDetail();
  renderTotal(); renderCompare(); renderAnalytics(); renderReco();
}

/* ---------- LOGO HANDLING ---------- */
function applyLogo(src){
  document.querySelectorAll('#logoBig,#logoMini').forEach(box=>{
    box.innerHTML = `<img src="${src}" alt="logo">`;
  });
  const lbl=document.getElementById('logoLabel'); if(lbl) lbl.textContent='تغيير اللوجو';
}
function initLogo(){
  const inp=document.getElementById('logoInput');
  if(inp){
    inp.addEventListener('change',e=>{
      const file=e.target.files[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload=ev=>applyLogo(ev.target.result);
      reader.readAsDataURL(file);
    });
  }
  // logo.png ships with the dashboard and is already embedded in the HTML.
  // Update the label since a permanent logo is present.
  const lbl=document.getElementById('logoLabel'); if(lbl) lbl.textContent='تغيير اللوجو';
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded",()=>{ renderAll(); initLogo(); });

