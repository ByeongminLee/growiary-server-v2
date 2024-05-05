export interface ReserveDTO {
  id: string;
  userId: string;
  content: object;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateReserveDTO {
  content: object;
}
