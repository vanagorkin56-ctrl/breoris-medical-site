"""Selective emphasis for approved copy; UA/EN text remains a single locale unit."""
import html,json,re
E=lambda value:html.escape(str(value),quote=True)

def marked(text,terms):
 if not terms:return E(text)
 pattern='('+ '|'.join(re.escape(t) for t in sorted(terms,key=len,reverse=True))+')'
 return ''.join('<span class="text-focus">'+E(part)+'</span>' if part in terms else E(part) for part in re.split(pattern,text) if part)

def attrs(uk,en,uk_terms,en_terms,shine=False):
 values={'data-focus-uk':uk,'data-focus-en':en,'data-focus-terms-uk':json.dumps(uk_terms,ensure_ascii=False),'data-focus-terms-en':json.dumps(en_terms,ensure_ascii=False)}
 if shine:values['data-focus-shine']='true'
 return ' '.join(k+'="'+E(v)+'"' for k,v in values.items())

HERO_TERMS={
 'neurology-center':(['сучасної неврології'],['modern neurology']),
 'women-men-health':(['жінки та чоловіка'],['Women’s and men’s']),
 'public-health-programmes':(['НСЗУ'],['NHSU']),
 'ekopfo-preparation':(['ЕКОПФО'],['EKOPFO'])
}
