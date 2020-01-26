import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAw-nOSFcmqhrYYUq10WbVJo2O2cInIzWo",
  authDomain: "react-native-5tenedores.firebaseapp.com",
  databaseURL: "https://react-native-5tenedores.firebaseio.com",
  projectId: "react-native-5tenedores",
  storageBucket: "react-native-5tenedores.appspot.com",
  messagingSenderId: "920003653515",
  appId: "1:920003653515:web:4020bedfbfaa32625c898e"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
