(function(){
const ST = {pending:"⏳ قيد الانتظار", accepted:"✅ مقبولة", rejected:"❌ مرفوضة"};
let BIDS = [];

async function rpc(name, body){
  return api("/rest/v1/rpc/" + name, {method:"POST", body});
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-bargain]");
  if(!b) return;
  e.stopPropagation();
  if(!SES){ toast("سجّلي الدخول أولاً"); return go("mine"); }
  const id = b.dataset.bargain;
  const s = L.find(x => String(x.id) === id);
  if(s && s.user_id === uidOf()) return toast("هذا إعلانك");
  openSheet('<h2 style="margin-top:0">🔥 اقترح سُومتك</h2><div class="meta">' + esc(s ? s.title : "") + (s ? " · السعر المطلوب " + fmt(s.price) : "") + '</div><label>سومتك (دج)</label><input id="bamt" type="number" inputmode="numeric"><label>رقم هاتفك</label><input id="bph" type="tel"><label>ملاحظة (اختياري)</label><input id="bnote" maxlength="120"><div class="btns"><button class="btn b5" id="bsend">إرسال السومة</button><button class="btn b3" data-close>إغلاق</button></div>');
  $("bsend").onclick = async () => {
    const amt = +$("bamt").value, ph = $("bph").value.trim(), note = $("bnote").value.trim();
    if(!amt || amt <= 0) return toast("اكتبي سعراً");
    if(!okPh(ph)) return toast("اكتبي رقم هاتف صحيح");
    try{
      const r = await rpc("place_bid", {p_listing: id, p_amount: amt, p_note: ph + "|" + note});
      toast(r === "تم" ? "تم إرسال سومتك ✔" : r);
      if(r === "تم"){ closeSheet(); load(); }
    }catch(x){ toast(x.message); }
  };
}, true);function row(b){
  const mine = b.seller_id === uidOf();
  const parts = String(b.note || "").split("|");
  const ph = parts.shift();
  const txt = parts.join("|");
  const s = L.find(x => String(x.id) === String(b.listing_id));
  let act = "";
  if(b.status === "pending" && mine){
    act = '<div class="btns"><button class="btn b1" data-yes="' + esc(b.id) + '">✅ قبول</button><button class="btn b4" data-no="' + esc(b.id) + '">❌ رفض</button></div>';
  }
  if(b.status === "accepted"){
    const p = mine ? ph : (s ? s.phone : "");
    if(p) act = '<div class="btns"><a class="btn b1" href="tel:' + esc(p) + '">📞 اتصال</a><a class="btn b2" target="_blank" href="' + wa(p) + '">واتساب</a></div>';
  }
  return '<article class="card"><b>' + esc(b.listing_title || "إعلان") + '</b><div class="meta">' + (mine ? "عرض وصلك" : "عرضك") + ": " + fmt(b.amount) + (s ? " · السعر المطلوب " + fmt(s.price) : "") + '</div>' + (mine && txt ? '<div class="meta">' + esc(txt) + '</div>' : "") + '<div class="meta">' + esc(ST[b.status] || b.status) + " · " + new Date(b.created_at).toLocaleDateString("ar-DZ") + '</div>' + act + '</article>';
}

async function act(e){
  const y = e.target.closest("[data-yes]"), n = e.target.closest("[data-no]");
  if(!y && !n) return;
  const id = (y || n).dataset.yes || (y || n).dataset.no;
  if(!confirm(y ? "قبول هذا العرض؟" : "رفض هذا العرض؟")) return;
  try{
    const r = await rpc("decide_bid", {p_id: id, p_ok: !!y});
    toast(r === "تم" ? "تم ✔" : r);
    load();
  }catch(x){ toast(x.message); }
}

async function load(){
  if(!SES) return;
  let box = $("bidBox");
  if(!box){
    const o = $("offBox");
    if(!o) return;
    const h = o.previousElementSibling || o;
    box = document.createElement("div");
    box.id = "bidBox";
    h.parentNode.insertBefore(box, h);
    box.onclick = act;
  }
  try{ BIDS = await api("/rest/v1/bids?select=*&order=created_at.desc&limit=50") || []; }catch(e){ BIDS = []; }
  box.innerHTML = '<h2>🔥 عروض الأسعار</h2>' + (BIDS.length ? BIDS.map(row).join("") : '<div class="empty">لا توجد عروض بعد.</div>');
}
const _rm3 = renderMine;renderMine=function(){ _rm3(): load(); }; load();
})();
