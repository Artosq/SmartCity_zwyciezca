// Treść Regulaminu i Polityki prywatności.
// Dokumenty opisują to, co aplikacja faktycznie robi — przy zmianie funkcji lub zakresu danych
// trzeba je poprawić razem z kodem i zmienić datę EFFECTIVE_DATE.

// DO UZUPEŁNIENIA PRZED PRAWDZIWYM URUCHOMIENIEM: dane podmiotu prowadzącego serwis.
// RODO (art. 13) i ustawa o świadczeniu usług drogą elektroniczną wymagają podania nazwy,
// adresu i kontaktu usługodawcy. Puste pole = dokument odsyła do formularza w Pomocy.
export const LEGAL = {
  serviceName: 'Sąsiedzko',
  operator: 'Zespół projektu Sąsiedzko (projekt zgłoszony na HackYeah 2026)',
  address: '', // np. 'ul. Przykładowa 1, 30-001 Kraków'
  email: '', // np. 'kontakt@sasiedzko.pl'
  effectiveDate: '4 października 2026 r.',
}

// akapit albo lista punktów
export type LegalBlock = string | string[]

export interface LegalSection {
  title: string
  blocks: LegalBlock[]
}

const contact = LEGAL.email
  ? `pod adresem e-mail ${LEGAL.email} albo przez formularz „Napisz do nas" na stronie Pomoc`
  : 'przez formularz „Napisz do nas" na stronie Pomoc'

const operatorLine = [LEGAL.operator, LEGAL.address].filter(Boolean).join(', ')

