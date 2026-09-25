# Walkthrough: Fix 0-Byte Audio Clips & Delay on Balls 2, 4, 6 (v3.13.1)

## สาเหตุของปัญหา (Root Cause)
- จากการตรวจสอบไฟล์เสียงในโฟลเดอร์ `public/sounds/` พบว่ามีไฟล์บางส่วนรวมถึง `num_2.mp3`, `num_4.mp3`, `num_6.mp3` ถูกสร้างเป็น **0 Bytes** จาก Network Timeout ในขั้นตอน Generate ครั้งก่อน
- เมื่อกดปุ่มเบอร์ 2, 4, 6 เบราว์เซอร์โหลดไฟล์ 0 Bytes แล้วเกิด Play Error ทำให้ต้องหลุดไปเข้า Web Speech API สำรองแบบ Async ส่งผลให้เกิดอาการ **ไม่มีเสียง / ดีเลย์ / เสียงซ้อนเมื่อกดปุ่มถัดไป**

## การแก้ไข (Fixes Applied)
1. **สร้างไฟล์เสียงใหม่แบบ 100% Validation**:
   - รัน Script ตรวจสอบและ Re-generate ทุกไฟล์เสียงใน `public/sounds/` ที่มีขนาด 0 Bytes
   - ยืนยันไฟล์ `num_2.mp3`, `num_4.mp3`, `num_6.mp3` และครบทั้ง 218 ไฟล์ มีขนาดสมบูรณ์ (~11,232 bytes ขึ้นไป)
2. **Build และ Deploy**:
   - รัน `npm run build` สำเร็จ 100%
   - ซิงค์ไฟล์ `public/sounds/`, `dist/` และ Source code เข้า GitHub Repository (`main` branch) สำเร็จเรียบร้อย (`c7b9920`)
3. **อัปเดตเวอร์ชันเป็น `v3.13.1`**
