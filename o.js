// Inside your CPS lot creation block (after cpsServer is created)

if (isBigLotRendered) {
    // Sign 1: Covers the back half of the CPS lot (Z: -90 to -70)
    const zoneASlots = cfsSlots.filter(s => s.x === -24 && s.z <= -30);
    
    const sign1 = new LEDSign(scene, 
        { x: -30, y: 1.5, z: -75 }, 
        cfsLot, 
        { 
            server: cpsServer,
            slots: zoneASlots,  // 👈 Doğrudan slot koordinatları
            fullText: "A DOLU",
            fullTextColor: "#FF4444",
            defaultTextColor: "#00FF00"
        }
    );

    
} else {
    // Small Lot CPS configuration...
    
}

//...
// 🟢 ADD THIS INSIDE scene.onBeforeRenderObservable.add():
if (window.CPS_SIGNS) {
    for (const sign of window.CPS_SIGNS) {
        sign.update(cars);
    }
}