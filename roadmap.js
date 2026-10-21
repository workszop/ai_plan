// Mapa drogowa wdrożenia AI - dane strony. Edytuj ten plik; index.html renderuje go bez kroku budowania.
// Zasady: bez długich myślników (używaj "-"), bez HTML w tekstach, każda akcja to jedno zdanie w trybie rozkazującym.
window.ROADMAP = {
  meta: {
    updated: "2026-10-21",
    version: "2.0",
    source: "https://github.com/workszop/ai_plan"
  },

  phases: [
    {
      id: "fundament",
      num: 1,
      title: "Fundament",
      duration: "ok. 2 tygodnie",
      icon: "layers",
      goal: "Zanim kupisz jakiekolwiek narzędzie, ustal po co, dla kogo i na jakich danych. Ta faza odpowiada na pytanie: czy w ogóle jesteśmy gotowi na pilotaż?",
      outcomes: [
        "Sponsor i budżet pilotażu",
        "1-2 ambasadorów AI z przydzielonym czasem",
        "2-3 wybrane przypadki użycia z celami i KPI",
        "Inwentaryzacja danych i ocena ryzyka (RODO, AI Act)",
        "Krótka lista narzędzi i plan wdrożenia"
      ],
      stages: [
        {
          title: "Decyzje strategiczne",
          items: [
            {
              title: "Sponsor i kadra kierownicza",
              actions: [
                "Wyznacz sponsora z zarządu i zapisz jego odpowiedzialność za wynik pilotażu.",
                "Ustal budżet pilotażu: licencje, czas ludzi, ewentualne wsparcie zewnętrzne.",
                "Przyjmij wstępną politykę AI: bezpieczeństwo, prywatność, etyka, przejrzystość, zakres zastosowań niedozwolonych.",
                "Przygotuj komunikat do organizacji: po co to robimy, kogo dotyczy, czego nie zmieniamy."
              ]
            },
            {
              title: "Ambasadorzy AI",
              actions: [
                "Wybierz 1-2 ambasadorów: osoby sprawne technicznie, z wpływem w zespole i otwarte na zmianę.",
                "Przydziel im oficjalnie 5-10 godzin tygodniowo i zapisz to w ich celach.",
                "Załóż kanał komunikacji i stały cotygodniowy termin spotkań."
              ]
            },
            {
              title: "Przypadki użycia",
              actions: [
                "Zbierz pomysły z działów i oceń je w macierzy: wartość biznesowa, ryzyko, dostępność danych, łatwość pomiaru.",
                "Sklasyfikuj każdy pomysł według AI Act: zakazany, wysokiego ryzyka, z obowiązkiem przejrzystości lub minimalnego ryzyka.",
                "Wybierz 2-3 przypadki o wysokiej wartości i niskim ryzyku; przypadki wysokiego ryzyka odłóż poza pilotaż.",
                "Opisz obecny proces krok po kroku, z wąskimi gardłami i czasem na każdy etap."
              ]
            },
            {
              title: "Cele i mierniki",
              actions: [
                "Zapisz dla każdego przypadku cel SMART: konkretny, mierzalny, osiągalny, istotny, określony w czasie.",
                "Wybierz 2-4 KPI: zaoszczędzony czas, koszt, jakość, odsetek osób korzystających.",
                "Zmierz stan wyjściowy, zanim cokolwiek zmienisz.",
                "Ustal, kto i jak często raportuje postęp."
              ]
            }
          ]
        },
        {
          title: "Dane, zgodność i narzędzia",
          items: [
            {
              title: "Inwentaryzacja danych",
              actions: [
                "Zmapuj źródła danych: system, właściciel, lokalizacja, okres retencji.",
                "Oznacz dane osobowe i wrażliwe; ustal, co trzeba zanonimizować lub pseudonimizować.",
                "Oceń jakość danych: kompletność, aktualność, dostępność, uprawnienia.",
                "Zaplanuj dostęp według ról, z zasadą minimalnych uprawnień."
              ]
            },
            {
              title: "Zgodność i ryzyka",
              actions: [
                "Przeprowadź DPIA i ocenę ryzyka bezpieczeństwa dla wybranych przypadków użycia.",
                "Spisz zasady przetwarzania i przekazywania danych, w tym do chmury i poza EOG.",
                "Zdefiniuj zakres niedozwolony w pilotażu, np. brak decyzji o ludziach bez udziału człowieka.",
                "Wyznacz właścicieli: danych, procesu, bezpieczeństwa i zgodności."
              ]
            },
            {
              title: "Wybór narzędzi",
              actions: [
                "Oceń narzędzia pod kątem bezpieczeństwa, funkcji, integracji, ceny i wymagań szkoleniowych.",
                "Sprawdź u dostawcy: gdzie przetwarza dane, czy uczy na nich modele, czy podpisze umowę powierzenia danych.",
                "Zamów demonstrację na własnych scenariuszach, nie na przykładach dostawcy.",
                "Wybierz 2-3 narzędzia do pilotażu i uruchom zakup z udziałem IT i prawników."
              ]
            },
            {
              title: "Plan wdrożenia",
              actions: [
                "Dla każdego przypadku użycia przygotuj plan: mapa procesu, harmonogram, ludzie, koszty.",
                "Zaplanuj szkolenia dla zespołu pilotażowego.",
                "Załóż rejestr ryzyk z działaniami ograniczającymi i właścicielami.",
                "Ustal, jak ogłosisz start pilotażu w całej organizacji."
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Bramka: czy startujemy z pilotażem?",
        checks: [
          "Dane dla wybranych przypadków są dostępne i zgodne z przepisami.",
          "Cele, KPI i pomiar stanu wyjściowego są zapisane.",
          "Właściciele zadań są wyznaczeni, a zidentyfikowane ryzyka zaakceptowane.",
          "Budżet i ramy kosztowe są zatwierdzone przez sponsora."
        ]
      }
    },

    {
      id: "pilotaz",
      num: 2,
      title: "Pilotaż",
      duration: "ok. 4 tygodnie",
      icon: "rocket",
      goal: "Mały zespół, wybrane narzędzia, realna praca pod nadzorem. Pilotaż ma dostarczyć liczby, nie wrażenia: ile czasu oszczędzamy, jaka jest jakość, ile to kosztuje.",
      outcomes: [
        "Skonfigurowane i zabezpieczone środowisko",
        "Przeszkolony zespół pilotażowy z biblioteką promptów",
        "Zmierzone wyniki na realnych zadaniach",
        "Decyzja GO / NO-GO oparta na danych"
      ],
      stages: [
        {
          title: "Przygotowanie i szkolenie",
          items: [
            {
              title: "Środowisko",
              actions: [
                "Podpisz umowy z dostawcami, w tym umowę powierzenia danych.",
                "Załóż konta z odpowiednimi uprawnieniami i włącz logowanie użycia.",
                "Skonfiguruj ustawienia bezpieczeństwa i przetestuj integracje.",
                "Przygotuj i oczyść dane testowe zgodnie z zasadami z fazy 1."
              ]
            },
            {
              title: "Szkolenie zespołu",
              actions: [
                "Przeprowadź szkolenie z obsługi narzędzi, pisania promptów, kontroli jakości i rozwiązywania problemów.",
                "Zbuduj bibliotekę promptów dla każdego przypadku użycia, z przykładami dobrych i złych wyników.",
                "Przygotuj krótkie instrukcje ze zrzutami ekranu.",
                "Udostępnij środowisko do ćwiczeń bez danych produkcyjnych."
              ]
            },
            {
              title: "Start pilotażu",
              actions: [
                "Zrób spotkanie otwierające: cele, role, oczekiwania, zasady bezpieczeństwa.",
                "Rozdaj konkretne zadania z terminami.",
                "W pierwszym tygodniu spotykaj się codziennie na 15 minut.",
                "Uruchom prosty kanał zgłaszania problemów i pomysłów."
              ]
            },
            {
              title: "Repozytoria i wersjonowanie",
              actions: [
                "Prowadź rejestr narzędzi i modeli: wersja, właściciel, data, zasady użycia.",
                "Wersjonuj prompty: historia zmian, warianty A/B, przegląd przed publikacją.",
                "Wersjonuj zbiory danych testowych i zapisuj ich pochodzenie.",
                "Zamroź zestaw przykładów do oceny jakości, taki sam dla każdej wersji.",
                "Jeśli budujesz własne rozwiązanie, dodaj automatyczne testy przed wdrożeniem zmian."
              ]
            }
          ]
        },
        {
          title: "Realizacja i ocena",
          items: [
            {
              title: "Praca pod nadzorem",
              actions: [
                "Zacznij od materiałów niekrytycznych.",
                "Dokumentuj każdy krok: czas, użyte prompty, ocena jakości.",
                "Codziennie przeglądaj wyniki z ekspertem merytorycznym.",
                "Poprawiaj prompty i proces na podstawie pierwszych wyników."
              ]
            },
            {
              title: "Realna praca",
              actions: [
                "Przejdź ostrożnie do rzeczywistych zadań, nadal pod nadzorem.",
                "Wprowadź obowiązkowy przegląd wyników z jasnymi kryteriami akceptacji.",
                "Mierz oszczędność czasu i jakość w ustalonych KPI.",
                "Zapisuj nowe przypadki użycia, które odkryje zespół."
              ]
            },
            {
              title: "Ocena jakości i testy",
              actions: [
                "Oceń jakość na zamrożonym zestawie przykładów: trafność, zgodność z faktami, czas odpowiedzi.",
                "Porównaj każdą nową wersję promptów, modelu lub danych z poprzednią.",
                "Testuj warianty A/B z jednoznacznym kryterium wygranej.",
                "Ustal progi GO / NO-GO: techniczne, biznesowe i kosztowe.",
                "Zarchiwizuj wyniki razem z wersją narzędzi, promptów i danych."
              ]
            },
            {
              title: "Przegląd pilotażu",
              actions: [
                "Zrób spotkanie podsumowujące z zespołem i sponsorem.",
                "Zbierz liczby: zaoszczędzony czas, błędy, satysfakcja użytkowników, koszt na zadanie.",
                "Spisz wnioski i potrzebne zmiany.",
                "Podejmij decyzję o rozszerzeniu na podstawie danych, nie entuzjazmu."
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Bramka: czy rozszerzamy wdrożenie?",
        checks: [
          "KPI osiągnęły ustalone progi GO na realnych zadaniach.",
          "Nie było incydentu bezpieczeństwa ani wycieku danych.",
          "Znany jest koszt na przypadek użycia i mieści się w budżecie.",
          "Zespół pilotażowy chce dalej pracować z narzędziem."
        ]
      }
    },

    {
      id: "wdrozenie",
      num: 3,
      title: "Wdrożenie",
      duration: "ok. 4 tygodnie",
      icon: "git-branch",
      goal: "To, co działało u kilku osób, ma działać u kilkudziesięciu. Kluczem są dokumentacja, szkolenia dopasowane do ról i wsparcie na miejscu.",
      outcomes: [
        "Procedury, instrukcje i lista kontrolna jakości",
        "Materiały szkoleniowe dla każdej roli",
        "Harmonogram wdrożenia dział po dziale",
        "Wskaźniki adopcji raportowane kierownictwu"
      ],
      stages: [
        {
          title: "Procesy i dokumentacja",
          items: [
            {
              title: "Dokumentacja",
              actions: [
                "Zaktualizuj procedury operacyjne o wyniki pilotażu.",
                "Zbierz w jednym miejscu: zasady użycia narzędzi, instrukcje, bibliotekę promptów.",
                "Opracuj listę kontrolną jakości i wytyczne etyczne.",
                "Sformalizuj proces przeglądu treści wygenerowanych przez AI."
              ]
            },
            {
              title: "Materiały szkoleniowe",
              actions: [
                "Przygotuj materiały w kilku formatach: krótkie wideo, przykłady, ćwiczenia.",
                "Zbuduj moduły dla konkretnych ról, nie jedno szkolenie dla wszystkich.",
                "Przygotuj komunikaty dla klientów o użyciu AI tam, gdzie wymaga tego art. 50 AI Act lub dobra praktyka.",
                "Napisz przewodnik rozwiązywania problemów i FAQ."
              ]
            }
          ]
        },
        {
          title: "Wdrożenie etapami",
          items: [
            {
              title: "Przygotowanie",
              actions: [
                "Ułóż harmonogram wdrożenia dział po dziale, zaczynając od najbardziej chętnych.",
                "Wybierz i przeszkol dodatkowych ambasadorów dla każdej nowej grupy.",
                "Dopasuj materiały szkoleniowe do specyfiki działu.",
                "Uruchom stałe godziny konsultacji AI."
              ]
            },
            {
              title: "Realizacja i monitoring",
              actions: [
                "Wdrażaj kolejne działy z pełnym szkoleniem, nie tylko z dostępem do narzędzia.",
                "Sparuj nowych użytkowników z doświadczonymi.",
                "Śledź wskaźniki adopcji i reaguj tam, gdzie jest opór.",
                "Co dwa tygodnie pokazuj kierownictwu wyniki w KPI."
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Bramka: czy przechodzimy do integracji?",
        checks: [
          "Co najmniej połowa docelowych użytkowników korzysta z narzędzi co tydzień.",
          "Dokumentacja i szkolenia są aktualne i dostępne dla każdej roli.",
          "Proces przeglądu treści AI działa i jest przestrzegany.",
          "KPI z pilotażu utrzymują się przy większej skali."
        ]
      }
    },

    {
      id: "integracja",
      num: 4,
      title: "Integracja",
      duration: "miesiące 3-6",
      icon: "network",
      goal: "AI przestaje być projektem, a staje się częścią organizacji: ma właściciela, budżet, zasady, program szkoleń i miejsce w ofercie dla klientów.",
      outcomes: [
        "Zoptymalizowane procesy i aktualna dokumentacja",
        "Program szkoleń dla nowych pracowników",
        "Komitet ds. AI, rejestr systemów i przegląd zgodności",
        "Mapa drogowa na kolejne 12 miesięcy"
      ],
      stages: [
        {
          title: "Optymalizacja i wiedza",
          items: [
            {
              title: "Optymalizacja procesów",
              actions: [
                "Przeanalizuj dane użycia, żeby znaleźć wąskie gardła i nieefektywności.",
                "Uprość przepływy pracy i wpisz dobre praktyki do dokumentacji.",
                "Wzmocnij kontrolę jakości tam, gdzie wyniki są najsłabsze."
              ]
            },
            {
              title: "Szkolenia formalne",
              actions: [
                "Włącz szkolenie z AI do wdrożenia nowych pracowników.",
                "Dodaj kompetencje AI do planów rozwoju zawodowego.",
                "Uruchom program dla zaawansowanych użytkowników z potwierdzeniem umiejętności."
              ]
            },
            {
              title: "Zarządzanie wiedzą",
              actions: [
                "Prowadź jedno miejsce na zasoby AI: prompty, instrukcje, przykłady.",
                "Organizuj regularne sesje dzielenia się wiedzą.",
                "Twórz wspólnoty praktyki wokół konkretnych przypadków użycia."
              ]
            }
          ]
        },
        {
          title: "Klienci i rynek",
          items: [
            {
              title: "Komunikacja zewnętrzna",
              actions: [
                "Przygotuj materiały dla klientów pokazujące, jak AI poprawia ich obsługę.",
                "Przyjmij przejrzyste zasady informowania o użyciu AI w komunikacji zewnętrznej.",
                "Zorganizuj sesje edukacyjne dla klientów o AI w Twojej branży."
              ]
            },
            {
              title: "Możliwości biznesowe",
              actions: [
                "Wskaż, gdzie AI daje przewagę konkurencyjną i jak o tym mówić.",
                "Rozważ nowe modele cenowe wynikające z większej efektywności.",
                "Mierz korzyści dla klientów: czas realizacji, koszt, jakość.",
                "Zbieraj pomysły na nowe usługi możliwe dzięki AI."
              ]
            }
          ]
        },
        {
          title: "Zarządzanie i plan",
          items: [
            {
              title: "Struktura zarządzania",
              actions: [
                "Powołaj stały komitet ds. AI z udziałem biznesu, IT, bezpieczeństwa i prawników.",
                "Prowadź rejestr systemów AI: cel, klasyfikacja ryzyka wg AI Act, właściciel, dostawca.",
                "Sformalizuj polityki oceny narzędzi, bezpieczeństwa danych, etyki, jakości i szkoleń.",
                "Przygotuj się na ewentualną kontrolę KRiBSI: dokumentacja, oznaczanie treści, obowiązki informacyjne."
              ]
            },
            {
              title: "Planowanie długoterminowe",
              actions: [
                "Zaplanuj budżet na narzędzia i szkolenia na kolejny rok.",
                "Przygotuj mapę drogową innowacji AI na 12 miesięcy.",
                "Wprowadź regularny cykl przeglądu inicjatyw AI.",
                "Rozważ program motywacyjny za adopcję i pomysły."
              ]
            }
          ]
        }
      ],
      gate: {
        title: "Stan docelowy: AI działa jak każdy inny proces",
        checks: [
          "Każdy system AI ma właściciela, klasyfikację ryzyka i wpis w rejestrze.",
          "Nowy pracownik przechodzi szkolenie z AI w pierwszym miesiącu.",
          "Komitet ds. AI spotyka się regularnie i decyduje o nowych inicjatywach.",
          "Budżet i mapa drogowa na kolejny rok są zatwierdzone."
        ]
      }
    }
  ],

  ongoing: {
    title: "Bieżące wsparcie",
    lead: "Po fazie 4 wdrożenie nie kończy się, tylko zmienia rytm. Cztery stałe cykle utrzymują tempo i jakość.",
    cadences: [
      { period: "Co dwa tygodnie", icon: "calendar", actions: ["Spotkanie ambasadorów AI", "Dyżur wsparcia", "Wymiana promptów i krótkie sesje szkoleniowe"] },
      { period: "Co miesiąc", icon: "bar-chart-3", actions: ["Przegląd metryk użycia", "Aktualizacja dokumentacji", "Wyróżnienie najlepszych zastosowań", "Spotkanie grup użytkowników"] },
      { period: "Co kwartał", icon: "refresh-cw", actions: ["Ocena zwrotu z inwestycji", "Przegląd nowych narzędzi i modeli", "Odświeżenie materiałów szkoleniowych", "Historie sukcesu z zespołów"] },
      { period: "Co rok", icon: "flag", actions: ["Pełny przegląd i porównanie z rynkiem", "Aktualizacja polityk i rejestru systemów AI", "Przegląd zgodności z AI Act i ustawą krajową", "Planowanie strategii i budżetu"] }
    ]
  },

  regulation: {
    title: "Kalendarz regulacyjny",
    lead: "Daty, które wyznaczają granice pilotażu i wdrożenia. Status liczony jest względem dzisiejszej daty; przed decyzjami sprawdź aktualne źródła.",
    events: [
      { date: "2025-02-02", title: "Zakazane praktyki AI", desc: "Art. 5 AI Act: zakaz m.in. manipulacji, scoringu społecznego i części systemów rozpoznawania emocji. Art. 4: obowiązek zapewnienia umiejętności AI w organizacji." },
      { date: "2025-08-02", title: "Modele ogólnego przeznaczenia", desc: "Obowiązki dostawców modeli GPAI i start struktur nadzoru w państwach członkowskich." },
      { date: "2026-07-27", title: "AI Omnibus wchodzi w życie", desc: "Rozporządzenie (UE) 2026/1744 przesuwa terminy dla systemów wysokiego ryzyka, upraszcza obowiązek umiejętności AI i rozszerza ułatwienia dla MŚP na małe spółki o średniej kapitalizacji." },
      { date: "2026-08-02", title: "Przejrzystość (art. 50)", desc: "Informowanie, że rozmówcą jest AI, oraz oznaczanie treści generowanych, w tym deepfake'ów." },
      { date: "2026-08-11", title: "Polska ustawa o systemach AI", desc: "Ustawa z 3 lipca 2026 r. (Dz.U. 2026 poz. 1003) wchodzi w życie i powołuje Komisję Rozwoju i Bezpieczeństwa Sztucznej Inteligencji (KRiBSI)." },
      { date: "2026-10-28", title: "Kontrole i kary KRiBSI", desc: "Komisja zaczyna prowadzić kontrole i nakładać kary za naruszenia AI Act w Polsce." },
      { date: "2026-12-02", title: "Nowe zakazy", desc: "Zakaz systemów generujących intymne treści bez zgody oraz materiały przedstawiające wykorzystywanie dzieci." },
      { date: "2027-12-02", title: "Systemy wysokiego ryzyka (załącznik III)", desc: "Pełne obowiązki dla samodzielnych systemów wysokiego ryzyka: m.in. rekrutacja, ocena zdolności kredytowej, edukacja, infrastruktura krytyczna." },
      { date: "2028-08-02", title: "AI w produktach regulowanych (załącznik I)", desc: "Obowiązki dla AI wbudowanej w maszyny, zabawki, wyroby medyczne i inne produkty objęte prawem harmonizacyjnym UE." }
    ],
    sources: [
      { label: "Komisja Europejska: AI Omnibus enters into force", url: "https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force" },
      { label: "EUR-Lex: Rozporządzenie (UE) 2026/1744", url: "https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng" }
    ]
  },

  challenges: {
    title: "Typowe wyzwania",
    lead: "Prawie każde wdrożenie trafia na te same przeszkody. Lepiej mieć gotową odpowiedź, zanim się pojawią.",
    items: [
      { title: "Nierówna adopcja", icon: "users", problem: "Część zespołu używa narzędzi codziennie, część wcale.", fix: "Sparuj opornych z ambasadorami, pokazuj konkretne przykłady z ich pracy, celebruj szybkie wygrane i zapewnij wsparcie na miejscu." },
      { title: "Obawy o jakość", icon: "shield-check", problem: "Treści z AI zawierają błędy, które trafiają dalej.", fix: "Przegląd dopasowany do roli, wzorce dobrej jakości, lista kontrolna, dokumentowanie błędów i automatyczne testy tam, gdzie to możliwe." },
      { title: "Bezpieczeństwo danych", icon: "lock", problem: "Dane klientów lub tajemnice firmy trafiają do zewnętrznych modeli.", fix: "Sprawdzaj dostawców, spisz jasne zasady, włącz zabezpieczenia techniczne, rób audyty i mów otwarcie, co wolno, a czego nie." },
      { title: "Etyka i przejrzystość", icon: "scale", problem: "Nie wiadomo, kiedy informować, że treść lub decyzję wspierała AI.", fix: "Ustal zasady atrybucji i szablony informacji dla klientów zgodne z art. 50 AI Act oraz ścieżkę zgłaszania wątpliwości." },
      { title: "Integracja z systemami", icon: "plug", problem: "Narzędzie działa osobno, a dane trzeba przenosić ręcznie.", fix: "Zmapuj integracje wcześnie, zaangażuj IT, zbuduj potrzebne połączenia, testuj i miej plan awaryjny." },
      { title: "Shadow AI i koszty", icon: "wallet", problem: "Pracownicy używają prywatnych kont, a rachunki za licencje i tokeny rosną bez kontroli.", fix: "Daj bezpieczną, oficjalną alternatywę, licz koszt na przypadek użycia, ustaw limity i przeglądaj wydatki co miesiąc." }
    ]
  },

  metrics: {
    title: "Pomiar sukcesu",
    lead: "Cztery grupy wskaźników. Wybierz po jednym lub dwa z każdej grupy już w fazie 1 i mierz je bez zmian do końca.",
    groups: [
      { title: "Efektywność", icon: "timer", items: ["Czas na proces przed i po", "Zaoszczędzone godziny pracy", "Przepustowość zespołu"] },
      { title: "Jakość", icon: "badge-check", items: ["Odsetek błędów", "Satysfakcja klientów", "Liczba poprawek po przeglądzie"] },
      { title: "Wpływ na biznes", icon: "trending-up", items: ["Oszczędności kosztów", "Wzrost przychodów", "Utrzymanie klientów", "Koszt na przypadek użycia"] },
      { title: "Innowacje i adopcja", icon: "lightbulb", items: ["Nowe przypadki użycia", "Odsetek aktywnych użytkowników", "Zastosowania między działami"] }
    ]
  }
};
