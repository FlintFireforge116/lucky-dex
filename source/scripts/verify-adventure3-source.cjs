const fs=require('fs'),path=require('path'),vm=require('vm'),root=path.resolve(__dirname,'..');let count=0;
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory())visit(f);else if(/\.(?:js|cjs)$/.test(entry.name)){new vm.Script(fs.readFileSync(f,'utf8'),{filename:path.relative(root,f)});count++}}}
for(const dir of ['app/src/main/assets','scripts','tests'])visit(path.join(root,dir));console.log('PASS '+count+' JavaScript sources parse without evaluation');
