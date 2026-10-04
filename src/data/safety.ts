// Treści strony „Bezpieczna sieć": edukacja o bezpiecznym korzystaniu z internetu
// dla seniorów oraz dzieci i młodzieży. Sam tekst, bez logiki, żeby dało się go łatwo redagować.
// Numery i instytucje: 112 (numer alarmowy), 8080 (CERT Polska, podejrzane SMS-y),
// 116 111 (telefon zaufania dla dzieci i młodzieży), zastrzeżenie PESEL w mObywatel.

export type Audience = 'all' | 'seniors' | 'kids'
// 'common' = pokazujemy każdemu; pozostałe tylko wybranej grupie (oraz w widoku „Dla wszystkich")
type For = 'common' | 'seniors' | 'kids'

export const AUDIENCES: { id: Audience; label: string; emoji: string }[] = [
  { id: 'all', label: 'Dla wszystkich', emoji: '👪' },
  { id: 'seniors', label: 'Seniorzy', emoji: '🧓' },
  { id: 'kids', label: 'Dzieci i młodzież', emoji: '🧒' },
]

export const matches = (item: { for: For }, audience: Audience) =>
  audience === 'all' || item.for === 'common' || item.for === audience

// ---------- 3 kroki ----------
export const STEPS = [
  { emoji: '✋', title: 'Zatrzymaj się', text: 'Oszuści chcą, żebyś się spieszył(a).', color: '#fcd34d' },
  { emoji: '🔍', title: 'Sprawdź', text: 'Oddzwoń sam(a) na znany numer.', color: '#7dd3fc' },
  { emoji: '📣', title: 'Zgłoś', text: 'Powiedz bliskim i instytucjom.', color: '#f9a8d4' },
]

// ---------- Jak rozpoznać oszusta ----------
export interface Scam {
  for: For
  emoji: string
  title: string
  text: string
  // typowe zdanie oszusta
  example: string
  // co robię w takiej sytuacji
  action: string
}

