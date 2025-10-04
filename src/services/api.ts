// API configuration
export const API_BASE_URL = 'http://localhost:5001/api';

// Mock data for development
export const mockExpenses = [
  {
    id: '1',
    employeeId: 'user-1',
    employeeName: 'John Doe',
    amount: 150.00,
    currency: 'USD',
    category: 'Travel',
    description: 'Taxi to client meeting',
    date: '2025-10-01',
    status: 'pending',
    approvers: ['manager-1'],
    currentApprover: 'manager-1',
  },
  {
    id: '2',
    employeeId: 'user-1',
    employeeName: 'John Doe',
    amount: 45.50,
    currency: 'EUR',
    category: 'Food',
    description: 'Team lunch',
    date: '2025-09-28',
    status: 'approved',
    approvers: ['manager-1'],
    approvedBy: ['manager-1'],
  },
  {
    id: '3',
    employeeId: 'user-2',
    employeeName: 'Jane Smith',
    amount: 320.00,
    currency: 'USD',
    category: 'Supplies',
    description: 'Office equipment',
    date: '2025-09-30',
    status: 'rejected',
    approvers: ['manager-1'],
    rejectedBy: 'manager-1',
    rejectionComment: 'Please provide itemized receipt',
  },
];

// Currency API
export const fetchCurrencies = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
};

export const fetchExchangeRates = async (baseCurrency: string) => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
};

export const convertCurrency = async (amount: number, fromCurrency: string, toCurrency: string) => {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    if (!rate) return amount;
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

// Expense API functions (placeholders for backend integration)
export const fetchExpenses = async () => {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/expenses`).then(res => res.json());
  return Promise.resolve(mockExpenses);
};

export const submitExpense = async (expenseData: any) => {
  // TODO: Replace with actual API call
  // return fetch(`${API_BASE_URL}/expenses`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(expenseData),
  // }).then(res => res.json());
  return Promise.resolve({ id: Date.now().toString(), ...expenseData });
};

export const approveExpense = async (expenseId: string, approverId: string) => {
  // TODO: Replace with actual API call
  return Promise.resolve({ success: true });
};

export const rejectExpense = async (expenseId: string, approverId: string, comment: string) => {
  // TODO: Replace with actual API call
  return Promise.resolve({ success: true });
};

export const processOCR = async (file: File) => {
  // Mock OCR processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        amount: '125.50',
        date: new Date().toISOString().split('T')[0],
        description: 'Restaurant Bill - Business Lunch',
        category: 'Food',
        vendor: 'The Gourmet Kitchen',
      });
    }, 2000);
  });
};
