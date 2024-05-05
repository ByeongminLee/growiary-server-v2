import { Timestamp } from 'firebase-admin/firestore';

export default function toDate(date: Date | Timestamp): Date {
  if (date instanceof Date) {
    return date;
  } else {
    return date.toDate();
  }
}
