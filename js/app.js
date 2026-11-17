const ICON = c => `<svg class="ic" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="var(--accent-soft)"/><text x="20" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="var(--accent)" font-family="Archivo, sans-serif">${c}</text></svg>`;
const PRODUCTS = [
  {id:"termo", name:"Termo de acero 500 ml", code:"TA", tiers:[118,104,95,88], techs:["laser","seri"]},
  {id:"taza", name:"Taza cerámica 11 oz", code:"TZ", tiers:[52,46,41,37], techs:["subli","seri"]},
  {id:"pluma", name:"Pluma metálica", code:"PL", tiers:[18,15,13,11], techs:["laser","tampo"]},
  {id:"libreta", name:"Libreta A5 de cartón reciclado", code:"LB", tiers:[58,51,46,42], techs:["seri","laser"], eco:true},
  {id:"gorra", name:"Gorra de gabardina", code:"GO", tiers:[72,64,58,53], techs:["bord"]},
  {id:"tote", name:"Bolsa tote de algodón reciclado", code:"TB", tiers:[45,39,35,32], techs:["seri"], eco:true},
  {id:"power", name:"Power bank 5,000 mAh", code:"PB", tiers:[165,149,138,129], techs:["laser","tampo"]},
  {id:"mochila", name:"Mochila para laptop", code:"MO", tiers:[320,295,275,260], techs:["bord","seri"]}
];
const BREAKS = [50,100,250,500];
const store = {
  get(k, d){ try{ const v = localStorage.getItem("cotizo:"+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("cotizo:"+k, JSON.stringify(v)); }catch(e){} }
};
const savedPrices = store.get("prices", null);
if(savedPrices) PRODUCTS.forEach(p=>{ if(savedPrices[p.id]) p.tiers = savedPrices[p.id]; });
const TECHS = {
  seri:{name:"Serigrafía", perInk:6, setupPerInk:350, inks:true},
  tampo:{name:"Tampografía", perInk:4, setupPerInk:300, inks:true},
  laser:{name:"Grabado láser", perPos:9, setup:0, inks:false},
  bord:{name:"Bordado (hasta 8,000 puntadas)", perPos:18, setup:450, inks:false},
  subli:{name:"Sublimación a color completo", perPos:12, setup:0, inks:false}
};
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});
let state = {prod:PRODUCTS[0], logo:null, folio:null};

function renderProducts(){
  $("products").innerHTML = PRODUCTS.map(p=>`<button class="prod" type="button" data-id="${p.id}" aria-pressed="${p.id===state.prod.id}">
    ${p.eco?'<span class="eco">Eco</span>':''}${ICON(p.code)}<strong>${p.name}</strong><small>desde ${fmt(p.tiers[3])} c/u</small></button>`).join("");
  document.querySelectorAll(".prod").forEach(b=>b.addEventListener("click",()=>{
    state.prod = PRODUCTS.find(p=>p.id===b.dataset.id); renderProducts(); renderTechs(); calc();
  }));
}
function renderTechs(){
  const cur = $("tech").value;
  $("tech").innerHTML = state.prod.techs.map(t=>`<option value="${t}">${TECHS[t].name}</option>`).join("");
  if(state.prod.techs.includes(cur)) $("tech").value = cur;
}
function tierIndex(q){ let i=0; BREAKS.forEach((b,k)=>{ if(q>=b) i=k; }); return i; }

