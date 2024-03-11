// import axios from './dist/index.js';
import FetchAxios from './dist/fetchAxios.js';

const axios = new FetchAxios();


axios.get('https://jsonaceholde.typicode.com').then(res => console.log(res.data.toString())).catch(console.error)