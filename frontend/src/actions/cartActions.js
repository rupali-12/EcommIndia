import {
  ADD_TO_CART,
  EMPTY_CART,
  REMOVE_CART_ITEM,
  SAVE_SHIPPING_INFO,
} from "../constants/cartConstants";
import axios from "axios";

// Add to Cart
export const addItemsToCart = (id, quantity) => async (dispatch, getState) => {
  const { data } = await axios.get(`/api/v1/product/${id}`);

  //   console.log(data.data);
  dispatch({
    type: ADD_TO_CART,
    payload: {
      product: data.data._id,
      name: data.data.name,
      price: data.data.price,
      image: data.data.images[0].url,
      stock: data.data.stock,
      quantity,
    },
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

// REMOVE FROM CART
export const removeItemsFromCart = (id) => async (dispatch, getState) => {
  dispatch({
    type: REMOVE_CART_ITEM,
    payload: id,
  });

  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

// SAVE SHIPPING INFO
export const saveShippingInfo = (data) => async (dispatch) => {
  console.log("Shipping data is", data);
  dispatch({
    type: SAVE_SHIPPING_INFO,
    payload: data,
  });

  localStorage.setItem("shippingInfo", JSON.stringify(data));
};

export const emptyCart = () => async (dispatch,getState) => {
  dispatch({ type: EMPTY_CART });
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};
