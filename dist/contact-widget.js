(() => {
 const widget=document.querySelector('.contact-widget');
 if(!widget)return;
 const toggle=widget.querySelector('.contact-toggle'),panel=widget.querySelector('.contact-panel');
 function setOpen(open,restore=false){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));widget.classList.toggle('is-open',open);if(open)panel.querySelector('a').focus();else if(restore)toggle.focus()}
 toggle.addEventListener('click',()=>setOpen(panel.hidden));
 widget.querySelector('.contact-close').addEventListener('click',()=>setOpen(false,true));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){setOpen(false,true);e.stopPropagation()}});
 document.addEventListener('click',e=>{if(!widget.contains(e.target))setOpen(false)});
 widget.querySelector('[data-book]').addEventListener('click',()=>setOpen(false));
 document.addEventListener('focusin',e=>{if(!widget.contains(e.target))setOpen(false)});
})();
