// Firebase module type definitions
declare module '../firebase' {
  import { Auth, Firestore } from 'firebase/auth';
  import { FirebaseApp } from 'firebase/app';

  const app: FirebaseApp;
  const auth: Auth;
  const db: Firestore;

  export { app, auth, db };
  export default app;
}