import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage'

const config = {
  apiKey: "AIzaSyAol9kxITyLRwJCF-d1xv6OD8HNfZR8g7w",
  authDomain: "master-vietnamese.firebaseapp.com",
  databaseURL: "https://master-vietnamese.firebaseio.com",
  projectId: "master-vietnamese",
  storageBucket: "master-vietnamese.appspot.com",
  messagingSenderId: "838310101316",
  appId: "1:838310101316:web:3ab582cded5d27e2a5d711"
};

firebase.initializeApp(config);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export default firebase;
