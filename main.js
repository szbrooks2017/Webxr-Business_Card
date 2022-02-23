var button = document.getElementById("webgl");

button.onclick = function(){
    console.log("opened");
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", {xrCompatible: true});
};