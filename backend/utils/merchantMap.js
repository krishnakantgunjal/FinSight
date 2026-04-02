// Keyword -> category mapping. Add more as needed.
const MERCHANT_MAP = [
  { keywords: ['swiggy','zomato','blinkit','zepto','dunzo'], category: 'Food' },
  { keywords: ['ola','uber','rapido','yulu','irctc','makemytrip'], category: 'Transport' },
  { keywords: ['netflix','spotify','amazon prime','hotstar','youtube'], category: 'Entertainment' },
  { keywords: ['amazon','flipkart','myntra','ajio','meesho','nykaa'], category: 'Shopping' },
  { keywords: ['apollo','medplus','netmeds','1mg','hospital','clinic'], category: 'Health' },
  { keywords: ['electricity','airtel','jio','bsnl','broadband','gas'], category: 'Utilities' },
  { keywords: ['rent','landlord','housing','pglife'], category: 'Rent' },
];

exports.guessCategory = (description = '') => {
  const lower = description.toLowerCase();
  for (const entry of MERCHANT_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.category;
  }
  return 'Other';
};
