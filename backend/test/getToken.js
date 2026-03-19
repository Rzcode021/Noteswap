const axios = require('axios');

// npm install axios if not installed
const getToken = async () => {
  const res = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAavbli-R24dZtg8TkTAkklg4Z8Nx_BLjE`,
    {
      email: 'test@noteswap.com',
      password: 'test1234',
      returnSecureToken: true,
    }
  );
  console.log('\n✅ Your idToken:\n');
  console.log(res.data.idToken);
};

getToken();