export const SCAMS: Scam[] = [
  {
    for: 'common',
    emoji: '⏰',
    title: 'Ktoś mnie pospiesza',
    text: '„Zrób to teraz, bo konto zostanie zablokowane." Prawdziwe instytucje dają czas na decyzję i nie wymuszają jej przez telefon.',
    example: 'Masz 10 minut na wpłatę',
    action: 'Rozłączam się, odczekuję chwilę i dzwonię sam(a) na numer z oficjalnej strony.',
  },
  {
    for: 'common',
    emoji: '🔗',
    title: 'Dostaję link w SMS-ie lub e-mailu',
    text: 'Fałszywe wiadomości udają kuriera, bank, urząd albo dostawcę prądu. Link prowadzi do strony, która wygląda jak prawdziwa i wyłudza dane karty.',
    example: 'Dopłać 1,80 zł, inaczej paczka wróci do nadawcy',
    action: 'Nie klikam. Status paczki albo rachunku sprawdzam w oficjalnej aplikacji, a SMS przesyłam na numer 8080.',
  },
  {
    for: 'seniors',
    emoji: '📞',
    title: 'Dzwoni „bank" lub „policja"',
    text: 'Głos w słuchawce brzmi fachowo i zna Twoje imię. Mówi o włamaniu na konto albo o tajnej akcji. Bank i policja nigdy nie proszą o przelew, kod ani gotówkę.',
    example: 'Proszę przelać oszczędności na bezpieczne konto',
    action: 'Kończę rozmowę i dzwonię na numer z odwrotu karty albo na 112. Nikomu nie przekazuję pieniędzy.',
  },
  {
    for: 'seniors',
    emoji: '👵',
    title: 'Bliski nagle potrzebuje pieniędzy',
    text: 'Ktoś podaje się za wnuczka, córkę albo ich znajomego. Mówi o wypadku lub kłopotach i prosi, żeby nikomu nie mówić.',
    example: 'Babciu, miałem wypadek, potrzebuję pieniędzy jeszcze dziś',
    action: 'Rozłączam się i dzwonię do bliskiej osoby na numer, który znam od dawna.',
  },
  {
    for: 'seniors',
    emoji: '💔',
    title: 'Nowa znajomość prosi o pieniądze',
    text: 'Poznana w internecie osoba pisze czule przez wiele tygodni, a potem ma nagły problem: chorobę, cło, bilet do Polski.',
    example: 'Kocham Cię, pożycz mi tylko na bilet, oddam przy spotkaniu',
    action: 'Nie wysyłam pieniędzy osobie, której nie spotkałem(-am) na żywo. Rozmawiam o tym z kimś bliskim.',
  },
  {
    for: 'common',
    emoji: '💻',
    title: 'Proszą o zdalny dostęp do telefonu',
    text: 'Rozmówca oferuje pomoc i prosi o zainstalowanie aplikacji do zdalnej obsługi. Dzięki niej widzi ekran i może sam wejść na konto w banku.',
    example: 'Proszę zainstalować tę aplikację, zabezpieczymy konto',
    action: 'Niczego nie instaluję na prośbę przez telefon. Pomocy szukam u rodziny albo w oddziale banku.',
  },
  {
    for: 'kids',
    emoji: '🎮',
    title: 'Nieznajomy pisze do mnie w grze',
    text: 'Ktoś jest bardzo miły, mówi, że jest w Twoim wieku, i szybko prosi o zdjęcie, adres albo spotkanie. W internecie każdy może udawać kogoś innego.',
    example: 'Też mam 12 lat, wyślij mi swoje zdjęcie',
    action: 'Nie odpisuję i nie wysyłam zdjęć. Blokuję tę osobę i mówię o tym rodzicowi albo innemu zaufanemu dorosłemu.',
  },
  {
    for: 'kids',
    emoji: '🎁',
    title: 'Ktoś obiecuje darmowe monety lub skiny',
    text: 'Strona albo gracz obiecuje nagrodę w zamian za login i hasło. Po podaniu danych tracisz konto.',
    example: 'Podaj hasło, a dostaniesz 5000 monet',
    action: 'Hasła nie podaję nikomu, nawet koledze. Nagrody za hasło nie istnieją.',
  },
  {
    for: 'kids',
    emoji: '😢',
    title: 'Ktoś mnie obraża albo straszy',
    text: 'Wyzwiska, wyśmiewanie albo groźby w sieci to przemoc. To nie Twoja wina i nie musisz radzić sobie z tym sam(a).',
    example: 'Jak komuś powiesz, wrzucę to do sieci',
    action: 'Nie odpowiadam. Robię zrzut ekranu, blokuję tę osobę i mówię dorosłemu. Mogę też zadzwonić pod 116 111.',
  },
]

// ---------- Jakich danych nie podawać ----------
export const FORBIDDEN: { for: For; emoji: string; color: string; title: string; text: string }[] = [
  { for: 'common', emoji: '🔢', color: '#7dd3fc', title: 'PIN i kod CVV karty', text: 'Nawet „do weryfikacji"' },
  { for: 'common', emoji: '📱', color: '#fcd34d', title: 'Kody SMS i BLIK', text: 'Taki kod to klucz do Twoich pieniędzy' },
  { for: 'common', emoji: '🔑', color: '#f9a8d4', title: 'Hasła i kody dostępu', text: 'Nikt uczciwy nie będzie o nie prosić' },
  { for: 'common', emoji: '🪪', color: '#c8ff00', title: 'Zdjęcie dowodu i PESEL', text: 'Zwłaszcza przez telefon lub komunikator' },
  { for: 'common', emoji: '🏠', color: '#7dd3fc', title: 'Adres i numer telefonu', text: 'Nie w czatach z nieznajomymi' },
  { for: 'common', emoji: '🖥️', color: '#fcd34d', title: 'Dostęp do ekranu telefonu', text: 'Żadnych aplikacji „zdalnej pomocy"' },
  { for: 'kids', emoji: '🏫', color: '#f9a8d4', title: 'Nazwa szkoły i plan dnia', text: 'Nieznajomy nie musi wiedzieć, gdzie i kiedy jesteś' },
]

