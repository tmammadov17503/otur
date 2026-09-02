export type Language = 'AZ' | 'EN' | 'RU';
export type Localized = Record<Language, string>;
export type TableShape = 'round' | 'square' | 'long';

export type RestaurantTable = {
  id: string;
  capacity: number;
  left: number;
  top: number;
  shape: TableShape;
  tags: string[];
  detail: Localized;
  baseAvailable: boolean;
  scene: 0 | 1 | 2 | 3;
};

export type Restaurant = {
  id: 'seki' | 'hayat' | 'xazri';
  name: string;
  area: Localized;
  cuisine: Localized;
  description: Localized;
  atmosphere: Localized;
  price: string;
  hours: string;
  rating: string;
  tags: string[];
  image: string;
  planVariant: 'heritage' | 'garden' | 'coastal';
  tables: RestaurantTable[];
};

const L = (AZ: string, EN: string, RU: string): Localized => ({ AZ, EN, RU });

export const tagCopy: Record<string, Localized> = {
  window: L('Pəncərə', 'Window', 'У окна'),
  terrace: L('Terras', 'Terrace', 'Терраса'),
  sea: L('Dəniz mənzərəsi', 'Sea view', 'Вид на море'),
  quiet: L('Sakit', 'Quiet', 'Тихо'),
  central: L('Mərkəzi zal', 'Central', 'Главный зал'),
  garden: L('Bağ', 'Garden', 'Сад'),
  bar: L('Barın yanında', 'Near bar', 'У бара'),
  private: L('Xüsusi künc', 'Private corner', 'Уединённый уголок'),
  date: L('Görüş üçün', 'Date night', 'Для свидания'),
  family: L('Ailə üçün', 'Family', 'Для семьи'),
  group: L('Qrup masası', 'Group table', 'Для компании'),
  traditional: L('Ənənəvi', 'Traditional', 'Традиционный'),
  plants: L('Yaşıllıq', 'Plants', 'Зелень'),
  sunset: L('Günbatımı', 'Sunset', 'Закат'),
  new: L('Yeni', 'New', 'Новое'),
};

