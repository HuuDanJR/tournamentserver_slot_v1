// Function to generate a random string of characters
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }





function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function getFormattedTimestamp() {
  const timestamp = new Date().getTime(); // Get current timestamp
  // Format the timestamp
  const dateObj = new Date(timestamp);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(4, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  // Create formatted timestamp string
  const formattedTimestamp = `${day}-${month}-${year}_${hours}-${minutes}`;
  return formattedTimestamp;
}


function removeEmptyStringsFromArray(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Input is not an array.');
  }

  return arr.filter(item => typeof item === 'string' && item !== "" && item !== null);
}
function replaceEmptyStrings(arr, replacement) {
  if (!Array.isArray(arr)) {
    throw new Error('Input is not an array.');
  }

  return arr.map(item => {
    if (typeof item === 'string' && item.trim() === "") {
      return replacement;
    }
    return item;
  });
}

module.exports={
  generateRandomString:generateRandomString,
  removeEmptyStringsFromArray:removeEmptyStringsFromArray,
  getFormattedTimestamp:getFormattedTimestamp,
  generateRandomString:generateRandomString
}