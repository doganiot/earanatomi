// Kulak Kalıbı Anatomik Analiz Sistemi
// Ana JavaScript Dosyası

// Global State
const state = {
    image: null,
    currentTool: 'polygon',
    currentRegion: null,
    currentColor: '#FF6B6B',
    annotations: [],
    errors: [],
    temporaryPoints: [],
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    showLabels: true,
    opacity: 0.5,
    selectedAnnotation: null
};

// Anatomik Bölge Tanımları
const anatomyDefinitions = {
    'helix': {
        name: 'Helix',
        description: 'Kulak kepçesinin en dış kıvrımı. Kulak kalıbında bu bölge iç kıvrım olarak görünür.',
        importance: 'Kulak kalıbının dış sınırlarını belirler ve tutuculuğu sağlar.'
    },
    'anti-helix': {
        name: 'Anti-Helix',
        description: 'Helix\'in iç tarafındaki belirgin kıvrım. İki kola ayrılır (superior ve inferior crus).',
        importance: 'Kulak kalıbının anatomik uyumunu sağlar.'
    },
    'concha-cymba': {
        name: 'Concha (Cymba)',
        description: 'Concha\'nın üst bölümü, anti-helix crus\'larının arasında yer alır.',
        importance: 'Kalıbın oturmasını ve tutuculuğunu sağlar.'
    },
    'concha-cavum': {
        name: 'Concha (Cavum)',
        description: 'Concha\'nın alt ve ana bölümü, kulak kanalı girişini çevreler.',
        importance: 'Kulak kalıbının ana oturma bölgesidir.'
    },
    'tragus': {
        name: 'Tragus',
        description: 'Kulak kanalı girişinin önündeki çıkıntı. Kulak kalıbında çukur olarak görünür.',
        importance: 'Ön tutuculuk sağlar.'
    },
    'anti-tragus': {
        name: 'Anti-Tragus',
        description: 'Tragus\'un karşısındaki çıkıntı, lobül ile concha arasında.',
        importance: 'Alt tutuculuk ve stabilite sağlar.'
    },
    'aperture': {
        name: 'Aperture (Kanal Girişi)',
        description: 'Kulak kanalının giriş açıklığı, concha ile canal arasındaki geçiş.',
        importance: 'Ses iletimi ve seal (sızdırmazlık) için kritiktir.'
    },
    'canal': {
        name: 'Canal (Kulak Kanalı)',
        description: 'Dış kulak yolunun kulak kalıbındaki bölümü.',
        importance: 'Ses iletimi ve kulak kalıbının derinlemesine tutuculuğu için önemlidir.'
    },
    'first-bend': {
        name: 'First Bend (İlk Bükülme)',
        description: 'Kulak kanalının ilk anatomik bükülme noktası (yaklaşık 6-8 mm derinlikte).',
        importance: 'Kalıp uzunluğunun belirlenmesinde referans noktasıdır.'
    },
    'second-bend': {
        name: 'Second Bend (İkinci Bükülme)',
        description: 'Kulak kanalının ikinci anatomik bükülme noktası (yaklaşık 15-20 mm derinlikte).',
        importance: 'Derin seal kalıplar için referans noktasıdır.'
    },
    'crus-helix': {
        name: 'Crus of Helix',
        description: 'Helix\'in kökü, concha içine doğru uzanan çıkıntı.',
        importance: 'Kalıbın üst kısmının stabilizasyonu için önemlidir.'
    },
    'lobule': {
        name: 'Lobule (Kulak Memesi)',
        description: 'Kulak memesi bölgesi, yumuşak doku.',
        importance: 'Bazı kalıp tiplerinde alt sınırı belirler.'
    }
};

// Canvas ve DOM Elementleri - DOMContentLoaded sonrası atanacak
let canvas, ctx, placeholder, canvasControls;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini seç
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    placeholder = document.getElementById('canvasPlaceholder');
    canvasControls = document.getElementById('canvasControls');

    initializeEventListeners();
    updateUI();
});

