/** Afrikaans long date for drawer masthead (e.g. "Dinsdag, 26 Mei 2026"). */
export function afrikaanseDatum(date = new Date()): string {
  const days = [
    'Sondag',
    'Maandag',
    'Dinsdag',
    'Woensdag',
    'Donderdag',
    'Vrydag',
    'Saterdag',
  ];
  const months = [
    'Januarie',
    'Februarie',
    'Maart',
    'April',
    'Mei',
    'Junie',
    'Julie',
    'Augustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
