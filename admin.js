(function(){
const ADMIN = "mimiadoula85@gmail.com";
const LB = {featured_1m:"تاجر مميز - شهر",featured_3m:"تاجر مميز - 3 أشهر",featured_12m:"تاجر مميز - سنة",ad_1m:"بانر شركة - شهر"};
const SS = {pending:"⏳ قيد المراجعة",approved:"✅ مقبول",rejected:"❌ مرفوض"};

function isAdmin(){
  return !!(SES && SES.user && String(SES.user.email||"").toLowerCase() === ADMIN);
}

async function load(){
  let box = document.getElementById("adminBox");
  if(!isAdmin()){ if(box) box.remove(); return; }
  if(!box){
    box = document.createElement("div");
    box.id = "adminBox";
    let u = document.getElementById("userBox");
    u.insertBefore(box, u.children[1]);
    box.onclick = onClick;
  }
  let rows = [];
  try{
    rows = await api("/rest/v1/rpc/admin_payments", {method:"POST", body:{}}) || [];
  }catch(e){
    box.innerHTML = '<h2>🛠️ طلبات الدفع</h2><div class="empty">'+esc(e.message)+'</div>';
    return;
  }
  box.innerHTML = '<h2>🛠️ طلبات الدفع</h2>' + (rows.length ? rows.map(r => `
    <article class="card">
      <b>${esc(LB[r.plan]||r.plan)}</b>
      <div class="meta">${esc(r.email)}</div>
      <div class="meta">${esc(SS[r.status]||r.status)} · ${new Date(r.created_at).toLocaleDateString("ar-DZ")}</div>
      <div class="btns"><button class="btn b3" data-view="${esc(r.receipt_path)}">🧾 عرض الوصل</button></div>
      ${r.status==="pending" ? `<div class="btns">
        <button class="btn b1" data-ok="${esc(r.id)}">✅ قبول</button>
        <button class="btn b4" data-no="${esc(r.id)}">❌ رفض</button>
      </div>` : ""}
    </article>`).join("") : '<div class="empty">لا توجد طلبات.</div>');
}

async function onClick(e){
  let v = e.target.closest("[data-view]");
  let ok = e.target.closest("[data-ok]");
  let no = e.target.closest("[data-no]");
  try{
    if(v){
