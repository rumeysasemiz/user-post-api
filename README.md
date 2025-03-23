# Node.js Rest API with MongoDB ve Docker

Node.js, Express, MongoDB ve Docker kullanarak oluşturulmuş bir blog gönderisi ve kullanıcı yönetimi RESTful API'si. Bu proje, kullanıcı kaydı, kimlik doğrulama ve gönderi yönetimini profesyonel loglama ve veri doğrulama özellikleriyle birlikte sunar.

## 📋 Özellikler

| Özellik               | Açıklama                                                                 |
|-----------------------|---------------------------------------------------------------------------|
| **Kullanıcı Yönetimi** | Yeni kullanıcı kaydı, JWT ile kimlik doğrulama, kullanıcı profillerini görüntüleme/güncelleme/silme |
| **Gönderi Yönetimi**  | Blog gönderisi oluşturma, okuma, güncelleme ve silme, gönderileri kullanıcıya/tags'e göre filtreleme, gönderi düzenleme/silme için yetkilendirme kontrolleri |
| **Veri Doğrulama**    | Express-validator ile kullanıcı girişi ve gönderi doğrulama, hata mesajları standardizasyonu |
| **Profesyonel Loglama** | Winston ile yapılandırılmış loglama, dosya ve konsol logları, hata izleme ve debug desteği |
| **Docker Entegrasyonu**| Konteynerleştirilmiş uygulama, MongoDB veritabanı konteyneri, Docker Compose kurulumu |

## 🛠️ Kullanılan Teknolojiler

| Teknoloji           | Açıklama                                                   |
|---------------------|------------------------------------------------------------|
| **Node.js**         | JavaScript çalışma zamanı ortamı                           |
| **Express**         | Web uygulaması framework'ü                                 |
| **MongoDB**         | NoSQL veritabanı                                           |
| **Mongoose**        | MongoDB obje modelleme                                      |
| **Express-validator** | Giriş doğrulama ve sanitizasyon                           |
| **Winston**         | Yapılandırılabilir loglama sistemi                         |
| **JWT**             | Kimlik doğrulama için JSON Web Token'ları                  |
| **bcryptjs**        | Parola şifreleme                                           |
| **Docker**          | Konteynerleştirme                                           |
| **Docker Compose**  | Çoklu konteynerli Docker uygulamaları                       |

## 🚀 Başlarken

### Gereksinimler

