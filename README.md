# CMD LAB – Windows 7 parancssori hálózati és rendszeradminisztráció

Interaktív, önállóan működő gyakorlóoldal a hálózati és rendszeradminisztráció alapjairól. A tananyag egy mellékelt PDF 5–14. oldalán szereplő témákat dolgoz át, Windows 7 és VirtualBox NAT környezethez igazítva.

## Követelmények

- Oracle VirtualBox, benne működő Windows 7 virtuális gép.
- **1 darab hálózati adapter**, kapcsolódási módja **NAT** (nem „NAT Network”).
- Alapbeállításban a Windows 7 vendég IPv4-címe: `10.0.2.15`, alhálózati maszkja: `255.255.255.0`, átjárója: `10.0.2.2`. A DNS tényleges értékét a vendégben kell ellenőrizni; gyakori a `10.0.2.3`.
- A hálózati konfiguráció **DHCP-vel** jön létre; a NAT IP-címet nem kell statikusan konfigurálni.

## GitHub Pages publikálás

1. Készíts egy új GitHub repositoryt, például `cmd-lab-win7` néven.
2. A következő négy fájlt a repository **gyökerébe** töltsd fel, a mappaszerkezet megváltoztatása nélkül:
   - `index.html`
   - `styles.css`
   - `content.js`
   - `app.js`
3. Commitold a fájlokat a `main` ágra.
4. **Settings → Pages → Build and deployment → Deploy from a branch**.
5. Branch: **main**, folder: **/(root)**, utána **Save**.
6. A publikált webhely címe jellemzően `https://FELHASZNALONEV.github.io/cmd-lab-win7/`.

Nem szükséges npm, Node, adatbázis, telepítés vagy külső szolgáltatás. A fájlok együtt helyben is megnyithatók.

## Funkciók

- 8 témakör részletes elméleti magyarázatokkal.
- 40+ lépéses, valódi Windows 7-en elvégzendő gyakorlatok; egyes adminisztrátori parancsok csak elméleti elemzésre szolgálnak.
- Másolható parancsok, megfigyelés mezők, haladáskövetés.
- 8 × 3 azonnal javított mini teszt.
- 20 kérdéses, 45 perces, 40 pontos véletlenszerű záróteszt, megjelöléssel és visszalépéssel.
- Kérdésenkénti megoldásmagyarázat, eredménytörténet, nyomtatható / PDF-ként menthető eredménylap.
- Kereshető parancsgyűjtemény és egy **csak szimulált** CMD-próba.
- A böngésző `localStorage` tárába menti az adatokat; **nem küldi őket a GitHubra vagy az oktatónak**.

## Oktatói megjegyzés

A weboldal nem lát rá a virtuális gépre, ezért a kipipált feladatok önbevallásosak. A gyakorlati teljesítés ellenőrzéséhez ajánlott a vendégrendszer bemutatása vagy a helyi kimenet ellenőrzése. A nyilvános GitHub-oldalra ne kerüljön jelszó, privát IP-konfigurációs fájl, MAC-címhez kapcsolódó személyes adat vagy más érzékeny adat.

A Windows 7 támogatása régen megszűnt. A virtuális gépet oktatási célra, elkülönítetten, megbízhatatlan weboldalak látogatása és valós fiókadatok használata nélkül ajánlott futtatni.
