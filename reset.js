(function(){
const b = $("forgot");
if(!b) return;
b.onclick = () => {
  openSheet(`
    <h2 style="margin-top:0">🔑 نسيت كلمة السر</h2>
    <label>البريد الإلكتروني</label>
    <input id="rem" type="email" dir="ltr" value="${esc($("em").value.trim())}">
    <div class="btns"><button class="btn b1" id="rsend">إرسال الرمز</button></div>
    <div id="rstep2" style="display:none">
      <label>الرمز الذي وصلك في البريد</label>
      <input id="rcode" inputmode="numeric" dir="ltr">
      <label>كلمة السر الجديدة</label>
      <input id="rnew" type="password" dir="ltr">
      <div class="btns"><button class="btn b5" id="rdone">تغيير كلمة السر</button></div>
    </div>
    <div class="btns"><button class="btn b3" data-close>إغلاق</button></div>
  `);
  $("rsend").onclick = async () => {
    let email = $("rem").value.trim();
    if(!email) return toast("اكتبي بريدك");
    try{
      await raw("/auth/v1/recover", {method:"POST", body:{email}, auth:false});
      $("rstep2").style.display = "block";
      toast("تم الإرسال، شوفي البريد (وخانة Spam)");
    }catch(x){ toast(x.message); }
  };
  $("rdone").onclick = async () => {
    let email = $("rem").value.trim(), code = $("rcode").value.trim(), np = $("rnew").value;
    if(!code || np.length < 6) return toast("اكتبي الرمز وكلمة سر من 6 أحرف");
    try{
      let d = await raw("/auth/v1/verify", {method:"POST", body:{type:"recovery", email, token:code}, auth:false});
      let r = await fetch(SB + "/auth/v1/user", {
        method:"PUT",
        headers:{apikey:KEY, Authorization:"Bearer " + d.access_token, "Content-Type":"application/json"},
        body: JSON.stringify({password:np})
      });
      if(!r.ok) throw Error("تعذر تغيير كلمة السر");
      SES = {access_token:d.access_token, user:d.user};
      localStorage.setItem("sdz_ses", JSON.stringify(SES));
      closeSheet();
      toast("تم تغيير كلمة السر ✔");}catch(x){ toast(x.message); }
  };
};
})();
      renderMine();
      loadAll();
