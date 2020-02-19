import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Text, View, Dimensions } from "react-native";
import { Rating, ListItem } from "react-native-elements";
import * as firebase from "firebase";
import Carousel from "./../../components/Carousel";
import Map from "./../../components/Map";
import ListReviews from "./../../components/Restaurants/ListReviews";

const screenWidth = Dimensions.get("window").width;

export default function Restaurant(props) {
  const { navigation } = props;
  const { restaurant } = navigation.state.params.restaurant.item;

  const [imagesRestaurant, setImagesRestaurant] = useState([]);

  useEffect(() => {
    const urls = [];

    (async () => {
      await Promise.all(
        restaurant.images.map(async idImage => {
          await firebase
            .storage()
            .ref(`restaurants/${idImage}`)
            .getDownloadURL()
            .then(imageUrl => urls.push(imageUrl));
        })
      );

      setImagesRestaurant(urls);
    })();
  }, []);

  return (
    <ScrollView style={styles.viewBody}>
      <Carousel images={imagesRestaurant} width={screenWidth} height={200} />
      <TitleRestaurant
        name={restaurant.name}
        description={restaurant.description}
        rating={restaurant.rating}
      />
      <RestaurantInfo
        location={restaurant.location}
        name={restaurant.name}
        address={restaurant.address}
        phone={restaurant.phone}
        email={restaurant.email}
      />

      <ListReviews navigation={navigation} idRestaurant={restaurant.id} />
    </ScrollView>
  );
}

function TitleRestaurant(props) {
  const { name, description, rating } = props;

  return (
    <View style={styles.viewRestaurantTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameRestaurant}>{name}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
          //   tintColor="transparent"
        />
      </View>
      <Text style={styles.descriptionRestaurant}>{description}</Text>
    </View>
  );
}

function RestaurantInfo(props) {
  const { location, name, address, phone, email } = props;

  const listInfo = [
    {
      text: address || null,
      iconName: "map-marker",
      iconType: "material-community",
      action: null
    },
    {
      text: phone || null,
      iconName: "phone",
      iconType: "material-community",
      action: null
    },
    {
      text: email || null,
      iconName: "at",
      iconType: "material-community",
      action: null
    }
  ];

  return (
    <View style={styles.viewRestaurantInfo}>
      <Text style={styles.restaurantInfoTitle}>
        Información sobre el restaurante
      </Text>
      <Map location={location} name={name} height={100} />
      {listInfo.map((item, index) => {
        if (item.text) {
          return (
            <ListItem
              key={index}
              title={item.text}
              leftIcon={{
                name: item.iconName,
                type: item.iconType,
                color: "#00a680"
              }}
              containerStyle={styles.containerListItem}
            />
          );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewRestaurantTitle: {
    margin: 15
  },
  nameRestaurant: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  descriptionRestaurant: {
    marginTop: 5,
    color: "grey"
  },
  viewRestaurantInfo: {
    margin: 15,
    marginTop: 25
  },
  restaurantInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1
  }
});
