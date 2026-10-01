# เอกสารส่งต่องาน: ระบบนับคะแนนสนุ๊กเกอร์ไฟฟ้า (Electric Snooker Handover Spec)

> **เอกสารนี้จัดทำขึ้นเพื่อ:** ให้สามารถเปิด Conversation ใหม่ใน Antigravity เพื่อพัฒนาระบบนับคะแนนสนุ๊กเกอร์ไฟฟ้า (Electric Snooker) ได้ทันที โดยประหยัด Token และสามารถนำโค้ดกลับมารวมกับแอปหลักได้อย่างสมบูรณ์ 100%

---

## 📌 1. ข้อมูลสภาพแวดล้อมโครงการ (Project Environment)
- **Path โฟลเดอร์งาน:** `D:\snooker-analyzer`
- **Path โฟลเดอร์สำรอง:** `D:\snooker-scorer`
- **Git Repository:** `https://github.com/panuwatch-pop/snooker-analyzer.git` (Branch: `main`)
- **เวอร์ชันปัจจุบัน:** `v3.16.0`
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Web Audio API, Canvas Confetti
- **คำสั่ง Build:** `npm run build`

---

## 🧩 2. สถานะโครงสร้างระบบปัจจุบันที่เกี่ยวข้องกับสนุกเกอร์ไฟฟ้า

### 2.1 ไฟล์ประเภทข้อมูล (`src/types/snooker.ts`)
```typescript
export type GameMode = '15-reds' | '6-reds' | 'snooker-ga' | 'electric-count' | 'shoot-out';

export interface ElectricConfig {
  countMode: 'ball-only' | 'ball-plus-ga'; // นับลูกอย่างเดียว (1 ลูก = 1 แต้ม) หรือ นับลูก + หลุมกา
  redPoints: number;        // ค่าเริ่มต้น 1
  yellowPoints: number;     // ค่าเริ่มต้น 1 หรือ 2 หรือ 4
  greenPoints: number;      // ค่าเริ่มต้น 1
  brownPoints: number;      // ค่าเริ่มต้น 1
  bluePoints: number;       // ค่าเริ่มต้น 1
  pinkPoints: number;       // ค่าเริ่มต้น 1
  blackPoints: number;      // ค่าเริ่มต้น 1 หรือ 2 หรือ 4
  lastBlackPoints: number;  // แต้มลูกดำสุดท้าย (เช่น 2, 4, 7, 10)
  foulPenalty: number;      // แต้มเสียฟาวล์ (เช่น 1, 4, 7)
  handicapEnabled: boolean; // ระบบต่อแบบสัดส่วนไฟฟ้า (100:80)
  handicapGiverIndex: 0 | 1;
  handicapGiverRatio: number; // e.g. 80 (เล่น 100 นับ 80)
  handicapReceiverRatio: number; // 100
}
```

### 2.2 กติกาและการคำนวณแต้ม (`src/utils/snookerRules.ts`)
- `DEFAULT_ELECTRIC_CONFIG`: ค่าเริ่มต้นของโหมดไฟฟ้า
- `getBallBasePoints(ball, isFinalBlack, electricConfig)`: คืนค่าแต้มพื้นฐานของแต่ละลูกตาม config
- `calculateElectricPotPoints(ball, pocket, isFinalBlack, electricConfig, activeStrikerIndex)`: คำนวณแต้มตบลูกตามหลุมกาหรือนับลูก
- `calculateRemainingPoints(...)`: คำนวณแต้มคงเหลือบนโต๊ะสำหรับโหมดไฟฟ้า
- `calculateHandicapScore(...)`: คำนวณแต้มหลังหักส่วนต่อ

### 2.3 การแสดงผลในหน้าจอ (`src/components/Scoreboard.tsx` & `src/components/KeyboardDisplayScreen.tsx`)
- ในโหมดไฟฟ้า (`isElectricMode`): หน้าจอจะแสดงผลแบบ **4-Box Display**:
  1. กล่องคะแนนเกมปัจจุบัน (Current Game Score) ของผู้เล่น 1 และ 2
  2. กล่องคะแนนสะสมรวมทุกเกม (Cumulative Total Score) ของผู้เล่น 1 และ 2
  3. ป้ายแสดงอัตราต่อรองไฟฟ้า เช่น `ต่อ 100:80` หรือ `รอง 100%`

### 2.4 หน้าจอเริ่มแมตช์ใหม่ (`src/components/NewMatchModal.tsx`)
- มีปุ่มเลือกโหมด **⚡ ไฟฟ้า** พร้อมแผงปรับแต่ง:
  - นับลูกอย่างเดียว / นับลูก + หลุมกา
  - แต้มลูกเหลือง (1, 2, 4), แต้มลูกดำ (1, 2, 4), แต้มลูกดำสุดท้าย (2, 4, 7, 10), แต้มฟาวล์ (1, 4, 7)
  - ระบบต่อรอง 100:80

---

## 🎯 3. สถาปัตยกรรมและข้อกำหนดในการรวมกลับ (Integration Guidelines)

เพื่อให้สามารถนำโค้ดที่ทำใน Conversation ใหม่กลับมารวมได้ง่าย:
1. **รักษาโครงสร้างประเภทข้อมูลเดิม**: ให้ขยายฟังก์ชันหรือเพิ่มฟิลด์เสริมใน `ElectricConfig` แทนการลบฟิลด์เดิม
2. **ไม่กระทบโหมดอื่น**: แอปมีโหมด 15 แดง, 6 แดง, สนุ๊กกา, ชู๊ตเอาท์ และระบบแต้มต่อเวท (Handicap Weight Points) ต้องมั่นใจว่าการแก้ไขระบบไฟฟ้าแยก Namespace หรือตรวจสอบเงื่อนไข `match.gameMode === 'electric-count'` เสมอ
3. **รองรับ Wireless Keypad 22 ปุ่ม**:
   - `1` ถึง `7`: ตบลูกสี
   - `Enter`: สลับเทิร์น
   - `8`: รีเซ็ตหรือช็อตพิเศษ
   - `-`: โหมดฟาวล์
   - `⌫` / `*`: Undo

---

## 💬 4. ข้อความ Prompt ที่แนะนำให้ใช้เปิด Conversation ใหม่

ให้คัดลอกข้อความด้านล่างนี้ไปวางในหน้า Chat / Conversation ใหม่ได้ทันที:

```text
สวัสดีครับ ต้องการให้ช่วยพัฒนาระบบนับคะแนนสนุ๊กเกอร์แบบไฟฟ้า (Electric Snooker) บนโปรเจกต์เดิมที่ D:\snooker-analyzer (Branch main, v3.16.0)

กรุณาอ่านข้อมูลจากไฟล์ D:\snooker-analyzer\ELECTRIC_SNOOKER_HANDOVER.md เพื่อทำความเข้าใจโครงสร้างปัจจุบัน แล้วช่วยวิเคราะห์และพัฒนาระบบนับคะแนนสนุ๊กเกอร์ไฟฟ้าตามความต้องการดังนี้:
[ใส่รายละเอียดกติกาหรือฟีเจอร์ของระบบไฟฟ้าที่ต้องการทำเพิ่มเติมตรงนี้]
```
