let canvas = document.getElementById('main-canvas');

let engine = new BABYLON.Engine(canvas, true, { antialias: true });
let scene = new BABYLON.Scene(engine);

let camera = new BABYLON.ArcRotateCamera('mainCamera', -Math.PI / 2 + Math.PI / 4, 1.25, 25, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas);

let ambientLight = new BABYLON.HemisphericLight('ambientLight', new BABYLON.Vector3(0, 1, 0), scene);
ambientLight.specular = new BABYLON.Color3(0, 0, 0);
ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
ambientLight.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);

let sunLight = new BABYLON.DirectionalLight('sunLight', new BABYLON.Vector3(-1, -2, 1.5), scene);

let box = BABYLON.MeshBuilder.CreateBox('singleBox', { size: 5 }, scene);

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});