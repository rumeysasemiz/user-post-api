# Node.js Rest API with MongoDB ve Docker

Node.js, Express, MongoDB ve Docker kullanarak oluşturulmuş bir blog gönderisi ve kullanıcı yönetimi RESTful API'si. Bu proje, kullanıcı kaydı, kimlik doğrulama ve uygun yetkilendirme ile gönderi yönetimi sağlayan bir backend servisi uygular.

## 📋 Özellikler

| Özellik               | Açıklama                                                                 |
|-----------------------|---------------------------------------------------------------------------|
| **Kullanıcı Yönetimi** | Yeni kullanıcı kaydı, JWT ile kimlik doğrulama, kullanıcı profillerini görüntüleme/güncelleme/silme, rol tabanlı izinler (kullanıcı/yönetici) |
| **Gönderi Yönetimi**  | Blog gönderisi oluşturma, okuma, güncelleme ve silme, gönderileri kullanıcıya/tags'e göre filtreleme, gönderi düzenleme/silme için yetkilendirme kontrolleri |
| **Docker Entegrasyonu**| Konteynerleştirilmiş uygulama, MongoDB veritabanı konteyneri, Docker Compose kurulumu |

## 🛠️ Kullanılan Teknolojiler

| Teknoloji           | Açıklama                                                   |
|---------------------|------------------------------------------------------------|
| **Node.js**         | JavaScript çalışma zamanı ortamı                           |
| **Express**         | Web uygulaması framework'ü                                 |
| **MongoDB**         | NoSQL veritabanı                                           |
| **Mongoose**        | MongoDB obje modelleme                                      |
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
git clone <repository-url>
cd nodejs-case
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

| Uç Nokta                         | Yöntem  | Açıklama                                    |
|-----------------------------------|---------|---------------------------------------------|
| **Yeni kullanıcı kaydı**          | POST    | /api/users/register                         |
| **Kullanıcı girişi**              | POST    | /api/users/login                            |

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

| Uç Nokta                          | Yöntem  | Açıklama                                  |
|------------------------------------|---------|------------------------------------------|
| **Tüm kullanıcıları getir**       | GET     | /api/users                               |
| **Kullanıcıyı ID ile getir**      | GET     | /api/users/:id                           |
| **Kullanıcıyı güncelle**          | PUT     | /api/users/:id                           |
| **Kullanıcıyı sil**               | DELETE  | /api/users/:id                           |

### Gönderi Uç Noktaları

| Uç Nokta                           | Yöntem  | Açıklama                                  |
|-------------------------------------|---------|------------------------------------------|
| **Yeni gönderi oluştur**           | POST    | /api/posts/create                        |
| **Tüm gönderileri getir**          | GET     | /api/posts                               |
| **Kullanıcıya ait gönderileri getir**| GET    | /api/posts/user/:id                      |
| **Tag'e göre gönderileri getir**   | GET     | /api/posts/tag/:tag                      |
| **Gönderiyi ID ile getir**         | GET     | /api/posts/:id                           |
| **Gönderiyi güncelle**             | PUT     | /api/posts/:id                           |
| **Gönderiyi sil**                  | DELETE  | /api/posts/:id                           |

## 🐳 Docker Bilgisi

### Proje Yapısı

```bash
nodejs-case/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── .dockerignore
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

### Docker Komutları

| Komut                                     | Açıklama                                   |
|-------------------------------------------|-------------------------------------------|
| **Uygulamayı loglarla başlat**            | `docker-compose up`                       |
| **Uygulamayı ayrılmış modda başlat**     | `docker-compose up -d`                    |
| **Uygulamayı durdur**                     | `docker-compose down`                     |
| **Uygulamayı yeniden derle**             | `docker-compose up --build`               |
| **Logları görüntüle**                    | `docker-compose logs api`                 |



