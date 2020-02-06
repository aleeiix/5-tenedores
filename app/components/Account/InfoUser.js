import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Avatar } from "react-native-elements";
import * as firebase from "firebase";
import * as Premissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

export default function InfoUser(props) {
  const defaultAvatar =
    "https://img-cdn.hipertextual.com/files/2020/01/hipertextual-es-figura-baby-yoda-mas-real-que-podras-comprar-2020062519.jpeg?strip=all&lossy=1&quality=55&resize=740%2C490&ssl=1";
  // https://api.adorable.io/avatars/285/aleix@adorable.png
  const {
    userInfo: { uid, displayName, email, photoURL },
    setReloadData,
    toastRef
  } = props;

  const changeAvatar = async () => {
    const resultPermission = await Premissions.askAsync(
      Premissions.CAMERA_ROLL
    );

    const resultPermissionCamera =
      resultPermission.permissions.cameraRoll.status;

    if (resultPermissionCamera === "denied") {
      toastRef.current.show("Es necesario aceptar los permisos de la galeria");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 3]
      });

      if (result.cancelled) {
        toastRef.current.show("Has cerrado la galeria de imagenes");
      } else {
        uploadImage(result.uri, uid)
          .then(() => {
            updatePhotoUrl(uid);
          })
          .catch(() => {
            toastRef.current.show("Error en la subida de la imagen");
          });
      }
    }
  };

  const uploadImage = async (uri, nameImage) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = firebase
      .storage()
      .ref()
      .child(`avatar/${nameImage}`);

    return ref.put(blob);
  };

  const updatePhotoUrl = uid => {
    firebase
      .storage()
      .ref(`avatar/${uid}`)
      .getDownloadURL()
      .then(async result => {
        const update = { photoURL: result };
        await firebase.auth().currentUser.updateProfile(update);
        setReloadData(true);
      })
      .catch(() => {
        toastRef.current.show("Error al recupera el avatar del servidor");
      });
  };

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton={true}
        onEditPress={changeAvatar}
        containerStyle={styles.userInfoAvatar}
        source={{
          uri: photoURL || defaultAvatar
        }}
      />
      <View>
        <Text style={styles.displayName}>{displayName || "Anónimo"}</Text>
        <Text>{email || "Social Login"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingTop: 30,
    paddingBottom: 30
  },
  userInfoAvatar: {
    marginRight: 20
  },
  displayName: {
    fontWeight: "bold"
  }
});
