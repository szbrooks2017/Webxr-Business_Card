async function init(){
    const isArSessionSupported =
      navigator.xr &&
      navigator.xr.isSessionSupported &&
      await navigator.xr.isSessionSupported("immersive-ar");
    if (isArSessionSupported){ 
        document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)}
}
