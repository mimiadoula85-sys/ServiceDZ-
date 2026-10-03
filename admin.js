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
    if(v){toast("جاري تحميل الوصل...");
      let r = await fetch(SB + "/storage/v1/object/authenticated/receipts/" + v.dataset.view, {
        headers: {apikey: KEY, Authorization: "Bearer " + SES.access_token}
      });
      if(!r.ok) throw Error("تعذر تحميل الوصل");
      let url = URL.createObjectURL(await r.blob());
      openSheet('<h2 style="margin-top:0">🧾 الوصل</h2><img src="'+url+'" style="width:100%;border-radius:12px"><div class="btns"><button class="btn b1" data-close>إغلاق</button></div>');
    }
    if(ok || no){
      let id = (ok||no).dataset.ok || (ok||no).dataset.no;
      if(!confirm(ok ? "تأكدتِ أن الدراهم وصلت لحسابك CCP؟ قبول الطلب؟" : "رفض هذا الطلب؟")) return;
      let res = await api("/rest/v1/rpc/admin_decide", {method:"POST", body:{p_id:id, p_ok:!!ok}});
      toast(res || "تم");
      load();
    }
  }catch(x){ toast(x.message); }
}

const _rm2 = renderMine;
renderMine = function(){ _rm2(); load(); };
load();
})();
