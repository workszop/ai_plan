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
      goal: "Wybierz jedno powtarzalne zadanie. Ustal, kto za nie odpowiada i jak bezpiecznie sprawdzisz, czy AI może w nim pomóc.",
      outcomes: [
        "Opis zadania i tego, jak wykonujesz je teraz",
        "Osoba wykonująca zadanie i osoba podejmująca decyzję (może to być ta sama osoba)",
        "Stan wyjściowy, oczekiwana poprawa i kryterium sukcesu",
        "Ustalony czas, budżet i zakres pierwszego testu",
        "Zasady korzystania z danych, przyznawania dostępu i sprawdzania wyników przez człowieka"
      ],
      stages: [
        {
          title: "Opis zadania i celu",
          items: [
            {
              title: "Zadanie i odpowiedzialność",
              actions: [
                { id: "sme.choice.action.001", text: "Wybór jednego powtarzalnego zadania oraz opisanie, jak jest teraz wykonywane i za pomocą jakich narzędzi.", hint: "Krótki opis zadania, kolejnych czynności i używanych narzędzi." },
                { id: "sme.choice.action.002", text: "Wyznaczenie osoby wykonującej zadanie i osoby podejmującej decyzję; może to być ta sama osoba.", hint: "Imiona lub role obu osób oraz zakres ich odpowiedzialności." },
                { id: "sme.choice.action.003", text: "Ustalenie, jak zadanie jest wykonywane teraz, co ma się poprawić i jak ocenić jakość wyniku.", hint: "Opis obecnej sytuacji, oczekiwanej zmiany i wyniku, który uznasz za wystarczająco dobry." }
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
                { id: "sme.choice.action.004", text: "Określenie dostępnego czasu, budżetu oraz zakresu pierwszego testu.", hint: "Limit czasu i kosztów oraz opis tego, czego test nie obejmuje." },
                { id: "sme.choice.action.005", text: "Ustalenie zasad korzystania z danych, dostępu do narzędzia i sprawdzania wyników przez człowieka.", hint: "Lista danych, których wolno i nie wolno używać, zasady dostępu i moment, w którym człowiek sprawdza wynik." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.choice.gate.001", text: "Zadanie, stan wyjściowy i kryterium sukcesu są opisane.", hint: "Opis zadania, obecnej sytuacji i kryterium sukcesu." },
          { id: "sme.choice.gate.002", text: "Wiadomo, kto wykonuje zadanie, a kto podejmuje decyzję.", hint: "Dwie role z zakresem odpowiedzialności." },
          { id: "sme.choice.gate.003", text: "Zakres danych, czas i budżet testu są ustalone i możliwe do dotrzymania.", hint: "Opis zakresu testu, limitów i zabezpieczeń." }
        ]
      }
    },
    {
      id: "test",
      num: 2,
      title: "Test w praktyce",
      duration: "krótka próba na przykładach",
      icon: "flask-conical",
      goal: "Sprawdź jedno narzędzie na przykładach typowych dla tego zadania. Porównaj wyniki z dotychczasowym sposobem pracy.",
      outcomes: [
        "Jedno narzędzie z opisanymi ustawieniami",
        "Ustalony zakres danych i zasady dostępu podczas testu",
        "Przykłady typowe dla zadania oraz sposób oceny wyników",
        "Porównanie czasu, poprawek, jakości i kosztu",
        "Zapisana decyzja: kontynuować, wprowadzić zmiany albo zakończyć próbę"
      ],
      stages: [
        {
          title: "Narzędzie i dane",
          items: [
            {
              title: "Konfiguracja próby",
              actions: [
                { id: "sme.test.action.001", text: "Wybór jednego narzędzia dopasowanego do zadania i sprawdzenie jego ustawień.", hint: "Nazwa narzędzia, wersja lub plan abonamentowy, osoba odpowiedzialna za ustawienia i ograniczenia użycia." },
                { id: "sme.test.action.002", text: "Określenie, jakich danych wolno użyć, kto ma dostęp i jakie ustawienia obowiązują podczas testu.", hint: "Zakres danych, role osób z dostępem oraz ustawienia prywatności i okresu przechowywania danych." }
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
                { id: "sme.test.action.003", text: "Przygotowanie przykładów typowych dla zadania i ustalenie sposobu oceny wyników.", hint: "Zestaw przykładów z kryterium oceny i miejscem na uwagi osoby sprawdzającej." },
                { id: "sme.test.action.004", text: "Porównanie czasu wykonania, liczby poprawek, jakości i kosztów z dotychczasowym sposobem pracy.", hint: "Tabela porównująca pracę bez AI i z AI, z uwzględnieniem czasu sprawdzania i poprawiania wyników." },
                { id: "sme.test.action.005", text: "Podjęcie decyzji: kontynuować, wprowadzić zmiany i powtórzyć test albo zakończyć próbę.", hint: "Krótki zapis decyzji uzasadnionej wynikiem testu i ustalonym kryterium sukcesu." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.test.gate.001", text: "Narzędzie, dozwolone dane i ustawienia są potwierdzone i zapisane.", hint: "Karta konfiguracji próby." },
          { id: "sme.test.gate.002", text: "Jakość, czas, poprawki i koszt są porównane ze stanem wyjściowym.", hint: "Tabela wyników wraz z czasem sprawdzania." },
          { id: "sme.test.gate.003", text: "Wynik testu i zalecenie, co zrobić dalej, są zapisane.", hint: "Zalecenie osoby odpowiedzialnej wraz z uzasadnieniem." }
        ]
      }
    },
    {
      id: "work",
      num: 3,
      title: "Wprowadzenie do pracy",
      duration: "codzienna praca jednego zespołu",
      icon: "users-round",
      goal: "Wprowadź sprawdzony sposób pracy do codziennych zadań. Wyznacz osobę, która sprawdza wyniki, i ustal, jak wykonać zadanie bez AI w razie problemów.",
      outcomes: [
        "Krótka instrukcja z jednym przykładem",
        "Osoby wykonujące zadanie wiedzą, jak korzystać z narzędzia",
        "Wyznaczona osoba sprawdzająca wyniki",
        "Ustalone zasady dostępu, wydatków i odpowiedzialności",
        "Instrukcja wykonania zadania bez AI w razie problemów"
      ],
      stages: [
        {
          title: "Instrukcja i ludzie",
          items: [
            {
              title: "Codzienna praca",
              actions: [
                { id: "sme.work.action.001", text: "Opracowanie krótkiej instrukcji z jednym przykładem poprawnego użycia.", hint: "Jedna strona lub ekran z kolejnością czynności, przykładem i przypomnieniem o sprawdzaniu wyników." },
                { id: "sme.work.action.002", text: "Pokazanie osobom wykonującym zadanie, jak korzystać z narzędzia, i zebranie ich pytań.", hint: "Lista osób, data prezentacji i zapis pytań lub niejasności." },
                { id: "sme.work.action.003", text: "Wyznaczenie osoby sprawdzającej wyniki i ustalenie sposobu ich zatwierdzania.", hint: "Rola osoby sprawdzającej i jasne kryterium zatwierdzania wyników." }
              ]
            }
          ]
        },
        {
          title: "Dostęp i ciągłość",
          items: [
            {
              title: "Dostęp i plan awaryjny",
              actions: [
                { id: "sme.work.action.004", text: "Ustalenie zasad dostępu, wydatków i odpowiedzialności za konto.", hint: "Osoba odpowiedzialna za konto, uprawnienia, limit wydatków i sposób zgłoszenia problemu." },
                { id: "sme.work.action.005", text: "Przygotowanie instrukcji wykonania zadania bez AI w razie problemów.", hint: "Krótka instrukcja awaryjna: kolejne czynności, miejsce przechowywania danych i osoba podejmująca decyzję." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.work.gate.001", text: "Krótka instrukcja, przykład i kryterium akceptacji są gotowe.", hint: "Instrukcja i przykładowy wynik." },
          { id: "sme.work.gate.002", text: "Osoby wykonujące zadanie znają sposób pracy, a osoba sprawdzająca wyniki jest wyznaczona.", hint: "Lista osób, imię lub rola osoby sprawdzającej i data ustalenia." },
          { id: "sme.work.gate.003", text: "Zasady dostępu, limity wydatków i sposób wykonania zadania bez AI są zapisane.", hint: "Zasady dostępu i instrukcja awaryjna." }
        ]
      }
    },
    {
      id: "keep",
      num: 4,
      title: "Utrzymanie i rozwój",
      duration: "regularne przeglądy",
      icon: "refresh-cw",
      goal: "Sprawdzaj, czy przyjęty sposób pracy nadal pomaga, i poprawiaj go w razie potrzeby. Nie wymaga to tworzenia dodatkowych struktur w firmie.",
      outcomes: [
        "Przegląd użyteczności, kosztu, błędów i czasu",
        "Zaktualizowana instrukcja i kryterium jakości",
        "Uporządkowane uprawnienia, dane i ustawienia",
        "Wyznaczona osoba odpowiedzialna i ustalone terminy przeglądów",
        "Decyzja o dalszym używaniu, zmianie albo rezygnacji z tego sposobu pracy"
      ],
      stages: [
        {
          title: "Przegląd i aktualizacja",
          items: [
            {
              title: "Ocena sposobu pracy",
              actions: [
                { id: "sme.keep.action.001", text: "Ocena użyteczności, kosztów, błędów i czasu po wprowadzeniu narzędzia do pracy.", hint: "Krótka notatka z przeglądu, z danymi z ustalonego okresu i opisem problemów." },
                { id: "sme.keep.action.002", text: "Aktualizacja instrukcji, przykładu i kryterium jakości na podstawie wyników.", hint: "Wersja instrukcji, opis zmiany i wynik ponownego sprawdzenia." },
                { id: "sme.keep.action.003", text: "Uporządkowanie uprawnień, danych i ustawień po zakończeniu testu.", hint: "Lista odebranych uprawnień, informacja o tym, co zrobiono z danymi testowymi, oraz aktualne ustawienia." }
              ]
            }
          ]
        },
        {
          title: "Odpowiedzialność i decyzja",
          items: [
            {
              title: "Regularne przeglądy i dalsze kroki",
              actions: [
                { id: "sme.keep.action.004", text: "Ustalenie, kto odpowiada za ten sposób pracy, jak często go sprawdza i kto wprowadza zmiany.", hint: "Imię lub rola osoby odpowiedzialnej, termin przeglądu i sposób zgłaszania zmian." },
                { id: "sme.keep.action.005", text: "Podjęcie decyzji o dalszym używaniu, zmianie albo rezygnacji z tego sposobu pracy na podstawie przeglądu.", hint: "Zapis decyzji wraz z uzasadnieniem wynikającym z przeglądu i następnym krokiem." }
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Czy warto iść dalej?",
        checks: [
          { id: "sme.keep.gate.001", text: "Przegląd użyteczności, kosztu, błędów i czasu jest wykonany.", hint: "Karta okresowego przeglądu." },
          { id: "sme.keep.gate.002", text: "Instrukcja jest aktualna, a uprawnienia i dane uporządkowane.", hint: "Aktualna instrukcja i lista odebranych uprawnień." },
          { id: "sme.keep.gate.003", text: "Decyzja o dalszym używaniu, zmianie albo rezygnacji z tego sposobu pracy wynika z danych.", hint: "Decyzja z uzasadnieniem i następnym krokiem." }
        ]
      }
    }
  ],

  ongoing: {
    title: "Utrzymanie rutyny",
    lead: "Gdy rutyna działa, wystarczą regularne przeglądy. Każdy kończy się decyzją: zostawić ją, zmienić albo zatrzymać.",
    cadences: [
      { period: "Po wykonaniu", icon: "check-circle-2", actions: ["Przegląd wyniku przed przekazaniem", "Odnotowanie poprawy lub błędu"] },
      { period: "Co miesiąc", icon: "calendar", actions: ["Przegląd czasu, kosztu i jakości", "Aktualizacja instrukcji, gdy zmieniły się warunki"] },
      { period: "Przy zmianie", icon: "refresh-cw", actions: ["Ponowne sprawdzenie przykładów", "Potwierdzenie dostępu i ręcznego sposobu awaryjnego"] },
      { period: "W razie potrzeby", icon: "arrow-up-right", actions: ["Sprawdzenie, czy zakres rutyny wymaga zmiany", "Potwierdzenie warunków bezpieczeństwa przed zmianą"] }
    ]
  },

  safety: {
    lead: "Zaznaczony kontekst pokazuje dodatkowe pytania do sprawdzenia. Lista nie jest kwalifikacją prawną i nie zwalnia z obowiązków ze względu na wielkość firmy.",
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
          { context: "externalOutput", text: "Wynik dla klienta lub na zewnątrz: przegląd treści, rola dostawcy i, jeśli trzeba, informacja dla odbiorcy." },
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
    lead: "Punktem wyjścia jest zakres zadania, Twoja rola i aktualny status obowiązku. Oś czasu to tylko tło: sama data nie zastąpi sprawdzenia, jak przepis brzmi dziś.",
    now: {
      title: "Co dotyczy Twojego zadania teraz?",
      lead: "Gdy znasz zakres, swoją rolę i dane, łatwiej oddzielić obowiązek od dobrej praktyki. Przed użyciem zapisz wynik i datę przeglądu.",
      items: [
        { scope: "Dane osobowe / DPIA", action: "Wstępna ocena, czy przetwarzanie może nieść wysokie ryzyko, i DPIA, gdy jest wymagana.", sourceLabel: "Komisja Europejska: data-protection obligations", source: "https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en", reviewed: "2026-10-22" },
        { scope: "Umiejętności AI", action: "Zapewnienie osobom używającym systemu umiejętności dopasowanych do ich roli. Art. 4 nie wymaga jednego poziomu dla wszystkich.", sourceLabel: "AI Act Service Desk: art. 4", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4", reviewed: "2026-10-22" },
        { scope: "Przejrzystość", action: "Sprawdzenie, czy występujesz jako dostawca czy wdrażający, oraz zasad oznaczania treści. Zasady zależą od rodzaju treści i wyjątków.", sourceLabel: "AI Act Service Desk: art. 50", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50", reviewed: "2026-10-22" },
        { scope: "Zastosowanie wrażliwe", action: "Sprawdzenie art. 6 i załącznika III oraz skierowanie przypadku do oceny prawnej przed użyciem.", sourceLabel: "AI Act Service Desk: art. 6", source: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6", reviewed: "2026-10-22" },
        { scope: "Polska ustawa", action: "Sprawdzenie zakresu polskiej ustawy i przepisów przejściowych. Data wejścia w życie nie oznacza, że tego dnia przyjdzie kontrola.", sourceLabel: "ELI: Dz.U. 2026 poz. 1003", source: "https://eli.gov.pl/eli/DU/2026/1003/ogl", reviewed: "2026-10-22" }
      ],
      note: "To wskazówka do wstępnej oceny. Nie jest poradą prawną ani certyfikatem zgodności. Oś czasu nie śledzi zmian w przepisach, więc przed decyzją otwórz źródło, a wątpliwości skonsultuj z osobą znającą przepisy."
    },
    events: [
      { date: "2025-02-02", title: "Zakazane praktyki AI", desc: "Art. 5 AI Act: zakaz m.in. manipulacji, scoringu społecznego i części systemów rozpoznawania emocji. Art. 4: obowiązek zapewnienia umiejętności AI w organizacji." },
      { date: "2025-08-02", title: "Modele ogólnego przeznaczenia", desc: "Obowiązki dostawców modeli GPAI i początek działania struktur nadzoru w państwach członkowskich." },
      { date: "2026-07-27", title: "AI Omnibus wchodzi w życie", desc: "Rozporządzenie (UE) 2026/1744 przesuwa terminy dla systemów wysokiego ryzyka, upraszcza obowiązek umiejętności AI i rozszerza ułatwienia dla MŚP na małe spółki o średniej kapitalizacji." },
      { date: "2026-08-02", title: "Przejrzystość (art. 50)", desc: "Obowiązki zależą od roli dostawcy lub wdrażającego, rodzaju treści i wyjątków. Przed oznaczeniem materiału sprawdź aktualne brzmienie przepisu." },
      { date: "2026-08-11", title: "Polska ustawa o systemach AI", desc: "Ustawa z 3 lipca 2026 r. (Dz.U. 2026 poz. 1003) wchodzi w życie. Przepisy przejściowe i podział kompetencji trzeba sprawdzić w tekście ustawy." },
      { date: "2026-10-28", title: "Wybrane przepisy krajowe", desc: "Zgodnie z przepisem przejściowym od 28 października stosuje się część przepisów o organie i nadzorze. Nie oznacza to, że tego dnia zaczną się kontrole." },
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
    lead: "Typowe problemy widać już przy jednym zadaniu. Żeby je ograniczyć, nie trzeba planu dla całej firmy.",
    items: [
      { title: "Nierówna użyteczność", icon: "users", problem: "Rutyna pomaga jednej osobie, ale nie pasuje do pozostałych przypadków.", fix: "Porównanie przykładów, zebranie pytań i dopasowanie instrukcji do rzeczywistego przebiegu zadania." },
      { title: "Błędy wyniku", icon: "shield-check", problem: "Wynik wymaga wielu poprawek albo zawiera trudne do zauważenia błędy.", fix: "Kryterium akceptacji, przegląd człowieka, zapis błędów i ponowny test na reprezentatywnych przykładach." },
      { title: "Bezpieczeństwo danych", icon: "lock", problem: "Dane klientów lub poufne informacje mogą trafić do niewłaściwego narzędzia.", fix: "Minimalny zakres danych, sprawdzenie ustawień, ograniczenie dostępu i konsultacja specjalisty przy niejasności." },
      { title: "Wynik dla klienta", icon: "message-circle", problem: "Treść przygotowana z pomocą AI może trafić na zewnątrz bez odpowiedniej kontroli.", fix: "Przegląd treści, ustalenie roli człowieka i sprawdzenie zasad przejrzystości przed przekazaniem." },
      { title: "Połączenie z systemem", icon: "plug", problem: "Ręczne przenoszenie danych zabiera czas albo tworzy nowe ryzyko.", fix: "Najpierw potwierdzenie potrzeby, mały zakres danych, test odtworzenia i ręczny sposób awaryjny." },
      { title: "Koszt i dostęp", icon: "wallet", problem: "Koszt rośnie, a nie wiadomo, kto odpowiada za konto lub limity.", fix: "Właściciel konta, limit wydatków, przegląd kosztu i uporządkowanie dostępu po teście." }
    ]
  },

  metrics: {
    title: "Pomiar sukcesu",
    lead: "Przed decyzją o dalszym użyciu potrzebujesz czterech rzeczy: stanu wyjściowego, kryterium jakości, czasu sprawdzania i kosztu.",
    groups: [
      { title: "Czas", icon: "timer", items: ["Czas całego zadania", "Czas sprawdzania i poprawek", "Liczba zadań w ustalonym okresie"] },
      { title: "Jakość", icon: "badge-check", items: ["Liczba błędów", "Liczba poprawek", "Akceptacja według ustalonego kryterium"] },
      { title: "Koszt", icon: "wallet", items: ["Koszt narzędzia", "Koszt pracy przy sprawdzaniu", "Koszt jednego zadania"] },
      { title: "Użyteczność", icon: "sparkles", items: ["Czy rutyna skraca pracę", "Czy instrukcja jest zrozumiała", "Czy ręczny sposób awaryjny pozostaje dostępny"] }
    ]
  },

  workedExample: {
    title: "Przykład: odpowiedzi na pytania klientów",
    lead: "Jedna osoba testuje narzędzie na niekrytycznych zgłoszeniach i mierzy czas odpowiedzi, czas poprawek, jakość według ustalonego kryterium oraz koszt zadania. Progi zapisuje przed testem i nie zakłada z góry, że wyjdą oszczędności.",
    phases: [
      { title: "1. Wybór zadania", output: "Karta zadania, stan wyjściowy, osoba decyzyjna i granice danych.", threshold: "Kryterium sukcesu oraz zakres testu są zapisane." },
      { title: "2. Test w praktyce", output: "Jedno narzędzie, reprezentatywne przykłady i tabela porównawcza.", threshold: "Czas poprawek i koszt są porównane ze stanem wyjściowym." },
      { title: "3. Wprowadzenie do pracy", output: "Krótka instrukcja, osoba przeglądająca i ręczny sposób awaryjny.", threshold: "Rutyna jest zrozumiała dla osób wykonujących zadanie." },
      { title: "4. Utrzymanie i rozwój", output: "Karta przeglądu, aktualna instrukcja i uporządkowane dostępy.", threshold: "Decyzja o utrzymaniu, zmianie albo zatrzymaniu rutyny wynika z danych." }
    ]
  },

  glossary: [
    { term: "Stan wyjściowy (baseline)", definition: "Punkt odniesienia dla wyniku testu: czas, jakość, poprawki i koszt." },
    { term: "Kryterium sukcesu", definition: "Ustalony przed testem opis wyniku, który uzasadnia dalsze używanie narzędzia." },
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