// Event Listeners
function initializeEventListeners() {
    // Image Upload
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('imageUpload').click();
    });

    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

    // Anatomy Buttons
    document.querySelectorAll('.anatomy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const region = e.currentTarget.dataset.region;
            const color = e.currentTarget.dataset.color;
            selectRegion(region, color);
        });

        // Hover effect for anatomy reference
        btn.addEventListener('mouseenter', (e) => {
            const region = e.currentTarget.dataset.region;
            showAnatomyReference(region);
        });
    });

    // Tool Buttons
    document.getElementById('polygonTool').addEventListener('click', () => selectTool('polygon'));
    document.getElementById('pointTool').addEventListener('click', () => selectTool('point'));
    document.getElementById('errorTool').addEventListener('click', () => selectTool('error'));
    document.getElementById('clearTool').addEventListener('click', clearCurrentDrawing);

    // Options
    document.getElementById('showLabels').addEventListener('change', (e) => {
        state.showLabels = e.target.checked;
        redrawCanvas();
    });

    document.getElementById('opacitySlider').addEventListener('input', (e) => {
        state.opacity = e.target.value / 100;
        document.getElementById('opacityValue').textContent = e.target.value + '%';
        redrawCanvas();
    });

    // Canvas Events
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('dblclick', handleCanvasDoubleClick);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Zoom Controls
    document.getElementById('zoomIn').addEventListener('click', () => zoom(1.2));
    document.getElementById('zoomOut').addEventListener('click', () => zoom(0.8));
    document.getElementById('resetZoom').addEventListener('click', resetZoom);

    // Data Management
    document.getElementById('saveBtn').addEventListener('click', saveAnnotations);
    document.getElementById('loadBtn').addEventListener('click', () => {
        document.getElementById('jsonUpload').click();
    });
    document.getElementById('jsonUpload').addEventListener('change', loadAnnotations);
    document.getElementById('exportBtn').addEventListener('click', exportReport);

    // Modal Events
    document.getElementById('modalSave').addEventListener('click', saveAnnotationEdit);
    document.getElementById('modalDelete').addEventListener('click', deleteAnnotationFromModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('confidenceScore').addEventListener('input', (e) => {
        document.getElementById('confidenceValue').textContent = e.target.value + '%';
    });
}

// Image Handling
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            state.image = img;
            setupCanvas(img);
            placeholder.style.display = 'none';
            canvas.style.display = 'block';
            canvas.classList.add('active');
            canvasControls.style.display = 'flex';

            // Update image info
            document.getElementById('imageInfo').innerHTML = `
                <strong>Yüklendi:</strong> ${file.name}<br>
                <strong>Boyut:</strong> ${img.width} x ${img.height}px
            `;

            redrawCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setupCanvas(img) {
    // Set canvas size to maintain aspect ratio
    const maxWidth = canvas.parentElement.clientWidth - 40;
    const maxHeight = canvas.parentElement.clientHeight - 40;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    state.scale = 1;
    state.offsetX = 0;
    state.offsetY = 0;
}

// Region Selection
function selectRegion(region, color) {
    state.currentRegion = region;
    state.currentColor = color;

    // Update UI
    document.querySelectorAll('.anatomy-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.region === region);
    });

    showAnatomyReference(region);
}

function showAnatomyReference(region) {
    const def = anatomyDefinitions[region];
    if (!def) return;

    const referenceDiv = document.getElementById('anatomyReference');
    referenceDiv.innerHTML = `
        <h4>${def.name}</h4>
        <p><strong>Tanım:</strong> ${def.description}</p>
        <p><strong>Önemi:</strong> ${def.importance}</p>
    `;
}

// Tool Selection
function selectTool(tool) {
    state.currentTool = tool;

    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (tool === 'polygon') document.getElementById('polygonTool').classList.add('active');
    if (tool === 'point') document.getElementById('pointTool').classList.add('active');
    if (tool === 'error') document.getElementById('errorTool').classList.add('active');

    // Change cursor
    if (state.image) {
        canvas.style.cursor = tool === 'polygon' || tool === 'point' || tool === 'error' ? 'crosshair' : 'grab';
    }
}

