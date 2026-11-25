/* MANIX HTML engine v2 — knowledge and transformations */
(()=>{"use strict";
let KB=null;
const $=(s)=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=s=>String(s||"").toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").trim();
async function load(){const r=await fetch("./p.json");if(!r.ok)throw Error("فایل p.json بارگذاری نشد؛ هر سه فایل باید کنار هم باشند.");KB=await r.json();return KB}
function inferTitle(prompt){let m=prompt.match(/(?:با عنوان|عنوان|اسم|نام)\s*[:：]?\s*["«]?([^،,.؛\n"»]{2,55})/);return m?m[1].trim():""; }
function palette(p){if(/آبی|blue/i.test(p))return ["#071426","#102b49","#39a8ff","#eaf5ff"];if(/سبز|green/i.test(p))return ["#071b16","#103b2d","#35d399","#effff7"];if(/قرمز|red/i.test(p))return ["#1c0b12","#3b1422","#fb5577","#fff1f4"];if(/روشن|سفید|light/i.test(p))return ["#f4f6fb","#ffffff","#6655e8","#151827"];return ["#080b14","#121a2b","#9368ff","#f4f6ff"]}
function buildHTML(prompt){
 const p=norm(prompt), title=inferTitle(prompt)||(/فروشگاه/.test(p)?"فروشگاه آنلاین":/رزومه|portfolio/.test(p)?"نمونه‌کار من":/داشبورد/.test(p)?"داشبورد مدیریت":/ورود|login/.test(p)?"ورود به حساب":/بلاگ/.test(p)?"مجله آنلاین":"وب‌سایت من");
 const [bg,surface,accent,fg]=palette(prompt);
 const shop=/فروشگاه|محصول|سبد خرید/.test(p), portfolio=/رزومه|نمونه.?کار|portfolio/.test(p), login=/ورود|ثبت.?نام|login|register/.test(p), dashboard=/داشبورد|مدیریت/.test(p);
 let sections=shop?`<section class="products" aria-label="محصولات">${[1,2,3].map((n)=>`<article class="product"><div class="product-art" aria-hidden="true">✦</div><h3>محصول شماره ${n}</h3><p>توضیحات کوتاه و کاربردی محصول</p><strong>۱٬۲۵۰٬۰۰۰ تومان</strong><button class="buy" type="button">افزودن به سبد</button></article>`).join("")}</section>`:
 portfolio?`<section class="cards"><article class="card"><h3>طراحی رابط کاربری</h3><p>طراحی تجربه‌های ساده و کاربردی.</p></article><article class="card"><h3>توسعه وب</h3><p>ساخت وب‌سایت‌های سریع و واکنش‌گرا.</p></article><article class="card"><h3>پروژه‌ها</h3><p>نمونه‌ای از کارهای انجام‌شده.</p></article></section>`:
 dashboard?`<section class="stats"><article class="card"><small>بازدید امروز</small><h2>۱۲٬۴۸۰</h2></article><article class="card"><small>کاربران</small><h2>۳٬۲۱۰</h2></article><article class="card"><small>درآمد</small><h2>۸۴٫۵M</h2></article></section><section class="card"><h2>فعالیت‌های اخیر</h2><p>گزارش فعالیت‌ها در این قسمت نمایش داده می‌شود.</p></section>`:
 login?`<section class="auth card"><h2>خوش آمدید</h2><form id="authForm"><label for="email">ایمیل</label><input id="email" name="email" type="email" autocomplete="email" placeholder="name@example.com" required><label for="password">رمز عبور</label><input id="password" name="password" type="password" autocomplete="current-password" required minlength="8"><button class="primary" type="submit">ورود</button><p id="formMsg" role="status"></p></form></section>`:
 `<section class="cards"><article class="card"><span class="eyebrow">طراحی مدرن</span><h2>ایده‌هایت را آنلاین کن</h2><p>یک تجربه سریع، زیبا و سازگار با موبایل برای معرفی خدمات و محصولاتت.</p><a class="primary linkbtn" href="#about">بیشتر بدانید</a></article><article class="card" id="about"><h2>درباره ما</h2><p>محتوای اختصاصی خودت را اینجا قرار بده.</p></article><article class="card"><h2>تماس با ما</h2><p>برای ارتباط، فرم یا اطلاعات تماس را اضافه کن.</p></article></section>`;
 return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(title)}؛ وب‌سایتی مدرن و واکنش‌گرا.">
<meta name="theme-color" content="${bg}">
<title>${esc(title)}</title>
<style>
:root{color-scheme:${bg==="#f4f6fb"?"light":"dark"};--bg:${bg};--surface:${surface};--accent:${accent};--fg:${fg};--muted:${bg==="#f4f6fb"?"#667085":"#aab5ca"}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--fg);font-family:Tahoma,Arial,sans-serif;line-height:1.8}
a{color:inherit}button,input{font:inherit}.container{width:min(1120px,calc(100% - 36px));margin-inline:auto}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid color-mix(in srgb,var(--fg) 12%,transparent)}
.nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font-size:20px;font-weight:800;text-decoration:none}.navlinks{display:flex;gap:18px;flex-wrap:wrap}.navlinks a{text-decoration:none;color:var(--muted);font-size:14px}
.hero{padding:76px 0 42px}.eyebrow{color:var(--accent);font-weight:bold}.hero h1{font-size:clamp(32px,7vw,62px);line-height:1.25;margin:10px 0}.hero p{max-width:650px;color:var(--muted);font-size:17px}
.primary{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:12px;background:var(--accent);color:white;padding:12px 20px;text-decoration:none;font-weight:bold;cursor:pointer}
.cards,.products,.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:28px 0 70px}.card,.product{background:var(--surface);border:1px solid color-mix(in srgb,var(--fg) 12%,transparent);border-radius:20px;padding:22px}.card p,.product p{color:var(--muted)}.product-art{height:130px;border-radius:14px;background:linear-gradient(135deg,var(--accent),#36c5d8);display:grid;place-items:center;font-size:54px;margin-bottom:14px}.buy{display:block;width:100%;margin-top:14px;background:transparent;border:1px solid var(--accent);color:var(--fg);padding:10px;border-radius:10px}
.auth{max-width:460px;margin:20px auto 80px}.auth form{display:grid;gap:10px}.auth input{width:100%;padding:13px;border-radius:10px;border:1px solid #667085;background:var(--bg);color:var(--fg)}footer{border-top:1px solid color-mix(in srgb,var(--fg) 12%,transparent);padding:24px 0;color:var(--muted)}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
@media(max-width:700px){.cards,.products,.stats{grid-template-columns:1fr}.hero{padding-top:48px}.nav{align-items:flex-start;padding:14px 0;flex-direction:column}.navlinks{gap:12px}.container{width:min(100% - 26px,1120px)}}
</style>
</head>
<body>
<header><div class="container nav"><a class="brand" href="#">${esc(title)}</a><nav class="navlinks" aria-label="ناوبری اصلی"><a href="#home">خانه</a><a href="#about">درباره</a><a href="#contact">تماس</a></nav></div></header>
<main id="home" class="container"><section class="hero"><span class="eyebrow">به وب‌سایت ما خوش آمدید</span><h1>${esc(title)}</h1><p>${shop?"محصولات منتخب را ببین و تجربه خرید ساده‌ای داشته باش.":portfolio?"من را بهتر بشناس و پروژه‌هایم را ببین.":login?"برای ادامه وارد حساب کاربری خود شو.":dashboard?"نمای کلی اطلاعات و فعالیت‌های سامانه.":"یک وب‌سایت حرفه‌ای، مدرن و کاملاً واکنش‌گرا."}</p></section>${sections}</main>
<footer id="contact"><div class="container">© ${new Date().getFullYear()} ${esc(title)} — تمامی حقوق محفوظ است.</div></footer>
<script>
document.querySelectorAll('.buy').forEach(b=>b.addEventListener('click',()=>{b.textContent='به سبد اضافه شد ✓';}));
const form=document.querySelector('#authForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#formMsg').textContent='این فرم نمایشی است؛ برای ورود واقعی به بک‌اند و احراز هویت امن نیاز است.';});
<\/script>
</body></html>`;
}
function formatHTML(s){return s.replace(/>\s*</g,"><").replace(/(>)(?=<)/g,"$1\n").replace(/(<\/?(?:html|head|body|main|header|footer|nav|section|article|form|div|ul|ol|li|table|thead|tbody|tr|h[1-6]|p|button|script|style)\b[^>]*>)/gi,"\n$1").replace(/\n{3,}/g,"\n\n").trim()}
function analyze(s){let issues=[];if(!/<!doctype html>/i.test(s))issues.push("DOCTYPE HTML5 وجود ندارد.");if(!/<html\b[^>]*lang=/i.test(s))issues.push("ویژگی lang برای عنصر html تنظیم نشده است.");if(!/<meta\b[^>]*charset=/i.test(s))issues.push("meta charset وجود ندارد.");if(!/<meta\b[^>]*name=["']viewport/i.test(s))issues.push("meta viewport وجود ندارد.");if(/<img\b(?![^>]*\balt=)[^>]*>/i.test(s))issues.push("حداقل یک img بدون alt پیدا شد.");if(/<input\b(?![^>]*\btype=["']hidden)[^>]*>/i.test(s)&&!/<label\b/i.test(s))issues.push("input وجود دارد اما label در سند پیدا نشد؛ ارتباط هر label را بررسی کن.");if((s.match(/<h1\b/gi)||[]).length===0)issues.push("عنصر h1 پیدا نشد.");if(/target=["']_blank["']/i.test(s)&&!/rel=["'][^"']*noopener/i.test(s))issues.push("لینک target=_blank را با rel=noopener noreferrer ایمن کن.");if(!issues.length)issues.push("بررسی‌های پایه مشکلی پیدا نکردند؛ این بررسی جایگزین اعتبارسنجی کامل HTML نیست.");return issues}
function modify(source,request){
 let s=source, r=norm(request);
 if(/عنوان|title/.test(r)){let t=inferTitle(request);if(t)s=s.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(t)}</title>`).replace(/<h1([^>]*)>[\s\S]*?<\/h1>/i,`<h1$1>${esc(t)}</h1>`)}
 if(/رنگ|تم|بنفش|آبی|سبز|روشن|تیره/.test(r)){let [bg,surf,acc,fg]=palette(request);if(/--bg\s*:/i.test(s)){s=s.replace(/--bg\s*:[^;]+;/i,`--bg:${bg};`).replace(/--surface\s*:[^;]+;/i,`--surface:${surf};`).replace(/--accent\s*:[^;]+;/i,`--accent:${acc};`).replace(/--fg\s*:[^;]+;/i,`--fg:${fg};`)}}
 if(/اضافه.*(?:بخش|سکشن)|بخش.*اضافه/.test(r)){let title=inferTitle(request)||"بخش جدید";s=s.replace(/<\/main>/i,`<section class="container card"><h2>${esc(title)}</h2><p>محتوای این بخش را ویرایش کنید.</p></section></main>`)}
 if(/ریسپانسیو|موبایل/.test(r)&&!/@media/i.test(s))s=s.replace("</style>","@media(max-width:700px){.container{width:calc(100% - 24px)}.cards{grid-template-columns:1fr}nav{flex-wrap:wrap}}\n</style>");
 if(/توضیح|description|سئو/.test(r)&&!/<meta[^>]+name=["']description/i.test(s))s=s.replace("</title>",'</title>\n<meta name="description" content="توضیح صفحه را اینجا وارد کنید">');
 return s;
}
window.MANIX_HTML={load,buildHTML,formatHTML,analyze,modify,get knowledge(){return KB}};
})();
