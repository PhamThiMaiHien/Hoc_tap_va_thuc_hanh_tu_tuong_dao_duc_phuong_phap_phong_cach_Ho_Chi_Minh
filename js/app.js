/* Chủ đề 1 – web học liệu. Không cần máy chủ: mở index.html hoặc đưa cả thư mục lên hosting tĩnh. */
(function(){
'use strict';
document.documentElement.classList.remove('no-js');
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return JSON.parse(localStorage.getItem('cd1:'+k))}catch(e){return null}},set:function(k,v){try{localStorage.setItem('cd1:'+k,JSON.stringify(v))}catch(e){}}};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- thanh tiêu đề luôn hiện, thu gọn khi cuộn ---------- */
var hdr=$('.hdr');
function setHH(){document.documentElement.style.setProperty('--hh',hdr.offsetHeight+'px')}
var compact=false;
window.addEventListener('scroll',function(){var c=scrollY>60;if(c!==compact){compact=c;hdr.classList.toggle('compact',c);setTimeout(setHH,320)}},{passive:true});
window.addEventListener('resize',function(){setHH();moveInd()});
setHH();

/* thanh chọn thời kỳ: vạch vàng trượt theo chuột */
var row=$('.nav .row'),ind=$('.nav .ind'),act=$('.nav a[aria-current="page"]');
function moveInd(el){if(!ind)return;el=el||act;if(!el){ind.style.width='0';return}ind.style.left=el.offsetLeft-row.scrollLeft+16+'px';ind.style.width=el.offsetWidth-32+'px'}
$$('.nav a').forEach(function(a){a.addEventListener('mouseenter',function(){moveInd(a)})});
if(row){row.addEventListener('mouseleave',function(){moveInd()});row.addEventListener('scroll',function(){moveInd()},{passive:true})}
if(act&&row){row.scrollLeft=Math.max(0,act.offsetLeft-(row.clientWidth-act.offsetWidth)/2)}
moveInd();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){setHH();moveInd()});

var tt=$('.totop');
if(tt){window.addEventListener('scroll',function(){tt.classList.toggle('show',scrollY>700)},{passive:true});tt.onclick=function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'})}}

/* ---------- hiện dần khi cuộn ---------- */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1}):null;
function reveal(root){$$('[data-reveal]',root).forEach(function(el,i){if(!io||reduce){el.classList.add('in');return}el.style.transitionDelay=Math.min(i%6*70,350)+'ms';io.observe(el)})}
reveal(document);

/* ---------- xem ảnh lớn: bấm ảnh để mở, bấm tiếp để phóng to ---------- */
var lb=$('#lb'),lbList=[],lbI=0,lbImg=lb&&$('img',lb);
function lbZoom(on,e){lb.classList.toggle('zoom',on);if(on&&e){var r=lbImg.getBoundingClientRect();lbImg.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%'}if(!on)lbImg.style.transformOrigin=''}
function lbShow(i){lbZoom(false);lbI=(i+lbList.length)%lbList.length;var it=lbList[lbI];lbImg.src=it.src;lbImg.alt=it.alt;$('p',lb).textContent=it.cap;$('.cnt',lb).textContent=lbList.length>1?(lbI+1)+' / '+lbList.length:'';lb.classList.toggle('single',lbList.length<2)}
function capOf(m){var f=m.closest('figure,.person,.stop');if(!f)return m.alt;var parts=[];$$('b,small,p,span,figcaption',f).forEach(function(x){if(x.closest('figcaption')&&x.tagName!=='FIGCAPTION')return;var t=(x.tagName==='FIGCAPTION'?Array.prototype.map.call(x.childNodes,function(n){return n.textContent}).join(' – '):x.textContent).replace(/\s+/g,' ').trim();if(t)parts.push(t)});return parts.join(' · ')||m.alt}
function bindAlbum(root){
  var imgs=$$('.album img',root);
  imgs.forEach(function(img,i){
    if(img.parentElement.tagName==='FIGURE'){var w=document.createElement('div');w.className='zw';img.parentNode.insertBefore(w,img);w.appendChild(img)}
    img.addEventListener('click',function(){lbList=imgs.map(function(m){return {src:m.src,alt:m.alt,cap:capOf(m)}});lbShow(i);lb.classList.add('open');$('.x',lb).focus()});
  });
  $$('img.zoomable',root).forEach(function(img){img.addEventListener('click',function(){lbList=[{src:img.src,alt:img.alt,cap:capOf(img)}];lbShow(0);lb.classList.add('open');$('.x',lb).focus()})});
}
if(lb){
  lb.addEventListener('click',function(e){
    if(e.target.closest('.pv'))lbShow(lbI-1);else if(e.target.closest('.nx'))lbShow(lbI+1);
    else if(e.target===lbImg)lbZoom(!lb.classList.contains('zoom'),e);
    else{lb.classList.remove('open');lbZoom(false)}});
  lbImg.addEventListener('mousemove',function(e){if(lb.classList.contains('zoom'))lbZoom(true,e)});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape'){lb.classList.remove('open');lbZoom(false)}if(e.key==='ArrowRight')lbShow(lbI+1);if(e.key==='ArrowLeft')lbShow(lbI-1)});
  var sx=null;lb.addEventListener('touchstart',function(e){sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
  lb.addEventListener('touchend',function(e){if(sx===null||lb.classList.contains('zoom'))return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50&&lbList.length>1)lbShow(lbI+(dx<0?1:-1));sx=null});
}

/* ---------- sơ đồ tư duy: phóng to, kéo, toàn màn hình ---------- */
$$('.viewer').forEach(function(v){
  var st=$('.stage',v),img=$('img',st),z=1;
  function setZ(n){z=Math.max(1,Math.min(3,n));st.classList.toggle('fit',z===1);img.style.width=z===1?'':(z*100)+'%';$('.zv',v).textContent=Math.round(z*100)+'%'}
  setZ(1);
  $('.zin',v).onclick=function(){setZ(z+.5)};$('.zout',v).onclick=function(){setZ(z-.5)};
  img.addEventListener('dblclick',function(){setZ(z>1?1:2)});
  var fs=$('.fs',v);if(fs){if(!v.requestFullscreen)fs.hidden=true;fs.onclick=function(){document.fullscreenElement?document.exitFullscreen():v.requestFullscreen()}}
  var d=null;st.addEventListener('mousedown',function(e){d={x:e.clientX,y:e.clientY,l:st.scrollLeft,t:st.scrollTop};st.classList.add('drag');e.preventDefault()});
  window.addEventListener('mousemove',function(e){if(!d)return;st.scrollLeft=d.l-(e.clientX-d.x);st.scrollTop=d.t-(e.clientY-d.y)});
  window.addEventListener('mouseup',function(){d=null;st.classList.remove('drag')});
});

/* ---------- nhánh tổng quan: mở/đóng từng nhánh ---------- */
$$('.br').forEach(function(br){var bt=$('button',br),ul=$('ul',br);bt.addEventListener('click',function(){var o=!br.classList.contains('open');br.classList.toggle('open',o);bt.setAttribute('aria-expanded',o);ul.style.maxHeight=o?ul.scrollHeight+30+'px':'0'})});

/* ---------- trang chủ: dòng "Chủ đề 1" trên thanh tiêu đề chỉ hiện khi đã cuộn qua tiêu đề lớn ---------- */
var heroT=document.body.classList.contains('home')&&$('.hero h1');
if(heroT){
  var showTop=function(on){hdr.classList.toggle('show-top',on);setTimeout(setHH,420)};
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){showTop(!es[0].isIntersecting)},{rootMargin:'-80px 0px 0px 0px'}).observe(heroT)}else{showTop(true)}
}

