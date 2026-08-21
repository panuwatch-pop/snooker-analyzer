import { useEffect } from 'react';

export function useKeyboardControls({
  scoreBall,
  switchTurn,
  setIsFoulModalOpen,
  isFoulModalOpen,
  commitFoul,
  undo,
  nextFrame,
  resetMatch,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ไม่ทำงานถ้าอยู่ในช่อง input / textarea (เพื่อเปิดให้แก้ไขชื่อผู้เล่นได้)
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // ถ้า Foul Modal เปิดอยู่ ให้กด 4, 5, 6, 7 หรือ Escape
      if (isFoulModalOpen) {
        if (['4', '5', '6', '7'].includes(e.key)) {
          e.preventDefault();
          commitFoul(parseInt(e.key, 10));
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFoulModalOpen(false);
          return;
        }
      }

      // Undo: Backspace หรือ Ctrl+Z
      if (e.key === 'Backspace' || (e.ctrlKey && (e.key === 'z' || e.key === 'Z'))) {
        e.preventDefault();
        undo();
        return;
      }

      // ตบลูกสี 1 - 7
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        e.preventDefault();
        scoreBall(parseInt(e.key, 10));
        return;
      }

      // ปุ่มควบคุมหลัก
      switch (e.key) {
        case ' ': // Spacebar = เปลี่ยนฝั่งปกติ
          e.preventDefault();
          switchTurn('SWITCH');
          break;
        case 's':
        case 'S': // S = แทง Safety
          e.preventDefault();
          switchTurn('SAFETY');
          break;
        case 'm':
        case 'M': // M = แทงพลาด (Miss)
          e.preventDefault();
          switchTurn('MISS');
          break;
        case 'f':
        case 'F': // F = เปิดเมนูฟาวล์
          e.preventDefault();
          setIsFoulModalOpen(true);
          break;
        case 'n':
        case 'N': // N = เฟรมถัดไป
          e.preventDefault();
          nextFrame();
          break;
        case 'r':
        case 'R': // R = รีเซ็ตแมตช์
          e.preventDefault();
          resetMatch();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scoreBall, switchTurn, setIsFoulModalOpen, isFoulModalOpen, commitFoul, undo, nextFrame, resetMatch]);
}