export const SAFE_NOTE = 'Bezpiecznie możesz podać: imię, ulubione wydarzenia i kategorie, które Cię interesują.'

// ---------- Jak korzystać z technologii ----------
export const LESSON_CATEGORIES = [
  { id: 'telefon', label: 'Telefon' },
  { id: 'hasla', label: 'Hasła' },
  { id: 'platnosci', label: 'Płatności' },
  { id: 'wideo', label: 'Wideo' },
  { id: 'aplikacje', label: 'Aplikacje' },
] as const

export type LessonCategory = (typeof LESSON_CATEGORIES)[number]['id']

export interface Lesson {
  id: string
  for: For
  category: LessonCategory
  emoji: string
  // tło ikony
  gradient: string
  title: string
  minutes: number
  steps: { title: string; text: string }[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'silne-hasla',
    for: 'common',
    category: 'hasla',
    emoji: '🔑',
    gradient: 'linear-gradient(135deg, #4b3bf0, #7c3aed)',
    title: 'Silne hasła bez bólu głowy',
    minutes: 4,
    steps: [
      { title: 'Zdanie zamiast słowa', text: 'Dobre hasło jest długie. Najłatwiej ułożyć je z kilku słów, które coś dla Ciebie znaczą, na przykład „ZielonyRowerNaBloniach7". Krótkie hasła typu „Kasia123" da się odgadnąć w kilka sekund.' },
      { title: 'Inne hasło do banku i poczty', text: 'Jeśli jedno hasło wycieknie, oszust sprawdzi je wszędzie. Bank i skrzynka e-mail powinny mieć hasła, których nie używasz nigdzie indziej.' },
      { title: 'Gdzie je trzymać', text: 'Najwygodniejszy jest menedżer haseł w telefonie. Jeśli wolisz papier, zeszyt schowany w domu jest lepszy niż jedno hasło do wszystkiego. Nie trzymaj haseł w notatkach ani w e-mailach.' },
      { title: 'Drugi krok przy logowaniu', text: 'Włącz logowanie dwuetapowe tam, gdzie się da. Wtedy samo hasło nie wystarczy: potrzebne jest jeszcze potwierdzenie w telefonie.' },
    ],
  },
  {
    id: 'bezpieczne-platnosci',
    for: 'common',
    category: 'platnosci',
    emoji: '💳',
    gradient: 'linear-gradient(135deg, #15803d, #22c55e)',
    title: 'Bezpieczne płatności online',
    minutes: 5,
    steps: [
      { title: 'Sprawdź adres strony', text: 'Zanim wpiszesz dane karty, przeczytaj adres w pasku przeglądarki litera po literze. Fałszywe strony różnią się jedną literą albo dziwną końcówką, na przykład .xyz.' },
      { title: 'Płać BLIK-iem albo kartą', text: 'Te płatności można reklamować. Przelew na prywatne konto nieznajomej osoby jest jak wręczenie gotówki: trudno ją odzyskać.' },
      { title: 'Kod BLIK jest tylko dla Ciebie', text: 'Kod BLIK wpisujesz sam(a) w sklepie albo bankomacie. Jeśli ktoś prosi o kod przez telefon lub komunikator, to prawie zawsze oszustwo, nawet gdy pisze z konta znajomego.' },
      { title: 'Ustaw limity', text: 'W aplikacji banku ustaw dzienny limit płatności i przelewów. Gdy coś pójdzie nie tak, strata będzie mniejsza.' },
    ],
  },
  {
    id: 'wideorozmowa',
    for: 'seniors',
    category: 'wideo',
    emoji: '📹',
    gradient: 'linear-gradient(135deg, #c2410c, #fb923c)',
    title: 'Wideorozmowa z bliskimi',
    minutes: 3,
    steps: [
      { title: 'Wybierz aplikację', text: 'Użyj tej, którą mają Twoi bliscy, na przykład WhatsApp albo Messenger. Poproś kogoś z rodziny o pomoc przy pierwszym uruchomieniu.' },
      { title: 'Zadzwoń z obrazem', text: 'Otwórz rozmowę z bliską osobą i naciśnij ikonę kamery. Przy pierwszym razie telefon zapyta o zgodę na użycie kamery i mikrofonu. Zgódź się.' },
      { title: 'Ustaw telefon wygodnie', text: 'Oprzyj telefon o kubek na wysokości twarzy i usiądź przodem do okna. Będzie Cię dobrze widać i słychać.' },
      { title: 'Zakończ rozmowę', text: 'Naciśnij czerwoną słuchawkę. Nieznane numery, które dzwonią z wideo, po prostu odrzuć.' },
    ],
  },
  {
    id: 'blokada-i-aktualizacje',
    for: 'common',
    category: 'telefon',
    emoji: '📱',
    gradient: 'linear-gradient(135deg, #0369a1, #38bdf8)',
    title: 'Blokada ekranu i aktualizacje',
    minutes: 3,
    steps: [
      { title: 'Zablokuj ekran', text: 'Ustaw odcisk palca, rozpoznawanie twarzy albo kod. Bez blokady każdy, kto znajdzie telefon, wejdzie do Twoich wiadomości i banku.' },
      { title: 'Aktualizuj telefon', text: 'Aktualizacje łatają dziury, którymi włamują się oszuści. Gdy telefon proponuje aktualizację systemu, zgódź się, najlepiej wieczorem przy ładowarce.' },
      { title: 'Uważaj na darmowe Wi-Fi', text: 'W kawiarni lub na dworcu nie loguj się do banku przez otwartą sieć. Do płatności użyj internetu z własnej karty SIM.' },
    ],
  },
  {
    id: 'skad-aplikacje',
    for: 'common',
    category: 'aplikacje',
    emoji: '🧩',
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
    title: 'Skąd pobierać aplikacje',
    minutes: 3,
    steps: [
      { title: 'Tylko z oficjalnego sklepu', text: 'Aplikacje instaluj ze Sklepu Play albo App Store. Plik z linku w SMS-ie lub od nieznajomego może przejąć telefon.' },
      { title: 'Czytaj, o co prosi aplikacja', text: 'Latarka nie potrzebuje dostępu do kontaktów i SMS-ów. Jeśli aplikacja prosi o więcej, niż powinna, odmów albo ją usuń.' },
      { title: 'Usuń to, czego nie używasz', text: 'Stare aplikacje nadal mają dostęp do danych. Raz na jakiś czas przejrzyj listę i usuń zbędne.' },
    ],
  },
  {
    id: 'prywatnosc-w-grach',
    for: 'kids',
    category: 'telefon',
    emoji: '🎮',
    gradient: 'linear-gradient(135deg, #6d28d9, #a78bfa)',
    title: 'Prywatność w grach i mediach',
    minutes: 4,
    steps: [
      { title: 'Ustaw konto jako prywatne', text: 'W ustawieniach wybierz, że Twoje zdjęcia i posty widzą tylko znajomi. Poproś rodzica o pomoc, jeśli nie możesz znaleźć tej opcji.' },
      { title: 'Nick zamiast nazwiska', text: 'W grach używaj pseudonimu. Nie wpisuj w profilu nazwy szkoły, adresu ani numeru telefonu.' },
      { title: 'Znajomi to osoby, które znasz', text: 'Przyjmuj zaproszenia tylko od osób, które znasz na żywo. Liczba znajomych nie jest ważna.' },
      { title: 'Blokuj i zgłaszaj', text: 'Każda gra i aplikacja ma przycisk blokowania i zgłaszania. Użyj go, gdy ktoś Cię obraża, i powiedz o tym dorosłemu.' },
    ],
  },
  {
    id: 'zanim-wrzucisz',
    for: 'kids',
    category: 'aplikacje',
    emoji: '📸',
    gradient: 'linear-gradient(135deg, #b45309, #fbbf24)',
    title: 'Pomyśl, zanim wrzucisz',
    minutes: 3,
    steps: [
      { title: 'Internet nie zapomina', text: 'Zdjęcie albo komentarz może ktoś zapisać i pokazać dalej, nawet gdy je usuniesz. Wrzucaj tylko to, co mogliby zobaczyć rodzice i nauczyciel.' },
      { title: 'Zapytaj o zgodę', text: 'Zanim opublikujesz zdjęcie kolegi albo koleżanki, zapytaj, czy się zgadza. Ty też masz prawo powiedzieć „nie".' },
      { title: 'Nie przesyłaj dalej krzywdzących treści', text: 'Udostępnianie ośmieszającego zdjęcia też krzywdzi. Zamiast podawać dalej, zgłoś je w aplikacji.' },
    ],
  },
]

