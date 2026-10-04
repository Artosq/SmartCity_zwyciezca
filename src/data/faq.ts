export interface FaqItem {
  question: string
  answer: string
  // cztery pytania widoczne od razu; pozostałe znajduje wyszukiwarka
  popular?: boolean
}

// Pytania i odpowiedzi na stronie Pomoc. Odpowiedzi opisują to, co aplikacja faktycznie robi —
// przy zmianie funkcji trzeba je poprawić razem z kodem.
export const FAQ: FaqItem[] = [
  {
    popular: true,
    question: 'Jak zapisać się na wydarzenie?',
    answer:
      'Otwórz wydarzenie — kliknij jego kartę na stronie głównej albo pinezkę na mapie — rozwiń kartę i wybierz „Dołącz". Musisz być zalogowany(-a). Jeśli wydarzenie ma limit miejsc, karta pokazuje, ile jeszcze zostało. Po zapisie trafisz od razu do czatu uczestników, a wydarzenie pojawi się w kalendarzu na stronie Konto.',
  },
  {
    popular: true,
    question: 'Jak działa czat uczestników?',
    answer:
      'Każde wydarzenie, na które jesteś zapisany(-a), ma swoją rozmowę w zakładce Czat. Wiadomości pojawiają się na żywo, bez odświeżania strony. Spotkania „We dwoje" mają osobną, prywatną rozmowę tylko dla dwóch osób — pojawia się ona, gdy ktoś dołączy do propozycji.',
  },
  {
    popular: true,
    question: 'Jak zgłosić nieodpowiednią osobę?',
    answer:
      'Kliknij „Napisz do nas" na dole tej strony i opisz, co się stało: podaj imię tej osoby oraz wydarzenie albo spotkanie, którego to dotyczy. Zespół przeczyta zgłoszenie i zareaguje. Jeśli ktoś jest w bezpośrednim niebezpieczeństwie, zadzwoń pod numer alarmowy 112.',
  },
  {
    popular: true,
    question: 'Jak odwołać udział?',
    answer:
      'Wydarzenie: otwórz je na mapie, rozwiń kartę i kliknij „Wypisz się" — miejsce od razu się zwolni. Spotkanie „We dwoje": otwórz je i wybierz „Rezygnuję"; jeśli to Twoja propozycja, możesz ją usunąć przyciskiem „Usuń propozycję". Listę wszystkiego, na co jesteś zapisany(-a), znajdziesz w kalendarzu na stronie Konto.',
  },
  {
    question: 'Jak dodać własne wydarzenie?',
    answer:
      'Wybierz „Dodaj" w nawigacji. Podaj tytuł, kategorię, dla kogo jest wydarzenie, zaznacz miejsce na mapie i ustaw termin. Opcjonalnie dodaj limit miejsc i zdjęcie z urządzenia. Dokładny adres prywatny (np. numer mieszkania) zobaczą tylko osoby zapisane.',
  },
  {
    question: 'Czym są spotkania „We dwoje"?',
    answer:
      'To spotkania z jedną osobą w miejscu publicznym: spacer, kawa, sport, rozmowa albo pomoc z zakupami. Ktoś proponuje spotkanie, a pierwsza chętna osoba klika „Idę" — wtedy propozycja znika z listy dla pozostałych, a obie osoby dostają prywatny czat. Znajdziesz je na stronie głównej po przełączeniu na „We dwoje".',
  },
  {
    question: 'Dlaczego nie widzę „We dwoje" albo „Pokaż się"?',
    answer:
      'Te funkcje są dostępne tylko dla zalogowanych osób pełnoletnich. Zaloguj się, a potem uzupełnij datę urodzenia na stronie Konto. Datę urodzenia widzisz tylko Ty.',
  },
  {
    question: 'Jak działa „Pokaż się" na mapie?',
    answer:
      'Przycisk „Pokaż się" na mapie udostępnia Twoje dokładne położenie na żywo innym dorosłym, razem z krótką notką, np. „Biegam po Błoniach, dołącz!". Znikasz po 60 minutach albo po kliknięciu „Ukryj się". Ktoś może kliknąć „Dołączam" — wtedy zobaczysz jego imię i położenie. Położenie jest wysyłane tylko wtedy, gdy aplikacja jest otwarta.',
  },
  {
    question: 'Jak działają oceny organizatorów?',
    answer:
      'Po terminie wydarzenia każda zapisana osoba może ocenić organizatora od 0,5 do 5 gwiazdek — na stronie Konto, w sekcji „Do oceny". Po spotkaniu „We dwoje" obie osoby oceniają się nawzajem. Średnia jest widoczna przy wydarzeniach i spotkaniach danej osoby; kto komu wystawił jaką ocenę, pozostaje niewidoczne.',
  },
  {
    question: 'Jak się zalogować? Nie mam hasła.',
    answer:
      'Hasła nie ma. Na stronie Konto podaj imię i adres e-mail — wyślemy link, po którego kliknięciu jesteś zalogowany(-a). Jeśli wiadomość nie dochodzi, sprawdź folder ze spamem i odczekaj kilka minut przed kolejną próbą.',
  },
  {
    question: 'Skąd liczona jest odległość do wydarzenia?',
    answer:
      'Jeśli zgodzisz się na użycie lokalizacji (przycisk „Pokaż odległość ode mnie" na stronie głównej), odległość liczy się od Ciebie. W przeciwnym razie karty pokazują odległość od centrum miasta, z dopiskiem „od centrum".',
  },
  {
    question: 'Jak zainstalować aplikację na telefonie?',
    answer:
      'Otwórz stronę w przeglądarce telefonu. Na Androidzie wybierz w menu przeglądarki „Dodaj do ekranu głównego" albo „Zainstaluj aplikację". Na iPhonie otwórz stronę w Safari, kliknij przycisk udostępniania i wybierz „Do ekranu początkowego". Ikona Sąsiedzko pojawi się obok innych aplikacji.',
  },
]
