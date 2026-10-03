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
  const s = $("save");
