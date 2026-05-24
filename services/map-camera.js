// ======================
// CAMERA SETTINGS
// ======================

let followUser = true;

let lastInteraction = 0;

const FOLLOW_TIMEOUT = 5000;

// ======================
// BUTTON FOLLOW
// ======================

export function toggleFollowMode() {

  followUser = !followUser;

  const btn = document.getElementById('follow-btn');

  if (followUser) {

    btn.classList.add('active');

  } else {

    btn.classList.remove('active');

  }
}

// ======================
// USER INTERACTION
// ======================

export function setupCameraListeners(map) {

  map.on('dragstart', () => {

    followUser = false;

    lastInteraction = Date.now();

    updateFollowButton();

  });

  map.on('zoomstart', () => {

    followUser = false;

    lastInteraction = Date.now();

    updateFollowButton();

  });
}

// ======================
// UPDATE CAMERA
// ======================

export function updateCamera(
  map,
  lng,
  lat,
  heading = 0,
  speed = 0
) {

  const now = Date.now();

  if (!followUser) {

    if (now - lastInteraction > FOLLOW_TIMEOUT) {

      followUser = true;

      updateFollowButton();

    } else {

      return;
    }
  }

  const zoom = getZoomBySpeed(speed);

  map.easeTo({

    center: [lng, lat],

    zoom,

    bearing: heading,

    pitch: 55,

    duration: 1000,

    essential: true
  });
}

// ======================
// DYNAMIC ZOOM
// ======================

function getZoomBySpeed(speed) {

  const kmh = speed * 3.6;

  if (kmh < 5) return 17.5;

  if (kmh < 20) return 16.5;

  if (kmh < 40) return 15.5;

  if (kmh < 70) return 14.5;

  return 13.5;
}

// ======================
// BUTTON STATE
// ======================

function updateFollowButton() {

  const btn = document.getElementById('follow-btn');

  if (!btn) return;

  if (followUser) {

    btn.classList.add('active');

  } else {

    btn.classList.remove('active');
  }
}