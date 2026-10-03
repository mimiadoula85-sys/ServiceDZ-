(function(){
const BUCKET = "listing-images", MAX = 5;
let picked = [];

function shrink(file){
  return new Promise((res, rej) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(u);
      c.toBlob(b => b ? res(b) : rej(Error("تعذر قراءة الصورة")), "image/jpeg", 0.75);
    };
    img.onerror = () => rej(Error("صورة غير صالحة"));
    img.src = u;
  });
}

async function upload(blob){
  const path = uidOf() + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + ".jpg";
  const r = await fetch(SB + "/storage/v1/object/" + BUCKET + "/" + path, {
    method: "POST",
    headers: {apikey: KEY, Authorization: "Bearer " + SES.access_token, "Content-Type": "image/jpeg"},
    body: blob
  });
  if(!r.ok) throw Error("فشل رفع صورة");
  return SB + "/storage/v1/object/public/" + BUCKET + "/" + path;
}

function addField(){
  const d = $("fd");
  if(!d || $("fimgs")) return;
  const box = document.createElement("div");
  box.innerHTML = '<label>صور الإعلان (حتى 5 صور)</label><input id="fimgs" type="file" accept="image/*" multiple><div class="sub" id="fcount"></div>';
  d.after(box);
  $("fimgs").onchange = e => {
    picked = Array.from(e.target.files).slice(0, MAX);
    $("fcount").textContent = picked.length ? "تم اختيار " + picked.length + " صور" : "";
  };
}

function hook(){
  const s = $("save");if(!s) return;
  s.onclick = async () => {
    const t = $("ft").value.trim(), n = $("fn").value.trim(), ph = $("fph").value.trim(), d = $("fd").value.trim();
    if(!t || !n || !d || !okPh(ph)) return toast("أكمل البيانات ورقم الهاتف");
    s.disabled = true;
    try{
      const imgs = [];
      for(const f of picked) imgs.push(await upload(await shrink(f)));
      await api("/rest/v1/listings", {method: "POST", body: {
        title: t, name: n, category: $("fc").value, wilaya: $("fw").value,
        price: +$("fp").value || 0, price_type: $("ft2").value, phone: ph,
        description: d, images: imgs
      }});
      picked = [];
      $("fimgs").value = "";
      $("fcount").textContent = "";
      toast("تم النشر ✔");
      go("home");
    }catch(x){ toast(x.message); }
    s.disabled = false;
  };
}

const _card = card;
card = function(s, own){
  let h = _card(s, own === true);
  const im = Array.isArray(s.images) ? s.images : [];
  h = h.replace("<article ", '<article data-open="' + esc(s.id) + '" ');
  if(im.length){
    const badge = im.length > 1 ? " · 📷 " + im.length : "";
    h = h.replace('<p class="desc">', '<img src="' + esc(im[0]) + '" loading="lazy" style="width:100%;height:190px;object-fit:cover;border-radius:14px;margin-top:8px"><div class="meta">اضغط لعرض الصفحة كاملة' + badge + '</div><p class="desc">');
  }
  return h;
};function detail(s){
  const im = Array.isArray(s.images) ? s.images : [];
  const g = im.length ? '<div style="display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;margin:10px 0">' +
    im.map(u => '<img src="' + esc(u) + '" style="flex:0 0 92%;scroll-snap-align:center;height:260px;object-fit:cover;border-radius:16px">').join("") + '</div>' : "";
  return '<h2 style="margin-top:0">' + esc(s.title) + '</h2><div class="meta">' + esc(s.name) + ' · 📍 ' + esc(short(s.wilaya)) + '</div>' + g +
    '<p class="desc">' + esc(s.description) + '</p><div><span class="price">' + fmt(s.price) + '</span><span class="tag">' + esc(s.price_type) + '</span></div>' +
    '<div class="btns"><a class="btn b1" href="tel:' + esc(s.phone) + '">📞 اتصال</a><a class="btn b2" target="_blank" href="' + wa(s.phone) + '">واتساب</a></div>' +
    '<div class="btns"><button class="btn b3" data-close>إغلاق</button></div>';
}

document.addEventListener("click", e => {
  if(e.target.closest("a,button,input,select,textarea")) return;
  const c = e.target.closest("[data-open]");
  if(!c) return;
  const s = L.find(x => String(x.id) === c.dataset.open);
  if(s) openSheet(detail(s));
});

addField();
hook();
try{ render(); renderMine(); }catch(e){}
})();
