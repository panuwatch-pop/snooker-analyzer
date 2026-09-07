# Mobile Layout Specification (LOCKED / GOLD STANDARD)

> ⚠️ **IMPORTANT**: รูปแบบและขนาดหน้าจอของ Mobile ได้รับการยืนยันว่าใช้งานได้สมบูรณ์แบบแล้ว (เวอร์ชัน v3.5.4) **ห้ามแก้ไขขนาดหน้าจอ / Padding / สัดส่วนของ Mobile อีกต่อไป**

---

## 📱 สรุปโครงสร้างและสัดส่วนที่ล็อคไว้สำหรับ Mobile

### 1. Viewport & Containers
- `App.tsx` Root: `h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col`
- `<main>`: `flex-1 min-h-0 p-0.5 xs:p-1 sm:p-2 md:p-3 max-w-7xl w-full mx-auto flex flex-col overflow-hidden`
- Inner container: `flex-1 min-h-0 flex flex-col justify-between space-y-0.5 xs:space-y-1 sm:space-y-1.5 md:space-y-2 animate-fadeIn overflow-hidden`

### 2. Navbar
- Header: `px-1.5 sm:px-3 py-0.5 sm:py-1.5`
- Mobile Dropdown: แสดงเมื่อ `isMobile = true` (ตรวจจับสมาร์ทโฟนทุกรุ่นทั้งแนวตั้งและแนวนอน)

### 3. Scoreboard (`Scoreboard.tsx`)
- การ์ด 2 คอลัมน์สมมาตร: `grid grid-cols-2 gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2.5`
- การ์ดผู้เล่น: `p-0.5 xs:p-1 sm:p-2 md:p-2.5 flex flex-col justify-between`
- ส่วนหัว:
  - ชื่อผู้เล่น + `เบรกสูง: X` อยู่ด้านล่างชื่อผู้เล่น
  - **ไม่มีป้ายกำลังแทง** (ใช้ขอบนีออนเรืองแสง)
- สัดส่วนความกว้าง:
  - กล่องซ้อนด้านนอก (FRAME + BREAK): `w-[30%] xs:w-[28%] sm:w-[26%]`
  - กล่องคะแนนแนวตั้ง (SCORE Box): `flex-1` (~70-74% ของการ์ด)
- ฟอนต์ตัวเลข:
  - คะแนน (SCORE): `text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight`
  - เฟรม & เบรก: `text-sm xs:text-base sm:text-2xl md:text-3xl font-black font-mono`
- แถบสถานะเฟรม (แดงบนโต๊ะ/แต้มบนโต๊ะ): `p-0.5 xs:p-1 md:p-1.5 text-[7px] xs:text-[8px] md:text-xs`

### 4. Ball Potting & Actions (`BallPots.tsx`)
- แถบลูกที่ตบในเทิร์น: `p-0.5 xs:p-1`
- แผงลูกสนุ๊ก 1-7 แต้ม: `p-0.5 xs:p-1 md:p-1.5`, ปุ่มลูก: `py-1 xs:py-1.5 sm:py-2 md:py-2.5`
- แถบปุ่มควบคุมล่างสุด:
  - ปุ่มฟาวล์: `w-16 xs:w-20 sm:w-28 md:w-36 py-1 xs:py-1.5 md:py-2`
  - ปุ่มอื่นๆ (พลาด, กัน/เซฟ, ย้อนกลับ, จบเฟรม, เริ่มใหม่): `py-0.5 xs:py-1 md:py-1.5`
