let ageSlider = document.querySelector('#age_slider');
let ageCounter = document.querySelector('#age_counter');

let locationTypesList = document.querySelector('#location_types');
let locationTypes = locationTypesList.getElementsByTagName('li');
let locationsText = document.querySelector('#locations_text');
let locationsList = document.querySelector('#locations_list');
let locations = locationsList.getElementsByTagName('li');
let dogeVibesList = document.querySelector('#doge_vibe_list');
let dogeVibes = dogeVibesList.getElementsByTagName('li');

let submitButton = document.querySelector('#submit_button');

function enableSubmitButton() {
  if (
    ageSlider.value == 0 ||
    !oneChecked(dogeVibes) ||
    !oneChecked(locationTypes) ||
    !oneChecked(locations)
  ) {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
}

function oneChecked(list) {
  let oneChecked = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i].firstElementChild.checked) {
      oneChecked = true;
      break;
    }
  }
  return oneChecked;
}

function filterLocations(type, display) {
  for (let i = 0; i < locations.length; i++) {
    if (locations[i].classList.contains(type)) {
      if (display) {
        locations[i].style.display = 'block';
      } else {
        locations[i].style.display = 'none';
        locations[i].firstChild.checked = false;
      }
    }
  }
}

function toggleLocationText() {
  for (let i = 0; i < locationTypes.length; i++) {
    if (locationTypes[i].firstElementChild.checked) {
      locationsText.style.display = 'none';
      return;
    }
  }
  locationsText.style.display = 'block';
}

ageSlider.addEventListener('input', () => {
  let countValue = ageSlider.value;
  countValue != 0
    ? (ageCounter.innerHTML = `0 - ${countValue}`)
    : (ageCounter.innerHTML = 'Select an age');
  enableSubmitButton();
});

dogeVibesList.addEventListener('click', e => {
  if (e.target.tagName == 'INPUT') {
    enableSubmitButton();
  }
});

locationTypesList.addEventListener('click', e => {
  if (e.target.tagName == 'INPUT') {
    filterLocations(e.target.id, e.target.checked);
    toggleLocationText();
    enableSubmitButton();
  }
});

locationsList.addEventListener('click', e => {
  if (e.target.tagName == 'INPUT') {
    enableSubmitButton();
  }
});

window.addEventListener('load', () => {
  for (let i = 0; i < locations.length; i++) {
    locations[i].style.display = 'none';
  }
  submitButton.disabled = true;
});
