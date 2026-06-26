// RoadAndGrass.js (Babylon.js uyarlaması)
import { createCarPark } from "./CarPark_v2.js";
import { ServerComputer } from "./ServerComputer_v2.js"; 
import { Magnetometer } from "./Magnetometer.js";
import { LEDSign } from "./LEDSign_v2.js";

export const BIG_PARKING_COORD_POINTS = [];
export const SMALL_PARKING_COORD_POINTS = [];
export const PARKING_LOTS = [];
export const BIG_LOT_CUSTOM_SLOTS = [
    { x: -24, z: 50, angle: 1.5 * Math.PI },
    { x: -24, z: 47.5, angle: 1.5 * Math.PI },
    { x: -24, z: 45, angle: 1.5 * Math.PI },
    { x: -24, z: 42.5, angle: 1.5 * Math.PI },
    { x: -24, z: 40, angle: 1.5 * Math.PI },
    { x: -24, z: 37.5, angle: 1.5 * Math.PI },
    { x: -24, z: 35, angle: 1.5 * Math.PI },
    { x: -24, z: 32.5, angle: 1.5 * Math.PI },
    { x: -24, z: 30, angle: 1.5 * Math.PI },
    { x: -24, z: 27.5, angle: 1.5 * Math.PI },
    { x: -26, z: 22.5, angle: 1 * Math.PI },
    { x: -23.5, z: 16, angle: 1 * Math.PI },
    { x: -21.0, z: 16, angle: 1 * Math.PI },
    { x: -18.5, z: 16, angle: 1 * Math.PI },
    { x: -16.0, z: 16, angle: 1 * Math.PI },
    { x: -13.5, z: 16, angle: 1 * Math.PI },
    { x: -11.0, z: 16, angle: 1 * Math.PI },
    { x: -8.5, z: 16, angle: 1 * Math.PI },
    { x: -6, z: 20, angle: 0.5 * Math.PI },
    { x: -6, z: 20.0, angle: 0.5 * Math.PI },
    { x: -6, z: 22.5, angle: 0.5 * Math.PI },
    { x: -6, z: 25.0, angle: 0.5 * Math.PI },
    { x: -6, z: 27.5, angle: 0.5 * Math.PI },
    { x: -6, z: 30.0, angle: 0.5 * Math.PI },
    { x: -6, z: 32.5, angle: 0.5 * Math.PI },
    { x: -6, z: 35.0, angle: 0.5 * Math.PI },
    { x: -6, z: 37.5, angle: 0.5 * Math.PI },
    { x: -6, z: 40.0, angle: 0.5 * Math.PI },
    { x: -6, z: 42.5, angle: 0.5 * Math.PI },
    { x: -6, z: 45.0, angle: 0.5 * Math.PI },
    { x: -6, z: 47.5, angle: 0.5 * Math.PI },
    { x: -6, z: 50, angle: 0.5 * Math.PI },
    { x: -6, z: 52.5, angle: 0.5 * Math.PI },
    { x: -18.5, z: 54, angle: 0 * Math.PI },
    { x: -21, z: 54, angle: 0 * Math.PI },
    { x: -23.5, z: 54, angle: 0 * Math.PI },
    { x: -26, z: 54, angle: 0 * Math.PI },
    { x: -20, z: 50, angle: 0.5 * Math.PI },
    { x: -20, z: 47.5, angle: 0.5 * Math.PI },
    { x: -20, z: 45, angle: 0.5 * Math.PI },
    { x: -20, z: 42.5, angle: 0.5 * Math.PI },
    { x: -20, z: 40, angle: 0.5 * Math.PI },
    { x: -20, z: 37.5, angle: 0.5 * Math.PI },
    { x: -20, z: 32.5, angle: 0.5 * Math.PI },
    { x: -20, z: 30, angle: 0.5 * Math.PI },
    { x: -20, z: 27.5, angle: 0.5 * Math.PI },
    { x: -20, z: 25, angle: 0.5 * Math.PI },
    { x: -20, z: 22.5, angle: 0.5 * Math.PI },
    { x: -10, z: 50, angle: 1.5 * Math.PI },
    { x: -10, z: 47.5, angle: 1.5 * Math.PI },
    { x: -10, z: 45, angle: 1.5 * Math.PI },
    { x: -10, z: 42.5, angle: 1.5 * Math.PI },
    { x: -10, z: 40, angle: 1.5 * Math.PI },
    { x: -10, z: 37.5, angle: 1.5 * Math.PI },
    { x: -10, z: 32.5, angle: 1.5 * Math.PI },
    { x: -10, z: 30, angle: 1.5 * Math.PI },
    { x: -10, z: 27.5, angle: 1.5 * Math.PI },
    { x: -10, z: 25, angle: 1.5 * Math.PI },
    { x: -10, z: 22.5, angle: 1.5 * Math.PI }
];
export const SMALL_LOT_CUSTOM_SLOTS = [
    // Original Z range: ~16 to 48.5. New Z range: ~66 to 98.5.
    { x: -18.5, z: 66, angle: 1 * Math.PI },      // Was 16
    { x: -21, z: 66, angle: 1 * Math.PI },        // Was 16
    { x: -23.5, z: 66, angle: 1 * Math.PI },      // Was 16
    { x: -26, z: 66, angle: 1 * Math.PI },        // Was 16
    { x: -25, z: 72, angle: 1.35 * Math.PI },     // Was 22
    { x: -25, z: 74.75, angle: 1.35 * Math.PI },  // Was 24.75
    { x: -25, z: 77.5, angle: 1.35 * Math.PI },   // Was 27.5
    { x: -25, z: 80.25, angle: 1.35 * Math.PI },  // Was 30.25
    { x: -25, z: 83, angle: 1.35 * Math.PI },     // Was 33
    { x: -25, z: 85.75, angle: 1.35 * Math.PI },  // Was 35.75
    { x: -24, z: 91, angle: 1.5 * Math.PI },      // Was 41
    { x: -24, z: 93.5, angle: 1.5 * Math.PI },    // Was 43.5
    { x: -24, z: 96, angle: 1.5 * Math.PI },      // Was 46
    { x: -24, z: 98.5, angle: 1.5 * Math.PI },    // Was 48.5
    { x: -12, z: 66, angle: 1 * Math.PI },        // Was 16
    { x: -9.5, z: 66, angle: 1 * Math.PI },       // Was 16
    { x: -7, z: 66, angle: 1 * Math.PI },         // Was 16
    { x: -4.5, z: 66, angle: 1 * Math.PI },       // Was 16

    { x: -6, z: 91, angle: 0.5 * Math.PI },       // Was 41
    { x: -6, z: 93.5, angle: 0.5 * Math.PI },     // Was 43.5
    { x: -6, z: 96, angle: 0.5 * Math.PI },       // Was 46
    { x: -6, z: 98.5, angle: 0.5 * Math.PI },     // Was 48.5
    { x: -6, z: 88.5, angle: 0.5 * Math.PI },     // Was 38.5
    { x: -6, z: 86, angle: 0.5 * Math.PI },       // Was 36
    { x: -6, z: 83.5, angle: 0.5 * Math.PI },     // Was 33.5
    { x: -6, z: 81, angle: 0.5 * Math.PI },       // Was 31
    { x: -6, z: 78.5, angle: 0.5 * Math.PI },     // Was 28.5
    { x: -6, z: 76, angle: 0.5 * Math.PI },       // Was 26
    { x: -6, z: 73.5, angle: 0.5 * Math.PI },     // Was 23.5
    { x: -6, z: 71, angle: 0.5 * Math.PI },       // Was 21

    { x: -20, z: 72, angle: 0.5 * Math.PI },      // Was 22
    { x: -20, z: 74.75, angle: 0.5 * Math.PI },   // Was 24.75
    { x: -20, z: 77.5, angle: 0.5 * Math.PI },    // Was 27.5
    { x: -20, z: 80.25, angle: 0.5 * Math.PI },   // Was 30.25
    { x: -20, z: 83, angle: 0.5 * Math.PI },      // Was 33
    { x: -20, z: 85.75, angle: 0.5 * Math.PI },   // Was 35.75
    { x: -20, z: 88.5, angle: 0.5 * Math.PI },    // Was 38.5
    { x: -20, z: 91.25, angle: 0.5 * Math.PI },   // Was 41.25
    { x: -20, z: 94, angle: 0.5 * Math.PI },      // Was 44

    { x: -10, z: 72, angle: 1.5 * Math.PI },      // Was 22
    { x: -10, z: 74.75, angle: 1.5 * Math.PI },   // Was 24.75
    { x: -10, z: 77.5, angle: 1.5 * Math.PI },    // Was 27.5
    { x: -10, z: 80.25, angle: 1.5 * Math.PI },   // Was 30.25
    { x: -10, z: 83, angle: 1.5 * Math.PI },      // Was 33
    { x: -10, z: 85.75, angle: 1.5 * Math.PI },   // Was 35.75
    { x: -10, z: 88.5, angle: 1.5 * Math.PI },    // Was 38.5
    { x: -10, z: 91.25, angle: 1.5 * Math.PI },   // Was 41.25
    { x: -10, z: 94, angle: 1.5 * Math.PI }       // Was 44
];
export const ROAD_NETWORK = {
main: {
width: 5,
zMin: -100, // Expanded to 200 units total (-100 to 100)
zMax: 100,
lanesX: [-1.0, 1.0]
},
sideRoads: [
{ id: "sideRoad_Left_1", z: 10, side: "left", length: 35 }, // Shifted +50 (was -40)
{ id: "parkingJunction", z: 60, side: "left", length: 35 }, // Shifted +50 (was 10)
{ id: "sideRoad_Right_1", z: 35, side: "right", length: 15 }, // Shifted +50 (was -15)
{ id: "parkingJunctionCFS", z: -50, side: "left", length: 35 }
],
parkingEntrances: [],
renderedParkingEntrances: [],
BIG_PARKING_COORD_POINTS: BIG_PARKING_COORD_POINTS,
BIG_LOT_CUSTOM_SLOTS: BIG_LOT_CUSTOM_SLOTS,

// ADD THESE FOR SMALL LOT SUPPORT
SMALL_PARKING_COORD_POINTS: SMALL_PARKING_COORD_POINTS,
SMALL_LOT_CUSTOM_SLOTS: SMALL_LOT_CUSTOM_SLOTS
};

