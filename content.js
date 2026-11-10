/* Önálló, statikus oktatási tartalom – Windows 7 / VirtualBox NAT */
'use strict';
const LAB = {
  version:'1.0', duration:45, pointsPerQuestion:2, examCount:20,
  modules:[
    {
      id:'kezdes', number:'00', icon:'▣', title:'Laborindítás és a CMD', subtitle:'VirtualBox NAT és biztonságos munkakörnyezet', pages:'5. oldal', minutes:20,
      goals:['A VirtualBox NAT beállításának ellenőrzése','CMD indítása Windows 7 alatt','Bizonyítékok gyűjtése'],
      theory:[
        {title:'Mi a parancssor?',body:`A <strong>CMD.EXE</strong> a Windows parancsértelmezője. Egyszerű szöveges parancsokkal megvizsgálhatjuk a hálózatot, fájlokat, felhasználói fiókokat és a rendszer állapotát. Nem minden parancs igényel rendszergazdai jogosultságot. A <code>Win + R</code> → <code>cmd</code> az általános parancssort indítja.`},
        {title:'A mi laborunk topológiája',body:`<strong>Egyetlen hálózati adapter</strong> van a Windows 7 virtuális gépben, amely a VirtualBox <strong>NAT</strong> hálózati módját használja. A várt vendégcím <code>10.0.2.15</code>, a maszk <code>255.255.255.0</code>, az alapértelmezett átjáró <code>10.0.2.2</code>. A VirtualBox NAT DNS-proxyja jellemzően <code>10.0.2.3</code>, de a tényleges DNS a konfigurációtól függhet. Ezeket <strong>automatikusan, DHCP-vel</strong> kapja a kliens; nem szükséges kézzel statikusra beállítani.`},
        {title:'A labor biztonsági szabálya',body:`Mielőtt rendszergazdai beállítást módosítanál, készíts VirtualBox-pillanatképet. A tűzfal teljes kikapcsolása, az IP-cím kézi átállítása és az alapvető szolgáltatások letiltása <strong>nem feladat</strong> ebben az egykártyás NAT-laborban. A weboldal nem hajt végre Windows-parancsokat: azokat neked kell a vendéggépen futtatni.`}
      ],
      steps:[
        {title:'Ellenőrizd a virtuális hálózatot',kind:'GUI',instruction:'Állítsd le a Windows 7 VM-et, majd VirtualBox → Beállítások → Hálózat → Adapter 1. Jelöld be a Hálózati kártya engedélyezése opciót, és a Csatlakoztatva mezőben válaszd a NAT lehetőséget. A 2–4. adapter maradjon kikapcsolva.',expected:'Pontosan egy aktív adapter: Adapter 1 / NAT.',hint:'A NAT és a NAT Network nem ugyanaz. Itt az egyszerű NAT mód szükséges.'},
        {title:'Készíts visszaállítási pontot a VM-ben',kind:'GUI',instruction:'A VirtualBox kezelőablakában készíts pillanatképet (Pillanatképek / Snapshots), például „CMD-labor-kezdés” néven. Indítsd el a Windows 7 rendszert.',expected:'Van visszatérési lehetőséged, ha egy parancs nem a vártnak megfelelően működne.',hint:'A VirtualBox-pillanatkép a virtuális gép állapotáról készül, nem azonos a Windows rendszer-visszaállítási pontjával.'},
        {title:'Nyisd meg a Windows 7 parancssorát',kind:'CMD',instruction:'A vendéggépen nyomd le a Win+R billentyűket, gépeld be a parancsot, és nyomj Entert.',cmd:'cmd',expected:'Megjelenik a fekete parancssori ablak, benne pl. C:\\Users\\Diak>.'},
        {title:'Kérj segítséget a CMD-től',kind:'CMD',instruction:'Tanulmányozd az elérhető parancsok listáját, majd a parancshoz tartozó saját súgót.',cmd:'help\nipconfig /?',expected:'Látod a parancsokat és az ipconfig kapcsolóinak jelentését.'}
      ],
      mini:[
        {q:'Melyik VirtualBox hálózati módot használjuk?',a:['Belső hálózat','NAT','Csak gazdagép'],correct:1,why:'Egy adapter van, és NAT biztosítja az internetelérést.'},
        {q:'Melyik parancs nyitja meg a Windows parancsértelmezőjét?',a:['cmd','regedit','services.msc'],correct:0,why:'A cmd a CMD.EXE parancsértelmezőt indítja.'},
        {q:'Miért készítünk pillanatképet?',a:['Gyorsabb lesz az internet','Módosítás után visszaállítható a VM','Megváltozik az IP-cím'],correct:1,why:'A VM előző állapota egyszerűen visszaállítható.'}
      ]
    },
    {
      id:'halozat',number:'01',icon:'↗',title:'IP, MAC és DHCP',subtitle:'Hálózati beállítások lekérdezése és címmegújítás',pages:'5–7. oldal',minutes:35,
      goals:['IPv4, maszk, átjáró, DNS azonosítása','MAC-cím megtekintése és fájlba írása','DHCP-bérlet megújítása'],
      theory:[
        {title:'IPv4-cím, maszk, átjáró',body:`Az IPv4-cím a hálózati eszköz azonosítására szolgál. A <code>255.255.255.0</code> maszk 24 bites hálózati előtagot jelent (<code>/24</code>). A <code>10.0.2.15</code> cím ebben a környezetben a Windows vendégé, a <code>10.0.2.2</code> a VirtualBox NAT átjárója. A <strong>MAC-cím</strong> a hálózati adapter fizikai/csatolati szintű címe, rendszerint 12 hexadecimális karakterből áll.`},
        {title:'Mi a DHCP?',body:`A DHCP a hálózati konfigurációt automatikusan biztosítja. Az <code>ipconfig /release</code> elengedi a kapott IPv4-bérletet, az <code>ipconfig /renew</code> új bérletet kér. A kettő között átmenetileg megszűnhet az internetelérés. Ne változtasd meg kézzel a NAT-os IP-címet.`},
        {title:'Átirányítás és csővezeték',body:`A <code>&gt;</code> a kimenetet fájlba írja (felülírhatja a fájlt). A <code>&gt;&gt;</code> hozzáfűz. A <code>|</code> átadja egy parancs kimenetét egy másiknak. Mivel a magyar Windows kimenetében eltérnek az oszlopnevek, a MAC-címek mentéséhez inkább a nyelvfüggetlen <code>getmac</code> parancsot használjuk.`}
      ],
      steps:[
        {title:'Kérdezd le a teljes TCP/IP konfigurációt',cmd:'ipconfig /all',instruction:'Keresd meg az aktív Helyi kapcsolat / Local Area Connection adaptert. Jegyezd fel az IPv4-címet, a maszkot, az alapértelmezett átjárót, a DHCP állapotát és a DNS-kiszolgálót.',expected:'IPv4: 10.0.2.15; maszk: 255.255.255.0; átjáró: 10.0.2.2. A DNS beállítását a géped tényleges kimenete alapján írd le.',hint:'Ha több hálózati sort látsz, ne a Tunnel adaptert vagy a loopbacket válaszd.'},
        {title:'Mentsd el a MAC-címeket',cmd:'getmac /v > "%USERPROFILE%\\Desktop\\mac.txt"\ntype "%USERPROFILE%\\Desktop\\mac.txt"',instruction:'A parancs a Windows 7 asztalára írja a mac.txt állományt, majd megjeleníti annak tartalmát. Nyisd meg a fájlt Jegyzettömbbel is.',expected:'Az Asztalon létrejött a mac.txt, amely hálózati adaptereket és MAC-címeket tartalmaz.',hint:'A forrásanyag angol nevű mezőre szűr. Magyar Windows 7-nél a getmac megbízhatóbb.'},
        {title:'Próbáld ki az alternatív hálózati lekérdezést',cmd:'netsh interface ip show config',instruction:'Keresd az IPv4-beállításokat, majd hasonlítsd össze az ipconfig /all eredményével.',expected:'Az aktív adapter hálózati konfigurációja látszik.'},
        {title:'Engedd el a DHCP-bérletet',cmd:'ipconfig /release',instruction:'Kizárólag a Windows 7 virtuális gép helyi konzolján futtasd. Vedd észre, mi változott az internetelérésben és a hálózati címen.',expected:'Átmenetileg megszűnik a korábbi DHCP-cím.',hint:'Nem távoli asztali kapcsolaton végezzük! A következő lépés azonnal helyreállítja.'},
        {title:'Kérj új hálózati konfigurációt',cmd:'ipconfig /renew\nipconfig /all',instruction:'Hasonlítsd össze a kiinduló és a megújított adatokat. Lehet, hogy ugyanazt a címet kapod vissza.',expected:'A NAT adapter ismét működik; a várt IPv4-cím 10.0.2.15.',hint:'Ha nincs cím, ellenőrizd a VirtualBox NAT adaptert, és indítsd újra a vendéget.'}
      ],
      mini:[
        {q:'Melyik parancs mutatja meg a DNS-t, az átjárót és a MAC-címet is?',a:['ipconfig /all','cls','ping'],correct:0,why:'Az /all részletes adapteradatokat ír ki.'},
        {q:'Mit tesz a > operátor?',a:['Újraindítja a gépet','Fájlba irányítja a kimenetet','Megváltoztatja a maszkot'],correct:1,why:'A szabványos kimenetet fájlba irányítja.'},
        {q:'Mi a helyes sorrend DHCP-megújításkor?',a:['/renew, /release','/release, /renew','/all, /flushdns'],correct:1,why:'Először elengedjük, utána új bérletet kérünk.'}
      ]
    },
    {
      id:'diagnosztika',number:'02',icon:'◎',title:'ARP, ping és DNS',subtitle:'Kapcsolat- és névfeloldási hibakeresés',pages:'7–8. oldal',minutes:35,
      goals:['ARP-tábla értelmezése','NAT átjáró elérésének ellenőrzése','DNS névfeloldás vizsgálata'],
      theory:[
        {title:'ARP – IPv4-címhez MAC-cím',body:`Az ARP-tábla a helyi linken használt IPv4-címek és a hozzájuk rendelt fizikai címek összerendelését tartalmazza. Az <code>arp -a</code> nem feltétlenül mutat minden eszközt: csak a megismert/megőrzött bejegyzéseket. NAT-környezetben az átjáró válasza a VirtualBox emulációjától is függhet.`},
        {title:'Ping – kapcsolatvizsgálat',body:`A <code>ping</code> ICMP visszhangkérelmet küld. A sikeres válasz jó jel, de a sikertelen ping <strong>nem bizonyítja</strong>, hogy az eszköz vagy a webhely elérhetetlen: tűzfal és ICMP-szűrés is okozhatja. A Windows 7-en a <code>-n 4</code> négy kérést jelent.`},
        {title:'DNS – név és IP-cím kapcsolata',body:`Az <code>nslookup</code> a DNS névfeloldását vizsgálja. Például az <code>example.com</code> névhez a DNS IPv4/IPv6 címeket adhat vissza. A fordított lekérdezéshez IP-címet írunk. Mivel a nyilvános webes címek változhatnak, nem ragaszkodunk egy előre megadott külső IP-címhez.`}
      ],
      steps:[
        {title:'Olvasd ki az ARP-táblát',cmd:'arp -a',instruction:'Vizsgáld meg a címeket és a típusokat. Keress dinamikus bejegyzést.',expected:'Megjelenik az ARP-tábla, amely az aktuálisan ismert címtársításokat sorolja.'},
        {title:'Teszteld a NAT átjárót',cmd:'ping -n 4 10.0.2.2',instruction:'Jegyezd fel, hogy 4 csomagból hányra érkezett válasz.',expected:'A VirtualBox NAT-átjáró sok beállításban válaszol, de ha nem, előbb a konfigurációt és a tényleges hálózati kapcsolatot vizsgáld.'},
        {title:'Vizsgáld meg az internetkapcsolatot IP alapján',cmd:'ping -n 4 1.1.1.1',instruction:'Hasonlítsd össze a NAT átjáró és a külső IP válaszát. A tűzfal/ICMP miatt a sikertelenség önmagában nem végleges bizonyíték.',expected:'Látod a visszhangválaszokat vagy a kapcsolat/ICMP korlátozását.'},
        {title:'Ellenőrizd a névfeloldást',cmd:'nslookup example.com',instruction:'Írd fel, milyen DNS-kiszolgáló válaszolt. Figyeld meg a kapott címet/címeket.',expected:'A DNS legalább egy címet ad vissza, ha működik a névfeloldás.'},
        {title:'Végezz fordított DNS-lekérdezést',cmd:'nslookup 1.1.1.1',instruction:'Figyeld meg, hogy visszakapsz-e DNS-nevet. Az eredmény a külső szolgáltató rekordjaitól függ.',expected:'A parancs válaszolhat névvel, vagy jelezheti, hogy nincs megfelelő rekord.'},
        {title:'Különítsd el a hibák típusát',cmd:'ipconfig /all\nping -n 2 10.0.2.2\nnslookup example.com',instruction:'Írj rövid hibakeresési sorrendet: 1. IP-cím, 2. átjáró, 3. DNS. Ha az IP működik, de név nem, gyanakodj DNS-hibára.',expected:'Három mondatos diagnosztikai összefoglaló.'}
      ],
      mini:[
        {q:'Mire szolgál az arp -a?',a:['Futó feladatok listázására','IP–MAC társítások megjelenítésére','DNS gyorsítótár törlésére'],correct:1,why:'Az ARP a linkrétegbeli címtársításokat jeleníti meg.'},
        {q:'Melyik a labor alapértelmezett NAT átjárója?',a:['10.0.2.15','255.255.255.0','10.0.2.2'],correct:2,why:'10.0.2.2 a VirtualBox alap NAT átjárója.'},
        {q:'Ha egy ping nem válaszol, ebből biztosan következik, hogy nincs internet?',a:['Igen','Nem, ICMP-szűrés is okozhatja','Csak DHCP esetén'],correct:1,why:'A sikertelen ping nem bizonyít teljes hálózati kiesést.'}
      ]
    },
    {
      id:'folyamatok',number:'03',icon:'≡',title:'Fiókok, folyamatok, szolgáltatások',subtitle:'Lekérdezés és célzott, biztonságos folyamatkezelés',pages:'8–10. oldal',minutes:40,
      goals:['Helyi felhasználók listázása','Futó folyamatok megfigyelése','Szolgáltatások állapotának értelmezése'],
      theory:[
        {title:'Felhasználó ≠ folyamat ≠ szolgáltatás',body:`A <code>net user</code> a helyi fiókokat listázza. A <code>tasklist</code> futó folyamatokat mutat, jellemzően PID-del (Process ID), azaz folyamatazonosítóval. Az <code>sc query</code> szolgáltatásokat kérdez le, az <code>sc queryex</code> kibővített adatokat is közölhet.`},
        {title:'Csak saját tesztfolyamatot állíts le!',body:`A forrásban szereplő általános <code>taskkill /pid</code> parancsot itt <strong>csak a saját magad által elindított Jegyzettömbön</strong> próbáld ki. Ne állíts le ismeretlen PID-et, rendszerszolgáltatást vagy biztonsági programot. A <code>sc pause</code>/<code>sc continue</code> nem minden szolgáltatásnál támogatott – ezért csak a jelentésüket tanuljuk meg.`}
      ],
      steps:[
        {title:'Nézd meg a helyi felhasználókat',cmd:'net user',instruction:'Hány felhasználói fiókot látsz? Miben különbözik a saját fiókod az Administrator fióktól?',expected:'A Windows 7 helyi felhasználói jelennek meg.'},
        {title:'Listázd a futó folyamatokat',cmd:'tasklist',instruction:'Keress néhány ismert folyamatot, például explorer.exe vagy csrss.exe. Ezeket ne állítsd le.',expected:'Folyamatnév, PID, memóriahasználat és további információk.'},
        {title:'Indíts teszteléshez Jegyzettömböt',cmd:'start notepad.exe\ntasklist /fi "imagename eq notepad.exe"',instruction:'Nyiss egy új Jegyzettömböt, és szűrj rá a folyamatára. A feladat előtt ne legyen nem mentett jegyzeted.',expected:'A listában a notepad.exe látható.'},
        {title:'Csak a saját Jegyzettömb-példányodat zárd be',cmd:'tasklist /fi "imagename eq notepad.exe"',instruction:'A kilistázott, saját magad által megnyitott notepad.exe PID-jét olvasd ki, és zárd be a <code>taskkill /pid SAJAT_PID</code> paranccsal. A SAJAT_PID helyére a tényleges számodat írd.',expected:'A saját teszt-Jegyzettömb bezárul, más alkalmazás nem.',hint:'Példa szintaxis: taskkill /pid 4321 – a szám csak példa, nem átmásolható fix PID.'},
        {title:'Nézd meg a szolgáltatásokat',cmd:'sc queryex',instruction:'Keress RUNNING és STOPPED állapotú szolgáltatást. Ne állíts le semmit.',expected:'A szolgáltatások állapota és kiegészítő adatai listázódnak.'},
        {title:'Ellenőrizz két konkrét szolgáltatást',cmd:'sc query spooler\nsc query winmgmt',instruction:'Jegyezd fel a nyomtatási sor és a Windows Management Instrumentation állapotát. A Winmgmt szolgáltatást nem kapcsoljuk ki.',expected:'A STOPPED és RUNNING állapotot a tényleges kimenet alapján azonosítod.'}
      ],
      mini:[
        {q:'Mit jelent a PID?',a:['Hálózati port száma','Folyamatazonosító','IP-cím fajtája'],correct:1,why:'A Process ID az egyes futó folyamatok azonosítója.'},
        {q:'Melyik parancs sorolja fel a helyi fiókokat?',a:['net user','tasklist','arp -a'],correct:0,why:'A net user a helyi felhasználókat listázza.'},
        {q:'Melyik folyamatot szabad leállítani ebben a feladatban?',a:['Ismeretlen rendszerfolyamatot','A saját tesztelésre indított Jegyzettömböt','Windows biztonsági szolgáltatást'],correct:1,why:'Csak az előre megtervezett, saját tesztfolyamatot zárjuk be.'}
      ]
    },
    {
      id:'fajlok',number:'04',icon:'▤',title:'Rendszerinformációk és fájlkezelés',subtitle:'CMD fájlparancsok, rendszer- és illesztőprogram-lekérdezés',pages:'10–11. oldal',minutes:40,
      goals:['systeminfo és driverquery kipróbálása','Biztonságos saját munkamappa készítése','Másolás, átnevezés és könyvtárfa'],
      theory:[
        {title:'Rendszeradatok és driverek',body:`A <code>systeminfo</code> a Windows verzióját, telepítési adatokat, memóriát és egyéb rendszertulajdonságokat mutathat meg. A <code>driverquery</code> az illesztőprogramokat listázza. A kimenet eltérhet a Windows 7 kiadásától és a VirtualBox vendégkiegészítőitől függően.`},
        {title:'A legfontosabb fájlparancsok',body:`<code>dir</code> – listázás; <code>cd</code> – mappaváltás; <code>md</code> – mappa létrehozása; <code>ren</code> – átnevezés; <code>copy</code> – fájlmásolás; <code>move</code> – mozgatás; <code>tree</code> – könyvtárfa; <code>type</code> – szöveges fájl tartalma; <code>del</code> – fájltörlés; <code>rd</code> – mappatörlés. Kizárólag a saját <code>%USERPROFILE%\\Desktop\\CMDLAB</code> mappádon dolgozz.`},
        {title:'A forrás további parancsai',body:`A <code>more</code> lapozható megjelenítést, az <code>attrib</code> attribútumlekérdezést, a <code>subst</code> virtuális meghajtóbetűjel-hozzárendelést, a <code>chkdsk</code> lemezellenőrzést kínálja. Az <code>at</code> időzítő parancs régi megoldás; a Windows 7-en inkább a <code>schtasks</code> használatos. A veszélyesebb kapcsolókat csak a súgóban vizsgáljuk meg.`}
      ],
      steps:[
        {title:'Ismerd meg a gépedet',cmd:'systeminfo',instruction:'Jegyezd fel az operációs rendszer pontos nevét, a rendszerindítás idejét, a memóriát és a gép nevét.',expected:'A Windows 7 rendszer jellemző adatai megjelennek.'},
        {title:'Listázd az illesztőprogramokat',cmd:'driverquery /fo table',instruction:'Találj három illesztőprogramot a felsorolásban. Írd le a nevüket.',expected:'Táblázatos driverlista jelenik meg.'},
        {title:'Hozd létre a saját munkaterületedet',cmd:'md "%USERPROFILE%\\Desktop\\CMDLAB"\ncd /d "%USERPROFILE%\\Desktop\\CMDLAB"\nmd munka\ndir',instruction:'A saját Asztalodon dolgozz; ez a következő fájlparancsok próbaterülete.',expected:'Megjelenik a CMDLAB mappa és benne a munka almappa.'},
        {title:'Hozz létre és olvass vissza egy szövegfájlt',cmd:'echo Elso CMD gyakorlat > jegyzet.txt\ntype jegyzet.txt\necho Masodik sor >> jegyzet.txt\ntype jegyzet.txt',instruction:'Figyeld meg a > és >> közötti különbséget.',expected:'A második megjelenítés már két sort tartalmaz.'},
        {title:'Másolj, nevezz át és mozgass fájlt',cmd:'copy jegyzet.txt masolat.txt\nren masolat.txt ujnev.txt\nmove ujnev.txt munka\\\ntree /f',instruction:'A fájlok csak a saját tesztmappádban változzanak.',expected:'A munka almappában van ujnev.txt; a könyvtárfa megmutatja.'},
        {title:'Vizsgálj meg további CMD-eszközöket',cmd:'dir /?\nattrib jegyzet.txt\nchkdsk /?\nschtasks /?\ncls',instruction:'A chkdsk és schtasks esetén csak a súgót kérjük le. A cls törli a konzol képernyőjét, nem a fájlokat.',expected:'A súgók és attribútumok megjelennek; a végén a képernyő kitisztul.'},
        {title:'Takaríts csak a saját mappádban',cmd:'cd /d "%USERPROFILE%\\Desktop\\CMDLAB"\ndel jegyzet.txt\ndel munka\\ujnev.txt\nrd munka\ndir',instruction:'Ellenőrizd, hogy valóban a CMDLAB mappában vagy. A kísérleti fájlokat töröld, de magát a CMDLAB mappát hagyd meg a későbbi feladatokhoz.',expected:'A tesztfájlok eltűntek; a CMDLAB mappa megmaradt.'}
      ],
      mini:[
        {q:'Melyik parancs írja ki a mappa tartalmát?',a:['dir','md','del'],correct:0,why:'A dir listázza a fájlokat és mappákat.'},
        {q:'Mi a >> jelentése?',a:['Kimenet hozzáfűzése fájlhoz','Fájl törlése','A program bezárása'],correct:0,why:'A >> az eredményt a fájl végére fűzi.'},
        {q:'Melyik parancs listázza a drivereket?',a:['net user','driverquery','nslookup'],correct:1,why:'A driverquery illesztőprogram-információkat ad.'}
      ]
    },
    {
      id:'admin',number:'05',icon:'⚙',title:'Rendszergazdai parancssor és netsh',subtitle:'Jogosultságok, DHCP és DNS beállítások biztonságosan',pages:'11–13. oldal',minutes:35,
      goals:['Emelt jogosultságú parancssor indítása','Adapter nevének azonosítása','Statikus és DHCP konfiguráció különbsége'],
      theory:[
        {title:'Mi az UAC?',body:`Az <strong>UAC</strong> (felhasználói fiókok felügyelete) a jogosultságemelést ellenőrzi. Windows 7-ben: Start → <em>Minden program</em> → <em>Kellékek</em> → <em>Parancssor</em> → jobb kattintás → <em>Futtatás rendszergazdaként</em>. A felugró kérdést csak tudatosan engedélyezd.`},
        {title:'A hálózati konfigurációt most nem állítjuk statikusra',body:`A forrás statikus IP- és DNS-parancsokat is tárgyal. Itt a NAT vendégnek a DHCP által kiosztott <code>10.0.2.15</code> címet kell megtartania. A <code>netsh interface ip set address ... source=static</code> szintaxist <strong>értelmezzük, de nem futtatjuk</strong>. A DHCP-visszaállító parancsokat sem kell rutinszerűen végrehajtani: csak akkor használhatók, ha a hálózat valóban át lett állítva és az adapter neve pontosan ismert.`},
        {title:'Adapternevek',body:`Magyar Windows 7 rendszeren gyakran <code>Helyi kapcsolat</code>, angol telepítésnél <code>Local Area Connection</code> a név. Parancsban ne feltételezz előre adapternevet; mindig olvasd ki a rendszerből. Több NAT-adapterre nincs szükség.`}
      ],
      steps:[
        {title:'Nyiss rendszergazdai CMD-ablakot',kind:'GUI',instruction:'Start → Minden program → Kellékek → Parancssor → jobb egérgomb → Futtatás rendszergazdaként. Fogadd el az UAC figyelmeztetését, ha valóban a rendszergazdai CMD-t indítottad.',expected:'Az ablak címsorában megjelenik a rendszergazdai jelzés.',hint:'Ha nem rendelkezel rendszergazdai jelszóval, kérd az oktató segítségét.'},
        {title:'Azonosítsd az adapter nevét',cmd:'netsh interface show interface\nnetsh interface ipv4 show config',instruction:'Írd fel a NAT kártya pontos megjelenített nevét.',expected:'A kapcsolat neve és a DHCP / IPv4 adatok olvashatók.'},
        {title:'Tanuld meg a statikus IP-parancs alakját',kind:'ELMÉLET – NE FUTTASD',cmd:'netsh interface ip set address name="Helyi kapcsolat" source=static addr=10.0.2.15 mask=255.255.255.0 gateway=10.0.2.2 gwmetric=1',instruction:'Csak elemezd: mi az adapter neve, a címe, a maszk, az átjáró és a gateway metric? Ne másold a CMD-be! Egyetlen NAT-adapteren a kézi beállítás megszakíthatja a DHCP-alapú hálózati működést.',expected:'Szóban meg tudod nevezni az öt paraméter szerepét. Ez nem végrehajtandó parancs.',hint:'A bemutatott Helyi kapcsolat név csak magyar nyelvű rendszerben lehet megfelelő.'},
        {title:'Tanuld meg a DNS-beállító parancsok jelentését',kind:'ELMÉLET – NE FUTTASD',cmd:'netsh interface ip set dns name="Helyi kapcsolat" source=dhcp\nnetsh interface ip delete dns name="Helyi kapcsolat" all',instruction:'Értelmezd a DHCP DNS-visszaállítását és a DNS-lista törlését. Ebben a laborban ne hajtsd végre őket, mert a DNS-hez nyúlás hibát okozhat.',expected:'Tudod, hogy a DNS-kiszolgáló azonosítása nem ugyanaz, mint annak módosítása.'},
        {title:'Ellenőrizd, hogy a NAT-os IP megmaradt',cmd:'ipconfig /all',instruction:'Ellenőrizd, hogy az adapter IPv4-címe továbbra is a várt 10.0.2.15, és DHCP használatban van-e.',expected:'A 10.0.2.15 cím és a 10.0.2.2 átjáró szerepel a hálózati adatok között.'}
      ],
      mini:[
        {q:'Melyik menüponttal indítod emelt jogosultsággal a CMD-t?',a:['Futtatás rendszergazdaként','Tulajdonságok → Szín','Futtatás csökkentett módban'],correct:0,why:'A jobb kattintás után választható a rendszergazdai futtatás.'},
        {q:'Kell-e itt statikusan beállítanod a 10.0.2.15 címet?',a:['Igen, minden alkalommal','Nem, DHCP osztja ki','Csak a dnslookup miatt'],correct:1,why:'A VirtualBox NAT-os DHCP biztosítja a címet.'},
        {q:'Miért kell lekérdezni az adapter pontos nevét?',a:['Mert a parancsok azzal hivatkoznak rá','Mert ez határozza meg a MAC címet','Mert automatikusan adminná tesz'],correct:0,why:'A netsh parancsokban pontos csatolónév szükséges.'}
      ]
    },
    {
      id:'biztonsag',number:'06',icon:'◆',title:'Tűzfal, szolgáltatások, fiókok',subtitle:'Állapotlekérdezés, felelős adminisztráció',pages:'13. oldal',minutes:35,
      goals:['Tűzfalprofil állapotának lekérdezése','Szolgáltatásindítás jelentése','Próba-fiók létrehozása és törlése'],
      theory:[
        {title:'A tűzfal állapotát ellenőrzöd, nem kapcsolod ki',body:`A <code>netsh advfirewall show allprofiles</code> megmutatja az egyes profilok állapotát. A teljes tűzfalkikapcsolás nem része a gyakorlatnak. Ha egy vizsgálatot a tűzfal akadályoz, először a konkrét szabályt és a hálózati profilt vizsgáljuk meg.`},
        {title:'Szolgáltatásvezérlés',body:`A <code>net start</code> és <code>net stop</code> szolgáltatásokat indít/leállít, ha a szolgáltatás ezt engedi és megvan a szükséges jog. Az <code>sc config</code> indítási módot állít át. A Windows Update, WMI és a Windows tűzfal szolgáltatás leállítása vagy letiltása nem biztonságos alapgyakorlat; ezért ezeket <strong>csak lekérdezzük</strong>. A <code>netsh winhttp show proxy</code> a rendszer HTTP-proxy beállítását mutatja meg.`},
        {title:'Próbafelhasználó, erős jelszó',body:`A <code>net user</code> parancs alkalmas helyi felhasználó létrehozására. Ha a parancsban a jelszó helyén <code>*</code> van, a rendszer külön kéri a jelszót, így az nem jelenik meg a parancsban. A feladat végén töröld a próbafiókot. Ne használj valódi személyes jelszót, és ne jegyezz fel jelszót a weboldalra.`}
      ],
      steps:[
        {title:'Vizsgáld meg a tűzfal profiljait',cmd:'netsh advfirewall show allprofiles',instruction:'Melyik profil aktív? Bekapcsolt állapotot látsz? A feladat nem kéri a tűzfal kikapcsolását.',expected:'Domain, Private és Public profilokra vonatkozó szabályok/állapotok látszanak.'},
        {title:'Nézd meg a proxy konfigurációt',cmd:'netsh winhttp show proxy',instruction:'Írd le, használ-e a Windows rendszerproxy-beállítást. A forrásanyag proxyimportálást is említ; itt kizárólag az olvasás a feladat.',expected:'Közvetlen elérés vagy proxyinformáció jelenik meg.'},
        {title:'Kérdezd le két fontos szolgáltatás állapotát',cmd:'sc query mpssvc\nsc query wuauserv',instruction:'Az egyik a Windows tűzfalhoz, másik a frissítésekhez kapcsolódik. NE állítsd le és NE tiltsd le őket.',expected:'A szolgáltatások aktuális RUNNING/STOPPED állapota látszik.'},
        {title:'Kérdezd le egy szolgáltatás indulási módját',cmd:'sc qc spooler',instruction:'Az sc qc paranccsal a nyomtatási várólista konfigurációja vizsgálható. Keress START_TYPE sort.',expected:'A START_TYPE értéke megjelenik. Nem szükséges szolgáltatást módosítani.'},
        {title:'Hozz létre egy ideiglenes helyi tesztfelhasználót',cmd:'net user cmdproba * /add\nnet user cmdproba',instruction:'Rendszergazdai CMD-ben futtasd. A csillag miatt a Windows biztonságosan kér jelszót. Válassz ideiglenes, erős, egyedi jelszót. A weboldalra SOHA ne írd be.',expected:'Az új cmdproba helyi felhasználó megjelenik a listában.',hint:'Ha a gép szabályzata tiltja a létrehozást, jegyezd fel a hibaüzenetet, és a feladatot nem kell megkerülni.'},
        {title:'Töröld a próba-felhasználót',cmd:'net user cmdproba /delete\nnet user',instruction:'A próbaként létrehozott cmdproba fiókot töröld. Más felhasználót ne módosíts.',expected:'A cmdproba már nem szerepel a helyi fiókok listájában.'}
      ],
      mini:[
        {q:'Mi a biztonságos első lépés tűzfalvizsgálatkor?',a:['Az összes profil kikapcsolása','Állapot lekérdezése','Windows Update letiltása'],correct:1,why:'Először megfigyelünk, csak indokolt esetben módosítunk.'},
        {q:'Mit jelent a net user cmdproba * /add parancsban a csillag?',a:['Azonnal törli a jelszót','Interaktívan kér jelszót','Jelszó nélkül adminná tesz'],correct:1,why:'A csillag miatt a Windows külön jelszóbekérést végez.'},
        {q:'Melyik paranccsal nézed meg egy szolgáltatás konfigurációját?',a:['sc qc spooler','ping spooler','taskkill spooler'],correct:0,why:'Az sc qc a szolgáltatás konfigurációját írja ki.'}
      ]
    },
    {
      id:'ellenorzes',number:'07',icon:'✓',title:'Rendszerellenőrzés és összegzés',subtitle:'SFC, jogosultságok, újraindítás súgója és záró ellenőrzés',pages:'14. oldal',minutes:30,
      goals:['SFC vizsgálati parancs értelmezése','NTFS jogosultságok lekérdezése','Záró dokumentáció készítése'],
      theory:[
        {title:'Rendszerfájlok ellenőrzése',body:`A <code>sfc /scannow</code> védett rendszerfájlokat vizsgál, és szükség esetén javításra törekszik. Hosszabb ideig is tarthat és rendszergazdai jogot kér. Oktatási célra először a <code>sfc /verifyonly</code> ellenőrző módot használjuk: ez nem javítja a fájlokat.`},
        {title:'NTFS jogosultságok',body:`A régebbi <code>cacls</code> parancs jogosultságok megjelenítésére is használható. Windows 7 alatt az <code>icacls</code> korszerűbb lehetőség. A gyakorlatban <strong>csak lekérdezzük</strong> a saját CMDLAB mappa hozzáféréseit, nem módosítjuk a rendszerkönyvtárak ACL-jeit.`},
        {title:'Leállítás és időzítés',body:`A <code>shutdown</code> parancs képes leállítani vagy újraindítani a gépet. Most kizárólag a <code>shutdown /?</code> súgóját tanulmányozzuk. A <code>chkntfs</code> a következő rendszerindításkor esedékes lemezellenőrzések kezeléséhez kapcsolódik; itt szintén csak a súgóját nézzük meg.`}
      ],
      steps:[
        {title:'Vizsgáld a Windows rendszerfájljait javítás nélkül',cmd:'sfc /verifyonly',instruction:'Rendszergazdai parancssorban indítsd el. Várd meg az ellenőrzés végét; jegyezd fel a rövid összefoglalót.',expected:'A rendszerfájlellenőrző eredményt ad. Ez nem végez automatikus javítást.',hint:'A vizsgálat néhány percig vagy tovább is tarthat. Ha nincs rá idő, a parancs jelentését is értékelhetitek tanár által.'},
        {title:'Nézd meg a saját mappa NTFS-jogosultságait',cmd:'cacls "%USERPROFILE%\\Desktop\\CMDLAB"\nicacls "%USERPROFILE%\\Desktop\\CMDLAB"',instruction:'Hasonlítsd össze a két parancs kimenetét. Csak olvasás történik.',expected:'Felhasználók/csoportok és hozzáférési jogosultságok látszanak.'},
        {title:'Olvasd el a biztonságos súgókat',cmd:'shutdown /?\nchkntfs /?\nmore /?\nsubst /?',instruction:'A súgó alapján magyarázd el a shutdown /r, /s és /a jelentését. Semmilyen leállítást ne indíts el.',expected:'A parancsok súgószövege látszik; a Windows tovább fut.'},
        {title:'Készíts rövid, saját laborjelentést',cmd:'ipconfig /all > "%USERPROFILE%\\Desktop\\CMDLAB\\halozat.txt"\nsysteminfo > "%USERPROFILE%\\Desktop\\CMDLAB\\rendszer.txt"\ngetmac /v > "%USERPROFILE%\\Desktop\\CMDLAB\\mac.txt"\ndir "%USERPROFILE%\\Desktop\\CMDLAB"',instruction:'Ellenőrizd a három jelentésfájl meglétét. A fájlokat a tanár kérésére mutasd be a VM-en; az esetleg bennük található adatokat ne töltsd fel nyilvános tárhelyre.',expected:'A CMDLAB könyvtárban három olvasható szöveges állomány található.'},
        {title:'Végezz utolsó hálózati ellenőrzést',cmd:'ipconfig /all\nnslookup example.com\nnetsh advfirewall show allprofiles',instruction:'Ellenőrizd: megmaradt a DHCP, a várt 10.0.2.15 cím, van névfeloldás, és nincs tudatosan kikapcsolt tűzfalprofil.',expected:'A virtuális labor működő és dokumentált állapotban maradt.'}
      ],
      mini:[
        {q:'Melyik SFC kapcsoló ellenőriz javítás nélkül?',a:['/verifyonly','/scannow','/restore'],correct:0,why:'A /verifyonly nem végez javítást.'},
        {q:'Melyik parancs alkalmas NTFS jogosultságok olvasására?',a:['icacls','nslookup','arp'],correct:0,why:'Az icacls a fájlok/mappák ACL-jét kezeli és listázza.'},
        {q:'Miért használjuk a shutdown /? parancsot?',a:['Azonnali újraindításhoz','A súgó megtekintéséhez','Az IP megújításához'],correct:1,why:'A /? a súgót jeleníti meg, nem indít leállítást.'}
      ]
    }
  ]
};
/* Minden kérdés pontosan egy helyes választ tartalmaz; évfolyamnak megfelelő megfogalmazás. */
LAB.questions = [
['Milyen operációs rendszeren dolgozik a tanuló?',['Windows 7','Windows 11','Linux Ubuntu','macOS'],0,'A labor Windows 7 vendégrendszerre készült.'],
['Hány aktív hálózati kártyát használ a Windows 7 VM?',['Kettőt','Egyet','Hármat','Négyet'],1,'A VirtualBoxban egyetlen NAT adapter szükséges.'],
['Mi a NAT adapter várt IPv4-címe?',['192.168.1.1','10.0.2.15','10.0.2.2','127.0.0.1'],1,'A vendég Windows IP-címe alapértelmezésben 10.0.2.15.'],
['Melyik NAT-átjárócímet várjuk?',['10.0.2.2','10.0.2.15','8.8.8.8','255.255.255.0'],0,'A VirtualBox alap NAT-átjárója 10.0.2.2.'],
['Milyen hálózati módra van szükség?',['Bridge','Belső hálózat','NAT','Csak gazdagép'],2,'A NAT mód biztosítja a vendég internetelérését.'],
['Mi állítja be automatikusan a vendég IP-paramétereit?',['DHCP','FTP','HTTP','ARP'],0,'A DHCP osztja a címeket és egyéb hálózati adatokat.'],
['Mi a 255.255.255.0 maszk CIDR-alakja?',['/16','/32','/8','/24'],3,'255.255.255.0 = 24 darab 1-es bit.'],
['Mi a Windows parancsértelmezőjének neve?',['calc.exe','cmd.exe','mspaint.exe','explorer.exe'],1,'A CMD.EXE értelmezi a Windows parancssori utasításait.'],
['Melyik gyorsbillentyű nyitja a Futtatás párbeszédablakot?',['Ctrl+C','Alt+F4','Win+R','Win+L'],2,'A Win+R a Futtatás ablakot nyitja meg.'],
['Mit ír ki az ipconfig /all?',['Csak időt','Részletes adapteradatokat','Felhasználók jelszavát','Folyamat-PID-eket'],1,'Az /all kiegészíti az alap hálózati információkat.'],
['Mire szolgál a getmac parancs?',['MAC-címek megjelenítésére','IP-cím statikusra állítására','DNS törlésére','Lemezformázásra'],0,'A getmac hálózati adapterek fizikai címeit jeleníti meg.'],
['Mit jelent a MAC-cím?',['Távoli webcím','Hálózati csatoló fizikai azonosítója','Felhasználónév','Alhálózati maszk'],1,'A MAC-cím kapcsolati rétegbeli azonosító.'],
['Mit tesz a > operátor?',['Fájlba irányítja a kimenetet','Jelszót kér','Új adaptert hoz létre','Pingel'],0,'A kimenetet fájlba irányítja, általában felülír.'],
['Mit tesz a >> operátor?',['Törli a fájlt','Hozzáfűz a fájlhoz','Leállítja a Windows-t','DHCP-t kér'],1,'A >> az új kimenetet a meglévő fájl végére írja.'],
['Mire szolgál a | jel?',['Egyik parancs kimenetét továbbadja a másiknak','Új fájlt hoz létre','Rendszergazdává tesz','Tűzfalat aktivál'],0,'A pipe összekapcsolja a parancsok ki- és bemenetét.'],
['Melyik parancs mutatja egy szöveges fájl tartalmát?',['dir','type','move','ren'],1,'A type szöveges állomány tartalmát jeleníti meg.'],
['Melyik parancs kér új DHCP-bérletet?',['ipconfig /release','ipconfig /renew','ipconfig /displaydns','ipconfig /all'],1,'A /renew új DHCP-konfigurációt kér.'],
['Mi történik az ipconfig /release futtatásakor?',['Átmenetileg elengedheti a DHCP-címet','Kikapcsolja a gépet','Fiókot hoz létre','Frissíti az órát'],0,'A DHCP-bérletet elengedi, a kapcsolat megszakadhat.'],
['Miért nem állítjuk kézzel statikusra a 10.0.2.15 címet?',['Mert DHCP biztosítja a NAT-konfigurációt','Mert nincs IPv4','Mert nem létezik CMD','Mert csak Windows 10-en működik'],0,'A DHCP által kapott NAT-címet meg kell őrizni.'],
['Mit mutat az arp -a?',['Futó szolgáltatásokat','ARP-címtársításokat','Telepített drivereket','DNS zónákat'],1,'Az ARP-tábla IP–MAC társításokat tartalmazhat.'],
['Mire szolgál a ping?',['ICMP-alapú elérhetőségvizsgálatra','Felhasználó törlésére','Fájlmásolásra','Szolgáltatás tiltására'],0,'A ping visszhangkérelmeket küld.'],
['Mit jelent a ping -n 4 kapcsoló Windows alatt?',['Négy csomagot küld','Négy adaptert nyit','Négy másodpercet vár elindulás előtt','Négy fájlt hoz létre'],0,'A -n a küldendő kérések számát szabja meg.'],
['Sikertelen ping esetén mit lehet helyesen állítani?',['Biztosan nincs internet','A cél vagy a tűzfal szűrheti az ICMP-t','Elromlott a lemez','A DNS biztosan jó'],1,'Az ICMP-szűrés miatt a ping sikertelen lehet működő kapcsolat mellett is.'],
['Mit vizsgál az nslookup?',['DNS névfeloldást','MAC címek gyártóját','CPU hőmérsékletét','Windows-frissítési dátumot'],0,'Az nslookup DNS-kiszolgálóval végez lekérdezést.'],
['Mi a különbség az IP-s ping és a névfeloldás között?',['Az IP-cím alapú ellenőrzés nem igényel DNS-névfeloldást','Semmi','A ping csak adminnal fut','Az nslookup letiltja a DNS-t'],0,'IP-cím pingeléséhez nem kell a név DNS-feloldása.'],
['Mire jó a net user paraméterek nélkül?',['Helyi fiókok listázására','Pingelésre','Fájl másolásra','ARP törlésére'],0,'A net user a helyi felhasználókat jeleníti meg.'],
['Melyik parancs listázza a folyamatokat?',['tasklist','getmac','sc config','md'],0,'A tasklist futó folyamatok listáját mutatja.'],
['Mi a PID?',['Folyamatazonosító','DNS-kiszolgáló','Csoportházirend','Tűzfalszabály'],0,'A PID a Process Identifier rövidítése.'],
['Melyik parancs alkalmas egy kiválasztott folyamat leállítására?',['taskkill /pid ...','arp -a','dir','driverquery'],0,'A taskkill célzottan képes folyamatot leállítani.'],
['Milyen folyamatot szabad leállítani a laborban?',['Bármely rendszert','Saját magunk által indított Jegyzettömböt','A Windows biztonsági szolgáltatását','Bármely ismeretlen PID-et'],1,'A feladat csak saját tesztfolyamaton végezhető.'],
['Melyik parancs kérdezi le a szolgáltatás állapotát?',['sc query','mkdir','ping','rename'],0,'Az sc query a szolgáltatásadatokat jeleníti meg.'],
['Mi a RUNNING szolgáltatásállapot jelentése?',['Fut','Letiltva','Törölve','Várakozik a törlésre'],0,'A RUNNING azt jelenti, hogy a szolgáltatás fut.'],
['Mi a STOPPED jelentése?',['Leállított','Adminisztrátor','Kész IP','Átirányítás'],0,'A STOPPED azt jelzi, hogy a szolgáltatás nem fut.'],
['Miért nem állítjuk le a winmgmt szolgáltatást?',['Mert más rendszerfunkciók is függhetnek tőle','Mert ez nem szolgáltatás','Mert ezt csak Linux tudja','Mert automatikusan törli a DNS-t'],0,'A WMI leállítása több rendszerösszetevőt érinthet.'],
['Mire szolgál a systeminfo?',['Rendszeradatok lekérdezésére','Hálózati kábel cseréjére','Felhasználó jelszavának megtekintésére','Tűzfal letiltására'],0,'A systeminfo a gép operációs rendszerének adatait jeleníti meg.'],
['Mit mutat a driverquery?',['Illesztőprogramokat','Jelszavakat','Átjárók ARP-listáját','Csak órát'],0,'A driverquery driveradatokat listáz.'],
['Melyik paranccsal hozol létre mappát?',['rd','md','del','ren'],1,'Az md / mkdir új könyvtárat hoz létre.'],
['Melyik paranccsal váltasz mappát?',['cd','dir','type','cls'],0,'A cd a munkakönyvtárat módosítja.'],
['Melyik paranccsal listázod a mappa tartalmát?',['dir','ping','arp','net user'],0,'A dir listázza a mappa elemeit.'],
['Melyik paranccsal nevezel át fájlt?',['ren','copy','tree','type'],0,'A ren átnevezi a fájlt vagy mappát.'],
['Melyik paranccsal másolsz fájlt?',['copy','move','rd','cd'],0,'A copy a fájl másolatát készíti.'],
['Melyik paranccsal mozgatod a fájlt?',['move','getmac','nslookup','driverquery'],0,'A move áthelyez egy fájlt vagy mappát.'],
['Melyik paranccsal jeleníted meg a könyvtárfát?',['tree','del','help','chkdsk'],0,'A tree hierarchikus struktúrát jelenít meg.'],
['Mit tesz a cls?',['Törli a konzol képernyőjét','Törli a lemezt','Kikapcsolja az internetet','Átnevezi a gépet'],0,'A cls csak a parancsablak kijelzőjét üríti.'],
['Melyik paranccsal nézheted meg egy parancs súgóját?',['/ ?','/?','--delete','/off'],1,'A legtöbb Windows CMD-parancs a /? kapcsolót használja.'],
['Milyen jog szükséges sok rendszerbeállítás módosításához?',['Emelt rendszergazdai jog','Vendégfiók','Böngészőhiba','DNS-proxy'],0,'Sok konfigurációs művelethez emelt jogosultság kell.'],
['Mit jelent az UAC?',['Felhasználói fiókok felügyelete','DNS gyorsítótár','MAC-cím típusa','IP-maszk'],0,'Az UAC a jogosultságemelést ellenőrzi.'],
['Mit ellenőriz a netsh interface ipv4 show config?',['IPv4-beállításokat','Felhasználói jelszavakat','PDF-oldalakat','Illesztőprogramok szerzőit'],0,'Az adapter IPv4-konfigurációját jeleníti meg.'],
['Miért kell a hálózati adapter pontos neve netsh-nál?',['Erre a névre hivatkozik a parancs','Mert másképp nem lehet CMD-t indítani','Mert ez az átjáró címe','Mert ez a portszám'],0,'Az adapter pontos elnevezése szükséges a célzáshoz.'],
['Mit kérdez le a netsh advfirewall show allprofiles?',['Tűzfalprofilok állapotát','Csak MAC-címet','Windows telepítési nyelvét','Futó alkalmazások nevét'],0,'Ez a parancs a Windows tűzfal profilbeállításait listázza.'],
['Mit csinál a netsh advfirewall set allprofiles state off?',['Az összes profilon kikapcsolhatja a tűzfalat','Lekérdezi a DNS-t','Mappa létrehozása','Telepíti a frissítéseket'],0,'A gyakorlatban ezt veszélyessége miatt nem futtatjuk.'],
['Mire való az sc qc spooler?',['A szolgáltatás konfigurációjának lekérdezésére','A nyomtató összetörlésére','Az összes szolgáltatás törlésére','A Windows leállítására'],0,'Az sc qc a szolgáltatás beállításait jeleníti meg.'],
['Mit tesz a net user cmdproba * /add parancs?',['Helyi tesztfiókot hoz létre és jelszót kér','Törli a tűzfalat','IP-címet oszt ki','Kikapcsolja a gépet'],0,'A /add létrehoz, a * a jelszó külön bekérését kéri.'],
['Melyik paranccsal törlöd a kizárólag próbaként létrehozott fiókot?',['net user cmdproba /delete','net stop cmdproba','del /system cmdproba','nslookup cmdproba'],0,'A /delete eltávolítja a megadott felhasználót.'],
['Melyik paranccsal kérdezed le a WinHTTP proxy-beállítást?',['netsh winhttp show proxy','ping 10.0.2.2','getmac','net user'],0,'A netsh winhttp show proxy nem változtatja a beállítást.'],
['Melyik parancs vizsgál rendszerfájlokat javítás nélkül?',['sfc /verifyonly','sfc /scannow','shutdown /r','chkdsk /f'],0,'A /verifyonly a rendszerfájlokat csak ellenőrzi.'],
['Mire használható az sfc /scannow?',['Rendszerfájlok ellenőrzésére és szükség esetén javítására','Kizárólag DNS törlésére','Folyamatok listázására','Hálózati megosztásra'],0,'Az SFC a védett rendszerfájlok épségét vizsgálja.'],
['Mit mutathat a cacls vagy icacls?',['NTFS jogosultságokat','ICMP csomagokat','Videokártya órajelét','DNS késleltetést'],0,'A parancsok az elérési vezérlési listákat tudják megjeleníteni.'],
['Mi történik shutdown /? esetén?',['Súgó jelenik meg','Azonnal leáll a gép','Törli a virtuális merevlemezt','Bekapcsol a DHCP'],0,'A /? a parancs lehetőségeit mutatja be.'],
['Mi az ajánlott gyakorlat veszélyesebb adminisztrátori parancs előtt?',['Pillanatkép készítése','Vírusirtó letiltása','Minden fájl törlése','Tűzfal végleges kikapcsolása'],0,'A VM-pillanatkép visszaállítási lehetőséget ad.'],
['Mit jelent az, hogy a weboldal statikus GitHub Pages-en?',['HTML/CSS/JS fut a böngészőben, és nem vezérli a VM-et','A GitHub végrehajtja a CMD-parancsokat','Minden válasz automatikusan megy a tanárhoz','A kvíz csak internetkapcsolattal fut'],0,'A GitHub Pages statikus webkiszolgálást biztosít.'],
['Melyik parancs jó a kimenet több oldalon való megtekintésére?',['more','ren','net stop','attrib +r'],0,'A more oldalanként jeleníti meg a hosszú kimenetet.'],
['Mire való a chkdsk?',['Lemezrendszer ellenőrzésére','IPv4 kiosztásra','Felhasználók listázására','Tűzfal engedélyezésre'],0,'A chkdsk meghajtókat és fájlrendszerhibákat vizsgál.'],
['Melyik a korszerűbb ütemezési eszköz Windows 7-en?',['schtasks','at /?','ping /t','getmac'],0,'A schtasks az időzített feladatok korszerűbb kezelésére szolgál.'],
['Mi a különbség szolgáltatásleállítás és tűzfalprofil kikapcsolása között?',['Eltérő műveletek, a szolgáltatás állapota nem azonos a profil engedélyezettségével','Semmi','Csak a szín változik','Mindkettő DNS-t töröl'],0,'A szolgáltatás működése és a tűzfalprofil konfigurációja különböző.'],
['Ha a DNS-lekérdezés hibás, mi legyen az első lépés?',['IP, átjáró és DNS konfiguráció ellenőrzése','Teljes rendszer törlése','A tűzfal kikapcsolása minden profilon','Felhasználók törlése'],0,'A hiba okát a konfiguráció és az elérhetőség ellenőrzésével keressük.']
].map((r,i)=>({id:i+1,q:r[0],a:r[1],correct:r[2],why:r[3]}));

