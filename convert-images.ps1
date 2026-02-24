node -e "const sharp=require('sharp');const fs=require('fs');const path=require('path');const dir='./images';fs.readdirSync(dir).filter(f=>f.endsWith('.jpg')).forEach(f=>{const fp=path.join(dir,f);sharp(fp).resize({width:1600,withoutEnlargement:true}).jpeg({quality:80}).toFile(fp+'.tmp').then(()=>{fs.renameSync(fp+'.tmp',fp);console.log('Done: '+f);});});"
Write-Host "All images converted and resized successfully!" -ForegroundColor Green
pause
