#!/usr/bin/env node
'use strict';
const readline = require('node:readline');
const { Writable } = require('node:stream');
const { createClient } = require('../server/health24');

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Запустіть файл у Terminal, щоб безпечно ввести доступи.');
  console.log('Health24 — локальна перевірка тестового доступу\n');
  console.log('Запити підуть із цього комп’ютера. Запис пацієнтів не створюється.');
  console.log('Доступи вводяться приховано і не зберігаються у файлах або історії команд.\n');
  let muted = true;
  const output = new Writable({ write(chunk, encoding, done) { if (!muted) process.stdout.write(chunk, encoding); done(); } });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true, historySize: 0 });
  const ask = label => new Promise(resolve => {
    process.stdout.write(label);
    rl.question('', value => { process.stdout.write('\n'); resolve(value.trim()); });
  });
  rl.on('SIGINT', () => { rl.close(); process.stdout.write('\nПеревірку скасовано.\n'); process.exit(130); });
  let entity;
  try {
    entity = await ask('legal_entity_id тестового профілю (якщо невідомий — просто Enter): ');
    if (entity && (!/^[1-9]\d*$/.test(entity) || !Number.isSafeInteger(Number(entity)))) {
      console.error('Потрібен числовий ID або порожнє поле для пошуку.');
      process.exitCode = 1;
      return;
    }
    const clientId = await ask('Вставте client_id і натисніть Enter: ');
    const secret = await ask('Вставте client_secret і натисніть Enter: ');
    if (!clientId || !secret) throw new Error('Обидва значення обов’язкові.');
    const client = createClient({ base: 'https://dev-ehr.h24.ua', clientId, secret });
    if (!entity) {
      console.log('\nОтримую список тестових організацій…');
      const clinics = (await client.legalEntities()).filter(row => Number.isSafeInteger(row.id) && row.id > 0);
      if (!clinics.length) {
        console.log('Доступних організацій не знайдено. Уточніть доступ до тестового профілю у Health24.');
        process.exitCode = 1;
        return;
      }
      console.log('Авторизація успішна. Організації з відповіді API (до 30):');
      for (const row of clinics.slice(0, 30)) console.log(row.id + ' — ' + String(row.name || '').replace(/[\x00-\x1f\x7f-\x9f]/g, '').slice(0, 150));
      if (clinics.length > 30) console.log('Знайдено більше 30 організацій. Уточніть ID саме вашого тестового профілю у Health24.');
      entity = await ask('Введіть ID вашої тестової організації зі списку (або Enter, щоб завершити): ');
      if (!entity) return;
      if (!/^[1-9]\d*$/.test(entity) || !clinics.some(row => String(row.id) === entity)) {
        console.error('ID відсутній у відповіді API. Перевірку зупинено.');
        process.exitCode = 1;
        return;
      }
    }
    console.log('\nПеревіряю список працівників тестового профілю ' + entity + '…');
    const employees = await client.employees(entity);
    console.log('\nУСПІХ: авторизація та доступ до списку працівників підтверджені.');
    console.log('legal_entity_id: ' + entity);
    console.log('Активних працівників: ' + employees.filter(e => e.fired === false).length);
    console.log('Це підтверджує локальний доступ. Онлайн-запис на сайті ще не увімкнено.');
  } catch (error) {
    if (error.diagnostic?.path === '/api/v4/employees') console.log('\nАвторизація успішна. Помилка на етапі отримання працівників.');
    console.log('\nДоступ до клініки не підтверджено. Дані для підтримки:');
    console.log(JSON.stringify({ connected: false, environment: 'test', source: 'local_computer', code: error.code || 'connection_failed', ...(error.upstreamStatus ? { upstreamStatus: error.upstreamStatus } : {}), ...(error.diagnostic ? { diagnostic: error.diagnostic } : {}) }, null, 2));
    process.exitCode = 1;
  } finally { rl.close(); }
}
main().catch(() => { console.error('Не вдалося виконати перевірку. Перевірте запуск у Terminal та введення обох доступів.'); process.exitCode = 1; });
