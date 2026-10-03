(function(){
async function load(){
  let box = $("banner");
  if(!box){
    let h = document.querySelector("#p-home .liveHero");
    if(!h) return;
    box = document.createElement("div");
    box.id = "banner";
    h.parentNode.insertBefore(box, h);
  }
  let rows = [];
  try{ rows = await raw("/rest/v1/banners?select=*&order=created_at.desc&limit=10", {auth:false}) || []; }catch(e){}
  if(!rows.length){ box.innerHTML = ""; return; }
  let i = 0;
  const show = () => {
    let b = rows[i % rows.length];
    let x = b.link || (b.phone ? "tel:" + b.phone : "");
    let href = /^(https?:|tel:)/.test(x) ? x : "#";
    box.innerHTML = '<a class="box" href="' + esc(href) + '" target="_blank" rel="noopener" style="display:block;text-decoration:none;color:inherit"><span class="tag" style="margin:0 0 6px">إعلان</span><h3>' + esc(b.title) + '</h3><p class="desc">' + esc(b.body) + '</p></a>';
    i++;
  };
  show();
  clearInterval(window._bt);
  if(rows.length > 1) window._bt = setInterval(show, 5000);
}
load();
})();
