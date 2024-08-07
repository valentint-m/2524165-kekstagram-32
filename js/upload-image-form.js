import { BUTTON_CLOSE_MODULE_WINDOW, IMAGE_DESCRIPTION_MAX_LENGTH } from './constants.js';
import { resetScale } from './upload-image-scale.js';
import { initEffect, resetEffect } from './upload-image-effects.js';
import { sendData } from './api.js';
import { showSendDataErrorMessage, showSendDataSuccessMessage } from './system-modal-messages.js';

const FILE_TYPES = ['jpg', 'jpeg', 'png'];

const imgUploadElement = document.querySelector('.img-upload');
const imgUploadForm = imgUploadElement.querySelector('.img-upload__form');
const imgUploadOverlay = imgUploadElement.querySelector('.img-upload__overlay');
const imgUploadPreview = imgUploadElement.querySelector('.img-upload__preview img');
const imgUploadOverlayCloseButton = imgUploadOverlay.querySelector('.img-upload__cancel');
const imgUploadInput = imgUploadElement.querySelector('.img-upload__input');
const imgUploadSubmitButton = imgUploadElement.querySelector('.img-upload__submit');
const imgHashTagsInput = imgUploadElement.querySelector('.text__hashtags');
const imgDescriptionInput = imgUploadElement.querySelector('.text__description');
const filterPreviews = imgUploadElement.querySelectorAll('span.effects__preview');

const regExpPattern = /^#[a-zа-яё0-9]{1,19}$/i;

initEffect();

const pristine = new Pristine(imgUploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__field-wrapper--error',
});
pristine.addValidator(imgHashTagsInput, validateHashTags, getHashTagsError);
pristine.addValidator(imgDescriptionInput, validateDescription, getDescriptionError);

function validateHashTags () {
  const hashTagsStr = imgHashTagsInput.value.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!hashTagsStr) {
    return true;
  }
  const hashTagsArr = hashTagsStr.split(' ');
  const uniqueHashTagsSet = new Set(hashTagsArr);
  if (hashTagsArr.length > 5 || hashTagsArr.length !== uniqueHashTagsSet.size) {
    return false;
  }
  for (let i = 0; i < hashTagsArr.length; i++) {
    if (!hashTagsArr[i].match(regExpPattern)) {
      return false;
    }
  }
  return true;
}

function validateDescription () {
  return imgDescriptionInput.value.length <= IMAGE_DESCRIPTION_MAX_LENGTH;
}

function getHashTagsError () {
  const hashTagsStr = imgHashTagsInput.value.replace(/\s+/g, ' ').trim().toLowerCase();
  const hashTagsArr = hashTagsStr.split(' ');
  const uniqueHashTagsSet = new Set(hashTagsArr);
  if (hashTagsArr.length > 5) {
    return 'Превышено допустимое количество хэштегов.';
  }
  if (hashTagsArr.length !== uniqueHashTagsSet.size) {
    return 'Хэштеги повторяются.';
  }
  return 'Введён невалидный хештег.';
}

function getDescriptionError () {
  return 'Длина комментария больше 140 символов.';
}

function blockSubmitButton () {
  imgUploadSubmitButton.disabled = true;
}

function unblockSubmitButton () {
  imgUploadSubmitButton.disabled = false;
}

function onImgUploadFormSubmit (evt) {
  evt.preventDefault();
  const data = new FormData(imgUploadForm);
  const isValidated = pristine.validate();
  if (isValidated) {
    blockSubmitButton();
    sendData(data)
      .then(() => {
        showSendDataSuccessMessage();
        closeModal();
      })
      .catch(() => showSendDataErrorMessage())
      .finally(() => unblockSubmitButton());
  }
}

imgUploadForm.addEventListener('submit', onImgUploadFormSubmit);
imgUploadInput.addEventListener('change', onImgUploadInputChange);
imgHashTagsInput.addEventListener('focus', onImgHashTagsInputFocus);
imgHashTagsInput.addEventListener('blur', onImgHashTagsInputBlur);
imgDescriptionInput.addEventListener('focus', onImgDescriptionInputFocus);
imgDescriptionInput.addEventListener('blur', onImgDescriptionInputBlur);

function onImgUploadInputChange () {
  updatePreviewPhoto();
  imgUploadOverlayCloseButton.addEventListener('click', onImgUploadOverlayCloseButtonClick);
  imgUploadOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
}

function updatePreviewPhoto () {
  const file = imgUploadInput.files[0];
  const fileName = file.name.toLowerCase();

  const matches = FILE_TYPES.some((type) => fileName.endsWith(type));
  if (matches) {
    const imagePath = URL.createObjectURL(file);
    imgUploadPreview.src = imagePath;
    filterPreviews.forEach((preview) => {
      preview.style.backgroundImage = `url(${imagePath})`;
    });
  }
}

function closeModal () {
  imgUploadInput.value = '';
  imgHashTagsInput.value = '';
  imgDescriptionInput.value = '';
  imgUploadOverlay.classList.add('hidden');
  imgUploadOverlayCloseButton.removeEventListener('click', onImgUploadOverlayCloseButtonClick);
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
  pristine.reset();
  resetScale();
  resetEffect();
}

function onImgUploadOverlayCloseButtonClick () {
  closeModal();
}

function onDocumentKeydown (evt) {
  const sendDataErrorElement = document.querySelector('.error');
  const sendDataSuccessElement = document.querySelector('.success');
  if (evt.key === BUTTON_CLOSE_MODULE_WINDOW && !sendDataErrorElement && !sendDataSuccessElement) {
    evt.preventDefault();
    closeModal();
  }
}

function onImgHashTagsInputFocus () {
  imgHashTagsInput.addEventListener('keydown', onInputKeydown);
}

function onImgHashTagsInputBlur () {
  imgHashTagsInput.removeEventListener('keydown', onInputKeydown);
}

function onImgDescriptionInputFocus () {
  imgDescriptionInput.addEventListener('keydown', onInputKeydown);
}

function onImgDescriptionInputBlur () {
  imgDescriptionInput.removeEventListener('keydown', onInputKeydown);
}

function onInputKeydown (evt) {
  evt.stopPropagation();
}


