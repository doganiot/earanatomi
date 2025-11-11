# 🦻 Kulak Kalıbı Anatomik Analiz Sistemi

İşitme merkezlerinin hastalar için ürettikleri kulak kalıplarının anatomik bölgelerini tespit etmek, etiketlemek ve analiz etmek için geliştirilmiş interaktif web uygulaması.

## 📋 Proje Hakkında

Bu uygulama, kulak kalıplarının (ear molds) anatomik yapısını incelemek ve etiketlemek için tasarlanmıştır. Kulak kalıpları, gerçek kulağın **negatifi** (ters kalıbı) olduğu için, anatomik bölgelerin doğru şekilde tanımlanması kritik öneme sahiptir.

### 🎯 Temel Özellikler

- ✅ **Görsel Yükleme**: Kulak kalıbı görsellerini yükleyip analiz edin
- ✅ **12 Anatomik Bölge**: Detaylı anatomik bölge tanımları ve referansları
- ✅ **İnteraktif Etiketleme**: Polygon ve nokta bazlı etiketleme araçları
- ✅ **Hata İşaretleme**: Hatalı bölgeleri işaretleyip açıklama ekleyin
- ✅ **Güven Skoru**: Her etiket için güvenilirlik skoru belirleyin
- ✅ **Veri Yönetimi**: JSON formatında kaydetme ve yükleme
- ✅ **Rapor Oluşturma**: HTML formatında detaylı analiz raporları
- ✅ **Zoom ve Pan**: Detaylı inceleme için yakınlaştırma özellikleri

## 🧩 Anatomik Bölgeler

Uygulama aşağıdaki 12 anatomik bölgeyi desteklemektedir:

### Ana Yapılar
1. **Helix** - Kulak kepçesinin dış kıvrımı
2. **Anti-Helix** - İç kıvrım yapısı
3. **Concha (Cymba)** - Üst concha bölgesi
4. **Concha (Cavum)** - Alt concha bölgesi (ana oturma bölgesi)
5. **Tragus** - Kulak kanalı önündeki çıkıntı
6. **Anti-Tragus** - Tragus karşısındaki çıkıntı

### Kanal Bölgeleri
7. **Aperture** - Kulak kanalı girişi
8. **Canal** - Kulak kanalı bölgesi
9. **First Bend** - İlk bükülme noktası
10. **Second Bend** - İkinci bükülme noktası

### Diğer Yapılar
11. **Crus of Helix** - Helix kökü
12. **Lobule** - Kulak memesi

## 🚀 Kullanım

### Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd earanatomi
```

2. Uygulamayı açın:
```bash
# Basit bir HTTP sunucusu ile (Python 3)
python -m http.server 8000

# veya Node.js ile
npx serve

