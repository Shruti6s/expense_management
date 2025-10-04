const axios = require('axios');

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error('Currency conversion rate not found');
    }

    return (amount * rate).toFixed(2);
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    throw new Error('Failed to convert currency');
  }
};

module.exports = { convertCurrency };
