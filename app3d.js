// 3D Viewer Module for Ear Mold Analysis
// Three.js Integration

// 3D State
const state3D = {
    mode: '2D', // '2D' or '3D'
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    model: null,
    raycaster: null,
    mouse: null,
    markers: [],
    isModelLoaded: false
};

// Initialize 3D Viewer
function initialize3DViewer() {
    const container = document.getElementById('viewer3D');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    state3D.scene = new THREE.Scene();
    state3D.scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    state3D.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    state3D.camera.position.set(50, 50, 50);

    // Renderer
    state3D.renderer = new THREE.WebGLRenderer({ antialias: true });
    state3D.renderer.setSize(width, height);
    state3D.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(state3D.renderer.domElement);

    // Controls
    state3D.controls = new THREE.OrbitControls(state3D.camera, state3D.renderer.domElement);
    state3D.controls.enableDamping = true;
    state3D.controls.dampingFactor = 0.05;
    state3D.controls.screenSpacePanning = false;
    state3D.controls.minDistance = 10;
    state3D.controls.maxDistance = 200;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    state3D.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    state3D.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    state3D.scene.add(directionalLight2);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 10, 0x888888, 0xdddddd);
    state3D.scene.add(gridHelper);

    // Raycaster for picking
    state3D.raycaster = new THREE.Raycaster();
    state3D.mouse = new THREE.Vector2();

    // Event listeners
    state3D.renderer.domElement.addEventListener('click', handle3DClick);
    state3D.renderer.domElement.addEventListener('mousemove', handle3DMouseMove);
    window.addEventListener('resize', handle3DResize);

    // Start animation loop
    animate3D();

    console.log('3D Viewer initialized');
}

// Animation loop
function animate3D() {
    requestAnimationFrame(animate3D);

    if (state3D.controls) {
        state3D.controls.update();
    }

    if (state3D.renderer && state3D.scene && state3D.camera) {
        state3D.renderer.render(state3D.scene, state3D.camera);
    }
}

// Handle window resize
function handle3DResize() {
    const container = document.getElementById('viewer3D');
    if (!container || !state3D.camera || !state3D.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    state3D.camera.aspect = width / height;
    state3D.camera.updateProjectionMatrix();
    state3D.renderer.setSize(width, height);
}

// Load STL Model
function loadSTLModel(file) {
    const loader = new THREE.STLLoader();
    const reader = new FileReader();

    reader.onload = function(event) {
        const geometry = loader.parse(event.target.result);

        // Center and scale geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Calculate scale to fit in view
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 40 / maxDim;
        geometry.scale(scale, scale, scale);

        // Compute normals
        geometry.computeVertexNormals();

        // Create material
        const material = new THREE.MeshPhongMaterial({
            color: 0xffc0cb,
            specular: 0x111111,
            shininess: 100,
            side: THREE.DoubleSide
        });

        // Remove old model if exists
        if (state3D.model) {
            state3D.scene.remove(state3D.model);
        }

        // Create mesh
        state3D.model = new THREE.Mesh(geometry, material);
        state3D.scene.add(state3D.model);

        // Update camera position
        state3D.camera.position.set(50, 50, 50);
        state3D.camera.lookAt(0, 0, 0);
        state3D.controls.target.set(0, 0, 0);

        state3D.isModelLoaded = true;

        // Hide placeholder
        document.getElementById('viewer3DPlaceholder').style.display = 'none';
        document.getElementById('viewer3D').classList.add('active');

        // Update file info
        document.getElementById('fileInfo').innerHTML = `
            <strong>Yüklendi:</strong> ${file.name}<br>
            <strong>Format:</strong> STL<br>
            <strong>Boyut:</strong> ${(file.size / 1024).toFixed(2)} KB
        `;

        console.log('STL model loaded successfully');
    };

    reader.readAsArrayBuffer(file);
}

// Load OBJ Model
function loadOBJModel(file) {
    const loader = new THREE.OBJLoader();
    const reader = new FileReader();

    reader.onload = function(event) {
        const object = loader.parse(event.target.result);

        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        object.position.sub(center);

        // Scale
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 40 / maxDim;
        object.scale.set(scale, scale, scale);

        // Apply material
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xffc0cb,
                    specular: 0x111111,
                    shininess: 100,
                    side: THREE.DoubleSide
                });
            }
        });

        // Remove old model
        if (state3D.model) {
            state3D.scene.remove(state3D.model);
        }

        state3D.model = object;
        state3D.scene.add(state3D.model);

        // Update camera
        state3D.camera.position.set(50, 50, 50);
        state3D.camera.lookAt(0, 0, 0);
        state3D.controls.target.set(0, 0, 0);

        state3D.isModelLoaded = true;

        // Hide placeholder
        document.getElementById('viewer3DPlaceholder').style.display = 'none';
        document.getElementById('viewer3D').classList.add('active');

        // Update file info
        document.getElementById('fileInfo').innerHTML = `
            <strong>Yüklendi:</strong> ${file.name}<br>
            <strong>Format:</strong> OBJ<br>
            <strong>Boyut:</strong> ${(file.size / 1024).toFixed(2)} KB
        `;

        console.log('OBJ model loaded successfully');
    };

    reader.readAsText(file);
}

