import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

function numberToThaiWords(num) {
  if (num === 0) return 'ศูนย์';
  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const places = ['', 'สิบ', 'ร้อย', 'พัน'];

  if (num === 1) return 'หนึ่ง';
  if (num === 2) return 'สอง';
  if (num === 3) return 'สาม';
  if (num === 4) return 'สี่';
  if (num === 5) return 'ห้า';
  if (num === 6) return 'หก';
  if (num === 7) return 'เจ็ด';
  if (num === 8) return 'แปด';
  if (num === 9) return 'เก้า';
  if (num === 10) return 'สิบ';

  const numStr = Math.floor(num).toString();
  const len = numStr.length;
  let result = '';

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i], 10);
    const pos = len - i - 1;

    if (digit === 0) continue;

    if (pos === 0) {
      if (digit === 1 && len > 1) {
        result += 'เอ็ด';
      } else {
        result += units[digit];
      }
    } else if (pos === 1) {
      if (digit === 1) {
        result += 'สิบ';
      } else if (digit === 2) {
        result += 'ยี่สิบ';
      } else {
        result += units[digit] + 'สิบ';
      }
    } else {
      result += units[digit] + places[pos % 4];
    }
  }

  return result;
}

async function synthesizeText(text, outputPath) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    return;
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata('th-TH-PremwadeeNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text, { pitch: '+5Hz', rate: '-2%' });
  const writeStream = fs.createWriteStream(outputPath);
  audioStream.pipe(writeStream);

  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      tts.close();
      resolve();
    });
    writeStream.on('error', (err) => {
      tts.close();
      reject(err);
    });
    audioStream.on('error', (err) => {
      tts.close();
      reject(err);
    });
  });
}

async function main() {
  const dir = path.join(process.cwd(), 'public', 'sounds');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Generating Sweet Female Thai Voice Bank (th-TH-PremwadeeNeural)...');

  // 1. Numbers 0 to 147
  console.log('1. Numbers 0 to 147...');
  for (let i = 0; i <= 147; i++) {
    const text = numberToThaiWords(i);
    const outFile = path.join(dir, `num_${i}.mp3`);
    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await synthesizeText(text, outFile);
        success = true;
        break;
      } catch {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (success) {
      process.stdout.write(`\r[${i}/147] num_${i}.mp3 (${text})`);
    }
  }
  console.log('\nNumbers complete.');

  // 2. Special Phrases
  console.log('2. Special phrases...');
  const phrases = [
    { name: 'p1_win.mp3', text: 'ผู้เล่นหนึ่งชนะ' },
    { name: 'p2_win.mp3', text: 'ผู้เล่นสองชนะ' },
    { name: 'tie.mp3', text: 'แต้มเสมอกัน' },
    { name: 'p1_match_win.mp3', text: 'ผู้เล่นหนึ่งชนะการแข่งขัน' },
    { name: 'p2_match_win.mp3', text: 'ผู้เล่นสองชนะการแข่งขัน' },
    { name: 'foul_4.mp3', text: 'ฟาวล์ สี่ แต้ม' },
    { name: 'foul_5.mp3', text: 'ฟาวล์ ห้า แต้ม' },
    { name: 'foul_6.mp3', text: 'ฟาวล์ หก แต้ม' },
    { name: 'foul_7.mp3', text: 'ฟาวล์ เจ็ด แต้ม' },
  ];

  for (const p of phrases) {
    const outFile = path.join(dir, p.name);
    await synthesizeText(p.text, outFile);
    console.log(`Generated ${p.name}: "${p.text}"`);
  }

  // 3. Deficit Phrases (1 to 60)
  console.log('3. Deficit phrases (1 to 60)...');
  for (let i = 1; i <= 60; i++) {
    const thaiWords = numberToThaiWords(i);
    const text = `แต้มขาดแล้ว ขาด ${thaiWords} แต้ม`;
    const outFile = path.join(dir, `deficit_${i}.mp3`);
    await synthesizeText(text, outFile);
  }
  console.log('Deficit phrases complete.');
  console.log('All sweet female voice clips generated successfully in public/sounds/!');
}

main().catch(console.error);