export const restaurants: Restaurant[] = [
  {
    id: 'seki',
    name: 'Şəki',
    area: L('İçərişəhər', 'Old City', 'Ичери-шехер'),
    cuisine: L('Müasir Azərbaycan mətbəxi', 'Modern Azerbaijani', 'Современная азербайджанская'),
    description: L('Daş, qoz ağacı və sakit axşam işığında ənənənin müasir yozumu.', 'Stone, walnut and a quiet modern reading of Azerbaijani tradition.', 'Камень, орех и спокойное современное прочтение азербайджанских традиций.'),
    atmosphere: L('İsti · yaxın · memarlıq', 'Warm · intimate · architectural', 'Тепло · камерно · архитектурно'),
    price: '₼₼₼',
    hours: '18:00 — 00:00',
    rating: '4.8',
    tags: ['traditional', 'quiet', 'date'],
    image: '/restaurants/seki-grid.webp',
    planVariant: 'heritage',
    tables: [
      { id: 'S02', capacity: 2, left: 15, top: 20, shape: 'round', tags: ['window', 'quiet'], detail: L('Daş divar boyunca sakit pəncərə masası', 'A quiet window table along the stone wall', 'Тихий стол у окна вдоль каменной стены'), baseAvailable: true, scene: 1 },
      { id: 'S03', capacity: 4, left: 34, top: 20, shape: 'round', tags: ['window', 'family'], detail: L('İsti işıqlı geniş pəncərə masası', 'A generous window table in warm light', 'Просторный стол у окна в тёплом свете'), baseAvailable: true, scene: 1 },
      { id: 'S04', capacity: 4, left: 58, top: 22, shape: 'round', tags: ['central', 'traditional'], detail: L('Zalın canlı, memarlıq mərkəzi', 'The lively architectural heart of the room', 'Живой архитектурный центр зала'), baseAvailable: true, scene: 3 },
      { id: 'S07', capacity: 2, left: 82, top: 22, shape: 'square', tags: ['private', 'date'], detail: L('Naxışlı arakəsmə yanında özəl künc', 'A secluded corner beside a patterned screen', 'Уединённый уголок у узорной перегородки'), baseAvailable: true, scene: 2 },
      { id: 'S08', capacity: 2, left: 18, top: 61, shape: 'round', tags: ['quiet', 'date'], detail: L('Aşağı hərəkətli, iki nəfərlik sakit yer', 'A low-traffic, quiet place for two', 'Тихое место для двоих вдали от прохода'), baseAvailable: true, scene: 2 },
      { id: 'S11', capacity: 4, left: 42, top: 59, shape: 'square', tags: ['central', 'family'], detail: L('Mərkəzi zalda rahat ailə masası', 'A comfortable family table in the central room', 'Удобный семейный стол в главном зале'), baseAvailable: true, scene: 3 },
      { id: 'S14', capacity: 2, left: 67, top: 60, shape: 'round', tags: ['private', 'traditional'], detail: L('Ənənəvi detalı olan premium künc', 'A premium corner framed by traditional detail', 'Премиальный уголок с традиционными деталями'), baseAvailable: true, scene: 2 },
      { id: 'S16', capacity: 8, left: 86, top: 62, shape: 'long', tags: ['group', 'central'], detail: L('Dostlar üçün uzun mərkəzi masa', 'A long central table for friends', 'Длинный центральный стол для компании'), baseAvailable: true, scene: 0 },
    ],
  },
  {
    id: 'hayat',
    name: 'Həyat',
    area: L('Ağ Şəhər', 'White City', 'Белый город'),
    cuisine: L('Mövsümi qril və tərəvəzlər', 'Seasonal grill & vegetables', 'Сезонный гриль и овощи'),
    description: L('Bağla açıq plan arasında yaşayan, yaşıl və rahat bir restoran.', 'A green, relaxed restaurant that lives between garden and open interior.', 'Зелёный, расслабленный ресторан между садом и открытым интерьером.'),
    atmosphere: L('Təbii · rahat · zərif', 'Natural · relaxed · elegant', 'Естественно · свободно · элегантно'),
    price: '₼₼',
    hours: '12:00 — 00:00',
    rating: '4.7',
    tags: ['garden', 'terrace', 'family', 'new'],
    image: '/restaurants/hayat-grid.webp',
    planVariant: 'garden',
    tables: [
      { id: 'H01', capacity: 2, left: 13, top: 24, shape: 'round', tags: ['garden', 'quiet'], detail: L('Bitkilər arasında sakit iki nəfərlik yer', 'A quiet table for two among the plants', 'Тихий стол для двоих среди зелени'), baseAvailable: true, scene: 1 },
      { id: 'H03', capacity: 4, left: 35, top: 20, shape: 'square', tags: ['terrace', 'garden'], detail: L('Açıq havaya yaxın bağ masası', 'A garden table open to the terrace air', 'Садовый стол рядом с открытой террасой'), baseAvailable: true, scene: 0 },
      { id: 'H05', capacity: 6, left: 68, top: 20, shape: 'long', tags: ['group', 'garden'], detail: L('Böyük qruplar üçün yaşıl zona', 'A planted zone made for larger groups', 'Зелёная зона для большой компании'), baseAvailable: true, scene: 2 },
      { id: 'H07', capacity: 2, left: 88, top: 26, shape: 'round', tags: ['quiet', 'plants'], detail: L('Memarlıq sütunu arxasında sakit künc', 'A quiet nook behind the architectural feature', 'Тихая ниша за архитектурным элементом'), baseAvailable: true, scene: 1 },
      { id: 'H09', capacity: 4, left: 18, top: 65, shape: 'square', tags: ['central', 'family'], detail: L('Bağa baxan rahat ailə masası', 'A comfortable family table facing the garden', 'Удобный семейный стол с видом на сад'), baseAvailable: true, scene: 3 },
      { id: 'H10', capacity: 2, left: 42, top: 64, shape: 'round', tags: ['date', 'plants'], detail: L('Yaşıllıqla əhatəli görüş masası', 'A date table wrapped in greenery', 'Стол для свидания в окружении зелени'), baseAvailable: true, scene: 1 },
      { id: 'H12', capacity: 8, left: 69, top: 63, shape: 'long', tags: ['group', 'central'], detail: L('Mərkəzi element yanında böyük masa', 'A large table beside the central feature', 'Большой стол у центрального элемента'), baseAvailable: true, scene: 2 },
      { id: 'H15', capacity: 4, left: 89, top: 68, shape: 'round', tags: ['terrace', 'quiet'], detail: L('Terrasın sakit sonundakı masa', 'A table at the quieter end of the terrace', 'Стол в тихой части террасы'), baseAvailable: true, scene: 0 },
    ],
  },
  {
    id: 'xazri',
    name: 'Xəzri',
    area: L('Bayıl', 'Bayil', 'Баил'),
    cuisine: L('Xəzər sahili mətbəxi', 'Caspian coastal kitchen', 'Каспийская прибрежная кухня'),
    description: L('Böyük pəncərələr, açıq terras və Xəzərin yumşaq işığı.', 'Large windows, an open terrace and the soft light of the Caspian.', 'Большие окна, открытая терраса и мягкий свет Каспия.'),
    atmosphere: L('Açıq · sakit · premium', 'Open · calm · premium', 'Просторно · спокойно · премиально'),
    price: '₼₼₼',
    hours: '13:00 — 01:00',
    rating: '4.9',
    tags: ['sea', 'terrace', 'sunset', 'date'],
    image: '/restaurants/xazri-grid.webp',
    planVariant: 'coastal',
    tables: [
      { id: 'X02', capacity: 2, left: 12, top: 20, shape: 'round', tags: ['sea', 'window'], detail: L('Birinci sırada Xəzər mənzərəsi', 'Front-row Caspian view by the glass', 'Первая линия у стекла с видом на Каспий'), baseAvailable: true, scene: 1 },
      { id: 'X04', capacity: 4, left: 35, top: 20, shape: 'round', tags: ['window', 'sunset'], detail: L('Günbatımını geniş görən pəncərə masası', 'A wide window table for the sunset', 'Широкий стол у окна для встречи заката'), baseAvailable: true, scene: 1 },
      { id: 'X06', capacity: 2, left: 65, top: 18, shape: 'square', tags: ['terrace', 'sea'], detail: L('Dəniz havasına açılan terras masası', 'A terrace table open to the sea air', 'Стол на террасе, открытый морскому воздуху'), baseAvailable: true, scene: 2 },
      { id: 'X08', capacity: 4, left: 88, top: 22, shape: 'round', tags: ['terrace', 'sunset'], detail: L('Günbatımı tərəfdə premium terras yeri', 'A premium terrace place on the sunset side', 'Премиальное место на закатной стороне террасы'), baseAvailable: true, scene: 2 },
      { id: 'X11', capacity: 4, left: 18, top: 63, shape: 'square', tags: ['central', 'family'], detail: L('Açıq mərkəzi zalda rahat masa', 'A comfortable table in the open central room', 'Удобный стол в открытом главном зале'), baseAvailable: true, scene: 3 },
      { id: 'X12', capacity: 8, left: 44, top: 62, shape: 'long', tags: ['group', 'central'], detail: L('Canlı atmosferli geniş qrup masası', 'A generous group table with a lively atmosphere', 'Просторный стол для компании в живой атмосфере'), baseAvailable: true, scene: 3 },
      { id: 'X14', capacity: 2, left: 69, top: 62, shape: 'round', tags: ['private', 'sea'], detail: L('Dənizə baxan daha özəl künc', 'A more secluded corner facing the sea', 'Более уединённый уголок с видом на море'), baseAvailable: true, scene: 1 },
      { id: 'X16', capacity: 4, left: 89, top: 65, shape: 'round', tags: ['window', 'date'], detail: L('Axşam görüşləri üçün yumşaq işıqlı yer', 'A softly lit window place for evening dates', 'Мягко освещённое место у окна для свиданий'), baseAvailable: true, scene: 0 },
    ],
  },
];

