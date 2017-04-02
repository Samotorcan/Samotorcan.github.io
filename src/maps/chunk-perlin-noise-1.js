let map = {};

(() => {
    const width = 8;
    const height = 8;
    const depth = 8;

    let perlinNoiseGenerator = new ClassicalNoise();

    const createChunk = (chunkX, chunkY, chunkZ) => {
        let chunk = [];

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                for (let z = 0; z < 16; z++) {
                    chunk[y * 16 * 16 + z * 16 + x] = perlinNoiseGenerator.noise((x + (chunkX * 16)) / (16 * width), (y + (chunkY * 16)) / (16 * height), (z + (chunkZ * 16)) / (16 * depth)) > 0 ? 0 : 1;
                }
            }
        }

        return chunk;
    };

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                map[`${x}-${y}-${z}`] = { x, y, z, chunkData: createChunk(x, y, z) };
            }
        }
    }
})();