/* premium.js - عضوية التاجر المميز */
(function(){

const PAY = {
  ccp: "002028098710",
  name: "meryem",
  baridi: "غير متوفر",
  prices: {
    featured_1m: "300",
    featured_3m: "800",
    featured_12m: "2500",
    ad_1m: "1500"
  }
};

const LABEL = {
  featured_1m: "تاجر مميز - شهر",
  featured_3m: "تاجر مميز - 3 أشهر",
  featured_12m: "تاجر مميز - سنة",
  ad_1m: "إعلان شركة (بانر) - شهر"
};

const ST = {
  pending: "⏳ قيد المراجعة",
  approved: "✅ مقبول",
  rejected: "❌ مرفوض"
};

let busy = false;

async function memberHTML(){
  let info = "";
  try{
    let fm = await api("/rest/v1/featured_members?select=until&user_id=eq." + uidOf());
    if(fm && fm[0] && new Date(fm[0].until) > new Date()){
      info += `<div class="note">⭐ أنت تاجر مميز إلى غاية ${new Date(fm[0].until).toLocaleDateString("ar-DZ")}</div>`;
    }
  }catch(e){}
  try{
    let p = await api("/rest/v1/payments?select=plan,status&order=created_at.desc&limit=3");
    if(p && p.length){
      info += `<p class="sub" style="margin-top:8px">طلباتك الأخيرة:<br>${p.map(x => esc(LABEL[x.plan] || x.plan) + " - " + (ST[x.status] || esc(x.status))).join("<br>")}</p>`;
    }
  }catch(e){}