// Canvas Drawing Events
function handleCanvasMouseDown(e) {
    if (!state.image) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.scale - state.offsetX;
    const y = (e.clientY - rect.top) / state.scale - state.offsetY;

    if (state.currentTool === 'polygon') {
        state.temporaryPoints.push({ x, y });
        redrawCanvas();
    } else if (state.currentTool === 'point') {
        if (!state.currentRegion) {
            alert('Lütfen önce bir anatomik bölge seçin!');
            return;
        }
        addPointAnnotation(x, y);
    } else if (state.currentTool === 'error') {
        addErrorMarker(x, y);
    }
}

function handleCanvasMouseMove(e) {
    if (!state.image) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.scale - state.offsetX;
    const y = (e.clientY - rect.top) / state.scale - state.offsetY;

    // Show temporary line when drawing polygon
    if (state.currentTool === 'polygon' && state.temporaryPoints.length > 0) {
        redrawCanvas();
        ctx.save();
        ctx.scale(state.scale, state.scale);
        ctx.translate(state.offsetX, state.offsetY);

        const lastPoint = state.temporaryPoints[state.temporaryPoints.length - 1];
        ctx.strokeStyle = state.currentColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }
}

function handleCanvasMouseUp(e) {
    // Reserved for future drag functionality
}

function handleCanvasDoubleClick(e) {
    if (state.currentTool === 'polygon' && state.temporaryPoints.length >= 3) {
        completePolygon();
    }
}

// Annotation Functions
function addPointAnnotation(x, y) {
    const annotation = {
        id: generateId(),
        type: 'point',
        region: state.currentRegion,
        color: state.currentColor,
        x: x,
        y: y,
        notes: '',
        isCorrect: true,
        confidence: 100,
        timestamp: new Date().toISOString()
    };

    state.annotations.push(annotation);
    redrawCanvas();
    updateAnnotationsList();
    updateStatistics();
}

function completePolygon() {
    if (!state.currentRegion) {
        alert('Lütfen önce bir anatomik bölge seçin!');
        state.temporaryPoints = [];
        redrawCanvas();
        return;
    }

    const annotation = {
        id: generateId(),
        type: 'polygon',
        region: state.currentRegion,
        color: state.currentColor,
        points: [...state.temporaryPoints],
        notes: '',
        isCorrect: true,
        confidence: 100,
        timestamp: new Date().toISOString()
    };

    state.annotations.push(annotation);
    state.temporaryPoints = [];
    redrawCanvas();
    updateAnnotationsList();
    updateStatistics();
}

