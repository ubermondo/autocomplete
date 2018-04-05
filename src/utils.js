export const normalizeIndex = (selectedIndex, max) => {
  let index = selectedIndex % max;
  if (index < 0) {
    index += max;
  }
  return index;
};

export const filterArray = (array, text) => {
  let filteredArray = array.filter(object => {
    return object.toLowerCase().startsWith(text.toLowerCase());
  });
  if (filteredArray.length === 0) filteredArray.push(text);
  return filteredArray;
};
