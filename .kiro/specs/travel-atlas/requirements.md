# Requirements Document

## Introduction

Travel Atlas, Türkçe ve İngilizce destekli, statik olarak GitHub Pages üzerinde barındırılan bir seyahat öneri web platformudur. Platform; seyahat planları, rehberler, kişisel deneyimler ve blog yazıları sunar. Yönetici paneli üzerinden içerik yönetimi (CRUD), görsel yükleme, harita entegrasyonu ve çok dilli içerik düzenleme yapılabilir. Tasarım olarak premium, koyu (dark soft) tema kullanılır.

## Glossary

- **Platform**: Travel Atlas web uygulamasının tamamı (frontend + admin paneli)
- **Visitor**: Siteyi ziyaret eden, kimlik doğrulaması yapmamış kullanıcı
- **Admin**: Yönetici paneline giriş yapmış, içerik yönetimi yetkisine sahip kullanıcı
- **Location_Page**: Bir şehir veya ülkeye ait detaylı seyahat bilgilerini içeren sayfa
- **Content_Item**: Platform üzerindeki herhangi bir içerik birimi (lokasyon, blog yazısı, öneri)
- **Language_Switcher**: Türkçe ve İngilizce arasında geçiş yapan UI bileşeni
- **Static_Export**: Next.js veya Vite ile oluşturulan, sunucu gerektirmeyen HTML/CSS/JS çıktısı
- **Hero_Section**: Ana sayfanın üst kısmındaki büyük arka plan görseli ve slogan alanı
- **Card_Component**: İçerik öğelerini gösteren glassmorphism efektli koyu tema kart bileşeni
- **Draft**: Henüz yayınlanmamış, sadece admin panelinde görünen içerik durumu
- **CMS_Data**: JSON dosyaları veya headless CMS üzerinde saklanan içerik verileri
- **SEO_Fields**: Arama motoru optimizasyonu için kullanılan başlık, açıklama ve meta etiketleri
- **Friend_Experience**: Arkadaşın seyahat deneyimini, kendi fotoğrafları ve kişisel yorumlarıyla paylaştığı içerik birimi
- **Route_Line**: Harita üzerinde gidilen noktalar arasında çizilen sıralı rota çizgisi (polyline)

## Requirements

### Requirement 1: Ana Sayfa Bölümleri

**User Story:** Bir ziyaretçi olarak, ana sayfada seyahat içeriklerini keşfetmek istiyorum, böylece ilgimi çeken destinasyonlara kolayca ulaşabilirim.

#### Acceptance Criteria

1. WHEN a Visitor loads the homepage, THE Platform SHALL display a Hero_Section with a full-width background image and a slogan text overlay
2. WHEN a Visitor scrolls the homepage, THE Platform SHALL display an "Explore" section containing worldwide travel recommendation Card_Components
3. WHEN a Visitor views the homepage, THE Platform SHALL display a "My Recommendations" section containing the Admin's personal travel experiences with uploaded photos
4. WHEN a Visitor views the homepage, THE Platform SHALL display a "Popular Routes" section with the most viewed or featured Location_Pages
5. WHEN a Visitor views the homepage, THE Platform SHALL display a "Newly Added" section with the most recently published Content_Items sorted by publish date descending
6. WHEN a Visitor views the homepage, THE Platform SHALL display a "Discover on Map" section with an interactive map showing Location_Page markers
7. WHEN a Visitor views the homepage, THE Platform SHALL display a "Blog Posts" section with the latest blog entries as Card_Components
8. THE Platform SHALL display a footer containing contact information, social media links, and a Language_Switcher on every page

### Requirement 2: Lokasyon Detay Sayfası

**User Story:** Bir ziyaretçi olarak, bir destinasyonun detaylı bilgilerini görmek istiyorum, böylece seyahatimi planlayabilirim.

#### Acceptance Criteria

1. WHEN a Visitor navigates to a Location_Page, THE Platform SHALL display a cover image, city name, and country name at the top of the page
2. WHEN a Visitor views a Location_Page, THE Platform SHALL display sections for general introduction, transportation info, accommodation recommendations, museums, historical places, and restaurant recommendations
3. WHEN a Visitor views a Location_Page, THE Platform SHALL display a daily route plan with step-by-step itinerary
4. WHEN a Visitor views a Location_Page, THE Platform SHALL display an estimated budget section with cost breakdowns
5. WHEN a Visitor views a Location_Page, THE Platform SHALL display an embedded map showing the location coordinates
6. WHEN a Visitor views a Location_Page, THE Platform SHALL display a photo gallery with multiple images
7. WHEN a Visitor views a Location_Page, THE Platform SHALL display a comments section for visitor feedback

### Requirement 3: Çok Dilli Destek

**User Story:** Bir ziyaretçi olarak, siteyi Türkçe veya İngilizce olarak görüntülemek istiyorum, böylece içerikleri kendi dilimde okuyabilirim.

#### Acceptance Criteria

