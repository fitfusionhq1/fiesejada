insert into public.stations(id,title,place,story,task,success_condition,main_hint,extra_hint) values
(1,'Otok Siren','Pomol Fiesa','Sirene skušajo posadko ustaviti s popolnim prizorom.','Poiščite rekvizit in poustvarite skupinski prizor.','Vsi člani, rekvizit in prepoznaven položaj.','Pojdite tja, kjer se kopno podaljša v morje, ne da bi postalo ladja.','Poiščite pomol na robu zaliva.'),
(2,'Otok Kiklopov','Fiesa 57','Enooki velikan verjame samo svojim očem.','S prisilno perspektivo ustvarite iluzijo velikanskega predmeta.','Predmet je viden, iluzija deluje in sodelujejo vsi.','Poiščite zavetje s številko, ki je za tri manjša od šestdeset.','Usmerite se proti Fiesi 57.'),
(3,'Otok Lotofagov','FKK / tekstil','Lotos je posadki vzel besede in spomin.','Brez govorjenja uprizorite reševanje z morja.','Vsi sodelujejo in prizor je razumljiv brez besed.','Poiščite mejo med dvema svetovoma kopalcev.','Usmerite se proti oznaki FKK / tekstil.'),
(4,'Itaka','Izhodišče in cilj','Tu se Odiseja začne in konča.','Na začetku naredite skupinsko fotografijo in jo ob vrnitvi ponovite.','Ista razporeditev, poza in obrazni izrazi.','Vrnite se tja, kjer se je vse začelo.','Postaja 4 je izhodišče pri CŠOD.'),
(5,'Kirkin otok','Rob jezera','Kirka spreminja ljudi v podobe.','Z vrvjo in telesi oblikujte simbol morja.','Vsi so del prepoznavne skulpture.','Poiščite mirni rob vode, kjer se valovi umaknejo zelenju.','Na robu večjega jezera med postajama 2 in 6.'),
(6,'Eolov otok','Kamp Fiesa','Bog vetrov je obrnil svet na glavo.','Ustvarite fotografijo Narobe svet.','Vsi sodelujejo in učinek kljubovanja težnosti je jasen.','Poiščite kraj začasnih domov pod platnom.','Ob območju Kampa Fiesa.'),
(7,'Kalipsin otok','Jezerca v Fiesi','Kalipso posadko zadržuje v popolnem odsevu.','Ustvarite zrcalno skupinsko fotografijo.','Leva in desna stran sta čim bolj zrcalni.','Poiščite manjši vodni ogledali v zelenem delu Fiese.','Pri jezercema na jugovzhodni strani.');

insert into public.routes(group_code,step_number,station_id) values
('A',0,4),('A',1,1),('A',2,2),('A',3,3),('A',4,5),('A',5,6),('A',6,7),('A',7,4),
('B',0,4),('B',1,2),('B',2,3),('B',3,1),('B',4,6),('B',5,5),('B',6,7),('B',7,4),
('C',0,4),('C',1,3),('C',2,2),('C',3,6),('C',4,1),('C',5,5),('C',6,7),('C',7,4),
('D',0,4),('D',1,6),('D',2,5),('D',3,7),('D',4,3),('D',5,2),('D',6,1),('D',7,4),
('E',0,4),('E',1,7),('E',2,5),('E',3,6),('E',4,1),('E',5,2),('E',6,3),('E',7,4),
('F',0,4),('F',1,5),('F',2,7),('F',3,6),('F',4,3),('F',5,2),('F',6,1),('F',7,4);
