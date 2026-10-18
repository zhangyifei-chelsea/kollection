type CalendarSeamsProps = { weeks: number };

/** Draw each shared boundary once so neighboring cells cannot drift apart. */
export function CalendarSeams({ weeks }: CalendarSeamsProps) {
  const horizontal = Array.from({ length: weeks - 1 }, (_, row) => {
    const y = (row + 1) * 100;
    return `M0 ${y} ` + Array.from({ length: 7 }, (_, col) => {
      const x = col * 100;
      const direction = (col + row) % 2 ? -1 : 1;
      return `L${x + 40} ${y} C${x + 45} ${y} ${x + 45} ${y - direction * 3} ${x + 43} ${y - direction * 5} C${x + 35} ${y - direction * 14} ${x + 65} ${y - direction * 14} ${x + 57} ${y - direction * 5} C${x + 55} ${y - direction * 3} ${x + 55} ${y} ${x + 60} ${y} L${x + 100} ${y}`;
    }).join(' ');
  });
  const vertical = Array.from({ length: 6 }, (_, col) => {
    const x = (col + 1) * 100;
    return `M${x} 0 ` + Array.from({ length: weeks }, (_, row) => {
      const y = row * 100;
      const direction = (col + row) % 2 ? 1 : -1;
      return `L${x} ${y + 40} C${x} ${y + 45} ${x + direction * 3} ${y + 45} ${x + direction * 5} ${y + 43} C${x + direction * 14} ${y + 35} ${x + direction * 14} ${y + 65} ${x + direction * 5} ${y + 57} C${x + direction * 3} ${y + 55} ${x} ${y + 55} ${x} ${y + 60} L${x} ${y + 100}`;
    }).join(' ');
  });
  return <svg className="calendar-seams" viewBox={`0 0 700 ${weeks * 100}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    {[...horizontal, ...vertical].map((path, i) => <path key={i} d={path} vectorEffect="non-scaling-stroke"/>)}
  </svg>;
}
