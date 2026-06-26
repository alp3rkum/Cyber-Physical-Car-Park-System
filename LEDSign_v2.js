export class LEDSign {
    constructor(scene, position, parkingLot, options = {}) {
        this.scene = scene;
        this.position = position;
        this.parkingLot = parkingLot;
        this.width = options.width || 1.2;
        this.height = options.height || 0.6;
        this.text = options.text || "PARKING";
        this.rotationY = (options.rotation || 0) * (Math.PI / 180);
        this.supportOptions = options.support;
        this.textColor = options.textColor;
        // Başındaki const veya let ifadesini kaldırıp this.texture yapıyoruz
        this.texture = new BABYLON.DynamicTexture("led_texture", { width: 512, height: 256 }, this.scene);

        // 🚨 Sadece parametre olarak gelen slotları bağla
        this.slots = options.slots || [];
        console.log("Bölge A Slotları: ",this.slots);

        this.root = new BABYLON.TransformNode("led_sign_root", scene);
        this.root.position.set(this.position.x, this.position.y, this.position.z);
        this.root.rotation.y = this.rotationY;
        
        this._buildScreen();
        if (this.supportOptions) this._createManualSupport();
    }

    _buildScreen() {
        // Çerçeve yok, sadece ekran
        const screen = BABYLON.MeshBuilder.CreatePlane("screen", { width: this.width, height: this.height }, this.scene);
        screen.parent = this.root;

        //const texture = new BABYLON.DynamicTexture("txt", 512, this.scene);
        const ctx = this.texture.getContext();
        ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = this.textColor; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "bold 64px Arial";
        ctx.fillText(this.text, 256, 128);
        this.texture.update();

        const mat = new BABYLON.StandardMaterial("mat", this.scene);
        mat.emissiveTexture = this.texture;
        mat.disableLighting = true;
        mat.backFaceCulling = false; // Arkası da görünsün
        screen.material = mat;
    }

    updateText(textColor, text) {
        const ctx = this.texture.getContext();
        const size = this.texture.getSize();

        // 1. Ekranı temizle ve siyah arka plan yap
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, size.width, size.height);

        // 2. Font ve hizalama ayarları
        ctx.font = "bold 36px monospace"; // Çok satırda sığması için fontu biraz küçültebilirsin
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = textColor;

        // 3. Metni \n karakterine göre satırlara böl
        const lines = text.split('\n');
        const lineHeight = 44; // Her satırın arasındaki dikey mesafe (piksel)

        // 4. Satır sayısına göre dikey başlangıç noktasını ortala
        // Toplam blok yüksekliğinin yarısını bulup merkezden yukarı kaydırıyoruz
        const totalHeight = lines.length * lineHeight;
        let startY = (size.height / 2) - (totalHeight / 2) + (lineHeight / 2);

        // 5. Her satırı döngüyle dikeyde alta kaydırarak yazdır
        lines.forEach((line, index) => {
            ctx.fillText(line, size.width / 2, startY + (index * lineHeight));
        });

        // 6. Ekran kartını tetikle
        this.texture.update();
    }

    _createManualSupport() {
        const { from } = this.supportOptions;
        const to = this.position; 
        
        // Tabelanın yarısı kadar pay bırak (tabela genişliğinin yarısı)
        // Eğer tabela genişliği options'tan gelmiyorsa varsayılan değerini buraya yaz
        const offset = this.width / 2; 

        const dx = to.x - from.x;
        const dz = to.z - from.z;

        // Toplam mesafeyi hesapla
        const fullDistance = Math.sqrt(dx * dx + dz * dz);
        
        // Mesafeden offset kadar çıkar ki tabelanın içine kadar girmesin
        const adjustedLength = fullDistance - offset;

        // Ayak kutusu (ayarlanmış uzunluk ile)
        const arm = BABYLON.MeshBuilder.CreateBox("arm", { 
            width: 0.1, 
            height: 0.1, 
            depth: adjustedLength 
        }, this.scene);

        // Pozisyonu yeniden hesapla (kaydırma payı ile)
        // Hem x hem z için yönü vektör ile oranlayarak kaydırıyoruz
        const ratio = (adjustedLength / 2) / fullDistance;
        arm.position.x = from.x + dx * ratio;
        arm.position.y = from.y;
        arm.position.z = from.z + dz * ratio;

        arm.rotation.y = Math.atan2(dx, dz);

        const mat = new BABYLON.StandardMaterial("armMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        arm.material = mat;
    }

}