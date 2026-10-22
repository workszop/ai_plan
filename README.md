# AI w firmie: jedno zadanie na początek

Interaktywny, polski plan dla małej lub średniej firmy. Prowadzi przez cztery praktyczne fazy: **Wybór zadania**, **Test w praktyce**, **Wprowadzenie do pracy** oraz **Utrzymanie i rozwój**. Rdzeń ma dokładnie 20 działań, po pięć na fazę. Warunki decyzji są osobnym potwierdzeniem i nie zwiększają licznika działań.

- `/home/andrzey/git-claude/ai_plan/index.html` - strona w stylu Quantica Lab, bez kroku budowania, działa z `file://`
- `/home/andrzey/git-claude/ai_plan/roadmap.js` - treść faz, warunków decyzji, kontekstów bezpieczeństwa i materiałów pomocniczych
- `/home/andrzey/git-claude/ai_plan/app.js` - renderowanie, tryb przewodnika, Mój plan, zapis, backup, import, decyzje i druk
- `/home/andrzey/git-claude/ai_plan/app-core.js` - kontrakt danych, walidacja, liczniki i stabilne ID; działa jako klasyczny skrypt oraz moduł CommonJS w testach
- `/home/andrzey/git-claude/ai_plan/assets/` - logo i favicon

## Mój plan

Workbench zapisuje jedno zadanie, osobę odpowiedzialną, pożądaną poprawę, kryterium sukcesu i następny krok. Dodatkowo zachowuje fazę, notatkę, wynik lub przykład oraz kontekst zadania:

- dane osobowe lub poufne,
- wynik dla klienta lub na zewnątrz,
- kilka zespołów,
- połączenie z innym systemem,
- wpływ na ludzi, pieniądze lub dostęp do usług.

Kontekst jest pomocą nawigacyjną. Nie jest automatyczną klasyfikacją prawną ani zwolnieniem zależnym od wielkości firmy. Panel pokazuje trzy warstwy: **Podstawy**, **Gdy dotyczy** oraz **Potrzebna konsultacja specjalisty**. Podstawowe granice danych, przegląd człowieka i ręczny sposób awaryjny pozostają w rdzeniu.

## Dane i kompatybilność

Nowy plan dla MŚP korzysta z osobnego klucza `aiPlan.plan.sme.v1` i schematu 4. Stabilne ID działań mają przestrzeń `sme.*`. Stare klucze `aiPlan.plan.v3` i `aiPlan.progress.v2` są tylko odczytywane w celu pokazania ostrzeżenia i pobrania oryginalnej kopii. Nie są mapowane na nowe działania, więc stare zaznaczenia nie mogą fałszywie oznaczyć nowego zadania jako wykonanego.

Import starego backupu jest odrzucany z jasnym komunikatem, bez zmiany bieżącego planu. Import JSON ma limit 1 MB; nieznane ID, niepoprawne daty, niebezpieczne adresy i zbyt długie pola są odrzucane. Zapis działa lokalnie, bez konta i bez synchronizacji między kartami lub urządzeniami.

## Testy i diagnostyka

```bash
node /home/andrzey/git-claude/ai_plan/tests/core.test.mjs
node --check /home/andrzey/git-claude/ai_plan/app-core.js && node --check /home/andrzey/git-claude/ai_plan/app.js && node --check /home/andrzey/git-claude/ai_plan/roadmap.js
# terminal 1
python3 -m http.server 8917 --directory /home/andrzey/git-claude/ai_plan
# terminal 2
node /home/andrzey/git-claude/ai_plan/tests/browser-smoke.mjs
```

W sekcji **Diagnostyka planu** uruchom `window.ROADMAP_CHECK()`. Sonda sprawdza liczbę faz i działań, rozdział działań od warunków decyzji, sumy layoutu, kolejność osi czasu, brak em-dash, stan zapisu i brak błędów DOM. Skróty: `1`-`4` fazy, `0` góra, `P` przegląd, `R` regulacje, `?` pomoc, `Esc` zamknięcie dialogu. Tryb planu ma filtr pozostałych działań, przywracanie po czyszczeniu, bezpieczne drafty decyzji oraz drukowany snapshot całego planu.

## Zakres i ograniczenia

To narzędzie jest samooceną i przewodnikiem, nie certyfikatem zgodności, poradą prawną ani dowodem skuteczności. Screeningi DPIA, AI Act, bezpieczeństwa i polskiej ustawy wymagają kwalifikowanej oceny, aktualnego źródła i daty przeglądu. Legalne źródła i daty są utrzymywane w `/home/andrzey/git-claude/ai_plan/roadmap.js`.

Weryfikacja PDF obejmuje tylko obecność tekstu i DOM. Poprzednia rozbieżność rasteryzacji druku pozostaje znanym ograniczeniem i nie jest ponownie diagnozowana w tej zmianie. Nie wykonano badań z użytkownikami, testów wszystkich przeglądarek ani testów konfliktów wielu kart.
