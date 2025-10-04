const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Cache for exchange rates (in production, use Redis or similar)
let exchangeRateCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// @route   GET /api/currency/rates/:baseCurrency
// @desc    Get exchange rates for a base currency
// @access  Private
router.get('/rates/:baseCurrency', authenticate, async (req, res) => {
  try {
    const { baseCurrency } = req.params;
    const cacheKey = `rates_${baseCurrency.toUpperCase()}`;
    
    // Check cache first
    if (exchangeRateCache[cacheKey] && 
        Date.now() - exchangeRateCache[cacheKey].timestamp < CACHE_DURATION) {
      return res.json({
        base: baseCurrency.toUpperCase(),
        rates: exchangeRateCache[cacheKey].rates,
        cached: true,
        timestamp: exchangeRateCache[cacheKey].timestamp
      });
    }

    // Fetch from external API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const baseUrl = process.env.EXCHANGE_RATE_BASE_URL || 'https://api.exchangerate-api.com/v4/latest';
    
    let response;
    if (apiKey) {
      // Use API key if available (for higher rate limits)
      response = await axios.get(`${baseUrl}/${baseCurrency.toUpperCase()}`, {
        params: { access_key: apiKey }
      });
    } else {
      // Use free tier
      response = await axios.get(`${baseUrl}/${baseCurrency.toUpperCase()}`);
    }

    const rates = response.data.rates || response.data;
    
    // Cache the result
    exchangeRateCache[cacheKey] = {
      rates,
      timestamp: Date.now()
    };

    res.json({
      base: baseCurrency.toUpperCase(),
      rates,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    const cacheKey = `rates_${req.params.baseCurrency.toUpperCase()}`;
    if (exchangeRateCache[cacheKey]) {
      return res.json({
        base: req.params.baseCurrency.toUpperCase(),
        rates: exchangeRateCache[cacheKey].rates,
        cached: true,
        timestamp: exchangeRateCache[cacheKey].timestamp,
        warning: 'Using cached data due to API error'
      });
    }
    
    res.status(500).json({
      message: 'Failed to fetch exchange rates'
    });
  }
});

// @route   POST /api/currency/convert
// @desc    Convert amount from one currency to another
// @access  Private
router.post('/convert', authenticate, async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        message: 'Amount, fromCurrency, and toCurrency are required'
      });
    }

    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return res.json({
        originalAmount: parseFloat(amount),
        convertedAmount: parseFloat(amount),
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: 1,
        timestamp: new Date()
      });
    }

    const cacheKey = `rates_${fromCurrency.toUpperCase()}`;
    let rates;

    if (exchangeRateCache[cacheKey] && 
        Date.now() - exchangeRateCache[cacheKey].timestamp < CACHE_DURATION) {
      rates = exchangeRateCache[cacheKey].rates;
    } else {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      const baseUrl = process.env.EXCHANGE_RATE_BASE_URL || 'https://api.exchangerate-api.com/v4/latest';
      
      let response;
      if (apiKey) {
        response = await axios.get(`${baseUrl}/${fromCurrency.toUpperCase()}`, {
          params: { access_key: apiKey }
        });
      } else {
        response = await axios.get(`${baseUrl}/${fromCurrency.toUpperCase()}`);
      }

      rates = response.data.rates || response.data;
      
      exchangeRateCache[cacheKey] = {
        rates,
        timestamp: Date.now()
      };
    }

    const rate = rates[toCurrency.toUpperCase()];
    if (!rate) {
      return res.status(400).json({
        message: `Exchange rate not available for ${toCurrency}`
      });
    }

    const convertedAmount = parseFloat(amount) * rate;

    res.json({
      originalAmount: parseFloat(amount),
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate: parseFloat(rate.toFixed(6)),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({
      message: 'Failed to convert currency'
    });
  }
});

// @route   GET /api/currency/supported
// @desc    Get list of supported currencies
// @access  Private
router.get('/supported', authenticate, async (req, res) => {
  try {
    const supportedCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    ];

    res.json({
      currencies: supportedCurrencies,
      total: supportedCurrencies.length
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({
      message: 'Failed to fetch supported currencies'
    });
  }
});

// @route   GET /api/currency/countries
// @desc    Get countries with their currencies
// @access  PUBLIC - This is needed for the signup page
router.get('/countries', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countries = response.data
      .map((country) => {
        const currencyCode = Object.keys(country.currencies || {})[0];
        if (!currencyCode) {
          return null;
        }
        return {
          countryName: country.name.common,
          currencyCode,
        };
      })
      .filter(Boolean) 
      .sort((a, b) => a.countryName.localeCompare(b.countryName));

    res.json({
      countries,
      total: countries.length
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      message: 'Failed to fetch countries'
    });
  }
});

module.exports = router;

