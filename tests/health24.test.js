'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { configuration, createClient } = require('../server/health24');
const env = { HEALTH24_API_BASE_URL: 'https://dev-ehr.h24.ua', HEALTH24_CLIENT_ID: 'example-id', HEALTH24_CLIENT_SECRET: 'example-secret', HEALTH24_LEGAL_ENTITY_ID: '17027' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
test('missing configuration never authorizes; only exact test host accepted', () => {
  assert.equal(configuration({}).missing.length, 4);
  for (const url of ['https://ehr.h24.ua','https://dev-ehr.h24.ua.evil.example','https://example.com','http://dev-ehr.h24.ua','https://user@dev-ehr.h24.ua','https://dev-ehr.h24.ua/path']) {
    assert.throws(() => configuration({ ...env, HEALTH24_API_BASE_URL: url }));
  }
});
test('documented OAuth payload, server bearer, clinic filter and single shared authorization', async () => {
  const requests = [];
  const client = createClient(configuration(env), async (url, options) => {
    requests.push({ url, options });
    assert.equal(options.redirect, 'error');
    if (url.endsWith('/oauth/token')) {
      assert.deepEqual(JSON.parse(options.body), {client_id:'example-id',client_secret:'example-secret',grant_type:'client_credentials',scope:'portal'});
      return json({ access_token:'server-token',token_type:'Bearer',expires_in:3600 });
    }
    assert.equal(url, 'https://dev-ehr.h24.ua/api/v4/employees?legal_entity_id=17027');
    assert.equal(options.headers.Authorization, 'Bearer server-token');
    return json([{id:3,fired:false,name:'Public physician'}]);
  });
  await Promise.all([client.employees(),client.employees()]);
  await client.employees();
  assert.equal(requests.filter(r=>r.url.endsWith('/oauth/token')).length,1);
});
test('Cloudflare HTML and rejected credentials fail without returning raw upstream data', async () => {
  for (const response of [new Response('<html>example-secret</html>',{status:403}),new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}}),json({access_token:'private'},401)]) {
    const client=createClient(configuration(env),async()=>response);
    await assert.rejects(client.employees(),error=>!error.message.includes('example-secret')&&!error.message.includes('private'));
  }
});
test('Vercel diagnostic returns no credential, token, staff name or raw upstream error', async () => {
  Object.assign(process.env,env);
  const original=global.fetch;
  global.fetch=async url=>url.endsWith('/oauth/token')?json({access_token:'private-token',token_type:'Bearer',expires_in:3600}):json([{id:3,fired:false,name:'Do not expose this name',party_id:99}]);
  try {
    const handler=require('../api/health24/status');
    let body,code;
    const res={setHeader(){},status(value){code=value;return this},json(value){body=value;return this}};
    await handler({method:'GET'},res);
    assert.equal(code,200);assert.equal(body.connected,true);assert.equal(body.employeeCount,1);
    const output=JSON.stringify(body);
    for(const privateValue of ['private-token','example-secret','example-id','Do not expose','party_id'])assert.ok(!output.includes(privateValue));
    await handler({method:'POST'},res);assert.equal(code,405);
  } finally {global.fetch=original;for(const key of Object.keys(env))delete process.env[key];}
});

test('support details identify failing request but never expose arbitrary upstream content', async () => {
  const client=createClient(configuration(env),async()=>new Response(JSON.stringify({error:'example-secret',message:'private-token'}),{status:403,headers:{'Content-Type':'application/json','server':'cloudflare','cf-ray':'abcdef0123456789-FRA'}}));
  await assert.rejects(client.employees(),error=>{
    assert.equal(error.diagnostic.path,'/oauth/token');
    assert.equal(error.diagnostic.method,'POST');
    assert.equal(error.diagnostic.cloudflareRayId,'abcdef0123456789-FRA');
    assert.equal(error.diagnostic.responseKind,'json');
    assert.ok(!JSON.stringify(error.diagnostic).includes('example-secret'));
    assert.ok(!JSON.stringify(error.diagnostic).includes('private-token'));
    return true;
  });
});

test('test clinic discovery omits contacts; employee lookup uses only a valid selected ID', async () => {
  const paths=[];
  const client=createClient({base:'https://dev-ehr.h24.ua',clientId:'example-id',secret:'example-secret'},async url=>{
    paths.push(url);
    if(url.endsWith('/oauth/token'))return json({access_token:'token',token_type:'Bearer',expires_in:3600});
    if(url.endsWith('/legal_entities'))return json([{id:12345,name:'Test clinic',phones:['private-contact']}]);
    assert.equal(url,'https://dev-ehr.h24.ua/api/v4/employees?legal_entity_id=12345');
    return json([]);
  });
  assert.deepEqual(await client.legalEntities(),[{id:12345,name:'Test clinic'}]);
  await client.employees('12345');
  const count=paths.length;
  await assert.rejects(client.employees('12345&legal_entity_id=17027'));
  assert.equal(paths.length,count);
  assert.equal(paths.filter(url=>url.endsWith('/oauth/token')).length,1);
});

test('schedule reads use the documented path and reject invalid IDs or date ranges before sending', async () => {
  const requests=[];
  const client=createClient(configuration(env), async (url, options)=>{
    requests.push(url);
    if(url.endsWith('/oauth/token'))return json({access_token:'server-token',token_type:'Bearer',expires_in:3600});
    assert.equal(options.headers.Authorization,'Bearer server-token');
    assert.equal(url,'https://dev-ehr.h24.ua/api/v4/employees/123/schedule?period_start=2026-10-16&period_end=2026-10-29');
    return json({'2026-10-16':['09:00-09:30']});
  });
  for(const args of [['123/../../visits','2026-10-16','2026-10-29'],[123,'2026-02-30','2026-03-01'],[123,'2026-10-29','2026-10-16'],[123,'2026-10-16','2026-12-16']])await assert.rejects(client.schedule(...args));
  assert.equal(requests.length,0);
  assert.deepEqual(await client.schedule(123,'2026-10-16','2026-10-29'),{'2026-10-16':['09:00-09:30']});
});

test('local schedule report keeps time examples and never exports arbitrary slot content or employee details', async () => {
  const {scheduleReport}=require('../scripts/health24-schedule-report');
  const client={async schedule(id,start,end){assert.equal(id,123);assert.equal(start,'2026-10-16');assert.equal(end,'2026-10-29');return {'2026-10-16':['09:00-09:30','private-token-secret','0671234567'],'2026-10-17':[]}}};
  const report=await scheduleReport(client,'22356',[{id:123,fired:false,name:'Not exported',party_id:555},{id:124,fired:true}],new Date('2026-10-15T22:30:00Z'));
  assert.equal(report.activeEmployeeCount,1);
  assert.equal(report.employees[0].slotCount,3);
  assert.deepEqual(report.employees[0].samples[0].slots[0],{kind:'time_string',value:'09:00-09:30'});
  for(const value of ['private-token-secret','Not exported','party_id','0671234567'])assert.ok(!JSON.stringify(report).includes(value));
});

test('unexpected schedule fields and entries are rejected without serializing response contents', async () => {
  for(const body of [{access_token:'private'}, {'2026-10-16':[{patient:'private'}]}, {'2026-10-15':['09:00']}, []]){
    const client=createClient(configuration(env),async url=>url.endsWith('/oauth/token')?json({access_token:'token',token_type:'Bearer',expires_in:3600}):json(body));
    await assert.rejects(client.schedule(123,'2026-10-16','2026-10-29'),error=>error.code==='unexpected_schedule_response'&&!error.message.includes('private'));
  }
});