# veya doğrudan tarayıcıda
# index.html dosyasını çift tıklayarak açın
```

3. Tarayıcınızda açın:
```
http://localhost:8000
```

### Adım Adım Kullanım

#### 1. Görsel Yükleme
- Sol paneldeki "📤 Kulak Kalıbı Görseli Yükle" butonuna tıklayın
- Bilgisayarınızdan bir kulak kalıbı görseli seçin
- Görsel canvas üzerinde görüntülenecektir

#### 2. Anatomik Bölge Seçimi
- Sol panelden etiketlemek istediğiniz anatomik bölgeyi seçin
- Bölgenin tanımı ve önemi sağ panelde görüntülenecektir

#### 3. Etiketleme
**Polygon Çizimi:**
- "🔷 Polygon" aracını seçin (varsayılan olarak aktiftir)
- Canvas üzerinde tıklayarak köşe noktaları ekleyin
- Polygon'u tamamlamak için çift tıklayın

**Nokta İşaretleme:**
- "📍 Nokta" aracını seçin
- Canvas üzerinde işaretlemek istediğiniz noktaya tıklayın

**Hata İşaretleme:**
- "❌ Hata İşaretle" aracını seçin
- Hatalı bölgeye tıklayın
- Açıklama girin

#### 4. Etiket Düzenleme
- Sağ paneldeki etiket listesinden düzenle (✏️) butonuna tıklayın
- Notlar ekleyin
- Güven skorunu ayarlayın
- Doğruluk durumunu işaretleyin

#### 5. Veri Kaydetme
- "💾 Etiketleri Kaydet (JSON)" ile etiketlerinizi kaydedin
- "📂 Etiketleri Yükle" ile önceki etiketlerinizi yükleyin
- "📊 Rapor Oluştur" ile HTML raporu oluşturun

## 📊 Veri Formatı

### JSON Çıktı Yapısı
```json
{
  "version": "1.0",
  "timestamp": "2025-11-11T20:00:00.000Z",
  "imageInfo": {
    "width": 1920,
    "height": 1080
  },
  "annotations": [
    {
      "id": "id_1699...",
      "type": "polygon",
      "region": "helix",
      "color": "#FF6B6B",
      "points": [
        { "x": 100, "y": 150 },
        { "x": 200, "y": 180 }
      ],
      "notes": "İyi tanımlanmış helix bölgesi",
      "isCorrect": true,
      "confidence": 95,
      "timestamp": "2025-11-11T20:00:00.000Z"
    }
  ],
  "errors": [
    {
      "id": "id_1699...",
      "x": 300,
      "y": 400,
      "notes": "Bu bölgede belirsizlik var",
      "timestamp": "2025-11-11T20:00:00.000Z"
    }
  ],
  "statistics": {
    "totalRegions": 8,
    "totalErrors": 2,
    "completionRate": 67
  }
}
```

## 🎨 Arayüz Özellikleri

### Kontroller
- **Zoom In/Out**: Görseli yakınlaştırma/uzaklaştırma
- **Reset**: Zoom ve pozisyonu sıfırlama
- **Şeffaflık**: Etiket şeffaflık seviyesi ayarlama
- **Etiket Görünümü**: Etiket isimlerini göster/gizle

### Klavye Kısayolları (Gelecek Sürüm)
- `P`: Polygon aracı
- `M`: Nokta aracı
- `E`: Hata işaretleme
- `Esc`: Mevcut çizimi iptal et
- `Delete`: Seçili etiketi sil

## 📈 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] **Makine Öğrenmesi Entegrasyonu**: Otomatik bölge tespiti
- [ ] **Batch Processing**: Birden fazla görseli aynı anda analiz etme
- [ ] **Karşılaştırma Modu**: İki kulak kalıbını yan yana karşılaştırma
- [ ] **3D Görselleştirme**: 3D kulak kalıbı modelleri için destek
- [ ] **Veritabanı Entegrasyonu**: Merkezi veri depolama
- [ ] **Kullanıcı Yönetimi**: Multi-user destek
- [ ] **AI Asistan**: Otomatik öneri ve düzeltme sistemi
- [ ] **Kalite Kontrol**: Otomatik kalite skorlama
- [ ] **Export Seçenekleri**: PDF, Excel, CSV formatları

## 🔬 Teknik Detaylar

### Teknolojiler
- **Frontend**: Vanilla JavaScript (ES6+)
- **Canvas API**: 2D çizim ve manipülasyon
- **CSS3**: Modern responsive tasarım
- **JSON**: Veri depolama formatı

### Tarayıcı Uyumluluğu
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dosya Yapısı
```
earanatomi/
├── index.html          # Ana HTML dosyası
├── styles.css          # Stil tanımları
├── app.js             # Ana JavaScript mantığı
└── README.md          # Dokümantasyon
```

## 💡 Kullanım Senaryoları

### 1. Eğitim ve Öğretim
- Yeni audiyoloji öğrencilerinin eğitimi
- Anatomik bölgelerin tanınması ve öğrenilmesi
- İnteraktif eğitim materyali olarak kullanım

### 2. Kalite Kontrol
- Üretilen kulak kalıplarının doğruluğunun kontrolü
- Standartlara uygunluğun değerlendirilmesi
- Hata analizleri ve raporlama

### 3. Araştırma ve Geliştirme
- Kulak kalıbı anatomisi üzerine araştırmalar
- İstatistiksel analizler için veri toplama
- Machine learning modelleri için eğitim verisi oluşturma

### 4. Klinik Kullanım
- Hasta özelinde kulak kalıbı analizi
- Özelleştirilmiş kulak kalıbı tasarımı
- Takip ve karşılaştırma çalışmaları

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak isterseniz:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 📧 İletişim

Sorular, öneriler ve geri bildirimler için:
- GitHub Issues üzerinden bildirim yapabilirsiniz
- Pull Request gönderebilirsiniz

## 🙏 Teşekkürler

Bu projeyi kullanan tüm audiyoloji uzmanları, işitme merkezi çalışanları ve eğitimcilere teşekkür ederiz.

---

**Not**: Kulak kalıpları gerçek kulağın negatifidir. Bu uygulamayı kullanırken bu önemli detayı göz önünde bulundurun.

**Sürüm**: 1.0.0
**Son Güncelleme**: 2025-11-11
