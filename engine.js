/* موتور دانش MANIX: تمام محتوای دانشی از p.json خوانده می‌شود. */
(()=>{"use strict";
let DB=null;
const norm=s=>String(s||"").toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[^\p{L}\p{N}+#.-]/gu," ").replace(/\s+/g," ").trim();
const words=s=>norm(s).split(" ").filter(x=>x.length>1);
async function load(){const r=await fetch("./p.json");if(!r.ok)throw Error("p.json پیدا نشد");DB=await r.json();return DB}
function score(q,item){const query=norm(q),all=norm([item.title,item.summary,...(item.keywords||[]),...(item.rules||[])].join(" "));let n=0;for(const w of words(q))if(all.includes(w))n+=all.split(w).length-1;if(query.includes(norm(item.title)))n+=8;return n}
function search(q){if(!DB)return[];return DB.topics.map(x=>({...x,score:score(q,x)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6)}
function reply(q){const hits=search(q);if(!hits.length)return "در p.json برای این درخواست مطلب دقیقی پیدا نکردم. می‌توانی دانش یا مثال جدید را به همین فایل اضافه کنی. توجه: این موتور دانش‌محور است، نه یک مدل زبانی مولد؛ بنابراین پاسخ‌هایش بر اساس محتوای ذخیره‌شده و الگوهای موجود است.";return hits.map(x=>"### "+x.title+"\n"+x.summary+"\n"+(x.rules||[]).map(t=>"• "+t).join("\n")+(x.example?"\n\nنمونه کد:\n"+x.example:"")).join("\n\n────────\n\n")}
function template(q){if(!DB)return null;return DB.templates.map(x=>({...x,score:score(q,x)})).sort((a,b)=>b.score-a.score)[0]||null}
window.MANIX={load,search,reply,template,get db(){return DB}};
})();
