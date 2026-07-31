# Fieseya

Mobilna QR-igra po motivih Odiseje. Vključuje šest različnih tras, preverjanje
postaj, fotografije, dodatne namige, kazni in organizatorski pregled.

## Hiter lokalni zagon

1. Namesti Node.js LTS (različica 20 ali novejša).
2. `npm install`
3. kopiraj `.env.example` v `.env`
4. `npm run dev`

Brez Supabase ključev se aplikacija samodejno zažene v predstavitvenem načinu
in podatke hrani v brskalniku. Privzeti organizatorski PIN je `2468`.

## Supabase

1. Ustvari prazen Supabase projekt.
2. V SQL Editorju zaženi `supabase/schema.sql`, nato `supabase/seed.sql`.
3. V `.env` vnesi Project URL in anon key.
4. Ponovno zaženi aplikacijo.

`schema.sql` vsebuje pregleden MVP. Pred javno prireditvijo naj se široke RLS
politike zamenjajo s strežniško validacijo ali Edge Functions; anon ključ ne
sme dobiti administratorskih pravic.

## QR-kode

Po objavi zaženi:

`$env:SITE_URL="https://vas-naslov.example"; npm run qr`

Datoteke se ustvarijo v `public/qr`. Natisni jih črno na belo, najmanj 6 × 6 cm,
plastificiraj in pred igro preizkusi z več telefoni.

## Objava

### Vercel

Uvozi repozitorij, dodaj štiri spremenljivke iz `.env.example`, nato objavi.
Po prvi objavi nastavi `VITE_SITE_URL` na produkcijski naslov, ponovno ustvari
QR-kode in naredi novo objavo.

### Netlify ali drugo statično gostovanje

Build command: `npm run build`; publish directory: `dist`. Vse poti morajo biti
preusmerjene na `/index.html` (SPA fallback).

## Točkovanje

Organizator vsako oddajo oceni: izvirnost 0–5 in upoštevanje naloge 0–5.
Dodatni namig: −1. Napačna QR-koda: −2. Čas je le kriterij ob izenačenju.

Podroben terenski pregled je v `TESTNI_SEZNAM.md`.

## Kaj je že dokončano

- mobilna vizualna podoba Fieseye;
- registracija barvnih skupin A–F, imena in članov;
- vseh šest dogovorjenih tras;
- začetna in končna fotografija na Itaki;
- pravilni in napačni QR-skeni;
- naloge, zgodbe, osnovni ter dodatni namigi;
- nalaganje fotografij in samodejno nadaljevanje;
- kazni za napačen sken in dodatni namig;
- zaključni zaslon;
- organizatorski pregled;
- Supabase shema, začetni podatki in shramba;
- generator osmih QR-kod;
- predstavitveni način brez zunanje baze.

## Zadnja nastavitev pred resnično igro

V `src/content.js` po terenskem ogledu po potrebi popravi besedila namigov.
V Supabase izbriši testne posadke, spremeni administratorski PIN in izvedi celoten
preizkus z vsaj dvema različnima telefonoma. Referenčne fotografije in izreze
zemljevida dodaj v `public/reference` ter njihove poti v tabelo `stations`.