LAB.reference = [
 ['cmd','Parancssor indítása','Biztonságos'],['help','CMD súgó','Biztonságos'],['ipconfig /all','Teljes TCP/IP konfiguráció','Biztonságos'],['getmac /v','MAC-címek lekérdezése','Biztonságos'],['netsh interface ip show config','IPv4-konfiguráció lekérdezése','Biztonságos'],['ipconfig /release','DHCP-bérlet elengedése – rövid kapcsolatkimaradás','Körültekintéssel'],['ipconfig /renew','Új DHCP-bérlet kérése','Körültekintéssel'],['arp -a','ARP-tábla','Biztonságos'],['ping -n 4 10.0.2.2','NAT-átjáró ellenőrzése','Biztonságos'],['nslookup example.com','DNS-feloldás ellenőrzése','Biztonságos'],['net user','Helyi fiókok listája','Biztonságos'],['tasklist','Folyamatlista','Biztonságos'],['taskkill /pid SAJAT_PID','Kizárólag saját tesztfolyamat leállítása','Körültekintéssel'],['sc queryex','Szolgáltatáslista','Biztonságos'],['sc qc spooler','Szolgáltatás konfigurációja','Biztonságos'],['systeminfo','Windows rendszerinformációk','Biztonságos'],['driverquery','Illesztőprogramok','Biztonságos'],['dir','Mappa tartalma','Biztonságos'],['md','Mappa létrehozása','Csak saját mappában'],['cd','Mappaváltás','Biztonságos'],['type','Szövegfájl tartalmának kijelzése','Biztonságos'],['copy','Fájl másolása','Csak saját mappában'],['ren','Átnevezés','Csak saját mappában'],['move','Mozgatás','Csak saját mappában'],['del','Fájl törlése','Csak saját mappában'],['rd','Mappa törlése','Csak saját mappában'],['tree /f','Könyvtárfa fájlokkal','Biztonságos'],['attrib','Attribútumok','Lekérdezés javasolt'],['more','Lapozható kimenet','Biztonságos'],['cls','Konzol képernyő törlése','Biztonságos'],['chkdsk /?','Lemezellenőrzés súgó','Biztonságos'],['chkntfs /?','Indításkori lemezellenőrzés súgó','Biztonságos'],['schtasks /?','Feladatütemezés súgó','Biztonságos'],['subst /?','Virtuális meghajtó súgó','Biztonságos'],['netsh advfirewall show allprofiles','Tűzfalprofilok lekérdezése','Biztonságos'],['netsh winhttp show proxy','Proxybeállítás lekérdezése','Biztonságos'],['net user cmdproba * /add','Próbafelhasználó létrehozása','Rendszergazda'],['net user cmdproba /delete','Próbafelhasználó törlése','Rendszergazda'],['sfc /verifyonly','Rendszerfájl-ellenőrzés javítás nélkül','Rendszergazda'],['cacls "%USERPROFILE%\\Desktop\\CMDLAB"','Jogosultságok lekérdezése','Biztonságos'],['icacls "%USERPROFILE%\\Desktop\\CMDLAB"','NTFS-jogosultságok','Biztonságos'],['shutdown /?','Leállítási parancs súgó','Biztonságos']
];
