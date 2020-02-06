import React, { useState } from "react";
import { SocialIcon } from "react-native-elements";
import * as firebase from "firebase";
import * as Google from "expo-google-app-auth";

import { GoogleApi } from "./../../utils/Social";
import Loading from "./../Loading";

export default function LoginGoogle(props) {
  const { toastRef, navigation } = props;
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    const { type, idToken, accessToken, user } = await Google.logInAsync(
      GoogleApi
    );

    if (type === "success") {
      setIsLoading(true);
      const credentials = firebase.auth.GoogleAuthProvider.credential(
        idToken,
        accessToken
      );
      await firebase
        .auth()
        .signInWithCredential(credentials)
        .then(() => {
          navigation.navigate("MyAccount");
        })
        .catch(() => {
          toastRef.current.show(
            "Error iniciando sesión con Google, intentelo más tarde"
          );
        });
    } else if (type === "cancel") {
      toastRef.current.show("Inicio de sesion cancelado");
    } else {
      toastRef.current.show("Error desconocido, intentelo más tarde");
    }
    setIsLoading(false);
  };

  return (
    <>
      <SocialIcon
        title="Iniciar sesión con Google"
        button
        type="google"
        onPress={login}
      />
      <Loading isVisible={isLoading} text="Iniciando sesión" />
    </>
  );
}
