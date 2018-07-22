function playSoundPort(elmApp) {
  elmApp.ports.playSound.subscribe(function (arg) {

    var audio = new Audio(arg.url);
    audio.volume = arg.volume;
    var promise = audio.play();

    if (promise !== undefined) {
      promise.then(_ => {
        // Autoplay started!
      }).catch(error => {
        // Autoplay was prevented.
        // Show a "Play" button so that user can start playback.
      });
    }
    
  });
}
