// main.js
import { setupGround, createEnvironment, setupBuildings, setupProceduralBlocks, ROAD_NETWORK, PARKING_LOTS } from "./RoadAndGrass.js";
import Car from './Car_V4.js';
import { GenericLightManager } from "./LightManager.js";
let camera;
let pedestrianCamera;
//0. Değişken tanımı
const carColors = [
new BABYLON.Color3(0.1, 0.4, 0.8), // Mavi
new BABYLON.Color3(0.8, 0.1, 0.1), // Kırmızı
new BABYLON.Color3(0.2, 0.2, 0.2), // Füme
new BABYLON.Color3(0.9, 0.9, 0.9), // Beyaz
new BABYLON.Color3(0.1, 0.5, 0.1), // Yeşil
new BABYLON.Color3(1, 0.8, 0),     // Senin klasik sarı
new BABYLON.Color3(0.8, 0.8, 0.8), // Gümüş
new BABYLON.Color3(0.05, 0.15, 0.6), // Koyu Mavi
new BABYLON.Color3(0.9, 0.45, 0.05), // Turuncu
];
const getRandomColor = () => {
return carColors[Math.floor(Math.random() * carColors.length)];
};
// 1. Sahne, Motor ve Kamera Kurulumu
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, {antialias: false});
let sunShadowGenerator = null;
let sunLight = null;
let skyFillLight = null;
let skyMaterialRef = null;
let realTimeTimer = null;
let checkCounter = 0;
const createScene = function () {
const scene = new BABYLON.Scene(engine);
setupGround(scene);
createEnvironment(scene, 200, 5, 15); // Updated length to 200
setupBuildings(scene,5);
setupProceduralBlocks(scene,5);
// Daylight setup: clear and realistic, not foggy/horror-like.
const sun = new BABYLON.DirectionalLight( "sun ", new BABYLON.Vector3(0.08, -1.0, -0.22), scene);
sun.position = new BABYLON.Vector3(-28, 62, 46);
sun.intensity = 2.2;
sun.shadowMinZ = 1;
sun.shadowMaxZ = 230;
sun.diffuse = new  BABYLON.Color3(1.0, 0.95, 0.84);
sun.specular = new BABYLON.Color3(1.0, 0.92, 0.8);
sunLight = sun;

const skyFill = new BABYLON.HemisphericLight( "skyFill ", new BABYLON.Vector3(0, 1, 0), scene);
skyFill.intensity = 0.56;
skyFill.diffuse = new BABYLON.Color3(0.72, 0.82, 1.0);
skyFill.groundColor = new BABYLON.Color3(0.46, 0.42, 0.36) ;
skyFillLight = skyFill;

sunShadowGenerator = new BABYLON.ShadowGenerator(2048, sun);
sunShadowGenerator.usePercentageCloserFiltering = true;
sunShadowGenerator.filteringQuality  = BABYLON.ShadowGenerator.QUALITY_HIGH;
sunShadowGenerator.bias = 0.0004;
sunShadowGenerator.normalBias = 0.02;
sunShadowGenerator.darkness = 0.2;

scene.imageProcessingConfiguration.toneMappingEnabled = true;
scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure = 1.25;
scene.imageProcessingConfiguration.contrast = 1.08;
scene.imageProcessingConfiguration.vignetteEnabled = false;

// Kamera (FreeCamera ile fare/klavye kontrolü)
camera =  new BABYLON.FreeCamera( "camera1 ", new BABYLON.Vector3(0, 10, -20), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);
camera.speed = 1.0;
camera.angularSensibility = 2000;

pedestrianCamera = new BABYLON.UniversalCamera( "camera2 ", new BABYLON.Vector3(-10, 1.7, 10), scene);
pedestrianCamera.setTarget(new BABYLON.Vector3(-10, 1.3, 5));
pedestrianCamera.attachControl(canvas, false);

pedestrianCamera.checkCollisions = false;
pedestrianCamera.applyGravity = false;
pedestrianCamera.ellipsoid = new BABYLON.Vector3(0.4, 1.3, 0.4); // Character size
pedestrianCamera.speed = 0.5; // Walking  speed
pedestrianCamera.inertia = 0.0;

pedestrianCamera.angularSensibility = 1000;

pedestrianCamera.keysUp.push(87, 38);    // W, ArrowUp
pedestrianCamera.keysDown.push(83, 40);   // S, ArrowDown
pedestrianCamera.keysLeft.push(65, 37);  // A, ArrowLeft
pedestrianCamera.keysRight.push(68, 39);

scene.onBeforeRenderObservable.add(() => {
    if (scene.activeCamera === pedestrianCamera) {
        pedestrianCamera.position.y = 1.3;
    }
});

scene.activeCamera = camera;

// --- GÖKYÜZÜ AYARI (Tek 360 Resim ile D ome Efekti) ---
const skyMaterial = new BABYLON.StandardMaterial( "skyMaterial ", scene);
skyMaterial.backFaceCulling = false;
skyMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
skyMaterial.disableLighting = true;
skyMaterial.emissiveColor = new BABYLON. Color3(1, 1, 1);
skyMaterialRef = skyMaterial;

// Tek resimden küresel doku
skyMaterial.diffuseTexture = new BABYLON.Texture( "assets/sky.jpg ", scene);
skyMaterial.diffuseTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;

// Dev bir küre oluştur
const skySphere = BABYLON.MeshBuilder.CreateSphere( "skySphere ", {
    segments: 16,
    diameter: 2000
}, scene);

skySphere.material = skyMaterial;
skySphere.infiniteDistance = true;

// Light atmospheric depth for distant fade.
scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
scene.fogDensity = 0.00045;
scene.fogColor = new BABYLON.Color3(0.85, 0.91, 0.98);

// Ground/object meshes receive shadows; skip sky dome.
scene.meshes.forEach((mesh) => {
    if (mesh === skySphere) return;
    mesh.receiveShadows = true;
    if (mesh.name !== "skySphere " && mesh.name !== "grass ") {
        sunShadowGenerator?.addShadowCaster(mesh, false);
    }
});
// --- GÖKYÜZÜ SONU ---

return scene;
};

