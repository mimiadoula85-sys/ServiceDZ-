/* premium.js - عضوية التاجر المميز + إعلانات الشركات */
(function(){

/* ===== بيانات الدفع والأسعار ===== */

  
    
    
  const PAY = {
  ccp: 002028098710
  name: "meryem",
  baridi: "غير متوفر",
  prices: {
    featured_1m: "300",
    featured_3m: "800",
    featured_12m: "2500",
    ad_1m: "1500"
  }
};
};
/* ================================ */

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

async function memberHTML(){

  let info = "";

  try {

    let fm = await api(
      "/rest/v1/featured_members?select=until&user_id=eq." + uidOf()
    );

    if(
      fm &&
      fm[0] &&
      new Date(fm[0].until) > new Date()
    ){
      info += `
        <div class="note">
          ⭐ أنت تاجر مميز إلى غاية
          ${new Date(fm[0].until).toLocaleDateString("ar-DZ")}
        </div>
      `;
    }

    let p = await api(
      "/rest/v1/payments?select=plan,status&order=created_at.desc&limit=3"
    );

    if(p && p.length){

      info += `
        <p class="sub" style="margin-top:8px">
          طلباتك الأخيرة:<br>
          ${p.map(x =>
            esc(LABEL[x.plan] || x.plan) +
            " - " +
            (ST[x.status] || x.status)
          ).join("<br>")}
        </p>
      `;

    }

  } catch(e) {}

  return `
    ${info}

    <p class="sub">
      إعلاناتك تظهر في الأول بعلامة ⭐.
      حوّل المبلغ ثم ارفع صورة الوصل:
    </p>

    <div class="note">
      CCP:
      <b>${esc(PAY.ccp)}</b>
      <br>

      الاسم:
      <b>${esc(PAY.name)}</b>
      <br>

      بريدي موب:
      <b>${esc(PAY.baridi)}</b>
    </div>

    <label>الباقة</label>

    <select id="pplan">
      ${Object.keys(LABEL).map(k => `
        <option value="${k}">
          ${LABEL[k]} — ${esc(PAY.prices[k])} دج
        </option>
      `).join("")}
    </select>

    <label>صورة الوصل</label>

    <input
      id="pfile"
      type="file"
      accept="image/*"
    >

    <div class="btns">
      <button class="btn b5" id="psend">
        📤 إرسال الطلب
      </button>
    </div>
  `;
}

})();
