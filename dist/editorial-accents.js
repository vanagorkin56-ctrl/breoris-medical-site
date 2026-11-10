/* Keep highlighted copy intact when the visitor switches UA/EN. */
(() => {
 const blocks=[...document.querySelectorAll('[data-focus-uk]')];
 function render(){
  const lang=document.documentElement.lang==='en'?'en':'uk';
  blocks.forEach(block=>{
   const text=block.getAttribute('data-focus-'+lang)||'';
   const terms=JSON.parse(block.getAttribute('data-focus-terms-'+lang)||'[]').filter(Boolean).sort((a,b)=>b.length-a.length);
   const fragment=document.createDocumentFragment();let cursor=0;
   while(cursor<text.length){
    let found=null,at=text.length;
    for(const term of terms){const i=text.indexOf(term,cursor);if(i!==-1&&i<at){at=i;found=term}}
    if(!found){fragment.append(document.createTextNode(text.slice(cursor)));break}
    fragment.append(document.createTextNode(text.slice(cursor,at)));
    const mark=document.createElement('span');mark.className='text-focus';mark.textContent=found;fragment.append(mark);cursor=at+found.length;
   }
   block.replaceChildren(fragment);
  });
 }
 render();new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
