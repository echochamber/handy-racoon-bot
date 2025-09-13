import { FieldValue, Timestamp } from "firebase-admin/firestore";

export interface DocMeta {
    id: string,
    path: string,
}

export interface BaseDoc {
    id?: string,
    meta?: DocMeta,
    createdAt?: Timestamp | FieldValue,
    updatedAt?: Timestamp | FieldValue,
}

export function docToEntity<T>(doc: FirebaseFirestore.DocumentData, doLog?: boolean): T {
  const entity: T = {
    ...doc.data(),
    meta: {
      id: doc.id,
      path: doc.ref.path,
    }
  };
  if (doLog) {
    console.info("Entity found", entity);
  }
  return entity;
}