/* ---------- phim tư liệu: bấm vào thẻ phim để mở trên YouTube ---------- */
function ytId(u){var m=String(u).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:null}
$$('.films[data-n]').forEach(function(box){
  var list=(window.FILMS||{})[box.dataset.n];if(typeof list==='string')list=list?[list]:[];if(!list||!list.length)return;
  list=list.map(function(u){return typeof u==='object'?u:{url:u}});
  var local=list.every(function(f){return !ytId(f.url)&&!/^https?:/i.test(f.url)});
  if(local){
    box.className='films local';
    box.innerHTML='<div class="fv"><video controls playsinline preload="metadata"></video><div class="fv-cap"><b></b><span></span></div></div>'+
      (list.length>1?'<ol class="fv-list">'+list.map(function(f,i){return '<li><button type="button" data-i="'+i+'"><span class="th">'+(f.poster?'<img src="'+esc(f.poster)+'" alt="" loading="lazy">':'')+'<i aria-hidden="true"></i></span><span class="tx"><small>Phim '+(i+1)+'</small>'+esc(f.title||('Phim '+(i+1)))+'</span></button></li>'}).join('')+'</ol>':'');
    var v=$('video',box);
    function load(i,play){var f=list[i];v.src=f.url;if(f.poster)v.poster=f.poster;else v.removeAttribute('poster');$('.fv-cap b',box).textContent=f.title||'Phim tư liệu';$('.fv-cap span',box).textContent=list.length>1?'Phim '+(i+1)+'/'+list.length:'';
      $$('.fv-list button',box).forEach(function(b){b.classList.toggle('on',+b.dataset.i===i)});if(play){var p=v.play();if(p&&p.catch)p.catch(function(){})}}
    $$('.fv-list button',box).forEach(function(b){b.onclick=function(){load(+b.dataset.i,true);v.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})}});
    v.addEventListener('ended',function(){var cur=$$('.fv-list button',box).findIndex(function(b){return b.classList.contains('on')});if(cur>-1&&cur<list.length-1)load(cur+1,true)});
    var pnl=box.closest('.panel');if(pnl)new MutationObserver(function(){if(!pnl.classList.contains('on'))v.pause()}).observe(pnl,{attributes:true,attributeFilter:['class']});
    load(0,false);return;
  }
  box.classList.toggle('one',list.length===1);box.dataset.c=list.length;
  var thumbs=[];document.querySelectorAll('.album img').forEach(function(im){thumbs.push(im.getAttribute('src'))});var hero=document.querySelector('.phero .frame img');
  var usedT={};function pickThumb(i){var hs=hero&&hero.getAttribute('src');if(i===0&&hs){usedT[hs]=1;return hs}var n=thumbs.length;for(var k=0;k<n;k++){var c=thumbs[(i*3+1+k)%n];if(!usedT[c]&&c!==hs&&!/tk\d-bia/.test(c)){usedT[c]=1;return c}}return hs}
  box.innerHTML=list.map(function(f,i){var u=f.url,ttl=f.title||'',id=ytId(u),tm=String(u).match(/[?&]t=(\d+)/),href=id?'https://www.youtube.com/watch?v='+id+(tm?'&t='+tm[1]+'s':''):u;
    var site=id?'YouTube':(/sharepoint\.com|1drv\.ms|onedrive/i.test(u)?'OneDrive':'trang phim');
    var th=f.poster||(id?'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg':pickThumb(i));
    return '<a class="fcard" href="'+esc(href)+'" target="_blank" rel="noopener" aria-label="Xem phim '+(i+1)+' trên '+site+'">'+(th?'<img src="'+esc(th)+'" alt="" loading="lazy" onerror="this.remove()">':'')+'<span class="play" aria-hidden="true"></span><span class="meta"><b>'+esc(ttl||(list.length>1?'Phim '+(i+1):'Phim tư liệu'))+'</b><span>'+(ttl&&list.length>1?'Phim '+(i+1)+' · ':'')+'Xem trên '+site+' ↗</span></span></a>'}).join('');
});

