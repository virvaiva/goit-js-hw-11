import PicturesAPI from './pixabayApi';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { createImagesMarkup } from './markup.js';

const refs = {
  formEl: document.querySelector('#search-form'),
  inputEl: document.querySelector('#search-form > input'),
  galleryContainer: document.querySelector('.gallery'),
  reviewerEl: document.querySelector('.reviewer'),
};

let totalPages = 0;

refs.formEl.addEventListener('submit', onFormSubmit);
refs.galleryContainer.addEventListener('click', onGalleryClick);

function onFormSubmit(event) {
  event.preventDefault();
  searchPicturers();
}

function onGalleryClick(event) {
  event.preventDefault();
}

const picturesSerchAPI = new PicturesAPI();

// Пошук

function searchPicturers() {
  if (!refs.inputEl.value.trim()) {
    Notify.warning('Please enter a query');
  }
  picturesSerchAPI.query = refs.inputEl.value.trim();

  picturesSerchAPI.resetPage();
  clearMurkup();
  reviewer.observe(refs.reviewerEl);

  if (picturesSerchAPI.query) {
    picturesSerchAPI
      .fetchPhotos(picturesSerchAPI.query)
      .then(data => {
        if (!data.hits.length) {
          Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.',
            {
              position: 'left-top',
              fontSize: '20px',
            }
          );
          return;
        }

        appendImagesMarkup(data);
        const totalResults = data.totalHits;
        totalPages = Math.ceil(totalResults / 40);
        Notify.success(`Hooray! We found ${totalResults} images.`, {
          position: 'right-top',
          fontSize: '25px',
        });
        if (PicturesAPI.pages === totalPages) {
          reviewer.unobserve(refs.reviewerEl);
        }
      })

      .catch(Error);
  }
}

function Error() {
  error => {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        position: 'right-top',
        fontSize: '20px',
      }
    );
  };
}

// Оформление

function appendImagesMarkup(data) {
  refs.galleryContainer.insertAdjacentHTML(
    'beforeend',
    createImagesMarkup(data.hits)
  );
  lightbox.refresh();
}

function clearMurkup() {
  refs.galleryContainer.innerHTML = '';
}

var lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionSelector: 'img',
  captionsData: 'alt',
});

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.boundingClientRect.bottom > 300) {
      picturesSerchAPI.icrementPage();
      if (PicturesAPI.pages === totalPages) {
        reviewer.unobserve(refs.reviewerEl);
      }
      picturesSerchAPI.fetchPhotos().then(images => {
        appendImagesMarkup(images);
        lightbox.refresh();
      });
    }
  });
};

const reviewer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});
