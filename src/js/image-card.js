import PicturesAPI from './pixabayApi';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  formEl: document.querySelector('#search-form'),
  inputEl: document.querySelector('#search-form > input'),
  galleryContainer: document.querySelector('.gallery'),
  reviewerEl: document.querySelector('.reviewer'),
};

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

// Поиск
function searchPicturers() {
  if (!refs.inputEl.value.trim()) {
    return;
  }
  picturesSerchAPI.query = refs.inputEl.value.trim();

  reviewer.observe(refs.reviewerEl);

  picturesSerchAPI.resetPage();
  clearMurkup();

  if (picturesSerchAPI.query) {
    picturesSerchAPI
      .fetchPhotos(picturesSerchAPI.query)
      .then(data => {
        if (!data.hits.length) {
          Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.',
            {
              position: 'center',
              fontSize: '20px',
            }
          );
          return;
        }

        appendImagesMarkup(data);
        const totalResults = data.totalHits;
        Notify.success(`Hooray! We found ${totalResults} images.`, {
          position: 'right-top',
          fontSize: '25px',
        });
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

function createImagesMarkup(image) {
  return image
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a
        class="gallery__item"
        target="_self"
        rel="nofollow, noreferrer"
        title="Click to enlarge"
        loading="lazy"
        href="${largeImageURL}">
          <img class="gallery__image" src="${webformatURL}" alt="${tags}"/>
          <div class="gallery__descr">
            <p class="gallery__features">likes:<span class="gallery__values"> ${likes}</span></p>
            <p class="gallery__features">views:<span class="gallery__values"> ${views}</span></p>
            <p class="gallery__features">comments:<span class="gallery__values"> ${comments}</span></p>
            <p class="gallery__features">downloads:<span class="gallery__values"> ${downloads}</span></p>
          </div>
        </a>`;
      }
    )
    .join('');
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
