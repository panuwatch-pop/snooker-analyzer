export const BALL_TYPES = {
  1: { name: 'แดง (Red)', points: 1, color: 'bg-red-600', textColor: 'text-white', border: 'border-red-400' },
  2: { name: 'เหลือง (Yellow)', points: 2, color: 'bg-yellow-400', textColor: 'text-zinc-900', border: 'border-yellow-200' },
  3: { name: 'เขียว (Green)', points: 3, color: 'bg-emerald-600', textColor: 'text-white', border: 'border-emerald-400' },
  4: { name: 'น้ำตาล (Brown)', points: 4, color: 'bg-amber-800', textColor: 'text-white', border: 'border-amber-600' },
  5: { name: 'น้ำเงิน (Blue)', points: 5, color: 'bg-blue-600', textColor: 'text-white', border: 'border-blue-400' },
  6: { name: 'ชมพู (Pink)', points: 6, color: 'bg-pink-500', textColor: 'text-white', border: 'border-pink-300' },
  7: { name: 'ดำ (Black)', points: 7, color: 'bg-zinc-900', textColor: 'text-white', border: 'border-zinc-500' },
};

/**
 * คำนวณสถิติของนักกีฬาแต่ละฝั่ง
 */
export function calculatePlayerStats(player) {
  const ast = player.totalShots > 0 
    ? (player.totalTimeOnTable / player.totalShots).toFixed(1) 
    : '0.0';

  const potAccuracy = player.attemptedPots > 0 
    ? Math.round((player.successfulPots / player.attemptedPots) * 100) 
    : 0;

  const safetyRate = player.totalSafeties > 0 
    ? Math.round((player.successfulSafeties / player.totalSafeties) * 100) 
    : 0;

  return {
    ...player,
    ast: parseFloat(ast),
    potAccuracy,
    safetyRate,
  };
}

/**
 * คำนวณสัดส่วน % สำหรับสร้าง Comparison Color Bar แบบ 2 ฝั่ง (Player 1 vs Player 2)
 */
export function calculateBarRatio(val1, val2, lowerIsBetter = false) {
  const v1 = parseFloat(val1) || 0;
  const v2 = parseFloat(val2) || 0;

  if (v1 === 0 && v2 === 0) return { p1Pct: 50, p2Pct: 50 };

  if (lowerIsBetter) {
    // เช่น AST ยิ่งเร็วยิ่งดี (หรือถ้าวิเคราะห์ความเร็ว relative)
    const total = v1 + v2;
    // ฝั่งที่ค่าน้อยกว่า จะได้สัดส่วนการแสดงผลที่โดดเด่นกว่า
    const p1Share = v2 / total;
    const p2Share = v1 / total;
    return {
      p1Pct: Math.round(p1Share * 100),
      p2Pct: Math.round(p2Share * 100),
    };
  }

  const total = v1 + v2;
  const p1Pct = Math.round((v1 / total) * 100);
  const p2Pct = 100 - p1Pct;

  return { p1Pct, p2Pct };
}