export let CFS_STATUS_ORB = null;

function createStatusOrb(scene, serverComputer, options = {}) {
    const { x = -28, y = 2.5, z = -48, diameter = 0.5 } = options;

    const orb = BABYLON.MeshBuilder.CreateSphere("cfs_status_orb", { diameter, segments: 16 }, scene);
    orb.position.set(x, y, z);
    orb.receiveShadows = false;

    const orbMat = new BABYLON.StandardMaterial("cfs_status_orb_mat", scene);
    orbMat.emissiveColor = new BABYLON.Color3(0, 1, 0); // Start green
    orbMat.disableLighting = true;
    orb.material = orbMat;

    return {
        mesh: orb,
        material: orbMat,
        setPosition: (nx, ny, nz) => orb.position.set(nx, ny, nz),
        update(allCars) {
            if (!serverComputer) return;
            
            const occupancy = serverComputer.getOccupancyMap(allCars);
            const total = occupancy.length;
            const occupied = occupancy.filter(s => s.isOccupied).length;
            const isFull = total > 0 && occupied >= total;

            // Smooth color swap (instant is fine, but this prevents flicker on boundary)
            orbMat.emissiveColor = isFull 
                ? new BABYLON.Color3(1, 0, 0) // 🔴 RED when full
                : new BABYLON.Color3(0, 1, 0); // 🟢 GREEN when not full
        }
    };
}

