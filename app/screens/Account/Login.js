import React, { useRef } from "react";
import { StyleSheet, ScrollView, View, Text, Image } from "react-native";
import { Divider } from "react-native-elements";
import { withNavigation } from "react-navigation";
import Toast from "react-native-easy-toast";

import LoginForm from "./../../components/Account/LoginForm";
import LoginFacebook from "./../../components/Account/LoginFacebook";
import LoginGoogle from "./../../components/Account/LoginGoogle";

function Login(props) {
  const { navigation } = props;
  const toastRef = useRef();

  return (
    <ScrollView>
      <Image
        source={require("./../../../assets/img/5-tenedores-letras-icono-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef} />
        <CreateAccount navigation={navigation} />
      </View>
      <Divider style={styles.divider} />
      <View style={styles.viewContainer}>
        <LoginGoogle toastRef={toastRef} navigation={navigation} />
        <LoginFacebook toastRef={toastRef} navigation={navigation} />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.5} />
    </ScrollView>
  );
}

function CreateAccount(props) {
  const { navigation } = props;

  return (
    <Text style={styles.textRegister}>
      ¿Aun no tienes una cuenta? {""}
      <Text
        style={styles.btnRegister}
        onPress={() => {
          navigation.navigate("Register");
        }}
      >
        Registrate
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 120,
    marginTop: 20
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40
  },
  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10
  },
  btnRegister: {
    color: "#00a680",
    fontWeight: "bold"
  },
  divider: {
    backgroundColor: "#00a680",
    marginBottom: 25,
    marginTop: 25,
    marginLeft: 40,
    marginRight: 40
  }
});

export default withNavigation(Login);
