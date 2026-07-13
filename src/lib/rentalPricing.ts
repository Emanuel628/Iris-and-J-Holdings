export function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isWeekendNight(dateString: string) {
  const day = new Date(`${dateString}T00:00:00`).getDay();
  return day === 5 || day === 6;
}

export function calculateStaySubtotal(checkIn: string, checkOut: string, nightlyRateCents: number, weekendRateCents: number) {
  const standardRate = Number(nightlyRateCents || 0);
  const weekendRate = Number(weekendRateCents || standardRate);
  let cursor = checkIn;
  let subtotal = 0;
  let weeknightNights = 0;
  let weekendNights = 0;
  let guard = 0;

  while (cursor < checkOut && guard < 800) {
    if (isWeekendNight(cursor)) {
      subtotal += weekendRate;
      weekendNights += 1;
    } else {
      subtotal += standardRate;
      weeknightNights += 1;
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }

  return { subtotal, weeknightNights, weekendNights };
}