export function setupGround(scene) {
// --- YOL AYARLARI ---
const roadBaseLength = 5;   // Tek birim uzunluğu
const roadUnitCount = 40;   // Increased for 200 units (40 * 5 = 200)
const roadLengthTotal = roadBaseLength * roadUnitCount; // Toplam uzunluk = 200
const roadWidth = ROAD_NETWORK.main.width;        // Yol genişliği
// Yol dokusu
const roadTexture = new BABYLON.Texture( "assets/road.jpg ", scene);
roadTexture.wrapU = BABYLON.Texture.WRAP_ADDRESS;
roadTexture.wrapV = BABYLON.Texture.WRAP_ADDRESS;
roadTexture.uScale = 1;                 // X yönünde tekrar
roadTexture.vScale = roadUnitCount;     // Z yönünde tekrar

const roadMaterial = new BABYLON.StandardMaterial( "roadMat ", scene);
roadMaterial.diffuseTexture = roadTexture;

// Yol geometrisi
const road = BABYLON.MeshBuilder.CreateGround( "road ", {
    width: roadWidth,
    height: roadLengthTotal
}, scene);
road.material = roadMaterial;
road.position.y = 0;
road.checkCollisions = true;

// --- ÇİM AYARLARI ---
const grassWidth = 15; // Yolun yanındaki çim genişliği

const grassTexture = new BABYLON.Texture( "assets/grass.jpg ", scene);
grassTexture.wrapU = BABYLON.Texture.WRAP_ADDRESS;
grassTexture.wrapV = BABYLON.Texture.WRAP_ADDRESS;
grassTexture.uScale = 10;                 // X yönünde tekrar
grassTexture.vScale = roadLengthTotal / 1; // Z yönünde tekrar (deneme değeri)

const grassTexture2 = new BABYLON.Texture( "assets/grass.jpg ", scene);
grassTexture2.wrapU = BABYLON.Texture.WRAP_ADDRESS;
grassTexture2.wrapV = BABYLON.Texture.WRAP_ADDRESS;
grassTexture2.uScale = 23 + (1/3);                 // X yönünde tekrar
grassTexture2.vScale = roadLengthTotal / 1; // Z yönünde tekrar (deneme değeri)

const grassMaterial = new BABYLON.StandardMaterial( "grassMat ", scene);
grassMaterial.diffuseTexture = grassTexture;
const grassMaterial2 = new BABYLON.StandardMaterial( "grassMat2 ", scene);
grassMaterial2.diffuseTexture = grassTexture2;

const grass = BABYLON.MeshBuilder.CreateGround( "grass ", {
    width: grassWidth,
    height: roadLengthTotal
}, scene);
grass.material = grassMaterial;

const grass2 = BABYLON.MeshBuilder.CreateGround( "grass ", {
    width: 35,
    height: roadLengthTotal
}, scene);
grass2.material = grassMaterial2;

// Çimi yolun yanına kaydır
grass.position.x = (roadWidth / 2) + (grassWidth / 2 );
grass.position.y = 0;
grass.checkCollisions = true;

grass2.position.x = -(roadWidth / 2) - (35 / 2 );
grass2.position.y = 0;
grass2.checkCollisions = true;

roadTexture.anisotropicFilteringLevel = 1;
grassTexture.anisotropicFilteringLevel = 1;
grassTexture2.anisotropicFilteringLevel = 1;
roadMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
grassMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
grassMaterial2.specularColor = new BABYLON.Color3(0, 0, 0);
// İstersen diğer tarafa da bir çim ekleyebilirsin:
//const grassLeft = grass.clone( "grassLeft ");
//grassLeft.position.x = -(roadWidth / 2) - (grassWidth / 2);

// Tali yollar
ROAD_NETWORK.sideRoads.forEach(sr => {
    createSideRoad(scene, road, sr.id, sr.z, sr.side, sr.length);
});
}
export function createEnvironment(scene, roadLengthTotal, roadWidth, grassWidth) {
// 1. MATERYALLER
const bushMaterial = new BABYLON.StandardMaterial("bushMat", scene);
bushMaterial.diffuseTexture = new BABYLON.Texture("assets/bush.png", scene);
bushMaterial.diffuseTexture.hasAlpha = true;
bushMaterial.backFaceCulling = false;
const treeMaterial = new BABYLON.StandardMaterial( "treeMat ", scene);
treeMaterial.diffuseTexture = new BABYLON.Texture( "assets/tree.webp ", scene);
treeMaterial.diffuseTexture.hasAlpha = true;
treeMaterial.backFaceCulling = false;

const flowerMaterial = new BABYLON.StandardMaterial( "flowerMat ", scene);
flowerMaterial.diffuseTexture = new BABYLON.Texture( "assets/flower.png ", scene);
flowerMaterial.diffuseTexture.hasAlpha = true;
flowerMaterial.backFaceCulling = false;

// 2. ANA MODELLER (Template)
const p1 = BABYLON.MeshBuilder.CreatePlane( "p1 ", {size: 1.5}, scene);
const p2 = p1.clone( "p2 ");
p2.rotation.y = Math.PI / 2;
const baseBush = BABYLON.Mesh.MergeMeshes([p1, p2], true);
baseBush.setEnabled(false);
baseBush.material = bushMaterial;

const t1 = BABYLON.MeshBuilder.CreatePlane( "t1 ", {width: 3, height: 5}, scene);
const t2 = t1.clone( "t2 ");
t2.rotation.y = Math.PI / 2;
const baseTree = BABYLON.Mesh.MergeMeshes([t1, t2], true);
baseTree.setEnabled(false);
baseTree.material = treeMaterial;

const f1 = BABYLON.MeshBuilder.CreatePlane( "f1 ", {size: 1.5}, scene);
const f2 = f1.clone( "f2 ");
f2.rotation.y = Math.PI / 2;
const baseFlower = BABYLON.Mesh.MergeMeshes([f1, f2], true);
baseFlower.setEnabled(false);
baseFlower.material = flowerMaterial;

// 3. YERLEŞTİRME  DÖNGÜSÜ
const spacing = 3; // Mesafeyi 8'den 4'e düşürdük (Yoğunluk x2 oldu)

// Tali yolların koordinatları (Buraya ağaç dikmeyeceğiz)
const sideRoadZ = [10, 60, 35]; // Updated to match new positions

for (let z = -roadLengthTotal / 2; z < roadLengthTotal / 2; z += spacing) {
    // Tali yol boşluk kontrolü
    if (sideRoadZ.some(pos => Math.abs(z - pos) < 5)) continue;

    const rand = Math.random();

    // Çim alanının başlangıcı (yol kenarı) ve bitişi
    const grassStart = roadWidth / 2 + 1.5; // Yoldan 1.5 birim güvenlik mesafesi
    const grassEnd = roadWidth / 2 + grassWidth - 1.5; 

    if (rand < 0.5) { // %50 ihtimalle ÇALI
        const bush = baseBush.createInstance( "bush_" + z);
        const scale = 0.5 + Math.random() * 0.3;
        bush.scaling.set(scale, scale, scale);
        
        // X Pozisyonu: Çimin genişliğine rastgele yayıyoruz
         const xPos = grassStart + Math.random() * (grassEnd - grassStart);
        bush.position = new BABYLON.Vector3(xPos, (1.5 * scale) / 2, z);
        bush.rotation.y = Math.random() * Math.PI;

    } else if (rand < 0.8) { // %35 ihtimalle AĞAÇ (Toplam %85 doluluk)
        const tree = baseTree.createInstance( "tree_" + z);
        const scale = 0.8 + Math.random() * 0.5;
        tree.scaling.set(scale, scale, scale);
        
        // X Pozisyonu: Ağaçları çimin daha dış (yola uzak) kısmına  meyillendirelim
        const xPos = (grassStart + 2) + Math.random() * (grassEnd - (grassStart + 2));
        tree.position = new BABYLON.Vector3(xPos, (5 * scale) / 2, z);
         tree.rotation.y = Math.random() * Math.PI;
    }
    else
    {
        const flower = baseFlower.createInstance( "flower_" + z);
        const scale = 0.3 + Math.random() * 0.5;
        flower.scaling.set(scale, scale, scale);

        // X Pozisyonu: Çimin genişliğine rastgele yayıyoruz
        const xPos = grassStart + Math.random() * (grassEnd - grassStart);
        flower.position = new BABYLON.Vector3(xPos, ((1.5 * scale) / 2) - 0.1, z);
        flower.rotation.y = Math.random() * Math.PI;
    }
}
}
// RoadAndGrass.js içine eklenebilir
function createSideRoad(scene, parentRoad, name, positionZ, side = "left", length = 10) {
const roadWidth = 5; // Ana yol genişliğiyle aynı tutalım
// 1. Tali Yol Geometrisi
const sideRoad = BABYLON.MeshBuilder.CreateGround(name, {
    width: roadWidth,
    height: length
}, scene);

// 2. Materyal ve Doku Ayarı
// Ana yolun materyalini clone'luyoruz ki vScale ayarı ana yolu bozmasın
const sideRoadMaterial = parentRoad.material.clone(name + "_mat");
const sideRoadTexture = sideRoadMaterial.diffuseTexture.clone();

// Her 5 metrede bir tekrar (length / 5)
sideRoadTexture.vScale = length / 5; 
sideRoadMaterial.diffuseTexture = sideRoadTexture;
sideRoad.material = sideRoadMaterial;

// 3. Konumlandırma ve Döndürme
sideRoad.rotation.y = Math.PI / 2;

const direction = (side === "left") ? -1 : 1;
// Ana yolun kenarından başlaması için hesaplama
const xPos = (roadWidth / 2 + length / 2) * direction;

sideRoad.position = new BABYLON.Vector3(xPos, 0.002, positionZ);

return sideRoad;
}
// RoadAndGrass.js (building1.png için Güncellenmiş Bina Oluşturma)
function createBuilding(scene, name, width, height, depth, position, rotationY = 0) {
const textureNames = [ "building1.png ",  "building2.png ",  "building3.png "];
const randomTexture = textureNames[Math.floor(Math.random() * textureNames.length)];
// 1. FaceUV Ayarı: Dokuyu her yüzeye dikey nizamda oturtmak
// Doku dikey (portrait) olduğ u için, kutunun dikey yüzeylerini (ön, arka, yan)
// dokunun tamamını kaplayacak şekilde (0,0'dan 1,1'e) haritalıyoruz.
const faceUV = new Array(6);
faceUV[0] = new BABYLON.Vector4 (0, 0, 1, 1); // Arka
faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1); // Ön (Doku dikey oturur)
faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1); // Sağ
faceUV[3] = new BABYLON.Vector4(0,  0, 1, 1); // Sol
// Üst ve Alt yüzeyler genellikle görünmez, dikey doku buralarda saçma durabilir. 
// Basitlik için dokunun çok küçük bir parçasını atıyoruz:
faceUV[4] = new BABYLON.Vector4(0, 0, 0.1, 0.1); // Üst
faceUV[5] = new BABYLON.Vector4(0, 0, 0.1, 0.1); // Alt

