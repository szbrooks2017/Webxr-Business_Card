async function init(){
    async function activateXR() {
        // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        const gl = canvas.getContext("webgl", {xrCompatible: true});
      
      //   // To be continued in upcoming steps.
      //   const scene = new THREE.Scene();
      
      // // The cube will have a different color on each side.
      // const materials = [
      //   new THREE.MeshBasicMaterial({color: 0xff0000}),
      //   new THREE.MeshBasicMaterial({color: 0x0000ff}),
      //   new THREE.MeshBasicMaterial({color: 0x00ff00}),
      //   new THREE.MeshBasicMaterial({color: 0xff00ff}),
      //   new THREE.MeshBasicMaterial({color: 0x00ffff}),
      //   new THREE.MeshBasicMaterial({color: 0xffff00})
      // ];
      
      // this might need to be added
      // // Create the cube and add it to the demo scene.
      // const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.2, 0.2, 0.2), materials);
      // cube.position.set(1, 1, 1);
      // scene.add(cube);
      
      // adding for hit test
      const scene = new THREE.Scene();
      // adding for debug
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.x = 13;
      directionalLight.position.y = 10;
      directionalLight.position.z = 10;
      
      // directionalLight.position.set(20, 20, 20);
      
      // gui for debug
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
      // const session = await navigator.xr.requestSession("immersive-ar");
      
      // session for hit test
      const session = await navigator.xr.requestSession("immersive-ar", {requiredFeatures: ['hit-test']});
      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
      });
      
      // A 'local' reference space has a native origin that is located
      // near the viewer's position at the time the session was created.
      const referenceSpace = await session.requestReferenceSpace('local');
      
      // Create another XRReferenceSpace that has the viewer as the origin.
      const viewerSpace = await session.requestReferenceSpace('viewer');
      // Perform hit testing using the viewer as origin.
      const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
      
      // Load GLTF models
      // Use the model loader from the previous step to load a targeting reticle and a sunflower from the web.
      const loader = new THREE.GLTFLoader();
      let reticle;
      loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", function(gltf) {
        reticle = gltf.scene;
        reticle.visible = false;
        scene.add(reticle);
      })
      
      let flower;
      loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/sunflower/sunflower.gltf", function(gltf) {
        flower = gltf.scene;
      });
      
      // Make a new sunflower appear when the user taps on the screen by adding this code during initialization
      session.addEventListener("select", (event) => {
        if (flower) {
          const clone = flower.clone();
          clone.position.copy(reticle.position);
          scene.add(clone);
        }
      });
      
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
      
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0 && reticle) {
              const hitPose = hitTestResults[0].getPose(referenceSpace);
              reticle.visible = true;
              reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
              reticle.updateMatrixWorld(true);
          }
          // Render the scene with THREE.WebGLRenderer.
          renderer.render(scene, camera)
        }
      }
      session.requestAnimationFrame(onXRFrame);
    }
//     const isArSessionSupported =
//       navigator.xr &&
//       navigator.xr.isSessionSupported &&
//       await navigator.xr.isSessionSupported("immersive-ar");
//     if (isArSessionSupported){ 
//         document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)}
}