// ---------- Quiz ----------
export interface QuizQuestion {
  // kto „pisze" i kiedy
  sender: string
  message: string
  options: { label: string; correct: boolean }[]
  explanation: string
}

const ADULT_QUIZ: QuizQuestion[] = [
  {
    sender: 'NIEZNANY NUMER · 14:02',
    message: 'Twoja paczka czeka. Dopłać 1,80 zł: kurier-szybki.xyz/odbierz',
    options: [
      { label: 'Nie klikam, usuwam', correct: true },
      { label: 'Klikam i płacę', correct: false },
    ],
    explanation: 'To oszustwo. Firmy kurierskie nie proszą o dopłatę przez link w SMS-ie, a adres z końcówką .xyz nie należy do żadnego przewoźnika. Taki SMS możesz przesłać na 8080.',
  },
  {
    sender: 'ROZMOWA TELEFONICZNA · „BANK"',
    message: 'Dzień dobry, ktoś właśnie bierze kredyt na Pana dane. Proszę podać kod BLIK, zablokujemy operację.',
    options: [
      { label: 'Podaję kod, żeby zablokować', correct: false },
      { label: 'Rozłączam się i dzwonię do banku', correct: true },
    ],
    explanation: 'Bank nigdy nie prosi o kod BLIK, PIN ani hasło. Rozłącz się i zadzwoń na numer z odwrotu karty.',
  },
  {
    sender: 'ZNAJOMA NA MESSENGERZE · 21:40',
    message: 'Hej, pożycz 300 zł BLIK-iem, oddam jutro. Nie mogę teraz rozmawiać.',
    options: [
      { label: 'Dzwonię do niej i pytam', correct: true },
      { label: 'Wysyłam kod, to przecież znajoma', correct: false },
    ],
    explanation: 'Konto znajomej mogło zostać przejęte. Zanim cokolwiek wyślesz, zadzwoń do niej zwykłym połączeniem.',
  },
  {
    sender: 'E-MAIL · „LOTERIA"',
    message: 'Wygrałeś telefon! Podaj numer karty, aby opłacić wysyłkę 4,99 zł.',
    options: [
      { label: 'Podaję dane karty', correct: false },
      { label: 'Usuwam wiadomość', correct: true },
    ],
    explanation: 'Nie da się wygrać w loterii, w której nie brało się udziału. Chodzi o numer karty, nie o 4,99 zł.',
  },
  {
    sender: 'APLIKACJA BANKU · POWIADOMIENIE',
    message: 'Zalogowano na nowym urządzeniu. Jeśli to nie Ty, zadzwoń na numer z karty.',
    options: [
      { label: 'Dzwonię na numer z karty', correct: true },
      { label: 'Ignoruję, pewnie pomyłka', correct: false },
    ],
    explanation: 'Powiadomienie z własnej aplikacji banku warto potraktować poważnie. Dzwoń zawsze na numer z karty albo z oficjalnej strony, nigdy na numer podany w SMS-ie.',
  },
]

