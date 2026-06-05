const axios = require('axios');
axios.get('https://web-api.polosim.com/api/V2/regions/18', { headers: { 'Accept': 'application/json', 'x-lang': 'en' } })
  .then(res => {
     console.log('Region:', res.data?.data || res.data);
  })
  .catch(err => console.error(err.message));