// Handle 3D Click (for placing markers)
function handle3DClick(event) {
    if (!state3D.isModelLoaded || !state.currentRegion) return;

    const rect = state3D.renderer.domElement.getBoundingClientRect();
    state3D.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state3D.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    state3D.raycaster.setFromCamera(state3D.mouse, state3D.camera);

    const intersects = state3D.raycaster.intersectObject(state3D.model, true);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        add3DMarker(point, state.currentRegion, state.currentColor);
    }
}

// Handle 3D Mouse Move (for hover effects)
function handle3DMouseMove(event) {
    if (!state3D.isModelLoaded) return;

    const rect = state3D.renderer.domElement.getBoundingClientRect();
    state3D.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state3D.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    state3D.raycaster.setFromCamera(state3D.mouse, state3D.camera);
    const intersects = state3D.raycaster.intersectObject(state3D.model, true);

    state3D.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

// Add 3D Marker
function add3DMarker(position, region, color) {
    // Create sphere marker in 3D space
    const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: color });
    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(position);
    state3D.scene.add(markerMesh);

    // Save to annotations
    const annotation = {
        id: generateId(),
        type: 'point3d',
        region: region,
        color: color,
        position: {
            x: position.x,
            y: position.y,
            z: position.z
        },
        mesh: markerMesh,
        notes: '',
        isCorrect: true,
        confidence: 100,
        timestamp: new Date().toISOString()
    };

    state.annotations.push(annotation);
    state3D.markers.push(annotation);

    updateAnnotationsList();
    updateStatistics();

    console.log('3D marker added at:', position);
}

// Clear 3D Markers
function clear3DMarkers() {
    state3D.markers.forEach(marker => {
        if (marker.mesh) {
            state3D.scene.remove(marker.mesh);
        }
    });
    state3D.markers = [];
}

// Switch between 2D and 3D mode
function switchMode(mode) {
    state3D.mode = mode;

    const canvas2D = document.getElementById('canvas2DContainer');
    const viewer3D = document.getElementById('viewer3DContainer');
    const mode2DBtn = document.getElementById('mode2D');
    const mode3DBtn = document.getElementById('mode3D');
    const uploadBtnText = document.getElementById('uploadBtnText');

    if (mode === '2D') {
        canvas2D.style.display = 'flex';
        viewer3D.style.display = 'none';
        mode2DBtn.classList.add('active');
        mode3DBtn.classList.remove('active');
        uploadBtnText.textContent = '📤 Kulak Kalıbı Görseli Yükle';
    } else {
        canvas2D.style.display = 'none';
        viewer3D.style.display = 'flex';
        mode2DBtn.classList.remove('active');
        mode3DBtn.classList.add('active');
        uploadBtnText.textContent = '🎲 3D Model Yükle (STL/OBJ)';

        // Initialize 3D viewer if not already done
        if (!state3D.renderer) {
            initialize3DViewer();
        } else {
            handle3DResize(); // Update size
        }
    }

    console.log('Switched to', mode, 'mode');
}

// Export functions for use in main app
window.initialize3DViewer = initialize3DViewer;
window.loadSTLModel = loadSTLModel;
window.loadOBJModel = loadOBJModel;
window.switchMode = switchMode;
window.clear3DMarkers = clear3DMarkers;
window.state3D = state3D;
