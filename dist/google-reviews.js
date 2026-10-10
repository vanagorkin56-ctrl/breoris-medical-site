(() => {
  'use strict';
  const config=window.BreorisGoogleReviews;
  const section=document.querySelector('#vidhuky');
  if(!section||!config?.apiKey||!config?.placeId)return;
  let started=false;
  const lang=()=>window.BreorisLocale?.language||'uk';
  const localized=(uk,ru,en)=>({uk,ru,en})[lang()]||uk;
  const safeURL=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:''}catch{return ''}};
  const add=(tag,className,text,parent)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);parent.append(el);return el};
  async function renderReviews(){
    try{
      const {Place}=await google.maps.importLibrary('places');
      const place=new Place({id:config.placeId});
      await place.fetchFields({fields:['displayName','rating','userRatingCount','reviews','googleMapsURI']});
      if(!/breoris|бреоріс|бреорис/i.test(place.displayName||''))throw new Error('Place ID is not Breoris Medical');
      const reviews=(place.reviews||[]).filter(review=>review.text&&review.authorAttribution?.displayName);
      if(!reviews.length)return;
      const rating=document.querySelector('#reviews-rating');
      const grid=document.querySelector('#reviews-grid');
      const attributions=document.querySelector('#reviews-attributions');
      rating.replaceChildren();grid.replaceChildren();attributions.replaceChildren();
      if(Number.isFinite(place.rating)){
        add('strong','',place.rating.toLocaleString('uk-UA',{minimumFractionDigits:1,maximumFractionDigits:1}),rating);
        const stars=add('span','stars','★★★★★',rating);
        stars.setAttribute('aria-label',`${place.rating} ${localized('із 5','из 5','out of 5')}`);
        if(place.userRatingCount)add('span','',`${place.userRatingCount} ${localized('оцінок','оценок','ratings')}`,rating);
      }
      for(const review of reviews){
        const card=add('article','review-card',undefined,grid);
        const stars=add('span','stars','★'.repeat(Math.min(5,Math.max(0,Math.round(review.rating||0)))),card);
        stars.setAttribute('aria-label',`${review.rating} ${localized('із 5','из 5','out of 5')}`);
        add('p','',review.text,card);
        const author=review.authorAttribution;
        const uri=safeURL(author.uri)||safeURL(place.googleMapsURI);
        if(uri){const link=add('a','',author.displayName,card);link.href=uri;link.target='_blank';link.rel='noopener noreferrer'}
        else add('span','review-author',author.displayName,card);
      }
      for(const source of place.attributions||[])add('span','',source,attributions);
      document.querySelector('#reviews-live').hidden=false;
      document.querySelector('#reviews-fallback').hidden=true;
    }catch(error){console.warn('Breoris Google reviews unavailable:',error)}
  }
  window.BreorisReviewsInit=renderReviews;
  const load=()=>{
    if(started)return;started=true;
    const script=document.createElement('script');
    script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.apiKey)}&v=weekly&loading=async&callback=BreorisReviewsInit`;
    script.async=true;script.onerror=()=>console.warn('Breoris Google reviews script unavailable');
    document.head.append(script);
  };
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){observer.disconnect();load()}},{rootMargin:'350px'});observer.observe(section)}
  else load();
})();