const KIDS_QUIZ: QuizQuestion[] = [
  {
    sender: 'CZAT W GRZE · GRACZ_PRO',
    message: 'Podaj login i hasło, a dodam Ci 5000 monet za darmo!',
    options: [
      { label: 'Nie podaję i zgłaszam gracza', correct: true },
      { label: 'Podaję, chcę monety', correct: false },
    ],
    explanation: 'Kto dostanie Twoje hasło, zabierze konto. Hasła nie podajemy nikomu.',
  },
  {
    sender: 'NIEZNAJOMY · WIADOMOŚĆ PRYWATNA',
    message: 'Gdzie mieszkasz? Spotkajmy się, tylko nie mów rodzicom.',
    options: [
      { label: 'Odpisuję, wydaje się miły', correct: false },
      { label: 'Nie odpowiadam i mówię dorosłemu', correct: true },
    ],
    explanation: 'Prośba o tajemnicę przed rodzicami to sygnał alarmowy. Powiedz o tym dorosłemu, któremu ufasz.',
  },
  {
    sender: 'KOLEGA Z KLASY · 16:10',
    message: 'Zobacz to śmieszne wideo o Tobie: bit-video.xyz/ty',
    options: [
      { label: 'Klikam, jestem ciekawy(-a)', correct: false },
      { label: 'Pytam kolegę na żywo, czy to on pisał', correct: true },
    ],
    explanation: 'Takie linki często rozsyła ktoś, kto przejął konto kolegi. Zanim klikniesz, zapytaj go inną drogą.',
  },
  {
    sender: 'OKIENKO NA STRONIE',
    message: 'Twój telefon ma 5 wirusów! Zainstaluj ochronę TERAZ!',
    options: [
      { label: 'Zamykam stronę', correct: true },
      { label: 'Instaluję, żeby usunąć wirusy', correct: false },
    ],
    explanation: 'Strona internetowa nie potrafi sprawdzić, czy masz wirusa. To reklama, która sama instaluje szkodliwą aplikację.',
  },
  {
    sender: 'GRUPA KLASOWA · 19:30',
    message: 'Hahaha, zobaczcie to zdjęcie Oli, podajcie dalej!',
    options: [
      { label: 'Podaję dalej, wszyscy tak robią', correct: false },
      { label: 'Nie udostępniam i zgłaszam', correct: true },
    ],
    explanation: 'Przesyłanie ośmieszającego zdjęcia to też przemoc. Możesz to przerwać: nie podawaj dalej i powiedz dorosłemu.',
  },
]