function calc(){
  const q = Math.max(0, parseInt($("qty").value)||0);
  const t = TECHS[$("tech").value];
  const inks = +$("inks").value, pos = +$("pos").value;
  $("inks").disabled = !t.inks;
  $("inksLabel").textContent = t.inks ? "Número de tintas" : "Número de tintas (no aplica)";
  const ti = tierIndex(q);
  $("tiers").innerHTML = BREAKS.map((b,k)=>`<span class="tier ${k===ti?'on':''}">${b}${BREAKS[k+1]?'–'+(BREAKS[k+1]-1):'+'} pzas · ${fmt(state.prod.tiers[k])}</span>`).join("");
  const base = state.prod.tiers[ti];
  const persU = t.inks ? t.perInk*inks*pos : t.perPos*pos;
  const setup = t.inks ? t.setupPerInk*inks*pos : (t.setup||0)*pos;
  const exp = document.querySelector('input[name="ship"]:checked').value==="exp";
  const prodSub = base*q, persSub = persU*q;
  const expFee = exp ? (prodSub+persSub)*0.15 : 0;
  const ship = $("dest").value==="nac" ? Math.max(350, Math.ceil(q/100)*280) : 0;
  const sub = prodSub+persSub+setup+expFee+ship, iva = sub*0.16, total = sub+iva;
  const unit = q ? (prodSub+persSub+setup+expFee)/q : 0;
  const rows = [
    [`${state.prod.name} × ${q}`, prodSub],
    [`${t.name} ${t.inks?`(${inks} tinta${inks>1?'s':''}, ${pos} pos.)`:`(${pos} pos.)`}`, persSub],
    ["Preparación (pantallas, ponchado)", setup],
  ];
  if(exp) rows.push(["Cargo por entrega exprés (15%)", expFee]);
  rows.push([ship? "Envío nacional por paquetería" : "Envío ZMG", ship]);
  rows.push(["Subtotal", sub],["IVA 16%", iva]);
  $("sumBody").innerHTML = rows.map(r=>`<tr><td>${r[0]}</td><td>${fmt(r[1])}</td></tr>`).join("") + `<tr class="total"><td>Total</td><td>${fmt(total)}</td></tr>`;
  $("unitP").textContent = fmt(unit);
  const next = BREAKS[ti+1];
  $("meta").innerHTML = `<span>Entrega: ${exp?5:10} días hábiles después de aprobar tu arte</span>` +
    (next ? `<span>Con ${next} piezas el producto baja a ${fmt(state.prod.tiers[ti+1])} c/u</span>` : `<span>Ya tienes el mejor precio por volumen</span>`) +
    (state.prod.eco ? `<span style="color:var(--ok)">Producto de material reciclado</span>` : "");
  state.calc = {q, t, inks, pos, base, persU, setup, exp, expFee, ship, sub, iva, total, unit, prodSub, persSub};
  return state.calc;
}

function validate(){
  const c = state.calc;
  if(c.q < 50) return "La cantidad mínima es de 50 piezas.";
  if(!$("company").value.trim()) return "Escribe el nombre de tu empresa en el paso 4.";
  if(!$("contact").value.trim()) return "Escribe un nombre de contacto en el paso 4.";
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($("email").value.trim())) return "Escribe un correo válido en el paso 4.";
  return "";
}

function generate(){
  const c = calc(), e = validate();
  $("err").textContent = e; if(e) return;
  const d = new Date(), vig = new Date(d.getTime()+15*864e5);
  state.folio = `CTZ-${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,"0")}-${Math.floor(1000+Math.random()*9000)}`;
  const f = x => x.toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
  const line = (desc,q,pu,imp) => `<tr><td>${desc}</td><td class="n">${q}</td><td class="n">${pu}</td><td class="n">${fmt(imp)}</td></tr>`;
  let body = line(state.prod.name, c.q, fmt(c.base), c.prodSub)
    + line(`${c.t.name}${c.t.inks?`, ${c.inks} tinta(s)`:''}, ${c.pos} posición(es)`, c.q, fmt(c.persU), c.persSub)
    + line("Preparación de arte y herramental", 1, fmt(c.setup), c.setup);
  if(c.exp) body += line("Entrega exprés", 1, "15%", c.expFee);
  body += line(c.ship? "Envío nacional":"Envío ZMG", 1, fmt(c.ship), c.ship);
  $("qdoc").innerHTML = `
    <div class="qhead"><div><div class="brand">Promocionales Demo</div><div style="font-size:13px;color:var(--muted)">Cotización generada con Cotizo</div></div>
    <div><strong style="color:var(--ink)">${state.folio}</strong><br>Emitida: ${f(d)}<br>Vigente hasta: ${f(vig)}</div></div>
    <div style="font-size:14px"><strong>${esc($("company").value)}</strong> · ${esc($("contact").value)} · ${esc($("email").value)}${$("rfc").value?` · RFC ${esc($("rfc").value.toUpperCase())}`:''}</div>
    <div class="qtable"><table><thead><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">P. unitario</th><th class="n">Importe</th></tr></thead><tbody>${body}</tbody></table></div>
    <table class="sum"><tbody><tr><td>Subtotal</td><td>${fmt(c.sub)}</td></tr><tr><td>IVA 16%</td><td>${fmt(c.iva)}</td></tr><tr class="total"><td>Total</td><td>${fmt(c.total)}</td></tr></tbody></table>
    <div class="meta"><span>Entrega en ${c.exp?5:10} días hábiles a partir de la aprobación del arte. Logotipo: ${state.logo?'recibido':'pendiente de enviar'}.</span><span>Condiciones: 50% de anticipo, 50% contra entrega. Precios de ejemplo para fines académicos.</span></div>`;
  $("sent").classList.remove("show"); $("send").disabled = false;
  $("quote").classList.add("show");
  $("quote").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
function esc(s){return s.replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]))}

