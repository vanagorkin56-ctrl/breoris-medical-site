"""Approved November campaign photography and selectable bilingual poster text."""
import html
from editorial_accents import attrs, marked

E = lambda value: html.escape(str(value), quote=True)
ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg>'

def render_photo(row, index, translations):
    campaign = row['campaign']
    uk, en = campaign['uk'], campaign['en']
    translations.update({value: en[key] for key, value in uk.items() if isinstance(value, str)})
    translations['Дізнатися більше: ' + uk['question']] = 'Learn more: ' + en['question'] + ' (Ukrainian article)'
    focus = attrs(uk['question'], en['question'], uk['accent'], en['accent'])
    if campaign['theme'] == 'screening':
        question = '<strong class="campaign-question campaign-screening"><span class="campaign-screening-word">Скринінг</span><span class="campaign-age" translate="no">40<span>+</span></span></strong>'
        translations['Скринінг'] = 'Screening'
    else:
        question = f'<strong class="campaign-question" {focus}>{marked(uk["question"], uk["accent"])}</strong>'
    return f'''<figure class="direction-photo"><img src="{campaign['image']}" alt="{E(uk['alt'])}" width="1024" height="1536" {'fetchpriority="high"' if index == 0 else ''}><figcaption>{question}<span class="campaign-caption">{E(uk['caption'])}</span></figcaption><a class="campaign-article" href="ua/blog/{campaign['article']}/" aria-label="{E('Дізнатися більше: ' + uk['question'])}"><span aria-hidden="true">{ARROW}</span></a></figure>'''