function addErrorMarker(x, y) {
    const notes = prompt('Hata açıklaması girin:');
    if (notes === null) return;

    const error = {
        id: generateId(),
        x: x,
        y: y,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    state.errors.push(error);
    redrawCanvas();
    updateErrorsList();
    updateStatistics();
}

function clearCurrentDrawing() {
    if (state.temporaryPoints.length > 0) {
        state.temporaryPoints = [];
        redrawCanvas();
    } else {
        if (confirm('Tüm etiketleri ve hata işaretlerini temizlemek istediğinizden emin misiniz?')) {
            state.annotations = [];
            state.errors = [];
            redrawCanvas();
            updateAnnotationsList();
            updateErrorsList();
            updateStatistics();
        }
    }
}

// Canvas Rendering
function redrawCanvas() {
    if (!state.image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(state.scale, state.scale);
    ctx.translate(state.offsetX, state.offsetY);

    // Draw image
    ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    state.annotations.forEach(annotation => {
        drawAnnotation(annotation);
    });

    // Draw temporary polygon
    if (state.temporaryPoints.length > 0) {
        drawTemporaryPolygon();
    }

    // Draw errors
    state.errors.forEach(error => {
        drawErrorMarker(error);
    });

    ctx.restore();
}

function drawAnnotation(annotation) {
    ctx.save();

    if (annotation.type === 'polygon') {
        // Fill polygon
        ctx.fillStyle = annotation.color;
        ctx.globalAlpha = state.opacity;
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        for (let i = 1; i < annotation.points.length; i++) {
            ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw border
        ctx.globalAlpha = 1;
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        annotation.points.forEach(point => {
            ctx.fillStyle = annotation.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw label
        if (state.showLabels) {
            const centerX = annotation.points.reduce((sum, p) => sum + p.x, 0) / annotation.points.length;
            const centerY = annotation.points.reduce((sum, p) => sum + p.y, 0) / annotation.points.length;
            drawLabel(centerX, centerY, anatomyDefinitions[annotation.region].name, annotation.color);
        }
    } else if (annotation.type === 'point') {
        // Draw point marker
        ctx.fillStyle = annotation.color;
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        if (state.showLabels) {
            drawLabel(annotation.x + 15, annotation.y, anatomyDefinitions[annotation.region].name, annotation.color);
        }
    }

    ctx.restore();
}

function drawTemporaryPolygon() {
    if (state.temporaryPoints.length === 0) return;

    ctx.save();

    // Draw lines
    ctx.strokeStyle = state.currentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.temporaryPoints[0].x, state.temporaryPoints[0].y);
    for (let i = 1; i < state.temporaryPoints.length; i++) {
        ctx.lineTo(state.temporaryPoints[i].x, state.temporaryPoints[i].y);
    }
    ctx.stroke();

    // Draw points
    state.temporaryPoints.forEach(point => {
        ctx.fillStyle = state.currentColor;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function drawErrorMarker(error) {
    ctx.save();

    // Draw X marker
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    const size = 10;

    ctx.beginPath();
    ctx.moveTo(error.x - size, error.y - size);
    ctx.lineTo(error.x + size, error.y + size);
    ctx.moveTo(error.x + size, error.y - size);
    ctx.lineTo(error.x - size, error.y + size);
    ctx.stroke();

    // Draw circle
    ctx.beginPath();
    ctx.arc(error.x, error.y, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawLabel(x, y, text, color) {
    ctx.save();

    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Background
    const metrics = ctx.measureText(text);
    const padding = 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x - padding, y - 10, metrics.width + padding * 2, 20);

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - padding, y - 10, metrics.width + padding * 2, 20);

    // Text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.restore();
}

// Zoom Functions
function zoom(factor) {
    state.scale *= factor;
    state.scale = Math.max(0.5, Math.min(state.scale, 3));
    updateZoomDisplay();
    redrawCanvas();
}

function resetZoom() {
    state.scale = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    updateZoomDisplay();
    redrawCanvas();
}

function updateZoomDisplay() {
    document.getElementById('zoomLevel').textContent = Math.round(state.scale * 100) + '%';
}

// UI Updates
function updateAnnotationsList() {
    const list = document.getElementById('annotationsList');

    if (state.annotations.length === 0) {
        list.innerHTML = '<p class="empty-state">Henüz etiketlenmiş bölge yok</p>';
        return;
    }

    list.innerHTML = state.annotations.map(annotation => {
        const def = anatomyDefinitions[annotation.region];
        const confidenceClass = annotation.confidence >= 80 ? 'confidence-high' :
                               annotation.confidence >= 50 ? 'confidence-medium' : 'confidence-low';

        return `
            <div class="annotation-item" data-id="${annotation.id}">
                <div class="annotation-header">
                    <div>
                        <span class="color-indicator" style="background: ${annotation.color}"></span>
                        <span class="annotation-name">${def.name}</span>
                    </div>
                    <div class="annotation-actions">
                        <button class="edit-btn" onclick="editAnnotation('${annotation.id}')">✏️</button>
                        <button class="delete-btn" onclick="deleteAnnotation('${annotation.id}')">🗑️</button>
                    </div>
                </div>
                <div class="annotation-info">
                    Tip: ${annotation.type === 'polygon' ? 'Polygon' : 'Nokta'}<br>
                    ${annotation.notes ? `Not: ${annotation.notes}<br>` : ''}
                    <span class="confidence-badge ${confidenceClass}">Güven: ${annotation.confidence}%</span>
                    ${!annotation.isCorrect ? '<br><strong style="color: #e74c3c;">⚠️ Kontrol edilmeli</strong>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function updateErrorsList() {
    const list = document.getElementById('errorsList');

    if (state.errors.length === 0) {
        list.innerHTML = '<p class="empty-state">Henüz hata işareti yok</p>';
        return;
    }

    list.innerHTML = state.errors.map(error => `
        <div class="error-item" data-id="${error.id}">
            <div class="annotation-header">
                <span class="annotation-name">❌ Hata İşareti</span>
                <button class="delete-btn" onclick="deleteError('${error.id}')">🗑️</button>
            </div>
            <div class="annotation-info">
                Konum: (${Math.round(error.x)}, ${Math.round(error.y)})<br>
                ${error.notes ? `Açıklama: ${error.notes}` : ''}
            </div>
        </div>
    `).join('');
}

function updateStatistics() {
    const totalRegions = state.annotations.length;
    const totalErrors = state.errors.length;
    const totalPossibleRegions = Object.keys(anatomyDefinitions).length;
    const completionRate = Math.round((totalRegions / totalPossibleRegions) * 100);

    document.getElementById('totalRegions').textContent = totalRegions;
    document.getElementById('totalErrors').textContent = totalErrors;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

function updateUI() {
    updateAnnotationsList();
    updateErrorsList();
    updateStatistics();
}

// Annotation Editing
function editAnnotation(id) {
    const annotation = state.annotations.find(a => a.id === id);
    if (!annotation) return;

    state.selectedAnnotation = annotation;

    // Fill modal
    document.getElementById('annotationName').value = anatomyDefinitions[annotation.region].name;
    document.getElementById('annotationNotes').value = annotation.notes || '';
    document.getElementById('annotationIsCorrect').checked = annotation.isCorrect;
    document.getElementById('confidenceScore').value = annotation.confidence;
    document.getElementById('confidenceValue').textContent = annotation.confidence + '%';

    // Show modal
    document.getElementById('annotationModal').classList.add('active');
}

function saveAnnotationEdit() {
    if (!state.selectedAnnotation) return;

    state.selectedAnnotation.notes = document.getElementById('annotationNotes').value;
    state.selectedAnnotation.isCorrect = document.getElementById('annotationIsCorrect').checked;
    state.selectedAnnotation.confidence = parseInt(document.getElementById('confidenceScore').value);

    closeModal();
    updateAnnotationsList();
}

function deleteAnnotationFromModal() {
    if (!state.selectedAnnotation) return;

    if (confirm('Bu etiketi silmek istediğinizden emin misiniz?')) {
        deleteAnnotation(state.selectedAnnotation.id);
        closeModal();
    }
}

function deleteAnnotation(id) {
    state.annotations = state.annotations.filter(a => a.id !== id);
    redrawCanvas();
    updateAnnotationsList();
    updateStatistics();
}

function deleteError(id) {
    state.errors = state.errors.filter(e => e.id !== id);
    redrawCanvas();
    updateErrorsList();
    updateStatistics();
}

function closeModal() {
    document.getElementById('annotationModal').classList.remove('active');
    state.selectedAnnotation = null;
}

// Data Management
function saveAnnotations() {
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        imageInfo: state.image ? {
            width: state.image.width,
            height: state.image.height
        } : null,
        annotations: state.annotations,
        errors: state.errors,
        statistics: {
            totalRegions: state.annotations.length,
            totalErrors: state.errors.length,
            completionRate: Math.round((state.annotations.length / Object.keys(anatomyDefinitions).length) * 100)
        }
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ear-mold-annotations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Etiketler başarıyla kaydedildi!');
}

function loadAnnotations(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (data.annotations) {
                state.annotations = data.annotations;
            }
            if (data.errors) {
                state.errors = data.errors;
            }

            redrawCanvas();
            updateUI();
            alert('Etiketler başarıyla yüklendi!');
        } catch (error) {
            alert('Dosya yüklenirken hata oluştu: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function exportReport() {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ear-mold-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Rapor başarıyla oluşturuldu!');
}

function generateReport() {
    const regionCounts = {};
    state.annotations.forEach(annotation => {
        regionCounts[annotation.region] = (regionCounts[annotation.region] || 0) + 1;
    });

    const avgConfidence = state.annotations.length > 0 ?
        Math.round(state.annotations.reduce((sum, a) => sum + a.confidence, 0) / state.annotations.length) : 0;

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Kulak Kalıbı Analiz Raporu</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #3498db; color: white; }
        .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px 20px; }
        .stat-label { font-weight: bold; color: #2c3e50; }
        .stat-value { font-size: 1.5em; color: #3498db; }
    </style>
</head>
<body>
    <h1>🦻 Kulak Kalıbı Anatomik Analiz Raporu</h1>
    <p><strong>Rapor Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>

    <div class="summary">
        <h2>Özet</h2>
        <div class="stat">
            <div class="stat-label">Toplam Etiketlenmiş Bölge:</div>
            <div class="stat-value">${state.annotations.length}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Hata İşareti:</div>
            <div class="stat-value">${state.errors.length}</div>
        </div>
        <div class="stat">
            <div class="stat-label">Ortalama Güven Skoru:</div>
            <div class="stat-value">${avgConfidence}%</div>
        </div>
        <div class="stat">
            <div class="stat-label">Tamamlanma Oranı:</div>
            <div class="stat-value">${Math.round((state.annotations.length / Object.keys(anatomyDefinitions).length) * 100)}%</div>
        </div>
    </div>

    <h2>Anatomik Bölgeler Detayı</h2>
    <table>
        <thead>
            <tr>
                <th>Bölge Adı</th>
                <th>Etiket Sayısı</th>
                <th>Ortalama Güven</th>
                <th>Durum</th>
            </tr>
        </thead>
        <tbody>
            ${Object.keys(anatomyDefinitions).map(region => {
                const annotations = state.annotations.filter(a => a.region === region);
                const count = annotations.length;
                const avgConf = count > 0 ? Math.round(annotations.reduce((sum, a) => sum + a.confidence, 0) / count) : 0;
                const status = count > 0 ? '✅ Etiketlenmiş' : '❌ Etiketlenmemiş';

                return `
                    <tr>
                        <td><strong>${anatomyDefinitions[region].name}</strong></td>
                        <td>${count}</td>
                        <td>${count > 0 ? avgConf + '%' : '-'}</td>
                        <td>${status}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>

    <h2>Hata İşaretleri</h2>
    ${state.errors.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Sıra</th>
                    <th>Konum (X, Y)</th>
                    <th>Açıklama</th>
                </tr>
            </thead>
            <tbody>
                ${state.errors.map((error, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>(${Math.round(error.x)}, ${Math.round(error.y)})</td>
                        <td>${error.notes || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>Hata işareti bulunmamaktadır.</p>'}

    <h2>Detaylı Etiket Listesi</h2>
    ${state.annotations.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Bölge</th>
                    <th>Tip</th>
                    <th>Güven</th>
                    <th>Doğruluk</th>
                    <th>Notlar</th>
                </tr>
            </thead>
            <tbody>
                ${state.annotations.map(annotation => `
                    <tr>
                        <td><strong>${anatomyDefinitions[annotation.region].name}</strong></td>
                        <td>${annotation.type === 'polygon' ? 'Polygon' : 'Nokta'}</td>
                        <td>${annotation.confidence}%</td>
                        <td>${annotation.isCorrect ? '✅ Doğru' : '⚠️ Kontrol Et'}</td>
                        <td>${annotation.notes || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>Henüz etiket bulunmamaktadır.</p>'}
</body>
</html>
    `;
}

// Utility Functions
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Make functions globally accessible for onclick handlers
window.editAnnotation = editAnnotation;
window.deleteAnnotation = deleteAnnotation;
window.deleteError = deleteError;