1. THE Platform SHALL support Turkish and English as available languages
2. WHEN a Visitor selects a language via the Language_Switcher, THE Platform SHALL render all UI labels, navigation items, and static text in the selected language
3. WHEN a Visitor selects a language, THE Platform SHALL display Content_Item translations in the selected language where available
4. WHEN a Content_Item translation is not available for the selected language, THE Platform SHALL fall back to the default language (Turkish)
5. THE Platform SHALL persist the selected language preference across page navigations within the same session
6. THE Platform SHALL store translations in JSON-based i18n files for static text

### Requirement 4: Admin Kimlik Doğrulama

**User Story:** Bir yönetici olarak, güvenli bir şekilde admin paneline giriş yapmak istiyorum, böylece içerik yönetimi işlemlerini gerçekleştirebilirim.

#### Acceptance Criteria

1. WHEN an Admin navigates to the login page, THE Platform SHALL display a username and password input form
2. WHEN an Admin submits valid credentials, THE Platform SHALL authenticate the Admin and redirect to the admin dashboard
3. WHEN an Admin submits invalid credentials, THE Platform SHALL display an error message without revealing which field is incorrect
4. WHILE an Admin is not authenticated, THE Platform SHALL block access to all admin panel routes and redirect to the login page
5. WHEN an Admin clicks the logout button, THE Platform SHALL terminate the session and redirect to the homepage

### Requirement 5: İçerik Yönetimi (CRUD)

**User Story:** Bir yönetici olarak, lokasyon ve blog içeriklerini oluşturmak, düzenlemek ve silmek istiyorum, böylece platformu güncel tutabilirim.

#### Acceptance Criteria

1. WHEN an Admin creates a new Content_Item, THE Platform SHALL save the Content_Item to CMS_Data with a unique slug identifier
2. WHEN an Admin edits an existing Content_Item, THE Platform SHALL update the corresponding CMS_Data entry and preserve the slug
3. WHEN an Admin deletes a Content_Item, THE Platform SHALL remove the Content_Item from CMS_Data and remove the associated Location_Page or blog post
4. WHEN an Admin creates or edits a Content_Item, THE Platform SHALL provide input fields for both Turkish and English translations
5. WHEN an Admin creates or edits a Content_Item, THE Platform SHALL provide SEO_Fields (meta title, meta description) for each language
6. WHEN an Admin saves a Content_Item, THE Platform SHALL allow setting the status as Draft, Published, or Unpublished
7. WHILE a Content_Item status is Draft, THE Platform SHALL exclude the Content_Item from public-facing pages
8. WHEN an Admin publishes a Draft Content_Item, THE Platform SHALL make the Content_Item visible on public-facing pages

### Requirement 6: Görsel Yönetimi

**User Story:** Bir yönetici olarak, içeriklere görsel eklemek istiyorum, böylece destinasyonları görsel olarak zengin bir şekilde sunabilirim.

#### Acceptance Criteria

1. WHEN an Admin uploads an image via the admin panel, THE Platform SHALL store the image and associate it with the target Content_Item
2. WHEN an Admin searches for images via the API integration, THE Platform SHALL fetch results from Unsplash or Pexels APIs and display them as selectable options
3. WHEN an Admin selects an API-fetched image, THE Platform SHALL download and store the image locally and associate it with the Content_Item
4. THE Platform SHALL optimize all stored images for web delivery by generating responsive sizes

### Requirement 7: Harita Entegrasyonu

**User Story:** Bir ziyaretçi olarak, destinasyonları harita üzerinde görmek istiyorum, böylece coğrafi konumlarını anlayabilirim.

#### Acceptance Criteria

1. WHEN a Visitor views the "Discover on Map" section, THE Platform SHALL render an interactive map using OpenStreetMap tiles with markers for each published Location_Page
2. WHEN a Visitor clicks a map marker, THE Platform SHALL display a popup with the Location_Page title and a link to the detail page
3. WHEN a Visitor views a Location_Page, THE Platform SHALL display an embedded map centered on the location coordinates
4. WHEN an Admin creates or edits a Location_Page, THE Platform SHALL provide a map-based coordinate picker for setting the location

### Requirement 8: Koyu Tema ve Tasarım Sistemi

**User Story:** Bir ziyaretçi olarak, görsel olarak premium ve modern bir deneyim yaşamak istiyorum, böylece siteyi keyifle kullanabilirim.

#### Acceptance Criteria

1. THE Platform SHALL use a dark soft color scheme with background colors #0f172a and #111827
2. THE Platform SHALL use #1e293b as the Card_Component background color
3. THE Platform SHALL use soft turquoise, indigo, and amber as accent colors
4. THE Platform SHALL apply light glassmorphism effects to Card_Components with subtle backdrop blur and semi-transparent borders
5. THE Platform SHALL use Inter or Poppins as the primary font family
6. THE Platform SHALL apply soft box shadows and minimal CSS animations to interactive elements
7. THE Platform SHALL maintain a consistent dark theme across all pages including the admin panel

