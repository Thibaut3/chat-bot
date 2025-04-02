(() => {
  let width = 320;
  let height = 0;
  let streaming = false;
  let video = null;
  let canvas = null;
  let startButton = null;
  let currentStream = null;
  let useFrontCamera = true;

  // Nouvelle fonction pour démarrer le flux vidéo
  async function startVideoStream(facingMode) {
      if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
          video: { 
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
          },
          audio: false
      };

      try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          video.srcObject = stream;
          currentStream = stream;
          await video.play();
      } catch (err) {
          console.error(`Erreur d'accès à la caméra: ${err}`);
      }
  }

  // Fonction de basculement caméra avant/arrière
  function switchCamera() {
      useFrontCamera = !useFrontCamera;
      const facingMode = useFrontCamera ? 'user' : 'environment';
      startVideoStream(facingMode);
      video.style.transform = useFrontCamera ? 'scaleX(-1)' : 'none';
  }

  function startup() {
      video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      startButton = document.getElementById('start-button');
      const switchButton = document.getElementById('switch-camera');

      // Démarrer avec la caméra avant par défaut
      startVideoStream('user');

      switchButton.addEventListener('click', switchCamera);

      // Configuration du redimensionnement vidéo
      video.addEventListener('canplay', () => {
          if (!streaming) {
              height = video.videoHeight / (video.videoWidth / width);
              video.setAttribute('width', width);
              video.setAttribute('height', height);
              canvas.setAttribute('width', width);
              canvas.setAttribute('height', height);
              streaming = true;
          }
      }, false);

      startButton.addEventListener('click', (ev) => {
          takePicture();
          ev.preventDefault();
      });
  }

    function clearPhoto() {
      const context = canvas.getContext("2d");
      context.fillStyle = "#AAA";
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      const data = canvas.toDataURL("image/png");
    }

    function takePicture() {
      const context = canvas.getContext("2d");
      if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
  
        const data = canvas.toDataURL("image/png");
      } else {
        clearPhoto();
      }
    }
  
    window.addEventListener("load", startup, false);
  })();

document.getElementById('process-button').addEventListener('click', async () => {
  const canvas = document.getElementById('canvas');
  const text = document.getElementById('user-text').value;
  const responseDiv = document.getElementById('api-response');

  const button = document.getElementById('process-button');
  const loader = document.querySelector('.loader');
  const progressBar = document.querySelector('.progress-bar');
  const buttonText = document.querySelector('.button-text');
  
  // Désactiver le bouton
  button.disabled = true;
  buttonText.textContent = 'Traitement en cours...';
  loader.style.display = 'block';
  progressBar.style.width = '100%';

  try {
    // Conversion en base64
    const imageData = canvas.toDataURL('image/png');
    
    // Envoi au backend
    const response = await fetch('/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        text: text
      })
    });

    const data = await response.json();
    
    if (data.error) {
      responseDiv.textContent = `Erreur: ${data.error}`;
      responseDiv.style.color = 'red';
    } else {
      responseDiv.textContent = data.response;
      responseDiv.style.color = 'black';
    }
  } catch (error) {
    console.error('Erreur:', error);
    responseDiv.textContent = 'Une erreur est survenue';
    responseDiv.style.color = 'red';

  } finally {
    // Réactiver le bouton
    button.disabled = false;
    buttonText.textContent = 'Valider';
    loader.style.display = 'none';
    progressBar.style.width = '0%';
  }
});
