(function(){
const _raw = raw;
raw = async function(path, o = {}){
  try {
    return await _raw(path, o);
  } catch (e) {
    if (SES && /jwt|expired/i.test(String(e.message))) {
      SES = null;
      localStorage.removeItem("sdz_ses");
      try { renderMine(); } catch (_) {}
      toast("انتهت الجلسة، ادخلي من جديد");
      if ((o.method || "GET") === "GET") return _raw(path, Object.assign({}, o, {auth: false}));
    }
    throw e;
  }
};
})();
