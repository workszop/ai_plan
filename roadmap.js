// Praktyczny plan AI dla jednego zadania. Edytuj ten plik; index.html renderuje go bez kroku budowania.
// Teksty działań zaczynają się od rzeczowników odczasownikowych. Bez HTML i bez em-dash.
window.ROADMAP = {
  meta: {
    updated: "2026-10-22",
    version: "4.0-sme",
    source: "https://github.com/workszop/ai_plan"
  },

  phases: [
    {
      id: "choice",
      num: 1,
      title: "Wybór zadania",
      duration: "pierwsze ustalenia",
      icon: "target",
      goal: "Zawężenie pracy do jednego powtarzalnego zadania, osoby odpowiedzialnej i warunków bezpiecznego sprawdzenia.",
      outcomes: [
        "Opis jednego zadania i obecnego przebiegu",
        "Wyznaczenie osoby wykonującej zadanie oraz osoby podejmującej decyzję; jedna osoba może pełnić obie role",
        "Stan wyjściowy, oczekiwana poprawa i kryterium sukcesu",
        "Ustalony czas, budżet i zakres pierwszego testu",
        "Podstawowe granice danych, dostępu i przeglądu człowieka"
      ],
      stages: [
        {
          title: "Opis zadania i celu",
          items: [
            {
              title: "Zadanie i odpowiedzialność",
              actions: [
                { id: "sme.choice.action.001", text: "Wybór jednego powtarzalnego zadania oraz opisanie obecnego przebiegu i używanych narzędzi.", hint: "Karta jednego zadania z krótkim opisem przebiegu i obecnych narzędzi." },
                { id: "sme.choice.action.002", text: "Wyznaczenie osoby wykonującej zadanie i osoby podejmującej decyzję; jedna osoba może pełnić obie role.", hint: "Imiona lub role obu osób oraz zakres ich odpowiedzialności." },
                { id: "sme.choice.action.003", text: "Ustalenie stanu wyjściowego, oczekiwanej poprawy i kryterium jakości.", hint: "Stan wyjściowy, pożądana zmiana i jedno zdanie opisujące akceptowalny wynik." }
              ]
            }
          ]
        },
        {
          title: "Granice pierwszego testu",
          items: [
            {
              title: "Czas, budżet i bezpieczeństwo",
              actions: [
                { id: "sme.choice.action.004", text: "Określenie dostępnego czasu, budżetu oraz zakresu pierwszego testu.", hint: "Krótki limit czasu i kosztu oraz jasne wskazanie, czego test nie obejmuje." },
                { id: "sme.choice.action.005", text: "Ustalenie granic bezpieczeństwa danych, dostępu i przeglądu człowieka.", hint: "Lista danych dozwolonych i niedozwolonych, sposób dostępu oraz moment kontroli przez człowieka." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.choice.gate.001", text: "Opis zadania, stan wyjściowy i kryterium sukcesu są zapisane.", hint: "Wynik lub przykład: karta zadania ze stanem wyjściowym i kryterium." },
          { id: "sme.choice.gate.002", text: "Wyznaczenie osoby wykonującej i osoby podejmującej decyzję jest potwierdzone.", hint: "Wynik lub przykład: dwie role z zakresem odpowiedzialności." },
          { id: "sme.choice.gate.003", text: "Ustalenie granic danych, czasu i budżetu jest realne.", hint: "Wynik lub przykład: krótki zakres testu z limitem i zabezpieczeniem." }
        ]
      }
    },
    {
      id: "test",
      num: 2,
      title: "Test w praktyce",
      duration: "krótka próba na przykładach",
      icon: "flask-conical",
      goal: "Sprawdzenie jednego narzędzia na reprezentatywnych przykładach i porównanie wyniku z dotychczasowym sposobem pracy.",
      outcomes: [
        "Jedno narzędzie z opisanymi ustawieniami",
        "Dozwolone dane i dostęp do testu",
        "Reprezentatywne przykłady oraz sposób oceny",
        "Porównanie czasu, poprawek, jakości i kosztu",
        "Zapisany wynik: kontynuacja, korekta albo zatrzymanie"
      ],
      stages: [
        {
          title: "Narzędzie i dane",
          items: [
            {
              title: "Konfiguracja próby",
              actions: [
                { id: "sme.test.action.001", text: "Wybór jednego narzędzia dopasowanego do zadania i potwierdzenie jego ustawień.", hint: "Nazwa narzędzia, wersja lub plan, właściciel ustawień i ograniczenia użycia." },
                { id: "sme.test.action.002", text: "Określenie dozwolonych danych, dostępu i ustawień testu.", hint: "Zakres danych, role z dostępem i ustawienia prywatności lub retencji." }
              ]
            }
          ]
        },
        {
          title: "Próba i porównanie",
          items: [
            {
              title: "Wyniki testu",
              actions: [
                { id: "sme.test.action.003", text: "Przygotowanie reprezentatywnych przykładów oraz sposobu oceny wyniku.", hint: "Zestaw przykładów z kryterium oceny i miejscem na uwagi osoby sprawdzającej." },
                { id: "sme.test.action.004", text: "Porównanie czasu wykonania, liczby poprawek, jakości i kosztu ze stanem wyjściowym.", hint: "Tabela przed i po, z czasem sprawdzania i poprawiania wyniku." },
                { id: "sme.test.action.005", text: "Ustalenie decyzji: kontynuacja, korekta i ponowny test albo zatrzymanie.", hint: "Krótka decyzja oparta na kryterium sukcesu i odnotowanym wyniku." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.test.gate.001", text: "Potwierdzenie jednego narzędzia, dozwolonych danych i ustawień jest zapisane.", hint: "Wynik lub przykład: karta konfiguracji próby." },
          { id: "sme.test.gate.002", text: "Porównanie jakości, czasu, poprawek i kosztu ze stanem wyjściowym jest wykonane.", hint: "Wynik lub przykład: tabela wyników wraz z czasem sprawdzania." },
          { id: "sme.test.gate.003", text: "Zapis wyniku testu i rekomendacji jest gotowy.", hint: "Wynik lub przykład: rekomendacja osoby odpowiedzialnej z podstawą." }
        ]
      }
    },
    {
      id: "work",
      num: 3,
      title: "Wprowadzenie do pracy",
      duration: "rutyna jednego zespołu",
      icon: "users-round",
      goal: "Przekształcenie udanej próby w krótką, zrozumiałą rutynę z osobą przeglądającą i ręcznym sposobem awaryjnym.",
      outcomes: [
        "Krótka instrukcja z jednym przykładem",
        "Osoby wykonujące zadanie znają przebieg",
        "Wyznaczona osoba przeglądająca wynik",
        "Ustalone dostępy, wydatki i odpowiedzialność",
        "Ręczny sposób wykonania zadania na wypadek problemu"
      ],
      stages: [
        {
          title: "Instrukcja i ludzie",
          items: [
            {
              title: "Rutyna pracy",
              actions: [
                { id: "sme.work.action.001", text: "Opracowanie krótkiej instrukcji z jednym przykładem poprawnego użycia.", hint: "Jedna strona lub ekran z kolejnością czynności, przykładem i ostrzeżeniem o kontroli." },
                { id: "sme.work.action.002", text: "Przedstawienie przebiegu osobom wykonującym zadanie i zebranie pytań.", hint: "Lista osób, data prezentacji i zapis pytań lub niejasności." },
                { id: "sme.work.action.003", text: "Wyznaczenie osoby przeglądającej wynik oraz sposobu akceptacji.", hint: "Rola osoby sprawdzającej i jednoznaczne kryterium akceptacji." }
              ]
            }
          ]
        },
        {
          title: "Dostęp i ciągłość",
          items: [
            {
              title: "Warunki wykonywania",
              actions: [
                { id: "sme.work.action.004", text: "Ustalenie zasad dostępu, wydatków i odpowiedzialności za konto.", hint: "Właściciel konta, poziom dostępu, limit wydatków i sposób zgłoszenia problemu." },
                { id: "sme.work.action.005", text: "Przygotowanie ręcznego sposobu wykonania zadania na wypadek problemu.", hint: "Krótki ręczny sposób awaryjny: procedura, miejsce danych i osoba, która podejmuje decyzję." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.work.gate.001", text: "Przygotowanie krótkiej instrukcji, przykładu i kryterium akceptacji jest zakończone.", hint: "Wynik lub przykład: instrukcja i przykładowy wynik." },
          { id: "sme.work.gate.002", text: "Przedstawienie rutyny osobom wykonującym zadanie oraz wyznaczenie osoby przeglądającej jest potwierdzone.", hint: "Wynik lub przykład: lista osób, osoba przeglądająca i data." },
          { id: "sme.work.gate.003", text: "Ustalenie dostępu, wydatków i ręcznego sposobu wykonania jest zapisane.", hint: "Wynik lub przykład: karta dostępu i instrukcja awaryjna." }
        ]
      }
    },
    {
      id: "keep",
      num: 4,
      title: "Utrzymanie i rozwój",
      duration: "rytm przeglądu",
      icon: "refresh-cw",
      goal: "Sprawdzenie, czy rutyna nadal pomaga, oraz uporządkowanie jej bez obowiązku tworzenia większej struktury.",
      outcomes: [
        "Przegląd użyteczności, kosztu, błędów i czasu",
        "Zaktualizowana instrukcja i kryterium jakości",
        "Uporządkowane dostępy, dane i ustawienia",
        "Ustalony właściciel rutyny i rytm przeglądu",
        "Decyzja o utrzymaniu, zmianie albo zatrzymaniu rutyny"
      ],
      stages: [
        {
          title: "Przegląd i aktualizacja",
          items: [
            {
              title: "Użyteczność rutyny",
              actions: [
                { id: "sme.keep.action.001", text: "Przegląd użyteczności, kosztu, błędów i czasu po uruchomieniu rutyny.", hint: "Krótka karta przeglądu z danymi z ustalonego okresu i odnotowanymi problemami." },
                { id: "sme.keep.action.002", text: "Aktualizacja instrukcji, przykładu i kryterium jakości na podstawie wyników.", hint: "Wersja instrukcji, opis zmiany i wynik ponownego sprawdzenia." },
                { id: "sme.keep.action.003", text: "Uporządkowanie dostępów, danych i ustawień po zakończeniu testu.", hint: "Lista odebranych dostępów, zamkniętych danych testowych i aktualnych ustawień." }
              ]
            }
          ]
        },
        {
          title: "Odpowiedzialność i decyzja",
          items: [
            {
              title: "Rytm utrzymania",
              actions: [
                { id: "sme.keep.action.004", text: "Ustalenie właściciela rutyny, rytmu przeglądu i odpowiedzialności za zmianę.", hint: "Imię lub rola właściciela, termin przeglądu i sposób zgłoszenia zmiany." },
                { id: "sme.keep.action.005", text: "Podjęcie decyzji o utrzymaniu, zmianie albo zatrzymaniu rutyny na podstawie przeglądu.", hint: "Zapis decyzji, podstawa z przeglądu i następny krok." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.keep.gate.001", text: "Przegląd użyteczności, kosztu, błędów i czasu jest wykonany.", hint: "Wynik lub przykład: karta okresowego przeglądu." },
          { id: "sme.keep.gate.002", text: "Aktualizacja instrukcji oraz uporządkowanie dostępów i danych są zapisane.", hint: "Wynik lub przykład: nowa instrukcja i lista zamkniętych dostępów." },
          { id: "sme.keep.gate.003", text: "Decyzja o utrzymaniu, zmianie albo zatrzymaniu rutyny wynika z danych.", hint: "Wynik lub przykład: decyzja z uzasadnieniem i następnym krokiem." }
        ]
      }
    }
  ],

  ongoing: {
    title: "Utrzymanie rutyny",
    lead: "Po użytecznym wdrożeniu wystarczy proporcjonalny rytm z decyzją o utrzymaniu, zmianie albo zatrzymaniu.",
    cadences: [
      { period: "Po wykonaniu", icon: "check-circle-2", actions: ["Przegląd wyniku przed przekazaniem", "Odnotowanie poprawy lub błędu"] },
      { period: "Co miesiąc", icon: "calendar", actions: ["Przegląd czasu, kosztu i jakości", "Aktualizacja instrukcji, gdy zmieniły się warunki"] },
      { period: "Przy zmianie", icon: "refresh-cw", actions: ["Ponowne sprawdzenie przykładów", "Potwierdzenie dostępu i ręcznego sposobu awaryjnego"] },
      { period: "Gdy potrzebne", icon: "arrow-up-right", actions: ["Przegląd potrzeby zmiany zakresu rutyny", "Potwierdzenie warunków bezpieczeństwa przed zmianą"] }
    ]
  },

  safety: {
    lead: "Wybór kontekstu kieruje uwagę do dodatkowych pytań. To pomoc nawigacyjna, nie automatyczna klasyfikacja prawna ani zwolnienie zależne od wielkości firmy.",
    layers: [
      {
        id: "basics",
        title: "Podstawy",
        items: [
          "Minimalny zakres danych i dostępów",
          "Przegląd człowieka przed przekazaniem wyniku",
          "Ręczny sposób wykonania zadania na wypadek problemu"
        ]
      },
      {
        id: "conditional",
        title: "Gdy dotyczy",
        items: [
          { context: "personalData", text: "Dane osobowe lub poufne: zakres, retencja, anonimizacja i podstawa przekazania." },
          { context: "externalOutput", text: "Wynik dla klienta lub na zewnątrz: przegląd treści, rola dostawcy i ewentualne poinformowanie odbiorcy." },
          { context: "multipleTeams", text: "Rozszerzenie na kolejny zespół: właściciel rutyny, dostęp według ról i wspólne kryterium jakości." },
          { context: "integration", text: "Połączenie z innym systemem: zakres danych, właściciel integracji, test odtworzenia i ręczny sposób awaryjny." },
          { context: "sensitiveDecision", text: "Wpływ na ludzi, pieniądze lub dostęp do usług: zatrzymanie automatycznej decyzji i konsultacja specjalisty przed użyciem." }
        ]
      },
      {
        id: "specialist",
        title: "Potrzebna konsultacja specjalisty",
        items: [
          "Zastosowanie dotyczące rekrutacji, oceny pracowników, kredytu, edukacji lub dostępu do usług",
          "Wysokie ryzyko dla praw i wolności albo potrzeba oceny skutków dla ochrony danych",
          "Niejasna rola dostawcy, przekazanie danych poza EOG albo obowiązek przejrzystości"
        ]
      }
    ]
  },

  regulation: {
    title: "Kalendarz regulacyjny",
    lead: "Zakres zadania, rola i aktualny status obowiązku są punktem wyjścia. Oś czasu jest pomocniczą historią; status daty nie zastępuje sprawdzenia aktualnego brzmienia przepisu.",
    now: {
      title: "Co dotyczy Twojego zadania teraz?",
      lead: "Ustalenie zakresu, roli i danych oddziela obowiązek od dobrej praktyki. Zapis wyniku i daty przeglądu przed użyciem.",
      items: [
        { scope: "Dane osobowe / DPIA", action: "Screening prawdopodobieństwa wysokiego ryzyka i wykonanie DPIA, gdy jest wymagana.", sourceLabel: "Komisja Europejska: data-protection obligations", source: "https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en", reviewed: "2026-10-22" },
        { scope: "Umiejętności AI", action: "Zapewnienie adekwatnych umiejętności osobom używającym systemu. Art. 4 nie gwarantuje jednego poziomu dla każdej osoby - wsparcie zależy od roli.", sourceLabel: "AI Act Service Desk: art. 4", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4", reviewed: "2026-10-22" },
        { scope: "Przejrzystość", action: "Sprawdzenie roli dostawcy i wdrażającego oraz zasad oznaczania zależnych od rodzaju treści i wyjątku.", sourceLabel: "AI Act Service Desk: art. 50", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50", reviewed: "2026-10-22" },
        { scope: "Zastosowanie wrażliwe", action: "Sprawdzenie art. 6 i załącznika III oraz skierowanie przypadku do oceny prawnej przed użyciem.", sourceLabel: "AI Act Service Desk: art. 6", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6", reviewed: "2026-10-22" },
        { scope: "Polska ustawa", action: "Sprawdzenie zakresu polskiej ustawy i przepisów przejściowych. Data wejścia w życie nie jest obietnicą kontroli w konkretnym dniu.", sourceLabel: "ELI: Dz.U. 2026 poz. 1003", source: "https://eli.gov.pl/eli/DU/2026/1003/ogl", reviewed: "2026-10-22" }
      ],
      note: "To praktyczna wskazówka do screeningu, nie porada prawna ani certyfikat zgodności. Oś czasu nie aktualizuje się prawnie automatycznie; przed decyzją: otwarcie źródła i konsultacja wątpliwości z wykwalifikowaną osobą."
    },
    events: [
      { date: "2025-02-02", title: "Zakazane praktyki AI", desc: "Art. 5 AI Act: zakaz m.in. manipulacji, scoringu społecznego i części systemów rozpoznawania emocji. Art. 4: obowiązek zapewnienia umiejętności AI w organizacji." },
      { date: "2025-08-02", title: "Modele ogólnego przeznaczenia", desc: "Obowiązki dostawców modeli GPAI i start struktur nadzoru w państwach członkowskich." },
      { date: "2026-07-27", title: "AI Omnibus wchodzi w życie", desc: "Rozporządzenie (UE) 2026/1744 przesuwa terminy dla systemów wysokiego ryzyka, upraszcza obowiązek umiejętności AI i rozszerza ułatwienia dla MŚP na małe spółki o średniej kapitalizacji." },
      { date: "2026-08-02", title: "Przejrzystość (art. 50)", desc: "Obowiązki zależą od roli dostawcy lub wdrażającego, rodzaju treści i wyjątków. Aktualne brzmienie przed oznaczeniem materiału wymaga sprawdzenia." },
      { date: "2026-08-11", title: "Polska ustawa o systemach AI", desc: "Ustawa z 3 lipca 2026 r. (Dz.U. 2026 poz. 1003) wchodzi w życie. Przepisy przejściowe i zakres kompetencji wymagają sprawdzenia w tekście ustawy." },
      { date: "2026-10-28", title: "Wybrane przepisy krajowe", desc: "Według przepisu przejściowego część regulacji dotyczących organu i nadzoru zaczyna być stosowana 28 października. Nie oznacza to gwarantowanej kontroli w tym dniu." },
      { date: "2026-12-02", title: "Nowe zakazy", desc: "Zakaz systemów generujących intymne treści bez zgody oraz materiały przedstawiające wykorzystywanie dzieci." },
      { date: "2027-12-02", title: "Systemy wysokiego ryzyka (załącznik III)", desc: "Pełne obowiązki dla samodzielnych systemów wysokiego ryzyka: m.in. rekrutacja, ocena zdolności kredytowej, edukacja, infrastruktura krytyczna." },
      { date: "2028-08-02", title: "AI w produktach regulowanych (załącznik I)", desc: "Obowiązki dla AI wbudowanej w maszyny, zabawki, wyroby medyczne i inne produkty objęte prawem harmonizacyjnym UE." }
    ],
    sources: [
      { label: "Komisja Europejska: AI Omnibus enters into force", url: "https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force" },
      { label: "EUR-Lex: Rozporządzenie (UE) 2026/1744", url: "https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng" },
      { label: "ELI: Dz.U. 2026 poz. 1003", url: "https://eli.gov.pl/eli/DU/2026/1003/ogl" }
    ]
  },

  challenges: {
    title: "Typowe przeszkody",
    lead: "Jedno zadanie wystarczy, żeby zobaczyć typowe problemy. Poniższe odpowiedzi pomagają je ograniczyć bez tworzenia planu dla całej firmy.",
    items: [
      { title: "Nierówna użyteczność", icon: "users", problem: "Rutyna pomaga jednej osobie, ale nie pasuje do pozostałych przypadków.", fix: "Porównanie przykładów, zebranie pytań i dopasowanie instrukcji do rzeczywistego przebiegu zadania." },
      { title: "Błędy wyniku", icon: "shield-check", problem: "Wynik wymaga wielu poprawek albo zawiera trudne do zauważenia błędy.", fix: "Kryterium akceptacji, przegląd człowieka, zapis błędów i ponowny test na reprezentatywnych przykładach." },
      { title: "Bezpieczeństwo danych", icon: "lock", problem: "Dane klientów lub poufne informacje mogą trafić do niewłaściwego narzędzia.", fix: "Minimalny zakres danych, sprawdzenie ustawień, ograniczenie dostępu i konsultacja specjalisty przy niejasności." },
      { title: "Wynik dla klienta", icon: "message-circle", problem: "Treść wsparta przez AI może trafić na zewnątrz bez odpowiedniej kontroli.", fix: "Przegląd treści, ustalenie roli człowieka i sprawdzenie zasad przejrzystości przed przekazaniem." },
      { title: "Połączenie z systemem", icon: "plug", problem: "Ręczne przenoszenie danych zabiera czas albo tworzy nowe ryzyko.", fix: "Najpierw potwierdzenie potrzeby, mały zakres danych, test odtworzenia i ręczny sposób awaryjny." },
      { title: "Koszt i dostęp", icon: "wallet", problem: "Koszt rośnie, a nie wiadomo, kto odpowiada za konto lub limity.", fix: "Właściciel konta, limit wydatków, przegląd kosztu i uporządkowanie dostępu po teście." }
    ]
  },

  metrics: {
    title: "Pomiar sukcesu",
    lead: "Miary potrzebne do jednego zadania obejmują stan wyjściowy, kryterium jakości, czas sprawdzania i koszt przed decyzją o dalszym użyciu.",
    groups: [
      { title: "Czas", icon: "timer", items: ["Czas całego zadania", "Czas sprawdzania i poprawek", "Liczba zadań w ustalonym okresie"] },
      { title: "Jakość", icon: "badge-check", items: ["Liczba błędów", "Liczba poprawek", "Akceptacja według ustalonego kryterium"] },
      { title: "Koszt", icon: "wallet", items: ["Koszt narzędzia", "Koszt pracy przy sprawdzaniu", "Koszt jednego zadania"] },
      { title: "Użyteczność", icon: "sparkles", items: ["Czy rutyna skraca pracę", "Czy instrukcja jest zrozumiała", "Czy ręczny sposób awaryjny pozostaje dostępny"] }
    ]
  },

  workedExample: {
    title: "Przykład: odpowiedzi na pytania klientów",
    lead: "Jedna osoba testuje narzędzie na niekrytycznych zgłoszeniach. Pomiar obejmuje czas odpowiedzi, czas poprawek, jakość według ustalonego kryterium i koszt zadania. Progi są zapisane przed testem, bez obietnicy oszczędności.",
    phases: [
      { title: "1. Wybór zadania", output: "Karta zadania, stan wyjściowy, osoba decyzyjna i granice danych.", threshold: "Kryterium sukcesu oraz zakres testu są zapisane." },
      { title: "2. Test w praktyce", output: "Jedno narzędzie, reprezentatywne przykłady i tabela porównawcza.", threshold: "Czas poprawek i koszt są porównane ze stanem wyjściowym." },
      { title: "3. Wprowadzenie do pracy", output: "Krótka instrukcja, osoba przeglądająca i ręczny sposób awaryjny.", threshold: "Rutyna jest zrozumiała dla osób wykonujących zadanie." },
      { title: "4. Utrzymanie i rozwój", output: "Karta przeglądu, aktualna instrukcja i uporządkowane dostępy.", threshold: "Utrzymanie, zmiana albo zatrzymanie rutyny wynika z danych." }
    ]
  },

  glossary: [
    { term: "Stan wyjściowy (baseline)", definition: "Punkt odniesienia dla wyniku testu: czas, jakość, poprawki i koszt." },
    { term: "Kryterium sukcesu", definition: "Ustalony przed testem opis wyniku, który uzasadnia dalsze użycie zadania." },
    { term: "Przegląd człowieka", definition: "Kontrola wyniku przez osobę, zanim trafi do klienta, systemu albo kolejnego etapu pracy." },
    { term: "Ręczny sposób awaryjny (fallback)", definition: "Opis zwykłego sposobu wykonania zadania, gdy narzędzie jest niedostępne lub wynik jest niepewny." },
    { term: "Dane wrażliwe", definition: "Dane wymagające dodatkowego ograniczenia zakresu, dostępu lub konsultacji specjalisty." },
    { term: "Wynik testu", definition: "Zapis obserwacji, przykładu i decyzji: kontynuacja, korekta z ponownym testem albo zatrzymanie." }
  ],

  pathOptions: {
    title: "Minimum i rozszerzenie",
    minimum: [
      "Jedno zadanie, jedna osoba wykonująca i jedna osoba podejmująca decyzję.",
      "Stan wyjściowy, kryterium sukcesu oraz porównanie czasu, poprawek i kosztu.",
      "Jedno narzędzie, minimalny zakres danych i przegląd człowieka.",
      "Instrukcja, ręczny sposób awaryjny i decyzja o utrzymaniu, zmianie albo zatrzymaniu."
    ],
    extended: [
      "Dodatkowy przegląd specjalisty przy danych osobowych, poufnych lub decyzjach wrażliwych.",
      "Wspólna instrukcja i dostęp według ról, gdy z rutyny korzysta kilka zespołów.",
      "Okresowy przegląd kryterium jakości, kosztu i ręcznego sposobu awaryjnego."
    ]
  }
};

window.ROADMAP.taskHints = Object.fromEntries(window.ROADMAP.phases.flatMap((phase) => phase.stages.flatMap((stage) => stage.items.flatMap((item) => item.actions.map((action) => [action.id, action.hint || "Wynik lub przykład zapisany przy zadaniu."])))).concat(window.ROADMAP.phases.flatMap((phase) => phase.gate.checks.map((check) => [check.id, check.hint || "Wynik lub dokumentacja warunku decyzji."]))));