export const quickFilters = ['Tonight', 'Terrace', 'Sea view', 'Date night', 'Quiet', 'Traditional', 'New'];
export const times = ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export const copy = {
  AZ: {
    explore: 'Kəşf et', partners: 'Restoranlar üçün', headline: 'Sənin masan. Sənin mənzərən.', subhead: 'Bakıda restoran tap, masanı dəqiq seç və gəlməzdən əvvəl onu gör.', promise: 'Gəlməzdən əvvəl harada oturacağını bil.', where: 'Harada?', when: 'Nə vaxt?', time: 'Saat', guests: 'Qonaqlar?', find: 'Masa tap', overline: 'Bakı · masa seçiminin yeni yolu', heroStep1: 'Restoran', heroStep2: 'Plan', heroStep3: 'Sənin masan', discoveryTitle: 'Bu axşam masalar mövcuddur', discoveryIntro: 'Üç fərqli məkan. Hər birində seçə biləcəyin real masa görünüşü.', searchPlaceholder: 'Restoran, mətbəx və ya atmosfer axtar', noResults: 'Bu axtarışa uyğun restoran tapılmadı.', clearSearch: 'Filtrləri təmizlə', viewRestaurant: 'Restorana bax', availableAt: 'Mövcud saatlar', modifySearch: 'Axtarışı dəyiş', choose: 'Masanı dəqiq seç', planHelp: 'Mövcudluq tarixə, saata və qonaq sayına görə dəyişir.', available: 'Mövcuddur', reserved: 'Rezerv edilib', selected: 'Seçilib', tables: 'masa', floorEvening: 'Axşam planı', see: 'Bu masaya bax', whyThis: 'Niyə bu masa?', seats: 'nəfər', at: 'saat', previewHint: 'Masanın səviyyəsində görünüş', reserve: 'Bu masanı rezerv et', back: 'Plana qayıt', changeRestaurant: 'Başqa restoran seç', gallery: 'Məkanın atmosferi', galleryIntro: 'Plan əsasdır; şəkillər masanın ətrafını anlamağa kömək edir.', cuisine: 'Mətbəx', price: 'Qiymət', hours: 'Saatlar', rating: 'Reytinq', reservation: 'Rezervasiya', reserveTitle: 'Masanı tamamla', reserveDescription: 'Hesab lazım deyil. Yalnız rezervasiya üçün məlumatlar.', name: 'Ad', phone: 'Telefon', email: 'E-poçt', optional: 'istəyə görə', request: 'Xüsusi istək', requestPlaceholder: 'Allergiya, uşaq stulu və ya başqa qeyd', confirm: 'Rezervasiyanı təsdiqlə', requiredError: 'Adınızı və düzgün +994 telefon nömrəsini daxil edin.', yours: 'sizindir.', confirmation: 'Rezervasiya təsdiqləndi', addCalendar: 'Təqvimə əlavə et', directions: 'İstiqamət', share: 'Paylaş', calendarAdded: 'Təqvim üçün hadisə hazırlandı.', directionsReady: 'İstiqamət prototipdə açılmağa hazırdır.', shareReady: 'Rezervasiya linki paylaşılmağa hazırdır.', done: 'Hazırdır', partnerOverline: 'OTUR restoran tərəfi', partnerHeadlineA: 'Yemək zalın,', partnerHeadlineB: 'rəqəmsal.', partnerCopy: 'Qonaqlara onlar üçün hazırladığın təcrübəni seçməyə imkan ver.', partnerTools: 'Plan idarəetməsi', moveTables: 'Masaları köçür', addTable: 'Masa əlavə et', resizeTables: 'Ölçünü dəyiş', setCapacity: 'Tutumu seç', unavailable: 'Mövcud deyil', combine: 'Masaları birləşdir', assignTags: 'Etiket ver', defineZones: 'Zonaları seç', reservations: 'Rezervasiyalar', bringOtur: 'OTUR-u restoranına gətir', noPlan: 'Rəqəmsal planın yoxdur?', noPlanCopy: 'Restoran planının eskizini, PDF-ni və ya fotosunu göndər. Biz onu OTUR planına çevirəcəyik.', sendPlan: 'Planını göndər', partnerTitle: 'Restoranını OTUR-a gətir', partnerDescription: 'Komandamız məkanı və rezervasiya prosesini səninlə birlikdə rəqəmsallaşdıracaq.', restaurantName: 'Restoranın adı', contactPerson: 'Əlaqə şəxsi', district: 'Rayon', tableCount: 'Masa sayı', has: 'Restoranda nələr var?', indoor: 'Qapalı zal', privateRooms: 'Xüsusi otaqlar', outdoor: 'Açıq zona', acceptReservations: 'Hazırda rezervasiya qəbul edirsiniz?', yes: 'Bəli', no: 'Xeyr', manage: 'Rezervasiyanı necə idarə edirsiniz?', upload: 'Plan yüklə', uploadOptional: 'PDF, JPG və ya PNG · istəyə görə', uploaded: 'Plan əlavə edildi', additional: 'Əlavə mesaj', join: 'OTUR-a qoşul', partnerError: 'Əsas əlaqə məlumatlarını tamamlayın.', thankYou: 'Təşəkkür edirik.', thankYouCopy: 'Restoranınızın rəqəmsallaşdırılması ilə bağlı sizinlə əlaqə saxlayacağıq.', prototype: 'Simulyasiya edilmiş Bakı restoranları və mövcudluq.', indoorZone: 'QAPALI ZAL', terraceZone: 'TERRAS', gardenZone: 'BAĞ', windowZone: 'PƏNCƏRƏ', seaZone: 'XƏZƏR TƏRƏFİ', quietZone: 'SAKİT ZONA', entrance: 'GİRİŞ', feature: 'MEMARLIQ ELEMENTİ', premiumCorner: 'PREMİUM KÜNC', tonight: 'Bu axşam', new: 'Yeni', paper: 'Kağız', system: 'Rezervasiya sistemi', other: 'Digər',
  },
  EN: {
    explore: 'Explore', partners: 'For restaurants', headline: 'Your table. Your view.', subhead: 'Find a restaurant in Baku, choose the exact table, and see it before you arrive.', promise: 'Know where you’ll sit before you arrive.', where: 'Where?', when: 'When?', time: 'Time', guests: 'Guests?', find: 'Find a table', overline: 'Baku · a new way to choose a table', heroStep1: 'Restaurant', heroStep2: 'Plan', heroStep3: 'Your table', discoveryTitle: 'Tables available tonight', discoveryIntro: 'Three distinct places. Each with real table-level choices to explore.', searchPlaceholder: 'Search restaurants, cuisine or atmosphere', noResults: 'No restaurants match this search.', clearSearch: 'Clear filters', viewRestaurant: 'View restaurant', availableAt: 'Available times', modifySearch: 'Modify search', choose: 'Choose your exact table', planHelp: 'Availability changes with date, time and party size.', available: 'Available', reserved: 'Reserved', selected: 'Selected', tables: 'tables', floorEvening: 'Evening floor plan', see: 'See this table', whyThis: 'Why this table?', seats: 'guests', at: 'at', previewHint: 'Table-level perspective', reserve: 'Reserve this table', back: 'Back to floor plan', changeRestaurant: 'Choose another restaurant', gallery: 'The atmosphere around you', galleryIntro: 'The plan stays central; these views help you understand what surrounds each table.', cuisine: 'Cuisine', price: 'Price', hours: 'Hours', rating: 'Rating', reservation: 'Reservation', reserveTitle: 'Complete your table', reserveDescription: 'No account needed. Just the details for this reservation.', name: 'Name', phone: 'Phone', email: 'Email', optional: 'optional', request: 'Special request', requestPlaceholder: 'Allergy, child seat or another note', confirm: 'Confirm reservation', requiredError: 'Enter your name and a valid +994 phone number.', yours: 'is yours.', confirmation: 'Reservation confirmed', addCalendar: 'Add to calendar', directions: 'Directions', share: 'Share', calendarAdded: 'Calendar event prepared.', directionsReady: 'Directions are ready to open in the prototype.', shareReady: 'Reservation link is ready to share.', done: 'Done', partnerOverline: 'OTUR for restaurants', partnerHeadlineA: 'Your dining room,', partnerHeadlineB: 'digitally.', partnerCopy: 'Let guests choose the experience you designed for them.', partnerTools: 'Floor-plan management', moveTables: 'Move tables', addTable: 'Add table', resizeTables: 'Resize tables', setCapacity: 'Set capacity', unavailable: 'Mark unavailable', combine: 'Combine tables', assignTags: 'Assign table tags', defineZones: 'Define zones', reservations: 'See reservations', bringOtur: 'Bring OTUR to your restaurant', noPlan: 'No digital floor plan yet?', noPlanCopy: 'Send us a sketch, PDF or photo of your restaurant layout. We’ll turn it into an OTUR floor plan.', sendPlan: 'Send your floor plan', partnerTitle: 'Bring your restaurant to OTUR', partnerDescription: 'Our team will help digitise your room and reservation flow.', restaurantName: 'Restaurant name', contactPerson: 'Contact person', district: 'Restaurant district', tableCount: 'Number of tables', has: 'Does your restaurant have?', indoor: 'Indoor seating', privateRooms: 'Private rooms', outdoor: 'Outdoor seating', acceptReservations: 'Do you currently accept reservations?', yes: 'Yes', no: 'No', manage: 'How do you manage reservations?', upload: 'Upload floor plan', uploadOptional: 'PDF, JPG or PNG · optional', uploaded: 'Floor plan attached', additional: 'Additional message', join: 'Join OTUR', partnerError: 'Complete the main restaurant and contact details.', thankYou: 'Thank you.', thankYouCopy: 'We’ll contact you about digitising your restaurant.', prototype: 'Simulated Baku restaurants and availability.', indoorZone: 'INDOOR DINING', terraceZone: 'TERRACE', gardenZone: 'GARDEN', windowZone: 'WINDOW', seaZone: 'CASPIAN SIDE', quietZone: 'QUIET ZONE', entrance: 'ENTRANCE', feature: 'ARCHITECTURAL FEATURE', premiumCorner: 'PREMIUM CORNER', tonight: 'Tonight', new: 'New', paper: 'Paper', system: 'Reservation system', other: 'Other',
  },
  RU: {
    explore: 'Рестораны', partners: 'Для ресторанов', headline: 'Ваш стол. Ваш вид.', subhead: 'Найдите ресторан в Баку, выберите точный стол и увидьте его до визита.', promise: 'Знайте заранее, где будете сидеть.', where: 'Где?', when: 'Когда?', time: 'Время', guests: 'Гости?', find: 'Найти стол', overline: 'Баку · новый способ выбрать стол', heroStep1: 'Ресторан', heroStep2: 'План', heroStep3: 'Ваш стол', discoveryTitle: 'Столы доступны сегодня', discoveryIntro: 'Три разных места. В каждом можно выбрать и увидеть конкретный стол.', searchPlaceholder: 'Поиск по ресторану, кухне или атмосфере', noResults: 'По вашему запросу ничего не найдено.', clearSearch: 'Сбросить фильтры', viewRestaurant: 'Открыть ресторан', availableAt: 'Доступное время', modifySearch: 'Изменить поиск', choose: 'Выберите точный стол', planHelp: 'Доступность меняется в зависимости от даты, времени и числа гостей.', available: 'Доступен', reserved: 'Занят', selected: 'Выбран', tables: 'столов', floorEvening: 'Вечерний план', see: 'Посмотреть этот стол', whyThis: 'Почему этот стол?', seats: 'гостей', at: 'в', previewHint: 'Вид с уровня стола', reserve: 'Забронировать этот стол', back: 'Назад к плану', changeRestaurant: 'Выбрать другой ресторан', gallery: 'Атмосфера вокруг', galleryIntro: 'План остаётся главным, а фотографии помогают понять окружение стола.', cuisine: 'Кухня', price: 'Цена', hours: 'Часы', rating: 'Рейтинг', reservation: 'Бронирование', reserveTitle: 'Подтвердите выбор стола', reserveDescription: 'Аккаунт не нужен. Только данные для бронирования.', name: 'Имя', phone: 'Телефон', email: 'Эл. почта', optional: 'необязательно', request: 'Особое пожелание', requestPlaceholder: 'Аллергия, детский стул или другое пожелание', confirm: 'Подтвердить бронь', requiredError: 'Введите имя и корректный номер +994.', yours: 'ваш.', confirmation: 'Бронирование подтверждено', addCalendar: 'В календарь', directions: 'Маршрут', share: 'Поделиться', calendarAdded: 'Событие для календаря подготовлено.', directionsReady: 'Маршрут готов к открытию в прототипе.', shareReady: 'Ссылка на бронь готова к отправке.', done: 'Готово', partnerOverline: 'OTUR для ресторанов', partnerHeadlineA: 'Ваш зал —', partnerHeadlineB: 'в цифре.', partnerCopy: 'Позвольте гостям выбирать впечатление, которое вы для них создали.', partnerTools: 'Управление планом', moveTables: 'Перемещать столы', addTable: 'Добавить стол', resizeTables: 'Изменять размер', setCapacity: 'Задать вместимость', unavailable: 'Сделать недоступным', combine: 'Объединять столы', assignTags: 'Назначать теги', defineZones: 'Задавать зоны', reservations: 'Смотреть брони', bringOtur: 'Подключить ресторан к OTUR', noPlan: 'Нет цифрового плана?', noPlanCopy: 'Пришлите эскиз, PDF или фото планировки. Мы превратим его в план OTUR.', sendPlan: 'Отправить план', partnerTitle: 'Подключите ресторан к OTUR', partnerDescription: 'Наша команда поможет оцифровать зал и процесс бронирования.', restaurantName: 'Название ресторана', contactPerson: 'Контактное лицо', district: 'Район ресторана', tableCount: 'Количество столов', has: 'Что есть в ресторане?', indoor: 'Внутренний зал', privateRooms: 'Отдельные комнаты', outdoor: 'Открытая зона', acceptReservations: 'Вы принимаете бронирования?', yes: 'Да', no: 'Нет', manage: 'Как вы ведёте бронирования?', upload: 'Загрузить план', uploadOptional: 'PDF, JPG или PNG · необязательно', uploaded: 'План прикреплён', additional: 'Дополнительное сообщение', join: 'Присоединиться к OTUR', partnerError: 'Заполните основные данные ресторана и контакта.', thankYou: 'Спасибо.', thankYouCopy: 'Мы свяжемся с вами по поводу цифрового плана ресторана.', prototype: 'Симулированные рестораны Баку и доступность.', indoorZone: 'ВНУТРЕННИЙ ЗАЛ', terraceZone: 'ТЕРРАСА', gardenZone: 'САД', windowZone: 'ОКНА', seaZone: 'СТОРОНА КАСПИЯ', quietZone: 'ТИХАЯ ЗОНА', entrance: 'ВХОД', feature: 'АРХИТЕКТУРНЫЙ ЭЛЕМЕНТ', premiumCorner: 'ПРЕМИАЛЬНЫЙ УГОЛОК', tonight: 'Сегодня', new: 'Новое', paper: 'Бумага', system: 'Система бронирования', other: 'Другое',
  },
} as const;

export function localize(value: Localized, language: Language) {
  return value[language];
}

export function localizeTag(tag: string, language: Language) {
  return tagCopy[tag]?.[language] ?? tag;
}
