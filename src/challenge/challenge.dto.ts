export interface Badge {
  name: string;
  acquired: boolean; // 획득 여부
  acquiredDate: Date; // 획득 날짜
}

export type BadgeList = {
  [key in BadgeKeyName]: Badge;
};

type BadgeKeyName =
  | 'first'
  | 'post1'
  | 'post10'
  | 'post100'
  | 'earlyBird'
  | 'owl'
  | 'balancer'
  | 'godHand'
  | 'selfWriter'
  | 'growthWriter'
  | 'dailyWriter'
  | 'freeWriter';
// | 'growiaryHolic';