/* ---------- trang thời kỳ: danh mục ---------- */
var panels=$$('.panel');
if(panels.length){
  var links=$$('.toc a.m'),chips=$$('.chips a'),toc=$('.toc'),bg=$('.sheet-bg'),fab=$('.fab'),seen=store.get('seen:'+document.body.dataset.slug)||{};
  document.body.classList.add('has-fab');
  function sheet(o){toc.classList.toggle('open',o);bg.classList.toggle('on',o);fab.setAttribute('aria-expanded',o)}
  fab.addEventListener('click',function(){sheet(!toc.classList.contains('open'))});
  bg.addEventListener('click',function(){sheet(false)});
  function mark(){}
  function show(id,sub,noScroll){
    var p=document.getElementById(id);if(!p||!p.classList.contains('panel'))return;
    panels.forEach(function(x){x.classList.toggle('on',x===p)});
    links.forEach(function(a){var on=a.dataset.p===id;a.setAttribute('aria-current',on);a.parentElement.classList.toggle('open',on)});
    chips.forEach(function(a){var on=a.dataset.p===id;a.setAttribute('aria-current',on);if(on){var c=a.parentElement;c.scrollTo({left:a.offsetLeft-(c.clientWidth-a.offsetWidth)/2,behavior:reduce?'auto':'smooth'})}});
    sheet(false);
    
    reveal(p);
    if(id==='bai-tap'&&window.QUIZ_INIT)window.QUIZ_INIT();
    if(!noScroll){var t=sub?document.getElementById(sub):$('.layout');if(t)setTimeout(function(){t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})},40)}
  }
  function fromHash(first){
    var h=decodeURIComponent(location.hash.slice(1)),el=h&&document.getElementById(h);
    if(!el||!el.closest('.panel')){show(panels[0].id,null,true);return}
    var p=el.classList.contains('panel')?el:el.closest('.panel');
    show(p.id,el===p?null:h,first&&el===p);
  }
  window.addEventListener('hashchange',function(){fromHash(false)});
  $$('.pnav button[data-go]').forEach(function(b){b.addEventListener('click',function(){location.hash=b.dataset.go})});
  $$('.toc ul a').forEach(function(a){a.addEventListener('click',function(){sheet(false)})});
  fromHash(true);
  var ly=scrollY;window.addEventListener('scroll',function(){var y=scrollY;if(Math.abs(y-ly)>8){fab.classList.toggle('hide',y>ly&&y>300&&!toc.classList.contains('open'));ly=y}},{passive:true});
}
bindAlbum(document);