// 2. Mesh Oluşturma (FaceUV ile)
const building = BABYLON.MeshBuilder.CreateBox(name, { 
    width: width,
    height: height,
    depth: depth,
    faceUV: faceUV, // UV haritasını buraya veriyoruz
    wrap: true       // Dokunun yüzeyi tam kaplamasını sağlar
}, scene);

// 3. Materyal ve Doku
const buildingMat = new BABYLON.StandardMaterial(name +  "_mat ", scene);
const texture = new BABYLON.Texture( "assets/" + randomTexture, scene);

// CLAMP kullanarak dokunun tekrar etmesini engelliyoruz (FaceUV ile zaten sığdırdık)
texture.wrapU = BABYLON.Texture.CLAMP_ADDRESS;
texture.wrapV = BABYLON.Texture.CLAMP_ADDRESS;

buildingMat.diffuseTexture = texture;
building.material = buildingMat;

// 4. Konumlandırma ve Döndürme
building.position = position;
building.position .y = height / 2; // Zemine oturt
building.rotation.y = rotationY;

return building;
}
export function setupBuildings(scene, roadWidth) {
const bWidth = 5;
const bDepth = 5;
const buildingX = -(roadWidth / 2) - (bDepth / 2); // Ana yol kenarındaki X çizgisi
// 1. ANA YOL ÜZERİNDEKİ BİNALAR (-50'den -40'a) -> Shifted to 0 to 10
for (let z = 0; z < 10; z += bWidth) {
    const bHeight = 5 + Math.random() * 3;
    createBuilding(scene, "MainRoad_Bldg_" + z, bWidth, bHeight, bDepth, 
        new BABYLON.Vector3(buildingX, 0, z));
}

// 2. TALİ YOL ÜZERİNDEKİ BİNALAR (Köşeden başlayarak bitişik)
// Ana yolun bittiği X noktasından (-buildingX) başlayıp içeri doğru dizeceğiz
const sideRoadZ = 10; // Tali yolun ekseni (Shifted +50)
const sideRoadLength = 30;

// Köşedeki ilk bina ana yoldakiyle zaten z=10'ta çakışacağı için 
// döngüyü ana yolun hemen dışından (X ekseninde kaydırarak) başlatıyoruz
const startX = buildingX - bWidth; 
const endX = buildingX - sideRoadLength;

for (let x = startX; x > endX; x -= bWidth) {
    const bHeight = 5 + Math.random() * 2;
    
    // Binaları tali yolun "üst" tarafına, ana yoldaki binalarla 
    // aynı hizada (Z ekseninde sabit) diziyoruz
    createBuilding(scene, "SideRoad_Bldg_X" + x, bWidth, bHeight, bDepth, 
        new BABYLON.Vector3(x, 0, sideRoadZ-5));
}
}
export function setupProceduralBlocks(scene, roadWidth) {
    PARKING_LOTS.length = 0;    // Filter parking entrances after lots rendered
    // Use only rendered entrances
    ROAD_NETWORK.parkingEntrances = ROAD_NETWORK.renderedParkingEntrances;
    console.log(`Simulation active parking entrances (rendered only): ${ROAD_NETWORK.parkingEntrances.map(pe => pe.id).join(', ')} (${ROAD_NETWORK.parkingEntrances.length} total)`);

    const bWidth = 5;
    const bDepth = 5;
    const buildingX = -(roadWidth / 2) - (bDepth / 2); // Ana yolun sol tar afı hizası

    const randomChoice = Math.random() < 0.5;
    const leftSideRoads = (ROAD_NETWORK.sideRoads ?? []).filter(sr => sr.side === "left ");
    const pickClosestLeftRoad = (startZ, endZ) => {
        if (!leftSideRoads.length) return null;
        const minZ = Math.min(startZ, endZ);
        const maxZ = Math.max(startZ, endZ);
        let best = leftSideRoads[0];
        let bestDist = Infinity;
        for (const sr of leftSideRoads) {
            const dist = (sr.z < minZ) ? (minZ - sr.z) : (sr.z > maxZ ? sr.z - maxZ : 0);
            if (dist < bestDist) {
                best = sr;
                bestDist = dist;
            }
        }
        return best;
};

// --- BLOK 1: BÜYÜK BLOK (z: 15 to 55) --- Shifted +50 from (-35 to 5)
    if (randomChoice) {
        // 1. Ana  yol üzerindeki binalar
        for (let z = 15; z <= 55; z += bWidth) {
            const bHeight = 6 + Math.random() * 4;
            createBuilding(scene, "BigBlock_Main_" + z, bWidth, bHeight, bDepth, 
                new BABYLON.Vector3(buildingX, 0, z));
        }

        // 2. 10'luk Tali Yol (z = 10 hizası) - Yola göre SAĞINDA (Z ekseninde üstünde)
        // Ana yoldaki binalarla bitişik başlasın
        for (let x = buildingX - bWidth; x > buildingX - 30; x -= bWidth) {
            const bHeight = 6 + Math.random() * 2;
            createBuilding(scene, "BigBlock_Side10_Right_" + x, bWidth, bHeight, bDepth, 
                new BABYLON.Vector3(x, 0, 15)); // z=15 (shifted)
        }

        // 3. 20'lik Tali Yol (z = 60 hizası) - Yola göre SOLUNDA ( Z ekseninde altında)
        for (let x = buildingX - bWidth; x > buildingX - 25; x -= bWidth) {
            const bHeight = 6 + Math.random() * 2;
            createBuilding(scene, "BigBlock_Side20_Left_" + x, bWidth, bHeight, bDepth, 
                new BABYLON.Vector3(x, 0, 55)); // z=55 (shifted from 5)
        }
        
        console.log( "Büyük Blok: Binalar (+Tali Yollar) | Küçük Blok: Otopark ");
    } else {
        const bigRoad = pickClosestLeftRoad(12.5, 57.5); // Shifted range
        const bigLotX = buildingX - 10.0;
        const bigLotWidth = 25;
        const bigLot = createCarPark(scene, {
            name: "BigBlock_Parking ",
            x: bigLotX,
            startZ: 12.5, // Shifted +50 from -37.5
            endZ: 57.5,   // Shifted +50 from 7.5
            width: bigLotWidth,
            variant: "perpendicular ",
            entranceSide: "south ",
            entranceZ: 35, // Shifted +50 from -15
            entranceX: 7.5,
            customSlots: BIG_LOT_CUSTOM_SLOTS
        });
        if (bigLot) {
            bigLot.accessSideRoad = bigRoad;
            PARKING_LOTS.push(bigLot);
            bigLot.coordPoints = BIG_PARKING_COORD_POINTS;

            BIG_PARKING_COORD_POINTS.push({id: 'entrance', position: new BABYLON.Vector3(-15, 0.5, 52.5), turnTo: []}); // Shifted Z +50 (2.5 -> 52.5)
            BIG_PARKING_COORD_POINTS.push({id: 'row11', position: new BABYLON.Vector3(-21, 0.5, 52.5), turnTo: []}); // Shifted Z +50
            BIG_PARKING_COORD_POINTS.push({id: 'row31', position: new BABYLON.Vector3(-7.5, 0.5, 52.5), turnTo: []}); // Shifted Z +50

            BIG_PARKING_COORD_POINTS.push({id: 'entrance-pre', position: new BABYLON.Vector3(-15, 0.5, 55), turnTo: []}); // Shifted Z +50 (5 -> 55)
            BIG_PARKING_COORD_POINTS.push({id: 'row30', position: new BABYLON.Vector3(-7.5, 0.5, 55), turnTo: []}); // Shifted Z +50

            BIG_PARKING_COORD_POINTS.push({id: 'row12', position: new BABYLON.Vector3(-21.75, 0.5, 35), turnTo: []}); // Shifted Z +50 (-15 -> 35)
            BIG_PARKING_COORD_POINTS.push({id: 'row13', position: new BABYLON.Vector3(-21.75, 0.5, 18.75), turnTo: []}); // Shifted Z +50 (-31.25 -> 18.75)

            BIG_PARKING_COORD_POINTS.push({id: 'row22', position: new BABYLON.Vector3(-15, 0.5, 35), turnTo: []}); // Shifted Z +50
            BIG_PARKING_COORD_POINTS.push({id: 'row23', position: new BABYLON.Vector3(-15,  0.5, 18.75), turnTo: []}); // Shifted Z +50

            BIG_PARKING_COORD_POINTS.push({id: 'row32', position: new BABYLON.Vector3(-7.5, 0.5, 35), turnTo: []}); // Shifted Z +50
            BIG_PARKING_COORD_POINTS.push ({id: 'row33', position: new BABYLON.Vector3(-7.5, 0.5, 18.75), turnTo: []}); // Shifted Z +50

            BIG_PARKING_COORD_POINTS.find(p => p.id === 'entrance-pre').turnTo = ['entrance', 'row30'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'entrance').turnTo = ['row11', 'row31'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row11').turnTo = ['row12'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row12').turnTo = ['row13'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row13').turnTo = ['row23'];

            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row22').turnTo = ['row12', 'row32', 'entrance']; // Kavşak noktası
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row23').turnTo = ['row22'];

            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row30').turnTo = ['row31'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row31').turnTo = ['row32'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row32').turnTo = ['row33'];
            BIG_PARKING_COORD_POINTS.find(p => p.id === 'row33').turnTo = ['row23'];

            // Blue spheres for all points
            for (const point of BIG_PARKING_COORD_POINTS) {
                const coordMat = new BABYLON.StandardMaterial(`coordMat_${point.id}`, scene);
                coordMat.emissiveColor = new BABYLON.Color3(0, 0.4, 1);
                coordMat.disableLighting = true;
                const coordSphere = BABYLON.MeshBuilder.CreateSphere(`coordPoint_${point.id}`, {diameter: 0.6}, scene);
                coordSphere.material = coordMat;
                coordSphere.position = point .position;
            }

            console.log('Big lot coord points graph ready. 16 points with turnTo connections (no walls/180°).');

            // Add yellow entrance marker
            const entranceMat = new BABYLON.StandardMaterial( "entranceMatBig ", scene);
            entranceMat.emissiveColor = new BABYLON.Color3(1, 1, 0); // Yellow
            entranceMat.disableLighting = true;
            const entranceSphere = BABYLON.MeshBuilder .CreateSphere( "entranceBig ", {diameter: 0.6}, scene);
            entranceSphere.material = entranceMat;
            entranceSphere.position = new BABYLON.Vector3(-15, 0.5, 57.5); // Shifted Z +50 (7.5 -> 57.5)
            
            // Simulation dete cts rendered entrance
            ROAD_NETWORK.renderedParkingEntrances.push({ id: "bigLotEntrance ", x: -15, z: 57.5, lotName: "BigBlock_Parking " }); // Shifted Z +50
            console.log(`Simulation detected rendered parking lot's entrance: bigLotEntrance at x=-15, z=57.5 (BigBlock_Parking)`);
        }
        const bHeight = 6 + Math.random() * 4;
        for(let i = -5; i >= -45; i -= 5)
        {
            createBuilding(scene,"t1234_" + i,bWidth, bHeight, bDepth,new BABYLON.Vector3(-5, 0, i));
        }
        
    }


// ---  BLOK 2: KÜÇÜK BLOK (z: 65 to 100) --- Shifted +50 from (15 to 50)
    if (!randomChoice) {
        // 1. Ana yol üzerindeki binalar
        for (let z = 65; z <= 100; z += bWidth) {
            const bHeight = 6 + Math.random() * 4;
            createBuilding(scene, "SmallBlock_Main_" + z, bWidth, bHeight, bDepth, 
                new BABYLON.Vector3(buildingX, 0, z));
        }

        // 2. 20'lik Tali Yol (z = 60 hizası) - Yola göre SAĞINDA (Z ekseninde üstünde)
        for (let x = buildingX - bWidth; x > buildingX - 40; x -= bWidth) {
            const bHeight = 6 + Math.random() * 2;
            createBuilding(scene, "SmallBlock_Side20_Right_" + x, bWidth, bHeight, bDepth, 
                new BABYLON.Vector3(x, 0, 65)); // z=65 (shifted from 15)
        }
        
        console.log( "Küçük Blok: Binalar (+Tali Yol) | Büyük Blok: Otopark ");
    } else {
        const smallRoad = pickClosestLeftRoad(62.5, 100);
        const smallLotX = buildingX - 10.0;
        const smallLotWidth = 25;

        const smallLot = createCarPark(scene, {
            name: "SmallBlock_Parking",
            x: smallLotX,
            startZ: 62.5,
            endZ: 100,
            width: smallLotWidth,
            variant: "angled",
            entranceSide: "south",
            entranceZ: 35,
            entranceX: 62.5,
            customSlots: SMALL_LOT_CUSTOM_SLOTS // 🟢 Orijinal veriyi kullan (flip yok)
        });

        if (smallLot) {
            smallLot.accessSideRoad = smallRoad;
            PARKING_LOTS.push(smallLot);

            // 🟢 Orijinal navigasyon noktaları
            SMALL_PARKING_COORD_POINTS.push({id: 'small_entrance', position: new BABYLON.Vector3(-15, 0.5, 62.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_start', position: new BABYLON.Vector3(-15, 0.5, 67.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_11', position: new BABYLON.Vector3(-22.5, 0.5, 67.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_31', position: new BABYLON.Vector3(-7.5, 0.5, 67.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_12', position: new BABYLON.Vector3(-22.5, 0.5, 97.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_32', position: new BABYLON.Vector3(-7.5, 0.5, 97.5), turnTo: []});
            SMALL_PARKING_COORD_POINTS.push({id: 'small_aisle_22', position: new BABYLON.Vector3(-15, 0.5, 97.5), turnTo: []});

            // Bağlantılar
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_entrance').turnTo = ['small_aisle_start'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_start').turnTo = ['small_aisle_11', 'small_aisle_31'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_11').turnTo = ['small_aisle_12'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_12').turnTo = ['small_aisle_22'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_22').turnTo = ['small_aisle_start'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_31').turnTo = ['small_aisle_32'];
            SMALL_PARKING_COORD_POINTS.find(p => p.id === 'small_aisle_32').turnTo = ['small_aisle_22'];

            // Görsel küreler
            for (const point of SMALL_PARKING_COORD_POINTS) {
                const coordMat = new BABYLON.StandardMaterial(`small_coordMat_${point.id}`, scene);
                coordMat.emissiveColor = new BABYLON.Color3(0, 0.4, 1);
                coordMat.disableLighting = true;
                const coordSphere = BABYLON.MeshBuilder.CreateSphere(`small_coordPoint_${point.id}`, {diameter: 0.6}, scene);
                coordSphere.material = coordMat;
                coordSphere.position = point.position;
            }

            // Sarı giriş işareti
            const entranceMatSmall = new BABYLON.StandardMaterial("entranceMatSmall", scene);
            entranceMatSmall.emissiveColor = new BABYLON.Color3(1, 1, 0);
            entranceMatSmall.disableLighting = true;
            const entranceSphereSmall = BABYLON.MeshBuilder.CreateSphere("entranceSmall", {diameter: 0.6}, scene);
            entranceSphereSmall.material = entranceMatSmall;
            entranceSphereSmall.position = new BABYLON.Vector3(-15, 0.5, 62.5);

            ROAD_NETWORK.renderedParkingEntrances.push({ id: "angledLotEntrance", x: -15, z: 62.5, lotName: "SmallBlock_Parking" });
        }
        
        // Fallback bina
        const bHeight = 6 + Math.random() * 4;
        createBuilding(scene, "t1234", bWidth, bHeight, bDepth, new BABYLON.Vector3(-5, 0, -5));
    }

        // --- PARKING JUNCTION CFS DUPLICATION ---
    // Hangi otoparkın render edildiğini randomChoice belirler.
    // !randomChoice = Big Lot, randomChoice = Small Lot.
    const isBigLotRendered = !randomChoice;
    
    const cfsSideRoad = ROAD_NETWORK.sideRoads.find(sr => sr.id === "parkingJunctionCFS");
    if (cfsSideRoad) {
        const targetZ = cfsSideRoad.z; // -35
        
        // Kaynak verileri seç
        const sourceCoordPoints = isBigLotRendered ? BIG_PARKING_COORD_POINTS : SMALL_PARKING_COORD_POINTS;
        const sourceCustomSlots = isBigLotRendered ? BIG_LOT_CUSTOM_SLOTS : SMALL_LOT_CUSTOM_SLOTS;
        const variant = isBigLotRendered ? "perpendicular" : "angled";
        const lotNameBase = isBigLotRendered ? "BigBlock_Parking" : "SmallBlock_Parking";
        
        const shiftZ = isBigLotRendered 
            ? (targetZ + 2.5) - 62.5   // Big Lot: startZ 12.5 -> -47.5
            : (targetZ + 2.5) - 62.5;  // Small Lot: startZ 62.5 -> -47.5

        const cfsLotName = `${lotNameBase}_CFS`;
        
        // Slotları kaydır
        const cfsSlots = sourceCustomSlots.map(s => ({ ...s, z: s.z + shiftZ, hasBarrier: true }));
        sourceCustomSlots.push(...cfsSlots);

        // Orijinal lotun Z aralıkları
        const origStartZ = isBigLotRendered ? 12.5 : 62.5;
        const origEndZ = isBigLotRendered ? 57.5 : 100;
        
         // Yeni lotu oluştur
        const cfsLot = createCarPark(scene, {
            name: cfsLotName,
            x: buildingX - 10.0,
            startZ: origStartZ + shiftZ, // Bu artık targetZ + 2.5 = -47.5 olacak
            endZ: origEndZ + shiftZ,
            width: 25,
            variant: variant,
            entranceSide: "south",
            entranceZ: targetZ,
            entranceX: 7.5,
            customSlots: cfsSlots
        });

        if (cfsLot) {
            cfsLot.accessSideRoad = cfsSideRoad;
            PARKING_LOTS.push(cfsLot);

            // Koordinasyon noktalarını kopyala ve kaydır
            const cfsCoords = sourceCoordPoints.map(p => ({
                id: `cfs_${p.id}`,
                position: new BABYLON.Vector3(p.position.x, p.position.y, p.position.z + shiftZ),
                turnTo: p.turnTo.map(t => `cfs_${t}`)
            }));

            const coordArray = isBigLotRendered ? BIG_PARKING_COORD_POINTS : SMALL_PARKING_COORD_POINTS;
            coordArray.push(...cfsCoords);
            cfsLot.coordPoints = coordArray;

            // Mavi koordinasyon küreleri (Görsel)
            for (const p of cfsCoords) {
                const m = new BABYLON.StandardMaterial(`cfs_m_${p.id}`, scene);
                m.emissiveColor = new BABYLON.Color3(0, 0.4, 1);
                m.disableLighting = true;
                const s = BABYLON.MeshBuilder.CreateSphere(`cfs_s_${p.id}`, {diameter: 0.6}, scene);
                s.material = m;
                s.position = p.position;
            }

            // Sarı giriş işaretçisi
            const entMat = new BABYLON.StandardMaterial("cfs_entMat", scene);
            entMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
            entMat.disableLighting = true;
            const entSphere = BABYLON.MeshBuilder.CreateSphere("cfs_entSphere", {diameter: 0.6}, scene);
            entSphere.material = entMat;
            const cfsEntranceZ = isBigLotRendered ? 57.5 + shiftZ : 62.5 + shiftZ;
            entSphere.position = new BABYLON.Vector3(-15, 0.5, cfsEntranceZ);

            // Simülasyona giriş noktasını bildir
            ROAD_NETWORK.renderedParkingEntrances.push({
                id: cfsLotName,
                x: -15,
                z: cfsEntranceZ,
                lotName: cfsLotName
            });
            console.log(`[CFS] Duplicated ${cfsLotName} at z=${targetZ}`);

            const serverPos = {
                x: -28.1,
                y: 0,
                z: cfsEntranceZ - (isBigLotRendered ? 0.75 : -0.75)
            };
            
            const cpsServer = new ServerComputer(scene, cfsLot, serverPos, { x: 0.85, y: 0.85, z: 0.85 });
            if (!window.CPS_SERVERS) window.CPS_SERVERS = [];
            window.CPS_SERVERS.push(cpsServer);

            const cfsMagnetometers = [];
            cfsSlots.forEach((slot, index) => {
                // Ensure slot has an ID for the magnetometer to use
                const slotWithId = { ...slot, id: `cfs_slot_${index}` };
                const mag = new Magnetometer(scene, slotWithId, cpsServer, {
                    detectionRadius: 1.0 // ~2.5 meters detection range
                });
                cfsMagnetometers.push(mag);
            });
            cfsLot.magnetometers = cfsMagnetometers;
            console.log(`[CPS] 🟢 Deployed ${cfsMagnetometers.length} magnetometers for ${cfsLot.name}`);

            if(isBigLotRendered)
            {
                CFS_STATUS_ORB = createStatusOrb(scene, cpsServer, {
                x: -12.5, y: 1, z: cfsEntranceZ // 🎯 SET YOUR COORDINATES HERE
            });
            }
            else
            {
                CFS_STATUS_ORB = createStatusOrb(scene, cpsServer, {
                    x: -12.5, y: 1, z: cfsEntranceZ // 🎯 SET YOUR COORDINATES HERE
                });
            }

            if (isBigLotRendered) {
                const zoneASlots = cfsSlots.filter(s => s.z === -56);
    
                const sign1 = new LEDSign(scene, 
                    { x: -17.5, y: 1.5, z: -57.5 },
                    cfsLot, 
                    { 
                        server: cpsServer,
                        slots: zoneASlots,  // 👈 Doğrudan slot koordinatları
                        text: "A BÖLGESİ",
                        textColor: "#00FF00",
                        rotation: 270, // Burayı derece cinsinden yazarsan (90 derece) sınıf içindeki (Math.PI / 180) çarpanı ile doğruya çevrilir.
                        support: { 
                            from: { x: -17.5, y: 1.5, z: -52.5 }
                        }
                    }
                );

                cpsServer.ledSigns = cpsServer.ledSigns || [];
                cpsServer.ledSigns.push(sign1);
                sign1.updateText("#FFFF00",`${zoneASlots.length} SLOTS\nAVAILABLE HERE`);
                
                // const sign2 = new LEDSign(scene, 
                //     { x: -15, y: 1.5, z: -50 }, 
                //     cfsLot, 
                //     { text: "PARK", textColor: "#FFD700" }
                // );
            } 
            // Small Lot CPS için
            else {
                // const sign3 = new LEDSign(scene, 
                //     { x: 5, y: 1.5, z: -28.75 }, 
                //     cfsLot, 
                //     { text: "CPS", textColor: "#00FF00" }
                // );
                
                // const sign4 = new LEDSign(scene, 
                //     { x: -15, y: 1.5, z: -60 }, 
                //     cfsLot, 
                //     { text: "PARK", textColor: "#FFD700" }
                // );
            }

        }
    }
}