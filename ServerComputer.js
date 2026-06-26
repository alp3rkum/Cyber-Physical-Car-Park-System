// ServerComputer.js
// ServerComputer.js
export class ServerComputer {
    constructor(scene, lotReference, position, scale) {
        this.scene = scene;
        this.targetLot = lotReference;        //  Bağlı olduğu otopark nesnesi
        this.slots = lotReference.customSlots || []; // ️ Tüm slot tanımları
        this.position = position || { x: 0, y: 0, z: 0 };
        this.scale = scale || { x: 1, y: 1, z: 1 };
        
        this.magnetometers = [];       // Array of registered sensor objects
        this.slotStates = new Map();

        this._buildPhysicalMesh();
    }

    // Fiziksel gövde (Önceki kodun sınıf içine alınmış hali)
    _buildPhysicalMesh() {
        this.root = new BABYLON.TransformNode("server_root", this.scene);
        this.root.position.set(this.position.x, this.position.y, this.position.z);
        this.root.scaling.set(this.scale.x, this.scale.y, this.scale.z);

        const w = 1.0, h = 1.8, d = 1.2;
        this.box = BABYLON.MeshBuilder.CreateBox("server_box", { width: w, height: h, depth: d }, this.scene);
        
        const mat = new BABYLON.StandardMaterial("server_mat", this.scene);
        const tex = new BABYLON.Texture("assets/server.png", this.scene);
        tex.wrapU = BABYLON.Texture.CLAMP_ADDRESS;
        tex.wrapV = BABYLON.Texture.CLAMP_ADDRESS;
        tex.anisotropicFilteringLevel = 4;
        mat.diffuseTexture = tex;
        mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        mat.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.1);
        
        this.box.material = mat;
        this.box.parent = this.root;
        this.box.position.y = h / 2;

        // Aktiflik göstergesi (Mavi LED şerit)
        const ledMat = new BABYLON.StandardMaterial("server_led_mat", this.scene);
        ledMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.8);
        ledMat.disableLighting = true;
        this.led = BABYLON.MeshBuilder.CreateBox("server_led", { width: w-0.15, height: 0.1, depth: d+0.03 }, this.scene);
        this.led.material = ledMat;
        this.led.position.set(0, h - 0.25, 0);
        this.led.parent = this.root;
    }

    // 🧠 CPS: Tüm slotları getir
    getAllSlots() {
        return this.slots.map(s => ({
            id: `${s.x.toFixed(1)}_${s.z.toFixed(1)}`,
            x: s.x,
            z: s.z,
            angle: s.angle || 0,
            lotName: this.targetLot.name
        }));
    }

    // 🧠 CPS: Belirli bir koordinata en yakın slotu bul
    findNearestSlot(targetX, targetZ) {
        let nearest = null;
        let minDist = Infinity;
        for (const slot of this.slots) {
            const dx = targetX - slot.x;
            const dz = targetZ - slot.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < minDist) {
                minDist = dist;
                nearest = { ...slot, distance: dist };
            }
        }
        return nearest;
    }

    registerMagnetometer(magnetometer) {
        this.magnetometers.push(magnetometer);
        this.slotStates.set(magnetometer.slotId, false); // Initialize as empty
    }

    updateSlotState(slotId, isOccupied) {
        this.slotStates.set(slotId, isOccupied);
    }

    // 🧠 CPS: Doluluk durumunu analiz et (araba listesine göre)
    getOccupancyMap(allCars) {
        // 1. Trigger all physical sensors to check their environment
        for (const mag of this.magnetometers) {
            mag.checkOccupancy(allCars);
        }

        // 2. Build the occupancy map
        return this.slots.map(slot => {
            const slotId = `${slot.x.toFixed(1)}_${slot.z.toFixed(1)}`;
            
            let isOccupied = false;

            // If this slot has a magnetometer, trust its physical reading
            if (this.slotStates.has(slotId)) {
                isOccupied = this.slotStates.get(slotId);
            } 
            // 🆕 Academic Feature: Sparse Sensing Fallback
            // If no sensor is installed, infer occupancy from car software state
            else {
                isOccupied = allCars.some(car => 
                    !car.isActive && car.targetParkingSlot &&
                    Math.abs(car.targetParkingSlot.x - slot.x) < 0.1 &&
                    Math.abs(car.targetParkingSlot.z - slot.z) < 0.1
                );
            }

            return {
                x: slot.x,
                z: slot.z,
                angle: slot.angle,
                isOccupied: isOccupied,
                lotName: this.targetLot.name,
                hasSensor: this.slotStates.has(slotId) // 📊 Crucial for your paper's metrics!
            };
        });
    }

    // Temizlik
    dispose() {
        if (this.box) this.box.dispose();
        if (this.led) this.led.dispose();
        if (this.root) this.root.dispose();
    }
}
//     // Root transform node
//     const root = new BABYLON.TransformNode(name + "_root", scene);
//     root.position.set(position.x, position.y, position.z);
//     root.scaling.set(scale.x, scale.y, scale.z);

//     // Server rack dimensions (rectangular box - taller than wide)
//     const width = 1.2;    // X axis
//     const height = 2.0;   // Y axis (tall server rack)
//     const depth = 1.6;    // Z axis

//     // Create main server box
//     const serverBox = BABYLON.MeshBuilder.CreateBox(name + "_box", {
//         width: width,
//         height: height,
//         depth: depth
//     }, scene);

//     // Material with server texture
//     const serverMat = new BABYLON.StandardMaterial(name + "_mat", scene);
//     const serverTexture = new BABYLON.Texture("assets/server.png", scene);
    
//     // Configure texture wrapping and filtering
//     serverTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESS;
//     serverTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESS;
//     serverTexture.anisotropicFilteringLevel = 4;
    
//     serverMat.diffuseTexture = serverTexture;
//     serverMat.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
//     serverMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05); // Slight glow
    
//     serverBox.material = serverMat;
//     serverBox.parent = root;
//     serverBox.position.y = height / 2; // Sit on ground

//     // Optional: Add a subtle emissive panel for "active" look
//     const panelMat = new BABYLON.StandardMaterial(name + "_panelMat", scene);
//     panelMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4); // Blue-ish server lights
//     panelMat.disableLighting = true;

//     // Front panel indicator (small strip at top)
//     const panelStrip = BABYLON.MeshBuilder.CreateBox(name + "_panel", {
//         width: width - 0.1,
//         height: 0.15,
//         depth: depth + 0.02
//     }, scene);
//     panelStrip.material = panelMat;
//     panelStrip.position.set(0, height - 0.3, 0);
//     panelStrip.parent = root;

//     // Return object with useful references
//     return {
//         root: root,
//         mesh: serverBox,
//         material: serverMat,
//         texture: serverTexture,
//         position: position,
//         scale: scale,
        
//         // Helper methods
//         setPosition: function(x, y, z) {
//             root.position.set(x, y, z);
//             this.position = { x, y, z };
//         },
        
//         setScale: function(x, y, z) {
//             root.scaling.set(x, y, z);
//             this.scale = { x, y, z };
//         },
        
//         dispose: function() {
//             serverBox.dispose();
//             panelStrip.dispose();
//             serverMat.dispose();
//             panelMat.dispose();
//             root.dispose();
//         }
//     };
// }

// export default createServerComputer;