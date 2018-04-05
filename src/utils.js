export const filterArray = (array, text) => {
  let filteredArray = null;
  filteredArray = array.filter(object => {
    const query = text.toLowerCase();
    return object.toLowerCase().startsWith(query);
  });
  if (filteredArray.length === 0) filteredArray.push(text);
  return filteredArray;
};

export const normalizeIndex = (selectedIndex, max) => {
  let index = selectedIndex % max;
  if (index < 0) {
    index += max;
  }
  return index;
};