export const TERMS: LegalSection[] = [
  {
    title: '1. Postanowienia ogólne',
    blocks: [
      `Regulamin określa zasady korzystania z serwisu ${LEGAL.serviceName} (dalej: „Serwis"), dostępnego jako aplikacja internetowa, w tym rodzaje i zakres usług świadczonych drogą elektroniczną, warunki ich świadczenia, zasady zawierania i rozwiązywania umowy oraz tryb postępowania reklamacyjnego.`,
      `Usługodawcą jest: ${operatorLine} (dalej: „Usługodawca"). Kontakt z Usługodawcą jest możliwy ${contact}.`,
      'Serwis jest wersją demonstracyjną, rozwijaną w ramach projektu społecznego. Korzystanie z Serwisu jest bezpłatne.',
      'Każda osoba korzystająca z Serwisu (dalej: „Użytkownik") jest zobowiązana zapoznać się z Regulaminem i go przestrzegać. Rozpoczęcie korzystania z Serwisu oznacza akceptację Regulaminu.',
    ],
  },
  {
    title: '2. Definicje',
    blocks: [
      [
        'Konto - zbiór danych i ustawień Użytkownika w Serwisie, tworzony przy pierwszym logowaniu.',
        'Wydarzenie - spotkanie dla wielu osób opublikowane w Serwisie przez Użytkownika albo zaimportowane z publicznego źródła.',
        'Spotkanie „We dwoje" - propozycja spotkania z jedną osobą w miejscu publicznym.',
        '„Pokaż się" - funkcja udostępniania własnego położenia na żywo wraz z krótką notką.',
        'Organizator - Użytkownik, który opublikował Wydarzenie albo zaproponował Spotkanie „We dwoje".',
        'Treści - wszystko, co Użytkownik zamieszcza w Serwisie: opisy, zdjęcia, notki, wiadomości na czacie, oceny.',
      ],
    ],
  },
  {
    title: '3. Rodzaje i zakres usług',
    blocks: [
      'Usługodawca świadczy drogą elektroniczną następujące usługi:',
      [
        'przeglądanie Wydarzeń na stronie głównej i na mapie - dostępne bez Konta;',
        'prowadzenie Konta, w tym kalendarza aktywności i listy ocen;',
        'publikowanie Wydarzeń i zapisywanie się na nie;',
        'proponowanie Spotkań „We dwoje" i dołączanie do nich - wyłącznie dla zalogowanych osób pełnoletnich;',
        'funkcja „Pokaż się" - wyłącznie dla zalogowanych osób pełnoletnich;',
        'czat uczestników Wydarzeń i prywatny czat Spotkań „We dwoje";',
        'ocenianie Organizatorów;',
        'kontakt z Usługodawcą przez formularze na stronie Pomoc.',
      ],
      'Usługodawca nie jest organizatorem Wydarzeń ani Spotkań, nie jest stroną ustaleń między Użytkownikami i nie pobiera opłat za udział. Serwis jedynie udostępnia narzędzia do ogłaszania i wyszukiwania spotkań.',
      'Część Wydarzeń pochodzi z publicznie dostępnych kalendarzy wydarzeń i jest dodawana automatycznie. Takie Wydarzenia są oznaczone i zawierają odnośnik do źródła; o ich aktualności decyduje źródło.',
    ],
  },
  {
    title: '4. Wymagania techniczne',
    blocks: [
      'Do korzystania z Serwisu potrzebne są: urządzenie z dostępem do Internetu, aktualna przeglądarka internetowa z włączoną obsługą JavaScript i pamięci lokalnej przeglądarki oraz, do logowania, aktywny adres e-mail.',
      'Funkcje oparte na położeniu („Pokaż się", odległość liczona od Użytkownika) wymagają dodatkowo udzielenia w przeglądarce zgody na dostęp do lokalizacji. Zgodę można w każdej chwili cofnąć w ustawieniach przeglądarki.',
      'Usługodawca nie gwarantuje nieprzerwanej dostępności Serwisu. Serwis może być czasowo niedostępny z powodu prac technicznych, awarii lub przyczyn leżących po stronie dostawców infrastruktury.',
    ],
  },
  {
    title: '5. Konto i zawarcie umowy',
    blocks: [
      'Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą rozpoczęcia korzystania z Serwisu, a w zakresie usług wymagających Konta z chwilą pierwszego zalogowania. Umowa jest zawierana na czas nieokreślony.',
      'Logowanie odbywa się bez hasła: Użytkownik podaje imię i adres e-mail, a następnie potwierdza logowanie, klikając odnośnik wysłany na ten adres. Użytkownik odpowiada za zachowanie dostępu do swojej skrzynki e-mail.',
      'Konto może założyć osoba, która ukończyła 16 lat. Osoby młodsze mogą korzystać z Serwisu wyłącznie za zgodą i pod nadzorem rodzica lub opiekuna prawnego.',
      'Spotkania „We dwoje" oraz funkcja „Pokaż się" są dostępne wyłącznie dla osób, które ukończyły 18 lat. Dostęp do nich wymaga podania w Koncie daty urodzenia. Podanie nieprawdziwej daty urodzenia jest naruszeniem Regulaminu.',
      'W okresie demonstracyjnym Serwis może udostępniać tymczasowe konta demonstracyjne, tworzone bez podawania adresu e-mail. Służą one wyłącznie do zapoznania się z działaniem Serwisu i mogą zostać usunięte w dowolnym momencie.',
      'Użytkownik może w każdej chwili, bez podania przyczyny, rozwiązać umowę i zażądać usunięcia Konta, kontaktując się z Usługodawcą. Konto zostanie usunięte nie później niż w ciągu 30 dni.',
    ],
  },
  {
    title: '6. Zasady korzystania z Serwisu',
    blocks: [
      'Użytkownik zobowiązuje się korzystać z Serwisu zgodnie z prawem, Regulaminem i dobrymi obyczajami, z poszanowaniem innych osób.',
      'Zakazane jest zamieszczanie Treści o charakterze bezprawnym, w szczególności:',
      [
        'naruszających dobra osobiste, prywatność lub wizerunek innych osób;',
        'nawołujących do nienawiści, przemocy lub dyskryminacji;',
        'obscenicznych, pornograficznych lub wulgarnych;',
        'wprowadzających w błąd co do charakteru, miejsca lub terminu Wydarzenia;',
        'naruszających prawa autorskie lub inne prawa własności intelektualnej;',
        'stanowiących niezamówioną informację handlową lub reklamę działalności niezwiązanej z Wydarzeniem;',
        'zawierających dane osobowe osób trzecich bez podstawy prawnej.',
      ],
      'Zakazane jest ponadto: podszywanie się pod inne osoby, zakładanie wielu Kont w celu obejścia ograniczeń lub manipulowania ocenami, wykorzystywanie Serwisu do nękania innych osób, automatyczne pobieranie danych z Serwisu oraz działania zakłócające jego funkcjonowanie.',
      'Użytkownik zamieszcza Treści dobrowolnie i ponosi za nie pełną odpowiedzialność.',
    ],
  },
  {
    title: '7. Wydarzenia i odpowiedzialność Organizatora',
    blocks: [
      'Wszystkie Wydarzenia opublikowane w Serwisie są publiczne: widzi je każda osoba odwiedzająca Serwis, a zalogowany Użytkownik może się na nie zapisać w ramach limitu miejsc.',
      'Organizator odpowiada za prawdziwość i aktualność informacji o Wydarzeniu, za jego przebieg, bezpieczeństwo uczestników oraz za spełnienie wymagań prawnych, w tym uzyskanie potrzebnych zgód na korzystanie z miejsca.',
      'Dokładny adres prywatny podany przez Organizatora jest udostępniany wyłącznie osobom zapisanym na Wydarzenie. Organizator decyduje, czy go podaje.',
      'Zapis na Wydarzenie nie jest umową z Usługodawcą. Uczestnik bierze udział w Wydarzeniu na własną odpowiedzialność; za dzieci odpowiadają ich rodzice lub opiekunowie.',
      'Użytkownik, który nie może wziąć udziału w Wydarzeniu, powinien się z niego wypisać, aby zwolnić miejsce.',
    ],
  },
  {
    title: '8. Spotkania „We dwoje" i funkcja „Pokaż się"',
    blocks: [
      'Spotkania „We dwoje" odbywają się wyłącznie w miejscach publicznych. Proponując Spotkanie, Użytkownik wskazuje takie miejsce.',
      'Usługodawca nie weryfikuje tożsamości ani wieku Użytkowników poza złożoną przez nich deklaracją daty urodzenia. Użytkownik powinien zachować ostrożność: spotykać się w miejscach publicznych, poinformować bliską osobę o planowanym spotkaniu i nie przekazywać nieznajomym pieniędzy ani danych wrażliwych.',
      'Funkcja „Pokaż się" udostępnia dokładne położenie Użytkownika na żywo wszystkim zalogowanym pełnoletnim Użytkownikom, przez czas do 60 minut albo do wyłączenia funkcji przyciskiem „Ukryj się". Użytkownik włącza ją świadomie i dobrowolnie i może ją wyłączyć w każdej chwili.',
      'Użytkownik, który wybiera „Dołączam" przy osobie widocznej na mapie, udostępnia tej osobie swoje imię i położenie do czasu rezygnacji albo ukrycia się tej osoby.',
      'W razie zagrożenia życia lub zdrowia należy niezwłocznie zadzwonić pod numer alarmowy 112.',
    ],
  },
  {
    title: '9. Czat',
    blocks: [
      'Czat Wydarzenia służy uczestnikom do ustaleń związanych z Wydarzeniem. Czat Spotkania „We dwoje" jest dostępny wyłącznie dla dwóch osób biorących w nim udział.',
      'Czat Wydarzenia nie jest kanałem poufnym. Użytkownik nie powinien zamieszczać w nim danych wrażliwych, haseł, numerów dokumentów ani danych płatniczych.',
    ],
  },
  {
    title: '10. Oceny',
    blocks: [
      'Po terminie Wydarzenia zapisany na nie Użytkownik może ocenić Organizatora w skali od 0,5 do 5 gwiazdek. Po Spotkaniu „We dwoje" obie osoby mogą ocenić się nawzajem. Jedną aktywność można ocenić jeden raz.',
      'Średnia ocen i ich liczba są widoczne publicznie przy Wydarzeniach i Spotkaniach danej osoby. Informacja o tym, kto wystawił daną ocenę, nie jest ujawniana innym Użytkownikom.',
      'Ocena powinna odzwierciedlać rzeczywiste doświadczenie. Zakazane jest wystawianie ocen w celu zaszkodzenia innej osobie lub sztucznego zawyżenia własnej oceny.',
    ],
  },
  {
    title: '11. Prawa do Treści',
    blocks: [
      'Użytkownik oświadcza, że ma prawo do zamieszczanych Treści, w tym zdjęć, oraz że ich publikacja nie narusza praw osób trzecich, w szczególności prawa do wizerunku.',
      'Zamieszczając Treści, Użytkownik udziela Usługodawcy nieodpłatnej, niewyłącznej licencji na ich przechowywanie i wyświetlanie w Serwisie w zakresie niezbędnym do świadczenia usług, na czas ich pozostawania w Serwisie.',
      'Nazwa, oznaczenia graficzne i układ Serwisu podlegają ochronie prawnej. Dane mapowe pochodzą z projektu OpenStreetMap i są udostępniane na jego licencji.',
    ],
  },
  {
    title: '12. Zgłaszanie naruszeń i moderacja',
    blocks: [
      `Każdy może zgłosić Treść, którą uważa za niezgodną z prawem lub Regulaminem, a także niewłaściwe zachowanie innego Użytkownika. Można to zrobić ${contact}. Zgłoszenie powinno wskazywać, czego dotyczy (np. nazwę Wydarzenia, imię osoby) oraz powód.`,
      'Usługodawca rozpatruje zgłoszenia bez zbędnej zwłoki. W razie stwierdzenia naruszenia może: usunąć lub ukryć Treść, odwołać Wydarzenie lub Spotkanie, ograniczyć dostęp do wybranych funkcji, a przy poważnych lub powtarzających się naruszeniach zawiesić lub usunąć Konto.',
      'O podjętej decyzji i jej powodach Usługodawca informuje Użytkownika, którego decyzja dotyczy, o ile dysponuje jego danymi kontaktowymi. Użytkownik może się od decyzji odwołać, kontaktując się z Usługodawcą w terminie 14 dni; odwołanie zostanie rozpatrzone w ciągu 14 dni.',
      'Usługodawca nie ma obowiązku uprzedniego sprawdzania Treści zamieszczanych przez Użytkowników.',
    ],
  },
  {
    title: '13. Odpowiedzialność',
    blocks: [
      'Usługodawca nie odpowiada za przebieg Wydarzeń i Spotkań, za zachowanie Użytkowników ani za prawdziwość zamieszczanych przez nich Treści, w tym deklarowanego wieku.',
      'Usługodawca nie odpowiada za szkody wynikłe z korzystania z Serwisu w sposób sprzeczny z prawem lub Regulaminem ani za przerwy w działaniu Serwisu wynikające z przyczyn od niego niezależnych.',
      'Postanowienia Regulaminu nie wyłączają ani nie ograniczają odpowiedzialności Usługodawcy w zakresie, w jakim jest to niedopuszczalne na podstawie bezwzględnie obowiązujących przepisów prawa, w szczególności nie ograniczają praw konsumentów.',
    ],
  },
  {
    title: '14. Reklamacje',
    blocks: [
      `Reklamacje dotyczące działania Serwisu można składać ${contact}. Reklamacja powinna zawierać opis problemu oraz dane kontaktowe pozwalające na udzielenie odpowiedzi.`,
      'Usługodawca rozpatruje reklamację w terminie 14 dni od jej otrzymania i informuje o sposobie jej załatwienia.',
      'Użytkownik będący konsumentem może skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w szczególności zwrócić się o pomoc do miejskiego lub powiatowego rzecznika konsumentów albo do wojewódzkiego inspektoratu Inspekcji Handlowej.',
    ],
  },
  {
    title: '15. Dane osobowe',
    blocks: [
      'Zasady przetwarzania danych osobowych, w tym danych o położeniu, opisuje Polityka prywatności dostępna w Serwisie.',
    ],
  },
  {
    title: '16. Zmiana Regulaminu',
    blocks: [
      'Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności w razie zmiany przepisów prawa, wprowadzenia nowych funkcji albo zmiany sposobu świadczenia usług.',
      'O zmianie Usługodawca informuje w Serwisie z co najmniej 7-dniowym wyprzedzeniem, chyba że zmiana wynika z przepisów prawa lub wyłącznie dodaje nowe funkcje. Użytkownik, który nie akceptuje zmian, może rozwiązać umowę przez usunięcie Konta.',
    ],
  },
  {
    title: '17. Postanowienia końcowe',
    blocks: [
      'W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego, ustawy o świadczeniu usług drogą elektroniczną oraz ustawy o prawach konsumenta.',
      'Wybór prawa polskiego nie pozbawia konsumenta ochrony przyznanej mu przez bezwzględnie obowiązujące przepisy państwa jego zwykłego pobytu.',
      'Jeżeli którekolwiek postanowienie Regulaminu okaże się nieważne lub nieskuteczne, pozostałe postanowienia pozostają w mocy.',
      `Regulamin obowiązuje od ${LEGAL.effectiveDate}`,
    ],
  },
]

