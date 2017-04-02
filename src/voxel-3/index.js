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

// create only the sides that are needed
let createFrontMesh = (x, y, z) => {
    let vertexData = new BABYLON.VertexData();

    vertexData.positions = [
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        - 0.5, -0.5, -0.5
    ];

    vertexData.normals = [
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1
    ];

    vertexData.indices = [
        0, 2, 1,
        0, 3, 2
    ];

    let mesh = new BABYLON.Mesh('side', scene);
    vertexData.applyToMesh(mesh);

    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;

    return mesh;
};

let createBackMesh = (x, y, z) => {
    let mesh = createFrontMesh(x, y, z);
    mesh.rotation.x = Math.PI;

    return mesh;
}

let createLeftMesh = (x, y, z) => {
    let mesh = createFrontMesh(x, y, z);
    mesh.rotation.y = Math.PI / 2;

    return mesh;
}

let createRightMesh = (x, y, z) => {
    let mesh = createFrontMesh(x, y, z);
    mesh.rotation.y = -Math.PI / 2;

    return mesh;
}

let createTopMesh = (x, y, z) => {
    let mesh = createFrontMesh(x, y, z);
    mesh.rotation.x = Math.PI / 2;

    return mesh;
}

let createBottomMesh = (x, y, z) => {
    let mesh = createFrontMesh(x, y, z);
    mesh.rotation.x = -Math.PI / 2;

    return mesh;
}

let hasMapVoxel = (map, x, y, z) => map[y * 16 * 16 + z * 16 + x] > 0;

for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
        for (let z = 0; z < 16; z++) {
            if (hasMapVoxel(map, x, y, z)) {
                let hasFront = z == 0 || !hasMapVoxel(map, x, y, z - 1);
                let hasBack = z == 15 || !hasMapVoxel(map, x, y, z + 1);

                let hasLeft = x == 0 || !hasMapVoxel(map, x - 1, y, z);
                let hasRight = x == 15 || !hasMapVoxel(map, x + 1, y, z);

                let hasBottom = y == 0 || !hasMapVoxel(map, x, y - 1, z);
                let hasTop = y == 15 || !hasMapVoxel(map, x, y + 1, z);

                if (hasFront)
                    createFrontMesh(x, y, z);

                if (hasBack)
                    createBackMesh(x, y, z);

                if (hasLeft)
                    createLeftMesh(x, y, z);

                if (hasRight)
                    createRightMesh(x, y, z);

                if (hasBottom)
                    createBottomMesh(x, y, z);

                if (hasTop)
                    createTopMesh(x, y, z);
            }
        }
    }
}

// position the camera so we see the full map
camera.targetScreenOffset.x = -10;
camera.targetScreenOffset.y = -5;

camera.beta -= 0.2;
camera.radius += 8;
