
async function activateXR() {
// Add a canvas element and initialize a WebGL context that is compatible with WebXR.
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl", {xrCompatible: true});

  // create a scene to add objects to
  const scene = new THREE.Scene();
  // add lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight.position.set(10, 15, 10);
  scene.add(directionalLight);
  // Set up the WebGLRenderer, which handles rendering to the session's base layer.
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas: canvas,
    context: gl
  });
  renderer.autoClear = false;
  
  // The API directly updates the camera matrices.
  // Disable matrix auto updates so three.js doesn't attempt
  // to handle the matrices independently.
  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = false;

// Initialize a WebXR session using "immersive-ar".
const session = await navigator.xr.requestSession("immersive-ar");
session.updateRenderState({
  baseLayer: new XRWebGLLayer(session, gl)
});

// A 'local' reference space has a native origin that is located
// near the viewer's position at the time the session was created.
const referenceSpace = await session.requestReferenceSpace('local');

// add objects here
var box = getBox(1, 1, 1);

// set positions
box.postion.set(3, 2, 2);
scene.add(box);
// Create a render loop that allows us to draw on the AR view.
const onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    session.requestAnimationFrame(onXRFrame);
  
    // Bind the graphics framebuffer to the baseLayer's framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
  
    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(referenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];
  
      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height)
  
      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix)
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);
  
      // Render the scene with THREE.WebGLRenderer.
      renderer.render(scene, camera)
    }
  }
  session.requestAnimationFrame(onXRFrame);
}

function getBox(w, h, d) {
	var geometry = new THREE.BoxGeometry(w, h, d);
	var material = new THREE.MeshPhongMaterial({
		color: 'rgb(120, 120, 120)'
	});
	var mesh = new THREE.Mesh(
		geometry,
		material 
	);
	mesh.castShadow = true;

	return mesh;
}
//     const isArSessionSupported =
//       navigator.xr &&
//       navigator.xr.isSessionSupported &&
//       await navigator.xr.isSessionSupported("immersive-ar");
//     if (isArSessionSupported){ 
//         document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)}

