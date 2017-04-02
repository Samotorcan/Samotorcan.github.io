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

// create only the sides that are needed (only vertex data so we have one mesh at the end)
let createVertexData = (rotationMatrix, x, y, z) => {
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

    vertexData.transform(rotationMatrix);

    vertexData.positions[0] += x;
    vertexData.positions[1] += y;
    vertexData.positions[2] += z;

    vertexData.positions[3] += x;
    vertexData.positions[4] += y;
    vertexData.positions[5] += z;

    vertexData.positions[6] += x;
    vertexData.positions[7] += y;
    vertexData.positions[8] += z;

    vertexData.positions[9] += x;
    vertexData.positions[10] += y;
    vertexData.positions[11] += z;

    return vertexData;
};

let createFrontVertexData = (x, y, z) => createVertexData(BABYLON.Matrix.Identity(), x, y, z);
let createBackVertexData = (x, y, z) => createVertexData(new BABYLON.Matrix.RotationX(Math.PI), x, y, z);
let createLeftVertexData = (x, y, z) => createVertexData(new BABYLON.Matrix.RotationY(Math.PI / 2), x, y, z);
let createRightVertexData = (x, y, z) => createVertexData(new BABYLON.Matrix.RotationY(-Math.PI / 2), x, y, z);
let createTopVertexData = (x, y, z) => createVertexData(new BABYLON.Matrix.RotationX(Math.PI / 2), x, y, z);
let createBottomVertexData = (x, y, z) => createVertexData(new BABYLON.Matrix.RotationX(-Math.PI / 2), x, y, z);

let hasMapVoxel = (map, x, y, z) => map[y * 16 * 16 + z * 16 + x] > 0;

let vertexData = new BABYLON.VertexData();

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
                    vertexData.merge(createFrontVertexData(x, y, z));

                if (hasBack)
                    vertexData.merge(createBackVertexData(x, y, z));

                if (hasLeft)
                    vertexData.merge(createLeftVertexData(x, y, z));

                if (hasRight)
                    vertexData.merge(createRightVertexData(x, y, z));

                if (hasBottom)
                    vertexData.merge(createBottomVertexData(x, y, z));

                if (hasTop)
                    vertexData.merge(createTopVertexData(x, y, z));
            }
        }
    }
}

let mesh = new BABYLON.Mesh('map', scene);
vertexData.applyToMesh(mesh);

// position the camera so we see the full map
camera.targetScreenOffset.x = -10;
camera.targetScreenOffset.y = -5;

camera.beta -= 0.2;
camera.radius += 8;