### Requirement 9: Statik Dışa Aktarım ve Hosting

**User Story:** Bir geliştirici olarak, siteyi GitHub Pages üzerinde statik olarak barındırmak istiyorum, böylece sunucu maliyeti olmadan yayın yapabilirim.

#### Acceptance Criteria

1. THE Platform SHALL produce a fully static HTML/CSS/JS export compatible with GitHub Pages hosting
2. THE Platform SHALL generate static pages for all published Location_Pages and blog posts at build time
3. THE Platform SHALL function without a server-side runtime after deployment
4. WHEN the site is built, THE Platform SHALL generate SEO-optimized HTML with proper meta tags, Open Graph tags, and structured data for each page

### Requirement 10: SEO ve Performans

**User Story:** Bir geliştirici olarak, sitenin arama motorlarında iyi sıralanmasını ve hızlı yüklenmesini istiyorum, böylece daha fazla ziyaretçiye ulaşabilirim.

#### Acceptance Criteria

1. THE Platform SHALL achieve a Lighthouse performance score above 90 on mobile and desktop
2. THE Platform SHALL implement responsive design that adapts to mobile, tablet, and desktop screen sizes
3. THE Platform SHALL lazy-load images that are below the viewport fold
4. THE Platform SHALL generate unique meta title and meta description tags for each page using SEO_Fields
5. THE Platform SHALL produce semantic HTML5 markup with proper heading hierarchy and landmark regions

### Requirement 11: Arkadaş Deneyimleri Bölümü

**User Story:** Bir ziyaretçi olarak, arkadaşımın seyahat deneyimlerini kendi fotoğrafları ve kişisel yorumlarıyla görmek istiyorum, böylece gerçek deneyimlerden ilham alabilirim.

#### Acceptance Criteria

1. WHEN a Visitor views the homepage, THE Platform SHALL display a "Friend Experiences" section with Friend_Experience Card_Components
2. WHEN a Visitor navigates to a Friend_Experience detail page, THE Platform SHALL display the friend's uploaded photos, personal narrative text, and location-specific comments
3. WHEN an Admin creates a Friend_Experience, THE Platform SHALL provide fields for friend name, visited location, personal narrative, location-specific comments, and a photo gallery upload
4. WHEN a Visitor views a Friend_Experience, THE Platform SHALL display the visited locations as a list with links to corresponding Location_Pages where available
5. THE Platform SHALL support the route /friend-experiences for the listing page and /friend-experiences/[slug] for detail pages

### Requirement 12: Harita Rota Çizimi ve Etkileşimli Marker'lar

**User Story:** Bir ziyaretçi olarak, haritada gidilen yerleri kırmızı işaretlerle ve aralarında rota çizgisiyle görmek istiyorum, böylece seyahat güzergahını görsel olarak takip edebileyim.

#### Acceptance Criteria

1. WHEN a Visitor views a Location_Page map, THE Platform SHALL display red-colored markers for each point of interest on the daily route plan
2. WHEN a Location_Page has multiple route points, THE Platform SHALL draw a Route_Line (polyline) connecting the points in visit order (first here, then there)
3. WHEN a Visitor clicks a red route marker, THE Platform SHALL display a popup containing the place name, a short description, and key tips about that point
4. WHEN a Visitor views the "Discover on Map" homepage section, THE Platform SHALL display red markers for all published locations with Route_Lines connecting locations that belong to the same travel route
5. WHEN an Admin edits a Location_Page daily route plan, THE Platform SHALL provide a map interface to add, reorder, and remove route points with coordinates

### Requirement 13: Site Navigasyonu ve Yönlendirme

**User Story:** Bir ziyaretçi olarak, sitede kolayca gezinmek istiyorum, böylece aradığım içeriğe hızlıca ulaşabilirim.

#### Acceptance Criteria

1. THE Platform SHALL provide a navigation bar with links to Home, Explore, My Recommendations, Friend Experiences, Blog, and language selection
2. WHEN a Visitor clicks a Content_Item card, THE Platform SHALL navigate to the corresponding detail page using the slug-based URL pattern /location/[slug], /blog/[slug], or /friend-experiences/[slug]
3. THE Platform SHALL support the following route structure: /, /explore, /my-recommendations, /friend-experiences, /friend-experiences/[slug], /location/[slug], /blog, /blog/[slug], /admin, /login

### Requirement 14: İçerik Verisi Serileştirme

**User Story:** Bir geliştirici olarak, içerik verilerini JSON formatında saklamak ve okumak istiyorum, böylece statik site oluşturma sürecinde verilere erişebilirim.

#### Acceptance Criteria

1. THE Platform SHALL store Content_Item data in JSON format within the project repository
2. WHEN the build process runs, THE Platform SHALL read JSON data files and generate corresponding static pages
3. THE Platform SHALL serialize Content_Item objects to JSON and deserialize JSON back to Content_Item objects
4. FOR ALL valid Content_Item objects, serializing to JSON then deserializing back SHALL produce an equivalent Content_Item object (round-trip property)