$("logo").addEventListener("change", ev=>{
  const file = ev.target.files[0]; if(!file) return;
  const url = URL.createObjectURL(file); state.logo = file.name;
  $("mock").innerHTML = `<img src="${url}" alt="Vista previa del logotipo">`;
});
["qty","tech","inks","pos","dest"].forEach(id=>$(id).addEventListener("input",calc));
document.querySelectorAll('input[name="ship"]').forEach(r=>r.addEventListener("change",calc));
$("gen").addEventListener("click", generate);
$("send").addEventListener("click", ()=>{ const c=state.calc; QUOTES.unshift({folio:state.folio, emp:$("company").value.trim(), prod:state.prod.name, q:c.q, total:c.total, st:"Nueva"}); store.set("quotes", QUOTES); $("sent").classList.add("show"); $("send").disabled = true; });
$("copy").addEventListener("click", async ()=>{
  const c = state.calc;
  const txt = `Cotización ${state.folio} – ${state.prod.name} × ${c.q} pzas, ${c.t.name}. Total con IVA: ${fmt(c.total)} (${fmt(c.unit)} c/u antes de IVA). Entrega: ${c.exp?5:10} días hábiles.`;
  try{ await navigator.clipboard.writeText(txt); $("copyMsg").textContent = "Resumen copiado."; }
  catch(e){ $("copyMsg").textContent = txt; }
});
$("restart").addEventListener("click", ()=>{ $("quote").classList.remove("show"); window.scrollTo({top:0}); });


const QUOTES = store.get("quotes", null) || [
  {folio:"CTZ-2611-1042", emp:"Hospital San Rafael (ejemplo)", prod:"Termo de acero 500 ml", q:200, total:24104, st:"Ganada"},
  {folio:"CTZ-2611-1037", emp:"Grupo Logístico Norte (ejemplo)", prod:"Gorra de gabardina", q:300, total:26100, st:"En seguimiento"},
  {folio:"CTZ-2611-1029", emp:"Universidad del Valle (ejemplo)", prod:"Libreta A5 de cartón reciclado", q:500, total:30276, st:"En seguimiento"},
];
function renderPanel(){
  $("qlist").innerHTML = QUOTES.map(r=>`<tr><td>${r.folio}</td><td>${esc(r.emp)}</td><td>${r.prod}</td><td class="n">${r.q}</td><td class="n">${fmt(r.total)}</td><td><span class="pill ${r.st==='Nueva'?'new':r.st==='Ganada'?'won':''}">${r.st}</span></td></tr>`).join("");
  const n=QUOTES.length, v=QUOTES.reduce((a,r)=>a+r.total,0);
  const cnt={}; QUOTES.forEach(r=>cnt[r.prod]=(cnt[r.prod]||0)+1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).at(0);
  $("k-n").textContent=n; $("k-v").textContent=fmt(v); $("k-t").textContent=fmt(n?v/n:0); $("k-p").textContent=top?top.at(0):"–";
  $("plist").innerHTML = PRODUCTS.map(p=>`<tr><td>${p.name}</td>${p.tiers.map((t,k)=>`<td class="n"><input type="number" min="1" step="1" id="pr-${p.id}-${k}" value="${t}" aria-label="${p.name}, escala ${k+1}"></td>`).join("")}</tr>`).join("");
  PRODUCTS.forEach(p=>p.tiers.forEach((t,k)=>$(`pr-${p.id}-${k}`).addEventListener("change",ev=>{
    const v=parseFloat(ev.target.value); if(v>0){ p.tiers[k]=v; const all={}; PRODUCTS.forEach(x=>all[x.id]=x.tiers); store.set("prices", all); renderProducts(); calc(); }
  })));
}
function route(){
  const h=(location.hash||"#cliente").slice(1);
  const v=["cliente","panel","planes"].includes(h)?h:"cliente";
  ["cliente","panel","planes"].forEach(x=>{ $("view-"+x).hidden = x!==v; const t=$("t-"+x); if(x===v) t.setAttribute("aria-current","page"); else t.removeAttribute("aria-current"); });
  if(v==="panel") renderPanel();
}
window.addEventListener("hashchange", route);
$("reset").addEventListener("click", ()=>{ try{ localStorage.removeItem("cotizo:quotes"); localStorage.removeItem("cotizo:prices"); }catch(e){} location.hash = "#panel"; location.reload(); });
renderProducts(); renderTechs(); calc(); route();