// Sahneyi oluştur
const scene = createScene();

const glowLayer = new BABYLON.GlowLayer("statusGlow", scene);
glowLayer.intensity = 1.5;
const lightMesh = BABYLON.MeshBuilder.CreateSphere("statusLightMesh", { diameter: 1.0 }, scene);
const lightMat = new BABYLON.StandardMaterial("statusLightMat", scene);
lightMat.emissiveColor = BABYLON.Color3.FromHexString("#00FF44");
lightMat.disableLighting = true;
lightMesh.material = lightMat;
lightMesh.position = new BABYLON.Vector3(-10, 3.5, 55);

const statusLight = new BABYLON.PointLight("statusLight", new BABYLON.Vector3(0, 0, 0), scene);
statusLight.intensity = 3.0;
statusLight.range = 30;
statusLight.diffuse = BABYLON.Color3.FromHexString("#00FF44");
statusLight.parent = lightMesh;

const lightManager = new GenericLightManager(lightMesh, statusLight);
lightManager.setupLogicB(BABYLON.Color3.FromHexString("#00FF44"), {
    speed: 0.003,
    pulseAmount: 0.2
});

const cameraModeSlider = document.getElementById("cameraMode");
const cameraModeLabel = document.getElementById("cameraModeValue");
cameraModeSlider.addEventListener("input", (e) => {
const mode = parseInt(e.target.value);
if (mode === 0) {
    // === SPECTATOR MODE ===
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);
    pedestrianCamera.detachControl(canvas);
    if(cameraModeLabel) cameraModeLabel.innerText = "Spectator";
    pedestrianCamera.position.y = 2;
} 
else if (mode === 1) {
    // === PEDESTRIAN MODE ===
    scene.activeCamera = pedestrianCamera;
    camera.detachControl(canvas);
    pedestrianCamera.attachControl(canvas, true);
    
    // Optional: Reset position to a safe spot when switching
    pedestrianCamera.position = new BABYLON.Vector3(-10, 1.7, 10);
    
    if(cameraModeLabel) cameraModeLabel.innerText = "Pedestrian";
}
});
// --- UI: car count slider ---
const carCountEl = document.getElementById("carCount");
const carCountValueEl = document.getElementById("carCountValue");
let desiredCarCount = Number(carCountEl?.value ?? 1);
if (carCountValueEl) carCountValueEl.textContent = String(desiredCarCount);
carCountEl?.addEventListener("input", (e) => {
desiredCarCount = Number(e.target.value);
if (carCountValueEl) carCountValueEl.textContent = String(desiredCarCount);
});
// --- UI: hour-of-day slider + real time ---
const timeOfDayEl = document.getElementById("timeOfDay");
const timeOfDayValueEl = document.getElementById("timeOfDayValue");
const realTimeModeEl = document.getElementById("realTimeMode");
let desiredHour = Number(timeOfDayEl?.value ?? 12);
function formatHourLabel(hour) {
const normalized = ((hour % 24) + 24) % 24;
const h = Math.floor(normalized);
const m = Math.round((normalized - h) * 60);
return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function applyTimeOfDay(hour) {
if (!sunLight) return;
const clampedHour = Math.max(0, Math.min(24, hour));
const t = clampedHour / 24;
const elevationDeg = -12 + Math.sin(t * Math.PI * 2 - Math.PI / 2) * 72;
const elevation = BABYLON.Angle.FromDegrees(elevationDeg).radians();
const azimuth = BABYLON.Angle.FromDegrees(-22).radians();
const cosEl = Math.cos(elevation);

const dirX = Math.sin(azimuth) * cosEl;
const dirY = -Math.sin(elevation);
const dirZ = -Math.cos(azimuth) * cosEl;
sunLight.direction = new BABYLON.Vector3(dirX, dirY, dirZ);

const sunDistance = 95;
sunLight.position = new BABYLON.Vector3(
    -dirX * sunDistance,
    Math.max(20, -dirY * sunDistance),
    -dirZ * sunDistance
);

// Keep daytime until around 20:00 and darken naturally after.
const dayFactor = Math.max(0, Math.sin((clampedHour - 6) / 14 * Math.PI));
const warmBand = Math.max(0, 1 - Math.abs(clampedHour - 6) / 2.5) + Math.max(0, 1 - Math.abs(clampedHour - 20) / 2.8);
const warmth = Math.min(1, warmBand);
const nightFactor = 1 - dayFactor;

sunLight.intensity = 0.12 + dayFactor * 2.25;
sunLight.diffuse = new BABYLON.Color3(1.0, 0.86 + dayFactor * 0.12 - warmth * 0.05, 0.72 + dayFactor * 0.2 - warmth * 0.08);
sunLight.specular = new BABYLON.Color3(0.9 + dayFactor * 0.1, 0.82 + dayFactor * 0.14 - warmth * 0.04, 0.72 + dayFactor * 0.16 - warmth * 0.06);

if (skyFillLight) {
    skyFillLight.intensity = 0.06 + dayFactor * 0.55;
    skyFillLight.diffuse = new BABYLON.Color3(0.2 + dayFactor * 0.52, 0.24 + dayFactor * 0.58, 0.34 + dayFactor * 0.66);
    skyFillLight.groundColor = new BABYLON.Color3(0.09 + dayFactor * 0.37, 0.09 + dayFactor * 0.33, 0.11 + dayFactor * 0.25);
}
if (sunShadowGenerator) sunShadowGenerator.darkness = 0.52 - dayFactor * 0.34;

scene.fogDensity = 0.0011 - dayFactor * 0.00075;
scene.fogColor = new BABYLON.Color3(0.12 + dayFactor * 0.73, 0.15 + dayFactor * 0.76, 0.22 + dayFactor * 0.76);
scene.clearColor = new BABYLON.Color4(0.04 + dayFactor * 0.56, 0.05 + dayFactor * 0.64, 0.08 + dayFactor * 0.72, 1);
if (skyMaterialRef) {
    const b = 0.2 + dayFactor * 0.8;
    skyMaterialRef.emissiveColor = new BABYLON.Color3(b, b, b + nightFactor * 0.04);
}
}
function getSystemHourFloat() {
const now = new Date();
return now.getHours() + (now.getMinutes() / 60);
}
function syncFromSystemClock() {
desiredHour = getSystemHourFloat();
if (timeOfDayEl) timeOfDayEl.value = String(desiredHour);
if (timeOfDayValueEl) timeOfDayValueEl.textContent = formatHourLabel(desiredHour);
applyTimeOfDay(desiredHour);
}
if (timeOfDayValueEl) timeOfDayValueEl.textContent = formatHourLabel(desiredHour);
applyTimeOfDay(desiredHour);
timeOfDayEl?.addEventListener("input", (e) => {
desiredHour = Number(e.target.value);
if (timeOfDayValueEl) timeOfDayValueEl.textContent = formatHourLabel(desiredHour);
applyTimeOfDay(desiredHour);
});
realTimeModeEl?.addEventListener("change", (e) => {
const enabled = Boolean(e.target.checked);
if (enabled) {
syncFromSystemClock();
if (realTimeTimer) clearInterval(realTimeTimer);
realTimeTimer = setInterval(syncFromSystemClock, 1000);
} else if (realTimeTimer) {
clearInterval(realTimeTimer);
realTimeTimer = null;
}
});
const MAIN_Y = (0.9 / 8);
function buildSpawnPoints() {
const spawns = [];
const zMin = ROAD_NETWORK.main.zMin ?? -50;
const zMax = ROAD_NETWORK.main.zMax ?? 50;
const roadHalf = (ROAD_NETWORK.main.width ?? 5) / 2;
// MAIN ROAD (LHD / drive-on-right):
// - DOWN (-Z) traffic uses LEFT lane (x: -1.0) because it's right-hand traffic? NO.
// Wait, in Turkey (LHD), you drive on the RIGHT side of the road.
// If you are driving DOWN (-Z), your RIGHT is the -X side. So x: -1.0 is correct for RIGHT lane.
// If you are driving UP (+Z), your RIGHT is the +X side. So x: 1.0 is correct for RIGHT lane.
spawns.push({
     id: "main_north_down_rightLane",
    roadType: "MAIN",
    x: -1.0, // Right lane for DOWN traffic
    y: MAIN_Y,
    z: zMax,
    rotY: Math.PI * 1.5, // DOWN (-Z)
    mainFlow: "DOWN"
});
spawns.push({
    id: "main_south_up_rightLane",
    roadType: "MAIN",
    x: 1.0, // Right lane for UP traffic
    y: MAIN_Y,
    z: zMin,
    rotY: Math.PI / 2, // UP (+Z)
    mainFlow: "UP"
});

// SIDE ROADS: far end -> toward main (3 spawns)
for (const sr of ROAD_NETWORK.sideRoads ?? []) {
    const dir = (sr.side === "left") ? -1 : 1;
    const farX = dir * (roadHalf + sr.length);
    const towardMainRot = (sr.side === "left") ? Math.PI : 0; // left: +X, right: -X
    
    // FIX: Side road right lane logic
    // Left side roads (driving +X): Right side is +Z direction relative to road center
    // Right side roads (driving -X): Right side is -Z direction relative to road center
    const offsetZ = (sr.side === "left") ? -1.0 : 1.0; 

    spawns.push({
        id: `side_far_${sr.id}`,
        roadType: "SIDE",
        sideRoad: sr,
        x: farX,
        y: MAIN_Y,
        z: sr.z + offsetZ,
        rotY: towardMainRot,
        mainFlow: "DOWN" // Merge into DOWN flow (Right lane of main road is x: -1.0)
    });
}

return spawns;
}
const spawnPoints = buildSpawnPoints();
function configureCar(car, spawn) {
car.setPosition(spawn.x, spawn.y, spawn.z);
car.root.rotation.y = spawn.rotY;
car.roadType = spawn.roadType;
car.sideRoad = spawn.sideRoad ?? null;
car.mainFlow = spawn.mainFlow ?? "DOWN";
car.roadNetwork = ROAD_NETWORK;
car.parkingLots = PARKING_LOTS;

car.maxSpeed = 0.12 + Math.random() * 0.18;
car.currentSpeed = 0;
car.targetSpeed = car.maxSpeed;
car.acceleration = 0.008 + Math.random() * 0.006;

car.isTurning = false;
car.isParked = false;
car.currentIntent = "STRAIGHT";
car.lastJunctionPassed = null;
car.targetPark = null;
car.targetSlot = null;
car.parkingPath = [];
car.parkingPathIndex = 0;
car.exitPath = [];
car.exitPathIndex = 0;
car.pendingParking = null;
}
let spawnIndex = 0;
function spawnOneCar() {
const spawn = spawnPoints[spawnIndex];
spawnIndex = (spawnIndex + 1) % spawnPoints.length;
const car = new Car(scene, getRandomColor(), 0.6, {
roadNetwork: ROAD_NETWORK,
parkingLots: PARKING_LOTS,
roadType: spawn.roadType,
sideRoad: spawn.sideRoad ?? null,
mainFlow: spawn.mainFlow ?? "DOWN"
});
configureCar(car, spawn);
if (sunShadowGenerator) {
const carMeshes = car.root.getChildMeshes(false);
for (const mesh of carMeshes) {
sunShadowGenerator.addShadowCaster(mesh, false);
mesh.receiveShadows = true;
}
}
return car;
}
// Car pool
let cars = [];
for (let i = 0; i < desiredCarCount; i++) cars.push(spawnOneCar());
function spawnParkedCarAt(x, z, rotationY = 0, color = getRandomColor()) {
const car = new Car(scene, color, 0.6, { roadNetwork: ROAD_NETWORK });
car.setPosition(x, MAIN_Y, z);
car.root.rotation.y = rotationY;
// Freeze as parked/inactive
car.isActive = false;
car.currentSpeed = 0;
car.targetSpeed = 0;
car.currentIntent = "STRAIGHT";


cars.push(car);
return car;
}
// spawnParkedCarAt(-24, -5, 1.5 * Math.PI);   // Big lot, facing -Z
// spawnParkedCarAt(-24, -10, 1.5 * Math.PI);
// spawnParkedCarAt(-20, -2.5, 0.5 * Math.PI); // Facing +Z
// spawnParkedCarAt(-10, -10, 1.5 * Math.PI);
// 2. Animasyon Döngüsü
engine.runRenderLoop(function () {
scene.render();
});
scene.onBeforeRenderObservable.add(() => {
    let activeCount = 0;
    for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        if (!car || !car.root || car.root.isDisposed()) {
            cars.splice(i, 1);
            continue;
        }
        if (car.isActive) activeCount++;
    }

    if (activeCount < desiredCarCount) {
        const toSpawn = desiredCarCount - activeCount;
        for (let i = 0; i < toSpawn; i++) cars.push(spawnOneCar());
    } else if (activeCount > desiredCarCount) {
        let toRemove = activeCount - desiredCarCount;
        for (let i = cars.length - 1; i >= 0 && toRemove > 0; i--) {
            const car = cars[i];
            if (car && car.isActive && !car.exitingCarPark) {
                car.root.dispose();
                cars.splice(i, 1);
                toRemove--;
            }
        }
    }

    for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        if (!car) continue;
        
        car.update(cars);
        
        // Out of bounds kontrolü
        if (car.checkBounds()) {
            car.root.dispose();
            cars.splice(i, 1);
        }
    }

    checkCounter++;
    if (checkCounter % 60 === 0) {
        let totalSlots = 0;
        for (const lot of PARKING_LOTS) {
            if (lot.customSlots) totalSlots += lot.customSlots.length;
        }

        let parkedCars = 0;
        for (const car of cars) {
            if (!car.isActive) parkedCars++;
        }

        const ratio = totalSlots > 0 ? parkedCars / totalSlots : 0;
        
        // Rengi doğrudan değiştir (Logic B kullanıldığı için nabızla birlikte uygulanır)
        if (ratio >= 0.95) {
            lightManager.logicB_BaseColor = BABYLON.Color3.FromHexString("#FF2222"); // Kırmızı
        } else {
            lightManager.logicB_BaseColor = BABYLON.Color3.FromHexString("#00FF44"); // Yeşil
        }
    }

    lightManager.update();
});
// Pencere boyutu değişirse motoru yeniden boyutlandır
window.addEventListener("resize", function () {
engine.resize();
});