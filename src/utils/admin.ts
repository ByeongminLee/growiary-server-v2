export function randomDate({
  startDate,
  endDate,
}: {
  startDate: string; // 생성할 게시글의 시작 날짜 yyyy-mm-dd
  endDate: string; // 생성할 게시글의 종료 날짜 yyyy-mm-dd
}): Date {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  const deltaTime = end - start;

  const randomMs = Math.floor(Math.random() * deltaTime);

  const randomDate = new Date(start + randomMs);

  randomDate.setHours(Math.floor(Math.random() * 24));
  randomDate.setMinutes(Math.floor(Math.random() * 60));

  return randomDate;
}
