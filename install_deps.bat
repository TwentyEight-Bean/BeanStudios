@echo off
echo === Starting npm install ===
call npm install prisma --save-dev
echo === Prisma installed ===
call npm install @prisma/client bcryptjs cloudinary next-cloudinary
echo === Core deps installed ===
call npm install @types/bcryptjs --save-dev
echo === Types installed ===
echo === ALL DONE ===