export const PRIVACY: LegalSection[] = [
  {
    title: '1. Kto odpowiada za Twoje dane',
    blocks: [
      `Administratorem danych osobowych przetwarzanych w serwisie ${LEGAL.serviceName} jest: ${operatorLine} (dalej: „Administrator").`,
      `W sprawach dotyczących danych osobowych, w tym w celu skorzystania ze swoich praw, skontaktuj się z Administratorem ${contact}.`,
      'Dane przetwarzamy zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) oraz polskimi przepisami o ochronie danych osobowych.',
    ],
  },
  {
    title: '2. Jakie dane przetwarzamy',
    blocks: [
      'Przetwarzamy wyłącznie dane potrzebne do działania Serwisu:',
      [
        'dane Konta: imię podane przy logowaniu, adres e-mail oraz techniczny identyfikator Konta;',
        'data urodzenia - tylko jeśli podasz ją w Koncie, aby korzystać z funkcji dostępnych od 18 lat;',
        'Wydarzenia, które publikujesz: tytuł, opis, kategoria, grupy docelowe, miejsce i jego współrzędne, termin, limit miejsc, zdjęcie oraz, opcjonalnie, dokładny adres prywatny;',
        'Spotkania „We dwoje", które proponujesz lub do których dołączasz: rodzaj, tytuł, opis, miejsce, termin, tagi;',
        'zapisy na Wydarzenia i udział w Spotkaniach;',
        'wiadomości na czacie;',
        'oceny, które wystawiasz i otrzymujesz;',
        'położenie na żywo oraz notka - wyłącznie wtedy, gdy włączysz funkcję „Pokaż się" albo wybierzesz „Dołączam";',
        'położenie urządzenia do liczenia odległości - wyłącznie w Twojej przeglądarce, po udzieleniu przez Ciebie zgody; tego położenia nie zapisujemy na serwerze;',
        'wiadomości wysłane przez formularze „Napisz do nas" i „Zgłoś błąd", wraz z podanym opcjonalnie adresem e-mail;',
        'dane techniczne: adres IP, rodzaj przeglądarki i urządzenia, daty i godziny żądań - rejestrowane automatycznie przez dostawców infrastruktury.',
      ],
      'Nie zbieramy danych o Twojej aktywności poza Serwisem, nie tworzymy profili reklamowych i nie przetwarzamy szczególnych kategorii danych (np. o zdrowiu). Prosimy, aby nie zamieszczać takich danych w opisach ani na czacie.',
    ],
  },
  {
    title: '3. W jakim celu i na jakiej podstawie',
    blocks: [
      [
        'świadczenie usług Serwisu: prowadzenie Konta, publikowanie Wydarzeń i Spotkań, zapisy, czat, oceny - na podstawie umowy, której jesteś stroną (art. 6 ust. 1 lit. b RODO);',
        'funkcja „Pokaż się", „Dołączam" oraz liczenie odległości od Twojego położenia - na podstawie Twojej zgody, wyrażonej przez włączenie funkcji i udzielenie zgody w przeglądarce (art. 6 ust. 1 lit. a RODO); zgodę możesz cofnąć w każdej chwili;',
        'sprawdzenie pełnoletności przy funkcjach dostępnych od 18 lat - na podstawie umowy oraz naszego prawnie uzasadnionego interesu, jakim jest ochrona osób niepełnoletnich (art. 6 ust. 1 lit. b i f RODO);',
        'obsługa zgłoszeń, reklamacji i wiadomości - nasz prawnie uzasadniony interes polegający na udzieleniu odpowiedzi i poprawie Serwisu (art. 6 ust. 1 lit. f RODO);',
        'bezpieczeństwo Serwisu, zapobieganie nadużyciom i moderacja Treści - nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO);',
        'ustalenie, dochodzenie lub obrona roszczeń - nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO);',
        'wykonanie obowiązków wynikających z przepisów prawa, np. odpowiedź na żądanie uprawnionego organu (art. 6 ust. 1 lit. c RODO).',
      ],
      'Podanie danych jest dobrowolne, ale imię i adres e-mail są niezbędne do założenia Konta, a data urodzenia do korzystania z funkcji dostępnych od 18 lat.',
    ],
  },
  {
    title: '4. Co widzą inni',
    blocks: [
      'Serwis służy do spotykania się z sąsiadami, dlatego część danych jest z założenia widoczna dla innych:',
      [
        'publicznie, także dla osób niezalogowanych: Twoje imię jako Organizatora, średnia Twoich ocen i ich liczba, opublikowane przez Ciebie Wydarzenia wraz ze zdjęciem i miejscem, liczba osób zapisanych na Wydarzenie oraz sam fakt Twojego zapisu (bez adresu e-mail);',
        'dla zalogowanych osób pełnoletnich: Twoje Spotkania „We dwoje" oraz, gdy włączysz „Pokaż się", Twoje imię, notka i dokładne położenie na żywo;',
        'dla osób zapisanych na Twoje Wydarzenie: dokładny adres prywatny, jeśli go podałeś(-aś);',
        'dla uczestników czatu Wydarzenia: Twoje imię i wiadomości; czat Wydarzenia nie jest kanałem poufnym, więc nie zamieszczaj w nim danych wrażliwych;',
        'dla drugiej osoby ze Spotkania „We dwoje": Twoje imię i wiadomości w prywatnym czacie tego Spotkania;',
        'dla osoby, przy której wybierzesz „Dołączam": Twoje imię i położenie, do czasu rezygnacji.',
      ],
      'Nigdy nie pokazujemy innym Użytkownikom Twojego adresu e-mail ani daty urodzenia. Inni nie widzą też, jaką ocenę komu wystawiłeś(-aś).',
    ],
  },
  {
    title: '5. Komu przekazujemy dane',
    blocks: [
      'Nie sprzedajemy danych i nie udostępniamy ich w celach reklamowych. Korzystamy z dostawców, bez których Serwis nie mógłby działać:',
      [
        'Supabase - baza danych, logowanie, przechowywanie zdjęć i wysyłka wiadomości z odnośnikiem do logowania;',
        'Render - serwer, z którego pobierana jest aplikacja;',
        'OpenStreetMap - obrazy mapy; przy ich pobieraniu Twoja przeglądarka łączy się z serwerami OpenStreetMap i przekazuje im swój adres IP.',
      ],
      'Dostawcy przetwarzają dane wyłącznie w zakresie niezbędnym do świadczenia swoich usług. Część z nich ma siedzibę lub serwery poza Europejskim Obszarem Gospodarczym; w takim wypadku przekazanie danych odbywa się na podstawie mechanizmów przewidzianych w RODO, w szczególności standardowych klauzul umownych zatwierdzonych przez Komisję Europejską lub decyzji stwierdzającej odpowiedni stopień ochrony.',
      'Dane możemy udostępnić uprawnionym organom publicznym, jeżeli wymagają tego przepisy prawa.',
    ],
  },
  {
    title: '6. Jak długo przechowujemy dane',
    blocks: [
      [
        'dane Konta, Wydarzenia, Spotkania, zapisy, wiadomości i oceny - do czasu usunięcia Konta albo usunięcia danej Treści;',
        'położenie na żywo („Pokaż się") - przestaje być udostępniane po wyłączeniu funkcji albo po 60 minutach; zapis jest usuwany przy wyłączeniu funkcji lub zastępowany przy jej kolejnym użyciu;',
        'położenie przekazywane przy „Dołączam" - do rezygnacji albo do ukrycia się osoby, do której dołączasz;',
        'wiadomości z formularzy na stronie Pomoc - do 12 miesięcy od załatwienia sprawy;',
        'dane techniczne u dostawców infrastruktury - przez okres wynikający z ich zasad, zwykle do kilkudziesięciu dni.',
      ],
      'Po usunięciu Konta dane możemy przechowywać dłużej wyłącznie w zakresie niezbędnym do obrony przed roszczeniami lub wykonania obowiązku prawnego, nie dłużej niż przez okres przedawnienia roszczeń.',
      'Tymczasowe konta demonstracyjne i dane przykładowe mogą zostać usunięte w dowolnym momencie.',
    ],
  },
  {
    title: '7. Twoje prawa',
    blocks: [
      'W związku z przetwarzaniem danych przysługuje Ci prawo do:',
      [
        'dostępu do swoich danych i otrzymania ich kopii;',
        'sprostowania danych nieprawidłowych lub niekompletnych;',
        'usunięcia danych („prawo do bycia zapomnianym");',
        'ograniczenia przetwarzania;',
        'przenoszenia danych przetwarzanych na podstawie umowy lub zgody;',
        'sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie;',
        'cofnięcia zgody w dowolnym momencie - bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem.',
      ],
      `Aby skorzystać z tych praw, skontaktuj się z nami ${contact}. Odpowiemy bez zbędnej zwłoki, nie później niż w ciągu miesiąca.`,
      'Część danych możesz zmienić lub usunąć samodzielnie: wypisać się z Wydarzenia, usunąć swoją propozycję Spotkania, zmienić datę urodzenia w Koncie, wyłączyć „Pokaż się", cofnąć zgodę na lokalizację w ustawieniach przeglądarki.',
      'Masz również prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa), jeżeli uznasz, że przetwarzamy Twoje dane niezgodnie z prawem.',
    ],
  },
  {
    title: '8. Położenie',
    blocks: [
      'Dane o położeniu traktujemy ze szczególną ostrożnością. O dostęp do lokalizacji prosimy wyłącznie po Twoim działaniu, czyli po kliknięciu „Pokaż odległość ode mnie", „Pokaż się" albo „Dołączam".',
      'Położenie używane do liczenia odległości na kartach pozostaje w Twojej przeglądarce i nie jest wysyłane na serwer.',
      'Położenie udostępniane w funkcji „Pokaż się" jest dokładne i widoczne dla wszystkich zalogowanych pełnoletnich Użytkowników. Jest wysyłane tylko wtedy, gdy Serwis jest otwarty na Twoim urządzeniu. Pasek „Jesteś live" przypomina o włączonej funkcji na każdym ekranie i pozwala ją wyłączyć jednym kliknięciem.',
    ],
  },
  {
    title: '9. Osoby niepełnoletnie',
    blocks: [
      'Konto może założyć osoba, która ukończyła 16 lat. Młodsze osoby mogą korzystać z Serwisu wyłącznie za zgodą i pod nadzorem rodzica lub opiekuna prawnego.',
      'Spotkania „We dwoje" i funkcja „Pokaż się" są niedostępne dla osób, które nie ukończyły 18 lat: Serwis nie pokazuje im tych treści i nie przyjmuje od nich takich danych. Wiek ustalamy na podstawie zadeklarowanej daty urodzenia.',
      'Jeżeli dowiemy się, że przetwarzamy dane dziecka bez wymaganej zgody opiekuna, usuniemy je. Rodzic lub opiekun może zgłosić taką sytuację przez formularz na stronie Pomoc.',
    ],
  },
  {
    title: '10. Pamięć przeglądarki i pliki cookies',
    blocks: [
      'Serwis nie używa plików cookies do celów reklamowych ani analitycznych i nie korzysta z zewnętrznych narzędzi śledzących.',
      'W pamięci lokalnej Twojej przeglądarki zapisujemy wyłącznie dane niezbędne do działania Serwisu: informację o zalogowaniu, wybrane miasto, język oraz Twoje preferencje dotyczące grup docelowych. Dane te pozostają na Twoim urządzeniu; możesz je usunąć, czyszcząc dane witryny w ustawieniach przeglądarki. Spowoduje to wylogowanie.',
    ],
  },
  {
    title: '11. Bezpieczeństwo',
    blocks: [
      'Połączenie z Serwisem jest szyfrowane. Dostęp do danych w bazie ograniczają reguły bezpieczeństwa na poziomie pojedynczych rekordów: każdy Użytkownik może zmieniać wyłącznie własne dane, a dane niepubliczne (takie jak data urodzenia, adres prywatny Wydarzenia czy prywatny czat) są dostępne tylko dla uprawnionych osób.',
      'Logowanie odbywa się bez hasła, przez jednorazowy odnośnik wysyłany na adres e-mail, dzięki czemu nie przechowujemy haseł.',
      'Żaden system nie daje pełnej gwarancji bezpieczeństwa. Jeśli zauważysz coś niepokojącego, zgłoś to przez formularz „Zgłoś błąd" na stronie Pomoc.',
    ],
  },
  {
    title: '12. Zautomatyzowane decyzje',
    blocks: [
      'Nie podejmujemy wobec Użytkowników decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, które wywoływałyby skutki prawne lub w podobny sposób istotnie na nich wpływały. Kolejność Wydarzeń wynika z prostych, jawnych reguł: terminu, liczby zapisanych osób, odległości i wybranych przez Ciebie preferencji.',
    ],
  },
  {
    title: '13. Wydarzenia z zewnętrznych źródeł',
    blocks: [
      'Część Wydarzeń pobieramy automatycznie z publicznie dostępnych kalendarzy wydarzeń. Dotyczy to wyłącznie informacji o samych wydarzeniach (nazwa, termin, miejsce, opis, zdjęcie) i nie obejmuje danych osób prywatnych. Każde takie Wydarzenie zawiera odnośnik do źródła.',
    ],
  },
  {
    title: '14. Zmiany Polityki prywatności',
    blocks: [
      'Politykę możemy aktualizować, gdy zmieniają się funkcje Serwisu, dostawcy lub przepisy. O istotnych zmianach poinformujemy w Serwisie przed ich wejściem w życie.',
      `Polityka obowiązuje od ${LEGAL.effectiveDate}`,
    ],
  },
]