/* ================= BÀI TẬP: XÁO TRỘN CÂU HỎI VÀ PHƯƠNG ÁN MỖI LẦN LÀM ================= */
var LV={M1:'Nhận biết',M2:'Thông hiểu',M3:'Vận dụng',M4:'Vận dụng cao'},L='ABCD';
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function fmt(x){return (Math.round(x*100)/100).toString().replace('.',',')}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function Quiz(box){
  var n0=+box.dataset.set.replace('tk',''),bank=window.QS.filter(function(q){return q.gd===n0});
  var st={phase:'start'},timer=null;
  function newPaper(){return shuffle(bank).map(function(q){var o=shuffle([0,1,2,3]);return {q:q.q,o:q.o,lv:q.lv,ref:q.ref,order:o,ans:o.indexOf(q.a)}})}
  function begin(){st={phase:'do',qs:newPaper(),ch:{},cur:0,t0:Date.now()};render();box.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}
  function render(){clearInterval(timer);if(st.phase==='start')start();else if(st.phase==='do')doing();else result()}
  function start(){
    box.innerHTML='<div class="qstart"><div class="big">'+bank.length+'</div><p>câu hỏi trắc nghiệm</p><button class="btn" type="button" id="qGo">Bắt đầu làm bài</button></div>';
    $('#qGo',box).onclick=begin;
  }
  function qhtml(q,i,done){
    var c=st.ch[i];
    return '<div class="qh"><span class="qn">Câu '+(i+1)+'.</span><span class="qt">'+esc(q.q)+'<span class="lv">'+q.lv+' · '+LV[q.lv]+'</span></span></div><div class="opts">'+
    q.order.map(function(oi,j){var cls=c===j?'sel':'';if(done)cls=j===q.ans?'right':(j===c?'wrong':'');
      return '<label class="opt '+cls+'"><input type="radio" name="o'+i+'" value="'+j+'"'+(c===j?' checked':'')+(done?' disabled':'')+'><span class="k">'+L[j]+'</span><span>'+esc(q.o[oi])+'</span></label>'}).join('')+'</div>'+
    (done?'<div class="fb">'+(c===q.ans?'<b class="ok">Đúng.</b>':c===undefined?'<b class="no">Chưa trả lời.</b>':'<b class="no">Chưa đúng.</b>')+' Đáp án đúng: <b>'+L[q.ans]+'</b>.'+(q.ref?' Căn cứ: '+esc(q.ref)+'.':'')+'</div>':'');
  }
  function doing(){
    var i=st.cur,q=st.qs[i],n=st.qs.length,a=Object.keys(st.ch).length;
    box.innerHTML='<div class="qtop"><span>Câu '+(i+1)+'/'+n+'</span><span class="tm">⏱ <span id="qT">'+mmss(Date.now()-st.t0)+'</span></span></div><div class="qprog"><i style="width:'+(a/n*100)+'%"></i></div>'+
    '<div class="qdots">'+st.qs.map(function(_,k){return '<button type="button" data-k="'+k+'" class="'+(st.ch[k]!==undefined?'ans ':'')+(k===i?'cur':'')+'" aria-label="Câu '+(k+1)+'">'+(k+1)+'</button>'}).join('')+'</div>'+
    '<fieldset class="qitem slide"><legend class="vh">Câu '+(i+1)+'</legend>'+qhtml(q,i,false)+'</fieldset>'+
    '<p class="err" role="alert"></p><div class="qnav"><button class="btn ghost" type="button" id="qP"'+(i===0?' disabled':'')+'>Câu trước</button><div class="r">'+(i<n-1?'<button class="btn" type="button" id="qX">Câu tiếp theo</button>':'')+'<button class="btn '+(i<n-1?'ghost':'gold')+'" type="button" id="qS">Nộp bài</button></div></div>';
    $$('input',box).forEach(function(inp){inp.onchange=function(){st.ch[i]=+inp.value;
      $$('.opt',box).forEach(function(o){o.classList.toggle('sel',$('input',o).checked)});
      $$('.qdots button',box)[i].classList.add('ans');$('.qprog i',box).style.width=Object.keys(st.ch).length/n*100+'%';
      if(i<n-1&&!reduce)setTimeout(function(){if(st.cur===i&&st.phase==='do'){st.cur++;render()}},450)}});
    $$('.qdots button',box).forEach(function(b){b.onclick=function(){st.cur=+b.dataset.k;render()}});
    $('#qP',box).onclick=function(){st.cur--;render()};
    var x=$('#qX',box);if(x)x.onclick=function(){st.cur++;render()};
    $('#qS',box).onclick=function(){
      var miss=n-Object.keys(st.ch).length;
      if(miss&&!st.warn){st.warn=1;$('.err',box).textContent='Còn '+miss+' câu chưa trả lời. Bấm “Nộp bài” lần nữa nếu vẫn muốn nộp.';return}
      st.phase='done';st.t1=Date.now();render();box.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    };
    timer=setInterval(function(){var t=$('#qT',box);if(t)t.textContent=mmss(Date.now()-st.t0)},1000);
  }
  function result(){
    var n=st.qs.length,right=0;st.qs.forEach(function(q,i){if(st.ch[i]===q.ans)right++});
    var sc=right*10/n,C=2*Math.PI*52;
    box.innerHTML='<div class="result" role="status"><div class="ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/></svg><b>'+fmt(sc)+'</b></div>'+
    '<div><div class="who">Đúng '+right+'/'+n+' câu</div><div class="meta">Thời gian làm bài: '+mmss(st.t1-st.t0)+'</div></div></div>'+
    '<div class="qnav" style="margin-bottom:6px"><div class="r"><button class="btn" type="button" id="qR">Làm lại</button></div></div>'+
    '<h3 class="review-h">Xem lại bài làm</h3><div class="qdots">'+st.qs.map(function(q,k){return '<button type="button" data-k="'+k+'" class="'+(st.ch[k]===q.ans?'r':'w')+'" aria-label="Xem câu '+(k+1)+'">'+(k+1)+'</button>'}).join('')+'</div>'+
    '<div class="done">'+st.qs.map(function(q,i){return '<fieldset class="qitem" id="'+box.dataset.set+'-c'+(i+1)+'"><legend class="vh">Câu '+(i+1)+'</legend>'+qhtml(q,i,true)+'</fieldset>'}).join('')+'</div>';
    setTimeout(function(){var fg=$('.fg',box);if(fg)fg.style.strokeDashoffset=C*(1-sc/10)},60);
    $$('.qdots button',box).forEach(function(b){b.onclick=function(){document.getElementById(box.dataset.set+'-c'+(+b.dataset.k+1)).scrollIntoView({behavior:'smooth',block:'center'})}});
    $('#qR',box).onclick=begin;
  }
  render();
}
var quizzes=$$('.quiz[data-set]');
window.QUIZ_INIT=function(){quizzes.forEach(function(b){if(!b._q){b._q=1;Quiz(b)}})};
if(!panels.length)window.QUIZ_INIT();
})();

