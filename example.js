// import axios from './dist/index.js';
import FetchAxios from './dist/fetchAxios.js';

const axios = new FetchAxios();


axios.get('https://jsonplaceholder.typicode.com/todos/1', {responseType: 'arraybuffer'}).then(res => console.log(res.data.toString())).catch(console.error)