| Araç               | Bağlantı                                                            |
|--------------------|---------------------------------------------------------------------|
| Docker             | [Docker'ı Başlat](https://www.docker.com/get-started)               |
| Docker Compose     | [Docker Compose Kurulumu](https://docs.docker.com/compose/install/) |

### Kurulum ve Yapılandırma

1. **Depoyu klonlayın**

```bash
git clone https://github.com/rumeysa111/nodejs-user-post-api.git
```

2. **Docker ile Çalıştırma**

```bash
docker-compose up
```

Uygulama `http://localhost:3000` adresinde kullanılabilir.

### Çevre Değişkenleri

| Değişken          | Açıklama                                          |
|-------------------|--------------------------------------------------|
| PORT              | Uygulama portu (varsayılan: 3000)                |
| MONGO_URI         | MongoDB bağlantı dizesi                         |
| JWT_SECRET        | JWT token üretimi için gizli anahtar             |

## 📚 API Dokümantasyonu

### Kimlik Doğrulama Uç Noktaları

| Uç Nokta                         | Yöntem  | Açıklama                                    | Gerekli Yetkiler |
|-----------------------------------|---------|---------------------------------------------|------------------|
| **Yeni kullanıcı kaydı**          | POST    | /api/users/register                         | Yetki gerekmez   |
| **Kullanıcı girişi**              | POST    | /api/users/login                            | Yetki gerekmez   |

**Yeni kullanıcı kaydı:**

```json
{
  "username": "example",
  "email": "example@example.com",
  "password": "password123",
  "role": "user" // Opsiyonel, varsayılan "user"
}
```

**Kullanıcı girişi:**

```json
{
  "email": "example@example.com",
  "password": "password123"
}
```

**Yanıt:**

```json
{
  "token": "JWT_TOKEN",
  "userId": "USER_ID"
}
```

### Kullanıcı Uç Noktaları

| Uç Nokta                          | Yöntem  | Açıklama                                  | Gerekli Yetkiler |
|------------------------------------|---------|------------------------------------------|------------------|
| **Tüm kullanıcıları getir**       | GET     | /api/users                               | Yetki gerekmez   |
| **Kullanıcıyı ID ile getir**      | GET     | /api/users/:id                           | Yetki gerekmez   |
| **Kullanıcıyı güncelle**          | PUT     | /api/users/:id                           | Kimlik doğrulama |
| **Kullanıcıyı sil**               | DELETE  | /api/users/:id                           | Kimlik doğrulama |

### Gönderi Uç Noktaları

| Uç Nokta                           | Yöntem  | Açıklama                                  | Gerekli Yetkiler |
|-------------------------------------|---------|------------------------------------------|------------------|
| **Yeni gönderi oluştur**           | POST    | /api/posts/create                        | Kimlik doğrulama |
| **Tüm gönderileri getir**          | GET     | /api/posts                               | Yetki gerekmez   |
| **Kullanıcıya ait gönderileri getir**| GET    | /api/posts/user/:id                      | Yetki gerekmez   |
| **Tag'e göre gönderileri getir**   | GET     | /api/posts/tag/:tag                      | Yetki gerekmez   |
| **Gönderiyi ID ile getir**         | GET     | /api/posts/:id                           | Yetki gerekmez   |
| **Gönderiyi güncelle**             | PUT     | /api/posts/:id                           | Kimlik doğrulama + Gönderi sahibi |
| **Gönderiyi sil**                  | DELETE  | /api/posts/:id                           | Kimlik doğrulama + Gönderi sahibi |

### Servis Parametreleri ve Yanıt Detayları

#### Gönderi Servisleri

**Yeni gönderi oluşturma (createPost):**
- Parametreler: `title`, `content`, `tags` (dizi), `userId`
- Yanıt: `{ message: "Post created", postId: "POST_ID" }`

**Gönderi güncelleme (updatePost):**
- Parametreler: `postId`, `userId`, `updateData` (güncelleme verileri)
- Yetkilendirme: Sadece gönderi sahibi güncelleyebilir
- Yanıt: Güncellenmiş gönderi nesnesi

**Gönderi silme (deletePost):**
- Parametreler: `postId`, `userId`
- Yetkilendirme: Sadece gönderi sahibi silebilir
- Yanıt: `{ message: "Post deleted successfully", postId: "POST_ID" }`

#### Kullanıcı Servisleri

**Kullanıcı güncelleme (updateUser):**
- Parametreler: `userId`, `updateData` (güncelleme verileri)
- Özel kontroller: Email ve kullanıcı adı benzersiz olmalıdır
- Yanıt: Güncellenmiş kullanıcı nesnesi (şifresiz)

**Kullanıcı silme (deleteUser):**
- Parametreler: `userId`
- Yan etki: Kullanıcının tüm gönderileri de silinir
- Yanıt: `{ user: kullanıcı_nesnesi, deletedPostsCount: silinen_gönderi_sayısı }`

### Hata Durumları

| HTTP Kodu | Açıklama                            | Örnek Mesaj                                   |
|-----------|-------------------------------------|----------------------------------------------|
| 400       | Geçersiz istek                      | "This email already exists"                   |
| 401       | Kimlik doğrulama hatası             | "Invalid credentials"                         |
| 403       | Yetkilendirme hatası                | "You are not authorized to update this post"  |
| 404       | Kaynak bulunamadı                   | "User not found" veya "Post not found"        |
| 500       | Sunucu hatası                       | "Internal server error"                       |

## 📊 Loglama Sistemi

Uygulama, Winston kütüphanesini kullanarak yapılandırılmış bir loglama sistemi sunar:

- **Konsol Logları**: Renkli formatlanmış loglar geliştirme sırasında görünürlük sağlar
- **Dosya Logları**: İki ayrı log dosyası tutulur:
  - combined.log: Tüm loglar
  - error.log: Sadece hata logları
- **Log Seviyeleri**: 
  - `error`: Kritik hatalar
  - `warn`: Uyarılar
  - `info`: Bilgilendirici mesajlar
  - `debug`: Detaylı debugging bilgisi

## 🔐 Güvenlik Özellikleri

Bu API, aşağıdaki güvenlik özelliklerini içerir:

- **Şifre Hashleme**: Bcrypt ile güvenli şifre depolama
- **JWT Doğrulama**: Güvenli API erişimi için JWT tabanlı kimlik doğrulama
- **Veri Doğrulama**: Express-validator ile kullanıcı girdilerinin doğrulanması
- **Hata İşleme**: Güvenli ve standartlaştırılmış hata mesajları


### Proje Yapısı

```bash
nodejs-case/
├── src/
│   ├── config/       # Veritabanı yapılandırması
│   ├── controllers/  # Request controller'ları
│   ├── middlewares/  # Auth ve validation middlewares
│   ├── models/       # Mongoose modelleri
│   ├── routes/       # Express route tanımları
│   ├── services/     # İş mantığı servisleri
│   ├── utils/        # Logger ve yardımcı fonksiyonlar
│   └── server.js     # Ana uygulama başlangıç noktası
├── logs/             # Winston log dosyaları
├── .dockerignore
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## 🐳 Docker Bilgisi

| Komut                                     | Açıklama                                   |
|-------------------------------------------|-------------------------------------------|
| **Uygulamayı loglarla başlat**            | `docker-compose up`                       |
| **Uygulamayı ayrılmış modda başlat**     | `docker-compose up -d`                    |
| **Uygulamayı durdur**                     | `docker-compose down`                     |
| **Uygulamayı yeniden derle**             | `docker-compose up --build`               |
| **Logları görüntüle**                    | `docker-compose logs api`                 |
| **Konteyner shell erişimi**              | `docker-compose exec api sh`              |



## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için LICENSE dosyasına bakın.
