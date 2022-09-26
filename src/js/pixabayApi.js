import axios from 'axios';

const KEY = '30084987-2bae9607d8c7414f71191ed2a';
const BASE_URL = 'https://pixabay.com/api/';

export default class PixabayAPI {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchPhotos() {
    const url = `${BASE_URL}?key=${KEY}&q=${this.searchQuery}&page=${this.page}&per_page=40&image_type=photo&orientation=horizontal&safesearch=true`;
    const { data } = await axios.get(url);
    return data;
  }

  icrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get currentpage() {
    return this.page;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