/* ================= BẢNG GHIM TRÍCH DẪN ================= */
(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function strip(h){var d=document.createElement('div');d.innerHTML=String(h).replace(/<br\s*\/?>/g,' ');return d.textContent}
/* chuyển dạng xem */
$$('.qview').forEach(function(tv){
  var panel=tv.parentElement,board=$('.cboard',panel),list=$('.qlist',panel),wall=$('.cwall',panel);
  var V={board:board,list:list,wall:wall};
  $$('button',tv).forEach(function(b){b.onclick=function(){
    $$('button',tv).forEach(function(x){x.setAttribute('aria-selected',x===b)});
    Object.keys(V).forEach(function(k){if(V[k])V[k].hidden=k!==b.dataset.v});window.dispatchEvent(new Event('resize'));
  }});
  window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(h&&list.querySelector('[id="'+h+'"]')&&list.hidden){$('button[data-v=list]',tv).click();setTimeout(function(){var el=document.getElementById(h);el&&el.scrollIntoView({block:'start'})},50)}});
  var h0=location.hash.slice(1);if(h0&&h0!=='trich-dan'&&list.querySelector('[id="'+h0+'"]'))$('button[data-v=list]',tv).click();
});

$$('.cboard').forEach(function(root){
  var D=JSON.parse($('.cbdata',root).textContent),canvas=$('.cb-canvas',root),scroll=$('.cb-scroll',root),zoom=$('.cb-zoom',root),zbox=$('.cb-zbox',root);
  /* mỗi trích dẫn có thể kèm một ảnh liên quan (ảnh nằm dưới, thẻ đè lên) */
  var QP=D.qpics||{},items=[];
  if(D.flow&&D.flow.length)items.push({id:'flow',type:'sticky'});
  D.items.forEach(function(q){items.push({id:q.id,type:'card',q:q,pic:QP[q.id]||null})});
  if(D.order&&D.order.length){var rank={};D.order.forEach(function(id,i){rank[id]=i});items.sort(function(a,b){return (rank[a.id]==null?99:rank[a.id])-(rank[b.id]==null?99:rank[b.id])})}
  var COLS,CW,W,H,byId;
  function rnd(i,k){var x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x)}
  function colsFor(w){var n=items.length;if(w<560)return 1;if(w<780)return Math.min(2,n);return Math.min(3,n)}
  function build(){
    COLS=colsFor(scroll.clientWidth||800);CW=COLS===1?320:300;
    /* vị trí ô (cột, hàng) */
    var pos={};
    if(D.grid&&COLS===3){items.forEach(function(it){var g=D.grid[it.id];pos[it.id]=g?g.slice():null});
      var used={};items.forEach(function(it){if(pos[it.id])used[pos[it.id]+'']=1});var r=0,c=0;
      items.forEach(function(it){if(pos[it.id])return;while(used[c+','+r]){c++;if(c>=3){c=0;r++}}pos[it.id]=[c,r];used[c+','+r]=1})}
    else if(D.grid&&COLS===2&&D.grid){var seq=items.slice();seq.forEach(function(it,i){pos[it.id]=[i%2,Math.floor(i/2)]})}
    else items.forEach(function(it,i){var r=Math.floor(i/COLS),c=i%COLS;if(r%2===1&&COLS>1)c=COLS-1-c;pos[it.id]=[c,r]});
    var ncols=0,nrows=0;items.forEach(function(it){ncols=Math.max(ncols,pos[it.id][0]+1);nrows=Math.max(nrows,pos[it.id][1]+1)});
    /* chiều cao từng hàng */
    var rowH=[];for(var r=0;r<nrows;r++)rowH[r]=0;
    items.forEach(function(it){it.fh=it.type==='sticky'?185:(it.pic?318:192);var r=pos[it.id][1];rowH[r]=Math.max(rowH[r],it.fh)});
    var rowY=[],acc=44;for(r=0;r<nrows;r++){rowY[r]=acc;acc+=rowH[r]+34}
    W=ncols*CW+24;H=acc;
    items.forEach(function(it,i){
      var c=pos[it.id][0],r=pos[it.id][1],cx=12+c*CW,cy=rowY[r]+(rowH[r]-it.fh)*.62+(rnd(i,2)-.5)*12;
      it.rot=(rnd(i,3)-.5)*5;it.z=2+i;
      if(it.type==='sticky'){it.w=215;it.x=cx+(CW-215)/2;it.y=cy;it.bh=182}
      else if(it.pic){var lft=rnd(i,5)>.5;it.ph={x:cx+(lft?6:CW-212),y:cy,w:206,rot:-(it.rot*1.6)||-3};it.w=236;it.x=cx+(lft?CW-246:10);it.y=cy+128;it.bh=180}
      else{it.w=236;it.x=cx+(CW-236)/2+(rnd(i,1)-.5)*16;it.y=cy;it.bh=180}
      it.px=it.x+it.w/2;it.py=it.y+8;if(it.pic){it.ax=it.ph.x+it.ph.w/2;it.ay=it.ph.y+2;it.ty=it.ph.y}else{it.ax=it.px;it.ay=it.py;it.ty=it.y}
    });
    byId={};items.forEach(function(it){byId[it.id]=it});
    var h='<svg class="cb-strings" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" aria-hidden="true">',labels='';
    D.links.forEach(function(l,k){var a=byId[l.a],b=byId[l.b];if(!a||!b)return;var x1,y1,x2,y2,lx,ly;
      var side=COLS===1&&Math.abs(a.ty-b.ty)>330;
      if(side){var u=a.y<b.y?a:b,w=a.y<b.y?b:a;x1=u.x+u.w-6;y1=u.y+u.bh*.55;x2=w.x+w.w-6;y2=w.y+w.bh*.45;
        h+='<path class="str '+(l.kind||'')+'" d="M'+x1+' '+y1+' C'+(W+6)+' '+y1+' '+(W+6)+' '+y2+' '+x2+' '+y2+'"/>';
        if(l.why)labels+='<span class="cb-lbl side" style="left:'+(W-22)+'px;top:'+((y1+y2)/2).toFixed(0)+'px">'+esc(l.why)+'</span>';return}
      if(Math.abs(a.ty-b.ty)>100){var u2=a.ty<b.ty?a:b,w2=a.ty<b.ty?b:a;x1=u2.px;y1=u2.y+u2.bh-4;x2=w2.ax;y2=w2.ay;lx=(x1+x2)/2;ly=(y1+y2)/2}
      else{x1=a.ax;y1=a.ay;x2=b.ax;y2=b.ay;lx=(x1+x2)/2;ly=Math.min(y1,y2)-15}
      var dist=Math.hypot(x2-x1,y2-y1),sag=Math.abs(y1-y2)>100?0:Math.min(18,dist*.06);
      h+='<path class="str '+(l.kind||'')+'" d="M'+x1+' '+y1+' Q'+((x1+x2)/2)+' '+((y1+y2)/2+sag)+' '+x2+' '+y2+'" style="animation-delay:'+(0.5+k*.1)+'s"/>';
      if(l.why)labels+='<span class="cb-lbl" style="left:'+lx.toFixed(0)+'px;top:'+ly.toFixed(0)+'px;animation-delay:'+(1.2+k*.1)+'s">'+esc(l.why)+'</span>'});
    h+='</svg>'+labels;
    items.forEach(function(it,i){
      var st='left:'+it.x+'px;top:'+it.y+'px;width:'+it.w+'px;--r:'+it.rot.toFixed(2)+'deg;z-index:'+(it.z+1)+';animation-delay:'+(i*0.05+.1)+'s';
      if(it.type==='sticky'){h+='<div class="cb-item cb-sticky" style="'+st+'"><i class="pin"></i><b>Mạch trích dẫn</b><ol>'+D.flow.map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ol></div>';return}
      if(it.pic){var P=it.ph;h+='<button type="button" class="cb-item cb-photo" data-id="'+it.id+'" data-photo="1" style="left:'+P.x+'px;top:'+P.y+'px;width:'+P.w+'px;--r:'+P.rot.toFixed(2)+'deg;z-index:'+it.z+';animation-delay:'+(i*0.05)+'s"><span class="tape"></span><img src="'+esc(it.pic.src)+'" alt="'+esc(it.pic.cap)+'" loading="lazy"><span class="cap">'+esc(it.pic.cap)+'</span></button>'}
      var q=it.q,ex=strip(q.quote).trim();if(!/^[“"]/.test(ex))ex='“'+ex+'”';
      h+='<button type="button" class="cb-item cb-card'+(it.pic?' on-photo':'')+'" data-id="'+q.id+'" style="'+st+'"><i class="pin"></i>'+
        '<span class="cb-meta"><span>Trích dẫn '+esc(q.no)+'</span>'+(q.when?'<span>'+esc(q.when)+'</span>':'')+'</span>'+
        (q.title?'<span class="cb-title">'+esc(q.title)+'</span>':'')+'<span class="cb-ex">'+esc(ex)+'</span></button>';
    });
    canvas.innerHTML=h;canvas.style.width=W+'px';canvas.style.height=H+'px';
    $$('.cb-card,.cb-photo',canvas).forEach(function(c){c.addEventListener('click',function(){open(c)})});
    /* rê vào thẻ: ảnh đi kèm cũng nổi lên */
    $$('.cb-card.on-photo',canvas).forEach(function(c){var ph=canvas.querySelector('.cb-photo[data-id="'+c.dataset.id+'"]');c.addEventListener('mouseenter',function(){ph.classList.add('lift')});c.addEventListener('mouseleave',function(){ph.classList.remove('lift')})});
  }
  var uz=1,K=1,base=1;
  function fit(keep){
    if(colsFor(scroll.clientWidth||800)!==COLS)build();
    var full=root.classList.contains('full')||document.fullscreenElement===root,avail=scroll.clientWidth-4;
    var k=avail/W;if(!full)k=Math.min(k,1.2);if(COLS===1)k=Math.min(k,1.3);
    if(full){k=Math.min(k,(scroll.clientHeight-10)/H)}
    base=k;K=k*uz;
    canvas.style.transform='scale('+K+')';
    var sz=$('.cb-sizer',scroll);if(!sz){scroll.insertAdjacentHTML('afterbegin','<div class="cb-sizer"></div>');sz=$('.cb-sizer',scroll)}
    sz.style.width=W*K+'px';sz.style.height=H*K+'px';
    canvas.style.left=Math.max(0,(scroll.clientWidth-W*K)/2)+'px';
    canvas.style.top=full?Math.max(0,(scroll.clientHeight-H*K)/2)+'px':'0px';
    var r=$('.bz-r',root);if(r)r.textContent=Math.round(uz*100)+'%';
    root.classList.toggle('zoomed',uz>1);
  }
  /* thu phóng cả bảng, giữ nguyên điểm đang nhìn */
  function setUz(v,cx,cy){
    v=Math.max(.5,Math.min(3,v));var rect=scroll.getBoundingClientRect();
    if(cx==null){cx=scroll.clientWidth/2;cy=Math.min(scroll.clientHeight,innerHeight-rect.top)/2}
    var l0=parseFloat(canvas.style.left)||0,px=(scroll.scrollLeft+cx-l0)/K,py=(scroll.scrollTop+cy)/K,pageY=window.scrollY;
    uz=v;fit();
    scroll.scrollLeft=px*K-cx+(parseFloat(canvas.style.left)||0);scroll.scrollTop=py*K-cy;
    if(scroll.scrollHeight<=scroll.clientHeight+1){var dy=py*K*0-0;window.scrollTo(0,pageY)}
  }
  $('.bz-i',root).onclick=function(){setUz(uz*1.2)};
  $('.bz-o',root).onclick=function(){setUz(uz/1.2)};
  $('.bz-r',root).onclick=function(){uz=1;fit();scroll.scrollLeft=0;scroll.scrollTop=0};
  scroll.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();var r=scroll.getBoundingClientRect();setUz(uz*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  /* kéo để di chuyển khi đã phóng to */
  var pd=null,pmoved=false;
  scroll.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('.cb-card,.cb-photo'))return;pd={x:e.clientX,y:e.clientY,l:scroll.scrollLeft,t:scroll.scrollTop,py:window.scrollY};pmoved=false});
  window.addEventListener('pointermove',function(e){if(!pd)return;var dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(Math.abs(dx)+Math.abs(dy)>4){pmoved=true;scroll.classList.add('drag')}if(!pmoved)return;scroll.scrollLeft=pd.l-dx;if(scroll.scrollHeight>scroll.clientHeight+1)scroll.scrollTop=pd.t-dy;else window.scrollTo(0,pd.py-dy)});
  window.addEventListener('pointerup',function(){pd=null;scroll.classList.remove('drag')});
  /* chụm 2 ngón */
  var pin=null;
  scroll.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1],r=scroll.getBoundingClientRect();pin={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),u:uz,cx:(a.clientX+b.clientX)/2-r.left,cy:(a.clientY+b.clientY)/2-r.top}}},{passive:true});
  scroll.addEventListener('touchmove',function(e){if(pin&&e.touches.length===2){e.preventDefault();var a=e.touches[0],b=e.touches[1];setUz(pin.u*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pin.d,pin.cx,pin.cy)}},{passive:false});
  scroll.addEventListener('touchend',function(e){if(e.touches.length<2)pin=null});
  /* phóng to một trích dẫn / ảnh */
  var src=null;
  function open(el){
    src=el;var id=el.dataset.id,it=byId[id];
    if(el.dataset.photo){zbox.className='cb-zbox photo';zbox.innerHTML='<button type="button" class="cbz-x" aria-label="Đóng">✕</button><span class="tape"></span><img src="'+esc(it.pic.src)+'" alt="'+esc(it.pic.cap)+'"><p class="cap">'+esc(it.pic.cap)+'</p>'}
    else{var q=it.q;zbox.className='cb-zbox wide'+(it.pic?' has-pic':'');zbox.innerHTML='<button type="button" class="cbz-x" aria-label="Đóng">✕</button><i class="pin"></i>'+
      '<div class="cbz-l"><div class="cbz-meta"><span>Trích dẫn '+esc(q.no)+'</span>'+(q.when?'<span>Thời điểm nói, viết: '+esc(q.when)+'</span>':'')+'</div>'+
      (q.title?'<h3>'+esc(q.title)+'</h3>':'')+(q.ctx?'<p class="ctx">'+esc(q.ctx)+'</p>':'')+
      (it.pic?'<figure class="cbz-pic"><img src="'+esc(it.pic.src)+'" alt="'+esc(it.pic.cap)+'"><figcaption>'+esc(it.pic.cap)+'</figcaption></figure>':'')+
      '<div class="who">— '+esc(q.who)+'</div>'+(q.src?'<p class="src">'+esc(q.src)+'</p>':'')+'</div>'+
      '<div class="cbz-r"><span class="cbz-mark" aria-hidden="true">“</span><blockquote>'+q.quote+'</blockquote></div>'}
    zbox.insertAdjacentHTML('afterbegin','<div class="cbz-tools" role="toolbar" aria-label="Phóng to, thu nhỏ"><button type="button" class="zm-o" aria-label="Thu nhỏ">−</button><button type="button" class="zm-r" aria-label="Về cỡ ban đầu">100%</button><button type="button" class="zm-i" aria-label="Phóng to">+</button></div>');
    base={};zoom.hidden=false;fitZoom();zf=1;setZf(1);
    zbox.querySelector('.zm-i').onclick=function(){setZf(zf+.15)};zbox.querySelector('.zm-o').onclick=function(){setZf(zf-.15)};zbox.querySelector('.zm-r').onclick=function(){setZf(1)};

    var r=el.getBoundingClientRect(),z=zbox.getBoundingClientRect();
    if(!reduce){
      var sx=r.width/z.width,dx=(r.left+r.width/2)-(z.left+z.width/2),dy=(r.top+r.height/2)-(z.top+z.height/2);
      zbox.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+sx+') rotate('+(byId[id].rot)+'deg)',opacity:.6},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
      zoom.animate([{opacity:0},{opacity:1}],{duration:300});
    }
    el.classList.add('picked');
    $('.cbz-x',zbox).onclick=close;$('.cbz-x',zbox).focus({preventScroll:true});
  }
  function fitZoom(){var bq=zbox.querySelector('.cbz-r blockquote');if(!bq)return;var fs=window.innerWidth<700?19:30;bq.style.fontSize=fs+'px';
    var lim=0;while(zbox.scrollHeight>zbox.clientHeight+1&&fs>(window.innerWidth<700?18:15)&&lim<40){fs-=1;bq.style.fontSize=fs+'px';lim++}}
  window.addEventListener('resize',function(){if(!zoom.hidden){fitZoom();setZf(zf)}});
  /* phóng to, thu nhỏ trong khung đang mở */
  var zf=1,base={};
  function setZf(v){zf=Math.max(.6,Math.min(2.5,Math.round(v*100)/100));
    var bq=zbox.querySelector('blockquote'),h3=zbox.querySelector('h3'),ctx=zbox.querySelector('.ctx'),img=zbox.querySelector('.cb-zbox.photo > img');
    if(bq){if(zf===1||!base.bq)base.bq=parseFloat(bq.style.fontSize)||parseFloat(getComputedStyle(bq).fontSize);bq.style.fontSize=(base.bq*zf)+'px'}
    if(h3){base.h3=base.h3||parseFloat(getComputedStyle(h3).fontSize);h3.style.fontSize=(base.h3*Math.sqrt(zf))+'px'}
    if(ctx){base.ctx=base.ctx||parseFloat(getComputedStyle(ctx).fontSize);ctx.style.fontSize=(base.ctx*Math.sqrt(zf))+'px'}
    if(img){img.style.width=zf===1?'':(Math.min(860,innerWidth-70)*zf)+'px';img.style.maxHeight=zf===1?'':'none';zbox.style.overflow=zf>1?'auto':''}
    var r=zbox.querySelector('.zm-r');if(r)r.textContent=Math.round(zf*100)+'%';
    zbox.classList.toggle('zoomed',zf>1);
  }
  zbox.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setZf(zf*(e.deltaY<0?1.1:1/1.1))},{passive:false});
  document.addEventListener('keydown',function(e){if(zoom.hidden)return;if(e.key==='+'||e.key==='=')setZf(zf+.15);if(e.key==='-')setZf(zf-.15);if(e.key==='0')setZf(1)});
  function close(){if(zoom.hidden)return;zoom.hidden=true;if(src){src.classList.remove('picked');src.focus({preventScroll:true})}}
  zoom.addEventListener('click',function(e){if(e.target===zoom)close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  var fs=$('.cb-fs',root);
  fs.onclick=function(){if(root.requestFullscreen&&!document.fullscreenElement){root.requestFullscreen()}else if(document.fullscreenElement){document.exitFullscreen()}else{root.classList.toggle('full');fs.textContent=root.classList.contains('full')?'✕ Thoát toàn màn hình':'⤢ Toàn màn hình';fit()}};
  document.addEventListener('fullscreenchange',function(){root.classList.toggle('full',document.fullscreenElement===root);fs.textContent=document.fullscreenElement===root?'✕ Thoát toàn màn hình':'⤢ Toàn màn hình';uz=1;setTimeout(fit,60)});
  window.addEventListener('resize',fit);build();fit();
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){fit();root.classList.add('live');io.disconnect()}},{threshold:.1});io.observe(root);
});
})();

