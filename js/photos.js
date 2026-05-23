// ================================
// PHOTOS.JS
// ================================

async function readFilesAsBase64(files){

  return Promise.all(

    [...files].map(file => {

      return new Promise(resolve => {

        const reader = new FileReader();

        reader.onload = () => {

          resolve(reader.result);

        };

        reader.readAsDataURL(file);

      });

    })

  );

}


// ================================
// RENDER PREVIEWS
// ================================

async function renderPhotoPreviews(){

  if(currentIndex >= routeReport.length)
    return;

  const entry =
    routeReport[currentIndex];

  const deliveryPreview =
    document.getElementById(
      'deliveryPreview'
    );

  const pickupPreview =
    document.getElementById(
      'pickupPreview'
    );

  if(!deliveryPreview || !pickupPreview)
    return;

  deliveryPreview.innerHTML = '';

  pickupPreview.innerHTML = '';

  // ================================
  // DELIVERY
  // ================================

  for(const photoId of entry.deliveryPhotos){

    const photo =
      await getPhoto(photoId);

    if(!photo) continue;

    const img =
      document.createElement('img');

    img.src = photo.image;

    img.className =
      'preview-thumb';

    deliveryPreview.appendChild(img);

  }

  // ================================
  // PICKUP
  // ================================

  for(const photoId of entry.pickupPhotos){

    const photo =
      await getPhoto(photoId);

    if(!photo) continue;

    const img =
      document.createElement('img');

    img.src = photo.image;

    img.className =
      'preview-thumb';

    pickupPreview.appendChild(img);

  }

}


// ================================
// DELIVERY INPUT
// ================================

document
.getElementById('deliveryPhotosInput')
.addEventListener('change', async (e)=>{

  if(currentIndex >= routeReport.length)
    return;

  const images =
    await readFilesAsBase64(
      e.target.files
    );

  const imageIds = [];

  for(const image of images){

    const id =
      `delivery_${Date.now()}_${Math.random()}`;

    await savePhoto({

      id,

      image

    });

    imageIds.push(id);

  }

  routeReport[currentIndex]
    .deliveryPhotos
    .push(...imageIds);

  renderPhotoPreviews();

  saveAppState();

});


// ================================
// PICKUP INPUT
// ================================

document
.getElementById('pickupPhotosInput')
.addEventListener('change', async (e)=>{

  if(currentIndex >= routeReport.length)
    return;

  const images =
    await readFilesAsBase64(
      e.target.files
    );

  const imageIds = [];

  for(const image of images){

    const id =
      `pickup_${Date.now()}_${Math.random()}`;

    await savePhoto({

      id,

      image

    });

    imageIds.push(id);

  }

  routeReport[currentIndex]
    .pickupPhotos
    .push(...imageIds);

  renderPhotoPreviews();

  saveAppState();

});
