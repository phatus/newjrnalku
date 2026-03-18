const month = 3;
const year = 2025;
const lastDate = new Date(year, month + 1, 0);
console.log('Month:', month, 'Year:', year);
console.log('LastDate:', lastDate.toISOString().split('T')[0]);
const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDate.getDate().toString().padStart(2, '0')}`;
console.log('Start:', startDate);
console.log('End:', endDate);
