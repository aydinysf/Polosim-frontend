const axios = require('axios');

async function testPaymentMethod(method) {
  try {
    const payload = {
      payment_method: method,
      product_id: 624,
      quantity: 1,
      guest_name: "Test",
      guest_surname: "User",
      guest_email: "test@example.com",
    };
    
    // Test API URL based on docker-compose.yml NEXT_PUBLIC_API_URL
    const response = await axios.post('https://esim-projects-web-test-api.bhnrgc.easypanel.host/api/V1/checkout/execute', payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`[SUCCESS] Method '${method}' works! Response:`, response.data);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      if (error.response.data.errors && error.response.data.errors.payment_method) {
        console.log(`[FAIL] Method '${method}' invalid:`, error.response.data.errors.payment_method[0]);
        return false;
      }
      console.log(`[FAIL-OTHER 422] Method '${method}':`, error.response.data);
      return false;
    }
    console.log(`[ERROR] method '${method}':`, error.message);
    return false;
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  const methodsToTest = [
    'stripe',
    'balance',
    'wallet',
    'bank_transfer',
    'crypto'
  ];

  for (const method of methodsToTest) {
    await testPaymentMethod(method);
    await delay(1000); // 1 second delay
  }
}

runTests();
