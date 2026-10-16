#!/usr/bin/env node
'use strict';
const readline = require('node:readline');
const { Writable } = require('node:stream');
const { configuration, createClient } = require('../server/health24');

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
  let clientId, secret, entity;
  try {
    entity = await ask('Вставте legal_entity_id тестового профілю від Health24 і натисніть Enter: ');
    if (!/^[1-9]\d*$/.test(entity) || !Number.isSafeInteger(Number(entity))) {
      console.error('Потрібен числовий ID тестового профілю. Отримайте його у Health24.');
      process.exitCode = 1;
      return;
    }
    clientId = await ask('Вставте client_id і натисніть Enter: ');
    secret = await ask('Вставте client_secret і натисніть Enter: ');
  }
  finally { rl.close(); }
  if (!clientId || !secret) throw new Error('Обидва значення обов’язкові.');
  const config = configuration({ HEALTH24_API_BASE_URL: 'https://dev-ehr.h24.ua', HEALTH24_LEGAL_ENTITY_ID: entity, HEALTH24_CLIENT_ID: clientId, HEALTH24_CLIENT_SECRET: secret });
  console.log('\nПеревіряю авторизацію та список працівників тестового профілю ' + entity + '…');
  try {
    const employees = await createClient(config).employees();
    console.log('\nУСПІХ: авторизація та доступ до списку працівників підтверджені.');
    console.log('Активних працівників: ' + employees.filter(e => e.fired === false).length);
    console.log('Це підтверджує локальний доступ. Онлайн-запис на сайті ще не увімкнено.');
  } catch (error) {
    if (error.diagnostic?.path === '/api/v4/employees') console.log('\nАвторизація успішна. Помилка на етапі отримання працівників.');
    console.log('\nДоступ до клініки не підтверджено. Дані для підтримки:');
    console.log(JSON.stringify({ connected: false, environment: 'test', source: 'local_computer', code: error.code || 'connection_failed', ...(error.upstreamStatus ? { upstreamStatus: error.upstreamStatus } : {}), ...(error.diagnostic ? { diagnostic: error.diagnostic } : {}) }, null, 2));
    process.exitCode = 1;
  }
}
main().catch(() => { console.error('Не вдалося виконати перевірку. Перевірте запуск у Terminal та введення обох доступів.'); process.exitCode = 1; });
