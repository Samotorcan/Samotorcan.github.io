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

scene.debugLayer.show();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});

// just create one box for one voxel from map
// if a box is surrounded by other boxes on all sides don't create it
let createVoxel = (position) => {
    let voxel = BABYLON.MeshBuilder.CreateBox('singleBox', { size: 1 }, scene);
    voxel.position.copyFrom(position);

    return voxel;
};

let hasMapVoxel = (map, x, y, z) => map[y * 16 * 16 + z * 16 + x] > 0;

for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
        for (let z = 0; z < 16; z++) {
            if (hasMapVoxel(map, x, y, z)) {
                // if the box is on the side we always create it
                let isSideBox = x == 0 || x == 15 || y == 0 || y == 15 || z == 0 || z == 15;
                let isVisible = false;

                // if it's not a side box check neighbour boxes
                if (!isSideBox) {
                    // left
                    isVisible |= !hasMapVoxel(map, x - 1, y, z);
                    // right
                    isVisible |= !hasMapVoxel(map, x + 1, y, z);
                    // bottom
                    isVisible |= !hasMapVoxel(map, x, y - 1, z);
                    // top
                    isVisible |= !hasMapVoxel(map, x, y + 1, z);
                    // front
                    isVisible |= !hasMapVoxel(map, x, y, z - 1);
                    // back
                    isVisible |= !hasMapVoxel(map, x, y, z + 1);
                }
                else {
                    isVisible = true;
                }

                if (isVisible)
                    createVoxel(new BABYLON.Vector3(x, y, z));
            }
        }
    }
}

// position the camera so we see the full map
camera.targetScreenOffset.x = -10;
camera.targetScreenOffset.y = -5;

camera.beta -= 0.2;
camera.radius += 8;
