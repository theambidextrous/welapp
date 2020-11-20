import AsyncStorage from "@react-native-community/async-storage";

const keep = async (storageKey, value) => {
  await AsyncStorage.setItem(storageKey, value);
};
const find = async (storageKey) => {
  return await AsyncStorage.getItem(storageKey);
};
const del = async (storageKey) => {
  await AsyncStorage.removeItem(storageKey);
};

export { keep, find, del };
