// Lekka wielojęzyczność bez zależności. Klucze w notacji z kropką; wartości mogą
// zawierać proste pola {nazwa}, podstawiane przez funkcję t().
export type Lang = 'pl' | 'en'

export const LANGS: Lang[] = ['pl', 'en']

type Dict = Record<string, string>

const pl: Dict = {
  // Nawigacja
  'nav.start': 'Start',
  'nav.map': 'Mapa',
  'nav.chat': 'Czat',
  'nav.help': 'Pomoc',
  'nav.add': 'Dodaj',
  'nav.addEvent': 'Dodaj wydarzenie',
  'nav.account': 'Konto',
  // Menu „więcej"
  'menu.more': 'Więcej',
  'menu.safety': 'Bezpieczna sieć',
  'menu.terms': 'Regulamin',
  'menu.privacy': 'Polityka prywatności',
  'menu.settings': 'Ustawienia',
  'menu.language': 'Język',
  // Nagłówek / wspólne
  'header.back': 'Wróć na stronę główną',
  'header.cityChange': 'Miasto: {city}. Zmień miasto',
  'header.city': 'Miasto: {city}',
  // Wyszukiwarka
  'search.placeholder': 'Szukaj wydarzeń…',
  'search.clear': 'Wyczyść wyszukiwanie',
  'search.label': 'Szukaj wydarzeń',
  'search.results': 'Wyniki: „{query}”',
  'search.empty': 'Brak wydarzeń pasujących do „{query}”. Spróbuj innego hasła.',
  'search.searching': 'Wyszukiwanie',
  // Strona główna
  'home.heading': 'Wydarzenia: {city}',
  'home.prefsChips': 'Twoje preferencje: dla kogo szukasz wydarzeń',
  'home.upcoming': 'Najbliższe wydarzenia',
  'home.prefsSection': 'Preferencje',
  'home.prefsMatched': 'Wydarzenia dopasowane do Twoich preferencji',
  'home.liked': 'Lubiane przez innych',
  'home.likedRow': 'Wydarzenia z największą liczbą zapisanych',
  'home.prefsEmptyNone': 'Zaznacz powyżej, dla kogo szukasz wydarzeń, a dopasujemy propozycje.',
  'home.prefsEmptySelected': 'Brak nadchodzących wydarzeń dla wybranych grup.',
  'home.errorFetch': 'Nie udało się pobrać wydarzeń. Spróbuj ponownie za chwilę.',
  'home.errorNoDb': 'Brak połączenia z bazą. Uzupełnij klucze Supabase w pliku .env.local.',
  'home.cityEmpty': 'W tym mieście nie ma jeszcze nadchodzących wydarzeń. Dodaj pierwsze!',
  'home.add': 'Dodaj',
  'home.fabMap': 'Mapa',
  // Wybór miasta
  'city.subtitle': 'Sąsiedzkie wydarzenia w Twoim mieście.',
  'city.select': 'Twoje miasto',
  'city.submit': 'Pokaż wydarzenia',
  // Strony informacyjne
  'terms.title': 'Warunki korzystania 📄',
  'terms.body':
    'Pełna treść regulaminu pojawi się wkrótce. Sąsiedzko to aplikacja do organizowania i ' +
    'znajdowania sąsiedzkich wydarzeń. Korzystając z niej, zgadzasz się na kulturalne i zgodne z ' +
    'prawem zachowanie wobec innych mieszkańców.',
  'privacy.title': 'Prywatność 🔒',
  'privacy.body':
    'Szanujemy Twoją prywatność. Dokładny adres wydarzenia widoczny jest dopiero po zapisaniu ' +
    'się, a Twoje dane chronione są regułami bezpieczeństwa bazy. Pełna polityka prywatności ' +
    'pojawi się wkrótce.',
  'settings.title': 'Ustawienia ⚙️',
  'settings.language': 'Język aplikacji',
  'settings.seniorTitle': 'Dostępność',
  'settings.senior': 'Tryb dla seniorów',
  'settings.seniorHint':
    'Większy tekst i ikony, mocniejszy kontrast, podkreślone linki, większe odstępy i brak animacji. Zgodnie z wytycznymi WCAG 2.1.',
  'a11y.skip': 'Przejdź do treści',
}

const en: Dict = {
  'nav.start': 'Home',
  'nav.map': 'Map',
  'nav.chat': 'Chat',
  'nav.help': 'Help',
  'nav.add': 'Add',
  'nav.addEvent': 'Add event',
  'nav.account': 'Account',
  'menu.more': 'More',
  'menu.safety': 'Safe internet',
  'menu.terms': 'Terms of use',
  'menu.privacy': 'Privacy',
  'menu.settings': 'Settings',
  'menu.language': 'Language',
  'header.back': 'Back to home',
  'header.cityChange': 'City: {city}. Change city',
  'header.city': 'City: {city}',
  'search.placeholder': 'Search events…',
  'search.clear': 'Clear search',
  'search.label': 'Search events',
  'search.results': 'Results: “{query}”',
  'search.empty': 'No events match “{query}”. Try another term.',
  'search.searching': 'Searching',
  'home.heading': 'Events: {city}',
  'home.prefsChips': 'Your preferences: who are you looking for events for',
  'home.upcoming': 'Upcoming events',
  'home.prefsSection': 'Preferences',
  'home.prefsMatched': 'Events matched to your preferences',
  'home.liked': 'Liked by others',
  'home.likedRow': 'Events with the most sign-ups',
  'home.prefsEmptyNone': 'Select above who you are looking for events for, and we will match suggestions.',
  'home.prefsEmptySelected': 'No upcoming events for the selected groups.',
  'home.errorFetch': 'Could not load events. Please try again in a moment.',
  'home.errorNoDb': 'No database connection. Fill in your Supabase keys in the .env.local file.',
  'home.cityEmpty': 'There are no upcoming events in this city yet. Add the first one!',
  'home.add': 'Add',
  'home.fabMap': 'Map',
  'city.subtitle': 'Neighbourhood events in your city.',
  'city.select': 'Your city',
  'city.submit': 'Show events',
  'terms.title': 'Terms of use 📄',
  'terms.body':
    'The full terms will appear soon. Sąsiedzko is an app for organising and finding ' +
    'neighbourhood events. By using it, you agree to behave politely and lawfully towards other ' +
    'residents.',
  'privacy.title': 'Privacy 🔒',
  'privacy.body':
    'We respect your privacy. The exact event address is shown only after you sign up, and your ' +
    'data is protected by the database security rules. The full privacy policy will appear soon.',
  'settings.title': 'Settings ⚙️',
  'settings.language': 'App language',
  'settings.seniorTitle': 'Accessibility',
  'settings.senior': 'Senior mode',
  'settings.seniorHint':
    'Larger text and icons, stronger contrast, underlined links, more spacing and no animations. Following WCAG 2.1 guidelines.',
  'a11y.skip': 'Skip to content',
}

export const translations: Record<Lang, Dict> = { pl, en }
