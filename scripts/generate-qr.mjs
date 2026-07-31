import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
const base = process.env.SITE_URL || "http://localhost:5173";
await mkdir("public/qr",{recursive:true});
for(let i=1;i<=7;i++) await QRCode.toFile(`public/qr/postaja-${i}.svg`,`${base}/postaja/${i}`,{type:"svg",errorCorrectionLevel:"H",margin:2,color:{dark:"#071c2c",light:"#ffffff"}});
await QRCode.toFile("public/qr/zacetek.svg",`${base}/prijava`,{type:"svg",errorCorrectionLevel:"H",margin:2});
console.log(`QR-kode ustvarjene za ${base}`);
