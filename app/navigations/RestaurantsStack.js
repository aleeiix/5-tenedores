import { createStackNavigator } from "react-navigation-stack";
import RestaurantsScreen from "./../screens/Restaurants/Restaurants";
import AddRestaurantScreen from "./../screens/Restaurants/AddRestaurant";
import Restaurant from "./../screens/Restaurants/Restaurant";

const RestaurantsScreenStacks = createStackNavigator({
  Restaurants: {
    screen: RestaurantsScreen,
    navigationOptions: () => ({
      title: "Restaurantes"
    })
  },
  AddRestaurant: {
    screen: AddRestaurantScreen,
    navigationOptions: () => ({
      title: "Nuevo restaurante"
    })
  },
  Restaurant: {
    screen: Restaurant,
    navigationOptions: props => ({
      title: props.navigation.state.params.restaurant.item.restaurant.name
    })
  }
});

export default RestaurantsScreenStacks;
