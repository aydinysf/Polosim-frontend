const axios = require('axios');
axios.get('https://web-api.polosim.com/api/V2/products?region_id=18&data_amount=1GB', { headers: { 'Accept': 'application/json' } })
  .then(res => {
     console.log('Filtered products length:', res.data?.data?.length);
  })
  .catch(err => console.error(err.message));
