export const groups = {
  A: { color: "#e8505b", name: "Koralna", symbol: "🧭", route: [4,1,2,3,5,6,7,4] },
  B: { color: "#2796d2", name: "Azurna", symbol: "🌊", route: [4,2,3,1,6,5,7,4] },
  C: { color: "#38a169", name: "Smaragdna", symbol: "🌲", route: [4,3,2,6,1,5,7,4] },
  D: { color: "#845ec2", name: "Vijolična", symbol: "⚓", route: [4,6,5,7,3,2,1,4] },
  E: { color: "#ed8936", name: "Jantarna", symbol: "☀️", route: [4,7,5,6,1,2,3,4] },
  F: { color: "#12a7a1", name: "Turkizna", symbol: "🕊️", route: [4,5,7,6,3,2,1,4] }
};

export const stations = {
  1: {
    title: "Otok Siren", place: "Pomol Fiesa", map: "/maps/postaja-1.jpg",
    story: "Sirene skušajo posadko ustaviti s popolnim prizorom. Premagajo jih lahko le popotniki, ki ostanejo povezani.",
    task: "Poiščite rekvizit in čim natančneje poustvarite prikazani skupinski prizor. Na fotografiji mora sodelovati celotna posadka.",
    success: "Vsi člani, rekvizit in prepoznaven položaj.",
    hint: "Pojdite tja, kjer se kopno podaljša v morje, ne da bi postalo ladja.",
    extra: "Poiščite pomol na robu zaliva."
  },
  2: {
    title: "Otok Kiklopov", place: "Fiesa 57", map: "/maps/postaja-2.jpg",
    story: "Enooki velikan verjame samo svojim očem. Pretentajte ga z iluzijo velikosti.",
    task: "Poiščite skriti predmet in s prisilno perspektivo ustvarite fotografijo, na kateri je videti mnogo večji, kot je v resnici.",
    success: "Predmet je jasno viden, iluzija deluje in sodeluje vsa posadka.",
    hint: "Poiščite zavetje s številko, ki je za tri manjša od šestdeset.",
    extra: "Usmerite se proti območju Fiesa 57 in poglejte ob rob poti."
  },
  3: {
    title: "Otok Lotofagov", place: "FKK / tekstil", map: "/maps/postaja-3.jpg",
    story: "Lotos je posadki vzel besede in spomin. Domov jo lahko vrne samo jasna zgodba brez glasu.",
    task: "Brez govorjenja v dveh minutah pripravite nemi prizor na temo »reševanje z morja« in posnemite fotografijo ali največ 10-sekundni video.",
    success: "Vsi sodelujejo, prizor pa je razumljiv brez besed.",
    hint: "Poiščite mejo med dvema svetovoma kopalcev.",
    extra: "Usmerite se proti oznaki FKK / tekstil."
  },
  4: {
    title: "Itaka", place: "Izhodišče in cilj", map: "/maps/postaja-4.jpg",
    story: "Tu se začne vaša Odiseja in tu vas čaka dom. Pozejdon bo preveril, ali se je posadka vrnila kot eno.",
    task: "Na začetku naredite skupinsko fotografijo z značilno pozo. Ob vrnitvi jo ponovite čim bolj natančno.",
    success: "Vsi člani, ista razporeditev, poza in obrazni izrazi.",
    hint: "Vrnite se tja, kjer se je vse začelo.",
    extra: "Postaja 4 je vaše skupno izhodišče pri CŠOD."
  },
  5: {
    title: "Kirkin otok", place: "Rob jezera", map: "/maps/postaja-5.jpg",
    story: "Čarovnica Kirka spreminja ljudi v podobe. Tokrat mora posadka sama postati simbol morja.",
    task: "Z vrvjo in telesi oblikujte prepoznaven simbol – sidro, val ali črko F – ter ga fotografirajte.",
    success: "Vsi so del skulpture in simbol je jasno prepoznaven.",
    hint: "Poiščite mirni rob vode, kjer se valovi umaknejo zelenju.",
    extra: "Postaja je na robu večjega jezera, med postajama 2 in 6."
  },
  6: {
    title: "Eolov otok", place: "Kamp Fiesa", map: "/maps/postaja-6.jpg",
    story: "Bog vetrov je obrnil svet na glavo. Posadka mora dokazati, da se znajde tudi, ko nič ni tako, kot se zdi.",
    task: "Ustvarite fotografijo »Narobe svet«: z držo, kamero ali perspektivo naj bo videti, kot da kljubujete težnosti.",
    success: "Vsi sodelujejo, učinek narobe obrnjenega sveta je jasen.",
    hint: "Poiščite kraj začasnih domov, kjer pustolovci spijo pod platnom.",
    extra: "Postaja je ob območju Kampa Fiesa."
  },
  7: {
    title: "Kalipsin otok", place: "Jezerca v Fiesi", map: "/maps/postaja-7.jpg",
    story: "Kalipso posadko zadržuje v popolnem odsevu. Svobodo si priborite z ravnotežjem in simetrijo.",
    task: "Razdelite se v dve polovici in ustvarite zrcalno fotografijo. Pri petih članih je peti os simetrije.",
    success: "Leva in desna stran sta čim bolj zrcalni.",
    hint: "Poiščite manjši vodni ogledali, ki ju skriva zeleni del Fiese.",
    extra: "Pojdite proti jezercema na jugovzhodni strani območja."
  }
};

export const rules = [
  "Posadka ves čas ostane skupaj in uporablja en telefon.",
  "Obiščite postaje samo v zaporedju, ki ga določi aplikacija.",
  "Ne vstopajte v morje ali jezero, ne plezajte in ne hodite na zasebna zemljišča.",
  "Rekvizite in QR-kode pustite na istem mestu.",
  "Napačen QR sken pomeni −2 točki, Atenin dodatni namig pa −1 točko.",
  "Ob nevarnosti ali poškodbi igro prekinite in pokličite organizatorja."
];
