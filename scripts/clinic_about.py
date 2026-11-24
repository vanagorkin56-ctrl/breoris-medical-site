"""Approved journal layout, with a compact and fully readable mobile card."""
from editorial_accents import attrs, marked


def copy_block(tag, css_class, uk, en, uk_terms=(), en_terms=(), shine=False):
    focus = attrs(uk, en, list(uk_terms), list(en_terms), shine)
    return f'<{tag} class="{css_class}" {focus}>{marked(uk, uk_terms)}</{tag}>'


def render():
    title = copy_block('h2', 'clinic-about-title', 'Медичний центр у Дніпрі',
                       'Medical centre in Dnipro', ['у Дніпрі'], ['in Dnipro'], True)
    lead = copy_block('p', 'clinic-about-lead',
                      'Breoris Medical — медицина, в центрі якої людина.',
                      'Breoris Medical — medicine with people at its heart.')
    paragraphs = [
        ('Ми створили сучасний медичний простір у самому серці Дніпра, де професіоналізм лікарів поєднується з турботою, комфортом та щирою увагою до кожного пацієнта.',
         'We have created a modern medical space in the heart of Dnipro, where medical expertise meets care, comfort and personal attention for every patient.'),
        ('Наш підхід — бачити не лише окремі симптоми, а людину в цілому. Ми об’єднуємо досвід лікарів різних спеціальностей, сучасну діагностику та комплексний підхід до вирішення проблем зі здоров’ям.',
         'Our approach is to see the whole person, beyond individual symptoms. We bring together doctors from different specialties, modern diagnostics and a comprehensive approach to health concerns.'),
        ('Наші ключові напрями: сучасна неврологія та реабілітація, жіноче й чоловіче здоров’я, кардіологія, ендокринологія, гастроентерологія, УЗД, лабораторна діагностика та профілактичні програми.',
         'Our key areas: modern neurology and rehabilitation, women’s and men’s health, cardiology, endocrinology, gastroenterology, ultrasound, laboratory diagnostics and preventive programmes.'),
        ('Ми приділяємо увагу кожній деталі — від першого знайомства до діагностики, лікування та відновлення.',
         'We pay attention to every detail — from your first visit through diagnosis, treatment and recovery.'),
        ('Breoris Medical — простір, де ваше здоров’я отримує увагу, на яку заслуговує.',
         'Breoris Medical — a space where your health receives the attention it deserves.')
    ]
    services = ''.join(copy_block('p', 'clinic-about-paragraph', uk, en) for uk, en in paragraphs)
    specialties = ''
    return f'''<!-- home-about:start --><section class="home-clinic section" id="pro-nas" aria-labelledby="clinic-about-title"><div class="clinic-about-inner"><div class="clinic-about-heading"><p class="direction-eyebrow">Про клініку</p>{title.replace('class="clinic-about-title"', 'class="clinic-about-title" id="clinic-about-title"')}</div><div class="clinic-about-layout"><figure class="clinic-about-photo"><img src="assets/campaigns/reception.jpg" alt="Фото клініки Breoris Medical" width="960" height="1280" loading="lazy"></figure><div class="clinic-about-copy">{lead}<div class="clinic-about-body">{services}{specialties}</div><a class="text-link" href="#poslugi">Переглянути послуги <span aria-hidden="true">↗</span></a></div></div></div></section><!-- home-about:end -->'''
