import { drawMiniatures } from './draw-miniatures.js';
import { getData } from './api.js';
import { showGetDataErrorMessage } from './system-modal-messages.js';
import { getPhotos } from './draw-full-images.js';
import './upload-image-form.js';

getData()
  .then((photos) => {
    drawMiniatures(photos);
    getPhotos(photos);
  })
  .catch(() => showGetDataErrorMessage());

