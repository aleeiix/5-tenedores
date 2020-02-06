import React, { useState, useEffect } from "react";
import * as firebase from "firebase";
import Loading from "./../../components/Loading";
import UserLogged from "./UserLogged";
import UserGuest from "./UserGuest";

export default function MyAccount() {
  const [login, setLogin] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      console.log("USER ==> ", user);
      setLogin(user !== null);
    });
  }, []);

  if (login === null) {
    return <Loading isVisible={true} text="Cargando..."></Loading>;
  }

  return login ? <UserLogged /> : <UserGuest />;
}
