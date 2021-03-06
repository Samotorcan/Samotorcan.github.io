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
let createVertexData = (rotationMatrix, x, y, z, width = 1, height = 1) => {
    let vertexData = new BABYLON.VertexData();

    vertexData.positions = [
        -0.5, -0.5 + height, -0.5,
        -0.5 + width, -0.5 + height, -0.5,
        -0.5 + width, -0.5, -0.5,
        -0.5, -0.5, -0.5
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

    vertexData.uvs = [
        0, height,
        width, height,
        width, 0,
        0, 0
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

let createFrontVertexData = (x, y, z, width, height) => createVertexData(BABYLON.Matrix.Identity(), x, y, z, width, height);
let createBackVertexData = (x, y, z, width, height) => createVertexData(new BABYLON.Matrix.RotationX(Math.PI), x, y, z, width, height);
let createLeftVertexData = (x, y, z, width, height) => createVertexData(new BABYLON.Matrix.RotationY(Math.PI / 2), x, y, z, width, height);
let createRightVertexData = (x, y, z, width, height) => createVertexData(new BABYLON.Matrix.RotationY(-Math.PI / 2), x, y, z, width, height);
let createTopVertexData = (x, y, z, width, height) => createVertexData(new BABYLON.Matrix.RotationX(Math.PI / 2), x, y, z, width, height);
let createBottomVertexData = (x, y, z, width, height) => createVertexData(new BABYLON.Matrix.RotationX(-Math.PI / 2), x, y, z, width, height);

let getVoxel = (chunk, x, y, z) => chunk[y * 16 * 16 + z * 16 + x];
let clearVoxel = (chunk, x, y, z, bitIndex) => { chunk[y * 16 * 16 + z * 16 + x] &= ~(1 << bitIndex); };
let hasMapVoxel = (chunk, x, y, z) => getVoxel(chunk, x, y, z) > 0;

let hasFrontSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (z == 0 && (map[`${chunkX}-${chunkY}-${chunkZ - 1}`] == null || !hasMapVoxel(map[`${chunkX}-${chunkY}-${chunkZ - 1}`].chunkData, x, y, 15)) || z > 0 && !hasMapVoxel(chunk, x, y, z - 1)) && (getVoxel(chunk, x, y, z) & (1 << 0)) > 0;
let hasBackSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (z == 15 && (map[`${chunkX}-${chunkY}-${chunkZ + 1}`] == null || !hasMapVoxel(map[`${chunkX}-${chunkY}-${chunkZ + 1}`].chunkData, x, y, 0)) || z < 15 && !hasMapVoxel(chunk, x, y, z + 1)) && (getVoxel(chunk, x, y, z) & (1 << 1)) > 0;

let hasLeftSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (x == 0 && (map[`${chunkX - 1}-${chunkY}-${chunkZ}`] == null || !hasMapVoxel(map[`${chunkX - 1}-${chunkY}-${chunkZ}`].chunkData, 15, y, z)) || x > 0 && !hasMapVoxel(chunk, x - 1, y, z)) && (getVoxel(chunk, x, y, z) & (1 << 2)) > 0;
let hasRightSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (x == 15 && (map[`${chunkX + 1}-${chunkY}-${chunkZ}`] == null || !hasMapVoxel(map[`${chunkX + 1}-${chunkY}-${chunkZ}`].chunkData, 0, y, z)) || x < 15 && !hasMapVoxel(chunk, x + 1, y, z)) && (getVoxel(chunk, x, y, z) & (1 << 3)) > 0;

let hasBottomSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (y == 0 && (map[`${chunkX}-${chunkY - 1}-${chunkZ}`] == null || !hasMapVoxel(map[`${chunkX}-${chunkY - 1}-${chunkZ}`].chunkData, x, 15, z)) || y > 0 && !hasMapVoxel(chunk, x, y - 1, z)) && (getVoxel(chunk, x, y, z) & (1 << 4)) > 0;
let hasTopSide = (chunk, x, y, z, map, chunkX, chunkY, chunkZ) => (y == 15 && (map[`${chunkX}-${chunkY + 1}-${chunkZ}`] == null || !hasMapVoxel(map[`${chunkX}-${chunkY + 1}-${chunkZ}`].chunkData, x, 0, z)) || y < 15 && !hasMapVoxel(chunk, x, y + 1, z)) && (getVoxel(chunk, x, y, z) & (1 << 5)) > 0;

let material = new BABYLON.StandardMaterial('mainMaterial', scene);
material.diffuseTexture = BABYLON.Texture.LoadFromDataString(textures.goldBlock, null, scene);

let createChunk = (map, chunkX, chunkY, chunkZ) => {
    let vertexData = new BABYLON.VertexData();
    let data = map[`${chunkX}-${chunkY}-${chunkZ}`].chunkData.map(value => value == 1 ? 63 : 0);

    for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
            for (let z = 0; z < 16; z++) {
                let voxel = getVoxel(data, x, y, z);

                if (voxel > 0) {
                    // front side
                    if (hasFrontSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (x + width < 16 && hasFrontSide(data, x + width, y, z, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (y + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasFrontSide(data, x + nextWidth, y + height, z, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createFrontVertexData(x, y, z, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x + j, y + i, z, 0);
                            }
                        }
                    }

                    // back side
                    if (hasBackSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (x + width < 16 && hasBackSide(data, x + width, y, z, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (y + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasBackSide(data, x + nextWidth, y + height, z, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createBackVertexData(x, y + height - 1, z, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x + j, y + i, z, 1);
                            }
                        }
                    }

                    // left side
                    if (hasLeftSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (z + width < 16 && hasLeftSide(data, x, y, z + width, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (y + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasLeftSide(data, x, y + height, z + nextWidth, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createLeftVertexData(x, y, z + width - 1, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x, y + i, z + j, 2);
                            }
                        }
                    }

                    // right side
                    if (hasRightSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (z + width < 16 && hasRightSide(data, x, y, z + width, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (y + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasRightSide(data, x, y + height, z + nextWidth, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createRightVertexData(x, y, z, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x, y + i, z + j, 3);
                            }
                        }
                    }

                    // bottom side
                    if (hasBottomSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (x + width < 16 && hasBottomSide(data, x + width, y, z, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (z + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasBottomSide(data, x + nextWidth, y, z + height, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createBottomVertexData(x, y, z + height - 1, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x + j, y, z + i, 4);
                            }
                        }
                    }

                    // top side
                    if (hasTopSide(data, x, y, z, map, chunkX, chunkY, chunkZ)) {
                        let width = 1;
                        let height = 1;

                        // find width
                        while (x + width < 16 && hasTopSide(data, x + width, y, z, map, chunkX, chunkY, chunkZ))
                            width++;

                        // find height
                        let nextWidth = width;
                        while (z + height < 16) {
                            nextWidth = 0;

                            while (nextWidth < width && hasTopSide(data, x + nextWidth, y, z + height, map, chunkX, chunkY, chunkZ))
                                nextWidth++;

                            if (nextWidth == width)
                                height++;
                            else
                                break;
                        }

                        // create rectangle
                        vertexData.merge(createTopVertexData(x, y, z, width, height));

                        // mark created
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                clearVoxel(data, x + j, y, z + i, 5);
                            }
                        }
                    }
                }
            }
        }
    }

    let mesh = new BABYLON.Mesh('chunk', scene);
    vertexData.applyToMesh(mesh);

    mesh.material = material;

    mesh.position.x = chunkX * 16;
    mesh.position.y = chunkY * 16;
    mesh.position.z = chunkZ * 16;

    return mesh;
};

// create chunks from map
for (let key in map) {
    let { x, y, z } = map[key];
    
    setTimeout(() => {
        createChunk(map, x, y, z);
    }, 250);
}

// position the camera so we see the full map
camera.targetScreenOffset.x = -175;
camera.targetScreenOffset.y = 30;

camera.beta -= 0.2;
camera.radius += 300;
