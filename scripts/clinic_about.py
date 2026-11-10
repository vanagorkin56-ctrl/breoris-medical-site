"""Approved journal layout, with a compact and fully readable mobile card."""
from editorial_accents import attrs, marked


def copy_block(tag, css_class, uk, en, uk_terms=(), en_terms=(), shine=False):
    focus = attrs(uk, en, list(uk_terms), list(en_terms), shine)
    return f'<{tag} class="{css_class}" {focus}>{marked(uk, uk_terms)}</{tag}>'


def render():
    title = copy_block('h2', 'clinic-about-title', 'Медичний центр у Дніпрі',
                       'Medical centre in Dnipro', ['у Дніпрі'], ['in Dnipro'], True)
    lead = copy_block('p', 'clinic-about-lead',
                      'Breoris Medical — багатопрофільний медичний центр у Дніпрі.',
                      'Breoris Medical is a multidisciplinary medical centre in Dnipro.')
    services = copy_block('p', 'clinic-about-services',
                          'Консультації лікарів, УЗД, функціональна та лабораторна діагностика.',
                          'Doctor consultations, ultrasound, functional diagnostics and laboratory tests.',
                          ['Консультації лікарів', 'УЗД'], ['Doctor consultations', 'ultrasound'])
    specialties = copy_block('p', 'clinic-about-specialties',
                             'Неврологія, жіноче та чоловіче здоров’я, профілактика й відновлення. Допоможемо обрати спеціаліста та спланувати візит.',
                             'Neurology, women’s and men’s health, prevention and rehabilitation. We help you choose a specialist and plan your visit.',
                             ['Неврологія', 'жіноче та чоловіче здоров’я'], ['Neurology', 'women’s and men’s health'])
    return f'''<!-- home-about:start --><section class="home-clinic section" id="pro-nas" aria-labelledby="clinic-about-title"><div class="clinic-about-inner"><div class="clinic-about-heading"><p class="direction-eyebrow">Про клініку</p>{title.replace('class="clinic-about-title"', 'class="clinic-about-title" id="clinic-about-title"')}</div><div class="clinic-about-layout"><figure class="clinic-about-photo"><img src="assets/campaigns/reception.jpg" alt="Фото клініки Breoris Medical" width="960" height="1280" loading="lazy"></figure><div class="clinic-about-copy">{lead}<div class="clinic-about-body">{services}{specialties}</div><a class="text-link" href="#poslugi">Переглянути послуги <span aria-hidden="true">↗</span></a></div></div></div></section><!-- home-about:end -->'''
