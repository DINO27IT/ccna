# CCNA 2 v7.0 Switching, Routing and Wireless Essentials - Testovací Aplikace

Interaktivní webová aplikace pro procvičování všech testových otázek z oficiálního závěrečného testu **CCNA 2 v7.0 (SRWE)** ze zdroje [itexamanswers.net](https://itexamanswers.net/ccna-2-v7-0-final-exam-answers-full-switching-routing-and-wireless-essentials.html).

Aplikace je navržena a optimalizována **především pro iPhone (iOS)** v moderním stylu Apple Human Interface Guidelines, ale funguje skvěle i na iPadu a PC.

---

## 🚀 Jak aplikaci spustit

### Možnost A: Otevření přímo na počítači
Jednoduše poklepejte na soubor `index.html` ve složce projektu. Aplikace se ihned otevře v libovolném webovém prohlížeči (Chrome, Edge, Safari, Firefox).

### Možnost B: Otevření na iPhone (doporučeno)
1. Spusťte dvojklikem soubor **`spustit-server.bat`** (nebo spusťte v PowerShellu `.\spustit-server.ps1`).
2. V okně se vám zobrazí IP adresa vašeho počítače v lokální síti, například:
   ```text
   http://192.168.0.106:8080
   ```
3. Otevřete prohlížeč **Safari na svém iPhone** (musí být na stejné domácí/školní Wi-Fi síti) a zadejte tuto adresu.
4. **Tip pro nejlepší zážitek na iPhone:**
   - V Safari klepněte dole na tlačítko **Sdílet** (čtverec se šipkou nahoru).
   - Vyberte možnost **Přidat na plochu** (Add to Home Screen).
   - Aplikace se uloží jako samostatná ikona s logem CCNA a poběží na celé obrazovce bez adresního řádku prohlížeče!

---

## 🔍 Analýza duplicit a rozsah otázek

Web itexamanswers.net obsahuje 172 očíslovaných bloků otázek (čísla 1 až 174, přičemž čísla 22 a 137 byla původním autorem v číslování vynechána).

Při detailní analýze bylo zjištěno, že se na stránce nacházely **přesně 4 duplicitní otázky**, které se opakovaly dvakrát se stejným textem a správnou odpovědí:
1. **Otázka 39 a 148**: *"A junior technician was adding a route to a LAN router. A traceroute to a device on the new network revealed a wrong path and unreachable status. What should be done or checked?"*
2. **Otázka 48 a 155**: *"A network administrator is configuring a WLAN. Why would the administrator change the default DHCP IPv4 addresses on an AP?"*
3. **Otázka 77 a 145**: *"A network administrator is configuring a WLAN. Why would the administrator disable the broadcast feature for the SSID?"*
4. **Otázka 117 a 174**: *"On a Cisco 3504 WLC Summary page (Advanced > Summary), which tab allows a network administrator to configure a particular WLAN with a WPA2 policy?"*

Všechny tyto duplicity byly sloučeny a každá otázka je v aplikaci obsažena **právě jednou**.
Celkem test obsahuje **168 unikátních otázek v plném rozsahu bez jakéhokoliv ořezání**.

---

## ✨ Hlavní funkce aplikace

- **Okamžité vyhodnocení:**
  - Jakmile zvolíte odpověď, ihned vidíte, zda byla správná (zeleně s ikonou ✓) nebo špatná (červeně s ikonou ✗, přičemž správná možnost se rozsvítí zeleně).
  - U otázek s více možnostmi (např. *"Choose two"*, *"Choose three"*) můžete označit potřebný počet voleb a ověřit je najednou.
- **Automatická sekce "NEUMÍM":**
  - Kdykoliv odpovíte na otázku špatně, otázka se **automaticky uloží do sekce "NEUMÍM"**.
  - Tuto sekci si můžete kdykoliv otevřít přes horní záložku `⚠️ NEUMÍM` a procházet pouze otázky, ve kterých jste chybovali.
  - Jakmile otázku v sekci NEUMÍM zvládnete, můžete ji jedním klepnutím na tlačítko *"Už to umím (odebrat)"* ze sekce odstranit.
  - Otázku lze do / ze sekce NEUMÍM přidat i ručně pomocí tlačítka v záhlaví každé otázky.
- **Trvalé ukládání pokroku (localStorage):**
  - Veškeré odpovědi, skóre i seznam otázek v sekci NEUMÍM se ukládají v prohlížeči. Při zavření nebo obnovení stránky o nic nepřijdete.
- **Detailní vysvětlení a teorie (Explanation):**
  - Po zodpovězení se zobrazí oficiální vysvětlení včetně odkazu na konkrétní kapitolu CCNA kurzu (např. *Topic 14.4.9*).
- **Optimalizace pro iPhone (iOS):**
  - Přizpůsobeno pro bezpečné zóny iPhone (Safe Areas - Dynamic Island, Notch, Home Indicator).
  - Velká tlačítka s příjemnou haptickou odezvou (vibrace při správné/špatné odpovědi).
  - Podpora gest tažením prstem: **Swipe doleva** pro další otázku, **Swipe doprava** pro předchozí.
  - **Zvětšení schémat (Lightbox):** Klepnutím na jakékoliv schéma sítě se obrázek otevře na celé obrazovce pro snadné čtení IP adres a portů na displeji telefonu.
- **Přehled a rychlé vyhledávání:**
  - Klepnutím na středové tlačítko navigace otevřete přehled všech 168 otázek s barevným rozlišením (zelená = správně, červená = NEUMÍM, šedá = nezodpovězeno).
  - Vyhledávací pole umožňuje okamžitě vyfiltrovat otázky podle klíčového slova (např. *HSRP*, *OSPF*, *VLAN*, *DHCP*).
- **Tmavý a světlý režim:**
  - Automaticky respektuje nastavení vašeho iPhone, s možností manuálního přepnutí ikonou slunce/měsíce.
- **Možnost náhodného pořadí (Shuffle) a Resetu pokroku**.
