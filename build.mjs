import fs from 'node:fs';
import path from 'node:path';
import './generate.mjs';
fs.mkdirSync('dist/server',{recursive:true});fs.copyFileSync('worker.mjs','dist/server/index.js');
const config={name:'tt-contabilidade',main:'index.js',compatibility_date:'2026-09-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true},d1_databases:[{binding:'DB',database_name:'tt-contabilidade',database_id:'00000000-0000-4000-8000-000000000000'}],r2_buckets:[{binding:'BUCKET',bucket_name:'tt-documentos'}]};
fs.writeFileSync('dist/server/wrangler.json',JSON.stringify(config,null,2));fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Worker, assets and hosting metadata prepared.');
