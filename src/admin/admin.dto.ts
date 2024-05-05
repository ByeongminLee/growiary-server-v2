export interface TestCreatePostDTO {
  userId: string; // 생성할 유저 uid
  count?: number; // 생성할 게시글 개수
  topicId?: string; // 생성할 게시글의 topicId
  category?: string; // 생성할 게시글의 category
  startDate?: string; // 생성할 게시글의 시작 날짜 yyyy-mm-dd
  endDate?: string; // 생성할 게시글의 종료 날짜 yyyy-mm-dd
}
