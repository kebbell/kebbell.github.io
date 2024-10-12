let player;
let dragging;
let interval;
let albums = ['OB12BslMI3Q', 'X4YlPELZKdQ'];
let album = albums[Math.floor(Math.random() * albums.length)];

let id = window.location.search ? window.location.search.substring(1) : album;

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  let src = `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&autoplay=0&rel=0&modestbranding=1&version=3`;
  document.querySelector('#player').setAttribute('src', src);

  player = new YT.Player('player', {
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  let volume = player.getVolume();
  document.querySelector('#volume .slider').value = volume;

  if (window.location.search) {
    document.title = 'Needledrop: ' + player.getVideoData().title;
  }

  document.querySelector('#power').addEventListener('click', () => {
    let turntable = document.querySelector('#turntable');

    turntable.classList.toggle('play');
    turntable.classList.toggle('pause');

    if (turntable.classList.contains('play')) {
      startPlayback();
    } else {
      player.pauseVideo();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;

    switch(e.keyCode) {
      case 32:
        document.querySelector('#power').click();
        break;
      case 51:
        document.querySelector('#speed33').click();
        break;
      case 52:
        document.querySelector('#speed45').click();
        break;
      case 84:
        document.querySelector('#track').click();
        break;
    }
  });

  document.querySelector('#track').addEventListener('click', () => {
    let url = prompt('Enter a YouTube URL:', 'https://www.youtube.com/watch?v=' + id);

    if (url) {
      let newID = getYouTubeID(url);

      if (newID && newID !== id) {
        window.location.href = './?' + newID;
      }
    }
  });

  document.querySelectorAll('#speed .button').forEach((button) => {
    button.addEventListener('click', (e) => {

      if (e.target.id == 'speed33') {
        document.body.setAttribute('data-speed', '33');
        player.setPlaybackRate(1);
      } else {
        document.body.setAttribute('data-speed', '45');
        player.setPlaybackRate(1.35);
      }

      if (turntable.classList.contains('play')) {
        let percentage = getPercentage();
        let duration = player.getDuration();
        let remaining = duration * (1 - percentage);
        player.playVideo();
        setArmAnimation(remaining);
      }
    }, true);
  });

  document.querySelector('#volume .slider').addEventListener('input', (e) => {
    let volume = e.target.value;
    player.setVolume(volume);
  });

  document.addEventListener('mousedown', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchstart', dragStart);
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('touchmove', drag);
}

function getPercentage() {
  let head = document.querySelector('#arm .head');
  let rect = head.getBoundingClientRect();
  let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let needle = {
    x: rect.left + scrollLeft + head.offsetWidth / 2,
    y: rect.top + scrollTop + head.offsetHeight + 10
  }

  let record = document.querySelector('#record');
  let center = {
    x: record.offsetLeft + record.offsetWidth / 2,
    y: record.offsetTop + record.offsetHeight / 2
  }

  let distance = getDistance(center, needle);
  let angle = getAngle(center, needle);

  let label = document.querySelector('#label');
  let startBuffer = 10;
  let radiusRecord = record.offsetWidth / 2 - startBuffer;
  let radiusLabel = label.offsetWidth / 2 + 15;
  let percentage = ((radiusRecord - distance) / (radiusRecord - radiusLabel)) + (angle / 36000);

  percentage = Math.min(percentage, 1);

  return percentage;
}

function getDistance(center, needle) {
  return Math.sqrt(Math.pow(center.x - needle.x, 2) + Math.pow(center.y - needle.y, 2));
}

function getAngle(center, needle) {
  let record = document.querySelector('#record');
  let rotation = getRotation(record);
  let angle = atan2Degrees(needle.y - center.y, needle.x - center.x);

  angle = angle - rotation;
  if (angle < 0) angle += 360;

  return angle;
}

function getRotation(element) {
  let matrix = window.getComputedStyle(element, null).getPropertyValue('transform');

  let values = matrix.split('(')[1];
  values = values.split(')')[0];
  values = values.split(',');

  let a = values[0];
  let b = values[1];

  let rotation = atan2Degrees(b, a);

  return rotation;
}

function atan2Degrees(y, x) {
  let angle = Math.atan2(y, x) * (180/Math.PI);
  if (angle < 0) angle += 360;

  return angle;
}

function dragStart(e) {
  let head = document.querySelector('#arm .head');
  if (e.target !== head) return;
  dragging = true;

  let root = document.documentElement;
}

function drag(e) {
  if (!dragging) return;

  e.preventDefault();
  let x;
  let arm;

  let base = document.querySelector('#arm');
  let foot = {
    x: base.offsetLeft + base.offsetWidth / 2,
    y: base.offsetTop + base.offsetHeight / 2
  }

  if (e.type === 'touchmove') {
    arm = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  } else {
    arm = {
      x: e.clientX,
      y: e.clientY
    }
  }

  let angle = atan2Degrees(foot.y - arm.y, foot.x - arm.x) - 270;
  angle = Math.max(0, Math.min(angle, 45));

  setRotation(angle);
}

function dragEnd(e) {
  if (!dragging) return;
  e.preventDefault();

  dragging = false;
  startPlayback();
}

function setRotation(angle) {
  let root = document.documentElement;
  root.style.setProperty('--arm-transition-duration', '0');
  root.style.setProperty('--arm-angle', angle + 'deg'); 
}

function startPlayback() {
  let percentage = getPercentage();
  let head = document.querySelector('#arm .head');

  head.classList.remove('pulse');

  if (percentage >= -.1 && percentage <=1) {
    let duration = player.getDuration();
    let time = duration * percentage;
    player.seekTo(time, true);
    player.pauseVideo();

    if (turntable.classList.contains('play')) {
      let remaining = duration * (1 - percentage);
      player.playVideo();
      setArmAnimation(remaining);
    }
  } else if (percentage < -.1) {
    player.seekTo(0, true);
    player.pauseVideo();
    head.classList.add('pulse');
  }
}

function load(id) {
  turntable.classList.remove('play');
  turntable.classList.add('pause');

  player.loadVideoById(id);
  player.seekTo(0, false);
  player.pauseVideo();

  let root = document.documentElement;
  root.style.setProperty('--arm-angle', '0deg');
  root.style.setProperty('--arm-transition-duration', 0);
}

function setArmAnimation(remaining) {
  let speed = document.body.getAttribute('data-speed');
  let root = document.documentElement;

  if (speed == '45') {
    remaining *= .65;
  }

  root.style.setProperty('--arm-transition-duration', remaining + 's');

  if (remaining > 0) {
    clearInterval(interval);
    root.style.setProperty('--arm-angle', '45deg');
  } else {
    interval = setInterval(setArmAnimation(remaining), 500);
  }
}

function getYouTubeID(url){
  url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : false;
}