export const quizFor = (audience: Audience) => (audience === 'kids' ? KIDS_QUIZ : ADULT_QUIZ)

// ---------- Co zrobić, gdy coś się stało ----------
export interface EmergencyStep {
  title: string
  text: string
  // numer telefonu do wybrania jednym kliknięciem
  phone?: string
  urgent?: boolean
}

const ADULT_EMERGENCY: EmergencyStep[] = [
  { title: 'Zablokuj kartę i konto', text: 'Zadzwoń na infolinię banku. Numer jest na odwrocie karty.', urgent: true },
  { title: 'Zgłoś na policję', text: 'Pilny przypadek lub zagrożenie.', phone: '112' },
  { title: 'Prześlij podejrzany SMS', text: 'Wyślij go pod ten numer. Pomoże to blokować oszustów.', phone: '8080' },
  { title: 'Zastrzeż swój PESEL', text: 'Zrobisz to w aplikacji mObywatel. To bezpłatne.' },
]

const KIDS_EMERGENCY: EmergencyStep[] = [
  { title: 'Powiedz zaufanemu dorosłemu', text: 'Rodzicowi, nauczycielowi albo pedagogowi. To nie skarżenie, tylko dbanie o siebie.', urgent: true },
  { title: 'Zrób zrzut ekranu', text: 'Nie kasuj wiadomości. Będą dowodem.' },
  { title: 'Zablokuj i zgłoś', text: 'Użyj przycisku zgłaszania w grze albo aplikacji.' },
  { title: 'Zadzwoń po pomoc', text: 'Telefon zaufania dla dzieci i młodzieży. Bezpłatny i anonimowy.', phone: '116 111' },
]

export const emergencyFor = (audience: Audience) => (audience === 'kids' ? KIDS_EMERGENCY : ADULT_EMERGENCY)
