let perlinNoiseGenerator = new ClassicalNoise();

let map = [];

for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
        for (let z = 0; z < 16; z++) {
            map[y * 16 * 16 + z * 16 + x] = perlinNoiseGenerator.noise(x / 16, y / 16, z / 16) > 0 ? 0 : 1;
        }
    }
}