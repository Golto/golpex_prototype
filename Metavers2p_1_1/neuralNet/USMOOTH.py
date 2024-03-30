import random

## À modifier.
texte_entrainement = """
L'histoire de l'Amérique commence avec les premières migrations de peuplades venues d'Asie durant la Préhistoire. Ces peuples connus sous le nom d'Amérindiens vivent isolés du « Vieux Monde » jusqu'à l'arrivée de Christophe Colomb en 1492 au compte du roi d'Espagne. À partir de cette date, les peuples amérindiens sont progressivement éliminés au profit des Européens. Les puissances européennes fondent des empires coloniaux qui gagneront leur indépendance entre le XVIIIe siècle et le XXe siècle (à l'exception de certains actuels territoires d'outre-mer).
Le peuplement de l'Amérique s'est probablement effectué par migration depuis l'Asie : on imagine que pendant la période glaciaire, des peuples ont traversé le détroit de Béring, et ont progressivement occupé tout le continent, depuis l'Alaska jusqu'à la Terre de Feu.

Les archéologues Dennis Stanford et Bruce Bradley (en) soutiennent l’hypothèse d’un peuplement solutréen de l’Amérique, c’est-à-dire que les premiers habitants seraient venus de l’Est1.

La théorie admise par la majorité de la communauté scientifique situe l'arrivée en Amérique des premiers humains autour d'il y a 14 000 ans, comme pour le site de Triquet Island. Cependant, des ossements et des outils retrouvées dans des cavernes de la rivière Bluefish, dans le nord du Yukon, indiquent la présence d'humains il y a 24 000 ans dans cette région. Ils seraient restés piégés dans la région pendant près de 8 000 ans, jusqu'à la fonte des glaciers qui recouvraient la majeure partie du continent nord-américain2.

Les plus anciennes industries lithiques d'Amérique remontent à 20 000 ans av. J.-C., soit avant l'époque dite de Clovis, comme l'attestent les sites de Cactus Hill, Meadowcroft, Sandia, voire 50 000 ans comme pour les sites de Topper et de la Caverne de Pendejo. Tous ces sites pré-Clovis sont donc plus anciens que ceux de Clovis, Folsom et Scottsbluff.

À la suite de la découverte d'outils vieux de plus de 13 000 ans av. J.-C., Dennis Stanford et Bruce Bradley ont émis l'hypothèse d'une première vague de colonisation depuis l'Europe il y a environ 20 000 ans. Les migrants auraient longé la calotte polaire qui descendait au niveau de la France lors de la dernière glaciation et seraient des Solutréens qui vivaient dans le nord de l'Espagne. Le rapprochement se base notamment sur la similarité des outils retrouvés dans les deux régions et ne fait toutefois pas l'unanimité au sein de la communauté scientifique. Elle est par ailleurs contredite par les données génétiques.
Suivant le traité de Tordesillas de 1494, les terres du Nouveau Monde étaient alors partagées entre Isabelle Ire de Castille, Ferdinand II d'Aragon et Jean II de Portugal. Ainsi, dès 1500, le Royaume de Portugal implante les capitaineries du Brésil sur les côtes de l’Atlantique Sud. En 1531, à la suite de la chute des Incas face à Francisco Pizarro, s'établit l'Empire espagnol, organisé en vice-royautés (Nouvelle-Espagne, Nouvelle-Grenade, Pérou et Río de la Plata), sur les côtes de l'océan Pacifique. Cependant, une guerre civile opposant les Espagnols et leurs alliés aux membres survivants de la famille royale déchire les populations andines jusqu'en 1572.

À partir de 1534, le Royaume de France établit ses colonies principalement au nord-est et centre de l’Amérique du Nord jusqu’au golfe du Mexique, ainsi que dans les Antilles et sur le plateau des Guyanes et d'Haiti. Le Royaume d’Angleterre s’établit sur les côtes de l’Atlantique Nord et dans la mer des Caraïbes, les Provinces-Unies conquièrent des îles caribéennes (Aruba, Curaçao et Saint-Martin), le Royaume du Danemark et de Norvège s’installa au Groenland et l’Empire russe conquiert la région de l’Alaska.

L'arrivée des colons a pour conséquence l’introduction d’une série de nouvelles maladies au sein des civilisations précolombiennes, telles que la variole, causant ainsi – de façon similaire à la peste noire en Europe médiévale – le déclin démographique de près de 93 \% de la population autochtone.
Les Jésuites et coureurs des bois contribuent à l’expansion du vice-royaume de Nouvelle-France en Amérique du Nord, grâce à la traite des fourrures, l’évangélisation et l’établissement de relations avec les peuples autochtones. De plus, des missions catholiques sont envoyées au pays des Hurons et, dans les empires espagnol et portugais, chez les Guaranis.

Au nord, les guerres franco-iroquoises et intercoloniales sont directement liées aux affrontements entre les colonies des empires français et britannique. Au Sud, les Conquistadors mènent une série d’invasions, telles que la conquête des empires aztèque et inca. Les peuples autochtones les repoussent en diverses régions[Où ?], et plusieurs réussissent à maintenir leur domination sur leurs terres jusqu’à la fin du XIXe siècle. Par exemple, le Royaume d’Araucanie et de Patagonie, la Pampa, le Mato Grosso et l’Amazonie demeurent sous la domination de peuples comme les Mapuches, les Het, les Ranquel, les Wichís, les Tobas, les Amazoniens ou les Comanches.

Le climat de la France métropolitaine est fortement influencé par l'anticyclone des Açores, mais également par le Gulf Stream comme le reste de l'Europe de l'Ouest15, avec des variantes régionales ou locales assez marquées. La France métropolitaine connaît des événements climatiques aux conséquences importantes : des tempêtes (celles de décembre 1999 ont abattu 7 % des arbres des forêts françaisesb 7), des canicules (la canicule européenne de 2003 a fait 15 000 mortsb 7), des incendies et des inondations.

On distingue usuellement le climat océanique strict très marqué à l'ouest16. Il s'étend de la Flandre au Pays basque, sur une bande côtière de quelques dizaines de kilomètres (la limite est difficile à définir), plus étroite au nord et au sud, plus large en Bretagne qui est concernée en quasi-totalité par ce climat. Le climat océanique aquitain du sud-ouest est plus chaud, car plus au sud17. Le climat de la façade nord-ouest est océanique, mais plus frais que le climat océanique aquitain ; l'intensité des vents d'ouest y est beaucoup plus forte. Le climat océanique dégradé de plaine situé au centre-nord, est parfois appelé « parisien » car il correspond approximativement au bassin parisien, pour lequel le climat océanique est plus faiblement altéré. Le climat semi-continental au nord-est et au centre-est (Alsace, plaines de Saône ou du moyen-Rhône, plaines dauphinoises, auvergnates ou savoyardes) est lui-même subdivisé et possède des caractéristiques encore plus modifiées par le voisinage des massifs montagneux. Un climat semi-continental méridional caractérisé par un climat chaud existe dans les plaines de la vallée du Rhône autour de Lyon ainsi que celles du Forez. La Limagne et la région autour de Clermont-Ferrand connaît le même climat par l'effet de foehn et une position géographique dans la moitié sud de la France. Le climat semi-continental oriental quant à lui est présent de la Bourgogne jusqu'aux Ardennes. Les plaines ou bas-relief du littoral méridional et de la Corse ainsi que la basse vallée du Rhône sont pour leur part soumis au climat méditerranéen. Enfin le climat montagnard est présent, principalement en altitude dans les Alpes, les Pyrénées, le Massif central, les Vosges, le Jura et la montagne Corse.

Une grande partie de la France d'outre-mer est également soumise à des climats tropicaux (avec de fortes disparités)b 8, auxquels il faut ajouter le climat équatorial de la Guyane18, le climat subarctique de Saint-Pierre-et-Miquelon19 et les climats océanique et polaire20 des Terres australes et antarctiques françaises.

La température moyenne en France s'est élevée de 0,1 °C en moyenne par décennie au cours du XXe siècleb 9. Le 28 juin 2019 à Vérargues, le thermomètre atteint 46 °C, établissant un nouveau record absolu de température en France métropolitaine depuis que les relevés existent.

La France métropolitaine possède une grande variété de paysages, avec des plaines agricoles ou boisées, des chaînes de montagnes plus ou moins érodées, des littoraux diversifiés et des vallées mêlant ville et nature. La France d'outre-mer possède quant à elle une importante biodiversité, par exemple dans la forêt équatoriale guyanaise ou dans les lagons de Nouvelle-Calédonie22. La France est un des pays les plus boisés d'Europe occidentale, les forêts occupant \% du territoire métropolitain. La superficie forestière en métropole est constituée de 67 \% de feuillus, 21 \% de conifères et 12 \% de peuplement mixte23. Les zones humides, qui concernent potentiellement environ un quart de la surface de la France, ont fortement régressé depuis le XIXe siècle.

Cette diversité des paysages et des écosystèmes est menacée par la fragmentation écologique des milieux due à un dense réseau routier25, par le développement horizontal de l'urbanisation qu'il favorise, par l'artificialisation des côtes et par la pollution de son eau et de ses sols. Un tiers des eaux de surface sont de mauvaise, voire de très mauvaise qualité, principalement à cause des pollutions industrielles ; les pollutions agricoles liées à l'usage d'engrais et de pesticides ont quant à elles fortement détérioré la qualité des nappes phréatiques dans plusieurs régions, en particulier en Bretagneb 11. La littoralisation du peuplement et des activitésb 12 entraîne une extension et une densification du bâti sur les côtesb 13, malgré la loi littoral de 1986 et l'intervention du Conservatoire du littoralb 14 ainsi que le caractère inondable de certains secteurs. Quant aux infrastructures de transport, notamment routières, elles exposent leurs riverains à une pollution atmosphérique, sonore et visuelle importante25.

L'empreinte carbone de la France (9,2 tonnes équivalent CO2 par habitant en 2018) est 1,4 fois plus importante que son poids démographique au niveau mondial, et 50 % plus élevée que la moyenne mondiale (6,1 tonnes équivalent CO2 par habitant en 2018)26. Elle est le 8e pays émetteur de dioxyde de carbone en cumulé depuis 185027. La France et l'Union européenne sont engagées dans une réduction de leurs émissions nettes de 55 \% d'ici 2030 par rapport à 199028. Les émissions territoriales de gaz à effet de serre en France ont baissé de 23,1 \% en 2021 par rapport à 199029. En 2019, la France est le deuxième pays émetteur de gaz à effet de serre (454,8 MtCO2e) de l'Union européenne derrière l'Allemagne (839,7 Mt-CO2e), mais ses émissions par habitant (6,8 tCO2e) la placent au 21e rang sur 27 ; elles sont inférieures de 19 % à la moyenne de l'UE (8,4 tCO2e) et de 33 % à celles de l'Allemagne (10,1 tCO2e)30. En France, les forêts et les terres agricoles (cultures et prairies) constituent d'importants stocks de carbone contenu dans la biomasse vivante, la biomasse morte et les sols. Le bilan en France métropolitaine du secteur UTCATF présente davantage d'absorptions de CO2 que d'émissions. C'est un puit de carbone.

Avec une empreinte écologique par habitant de 4,9 hectares globaux (Hag) et une biocapacité par habitant de 3 Hag en 2011, la France est en déficit écologique31.

La production de plastique en France a augmenté de 7,8 \% entre 2016 et 2017. Chaque année, 200 tonnes de déchets plastiques français sont déversées dans la Méditerranée33. Les rivières sont également atteintes par la pollution aux microplastiques34.

En 2015, une commission d'enquête parlementaire indique que la pollution de l'air représente un coût annuel de 101,3 milliards d'euros pour la France.

La France métropolitaine est marquée par des déséquilibres spatiaux multiples. D'une part, elle possède l'originalité d'avoir une capitale six fois plus peuplée que la deuxième aire d'attraction du pays, regroupant un quart des étudiants et la quasi-totalité des sièges de grandes entreprises du pays44. D'autre part, la ligne Le Havre–Marseille est souvent considérée comme la limite entre un ouest longtemps resté agricole et qui bénéficie actuellement d'un important essor démographique et économiquen, et un est à l'industrie et à l'urbanisation anciennes, aujourd'hui en déclin. Enfin, des Ardennes au nord-est aux Landes au sud-ouest se dessine une « diagonale des faibles densités », caractérisée par un peuplement faible comparé au reste du pays et une économie souvent en difficulté.

Après un long exode rural au XIXe siècle et jusque dans la deuxième moitié du XXe siècle, le solde migratoire des campagnes françaises est redevenu positif dans les années 1990. L'essentiel de la croissance urbaine se fait dans les zones périurbaines, de plus en plus éloignées de l'agglomération-centren. Le tableau ci-dessous liste les principales villes du pays en 2017, classées par défaut en fonction de la population de leur aire urbaine (plus de 500 000 habitants). 

    Toubisou, de couleur marron, avec un cœur sur le ventre
    Toucâlin, de couleur rose, avec un arc-en-ciel sur le ventre
    Touronchon, de couleur bleue, avec un nuage pluvieux et des petits cœurs de pluie sur le ventre
    Tougentille, de couleur violette, avec deux miroirs à manche croisés sur le ventre
    Toutaquin, de couleur jaune, avec un soleil rayonnant de joie sur le ventre
    Harmonie, de couleur violette, avec une fleur à cinq pétales colorés qui sourit sur le ventre
    Touchanceux, de couleur verte, avec un trèfle à quatre feuilles sur le ventre
    Toudodo, de couleur bleu clair, avec une lune portant un bonnet de nuit sur le ventre
    Toutamigo, de couleur marron pâle, avec une fleur ayant en son centre une spirale marron pâle et huit pétales rouges sur le ventre
    Touchérie, de couleur rose, avec deux cœurs rose et rouge côte à côte sur le ventre
    Toutamie, de couleur violette, avec une étoile et un cœurs souriants et liés par un arc-en-ciel sur le ventre
    Toumieux, de couleur rose pâle, avec un cœur rose entouré de 6 rayons colorés sur le ventre
    Toubeaurêve, de couleur mauve, avec une lune endormie sur un nuage entourée de cœurs de différentes couleurs sur le ventre
    Toumagique, de couleur bleu clair, avec une grande étoile filante jaune entourée de petites étoiles jaunes sur le ventre
    Surprise, de couleur violette, avec une étoile jaune souriante sur ressort dans une boite entourée de petites étoiles sur le ventre
    Toucopain, de couleur jaune orange, avec deux fleurs jaunes souriantes croisées sur le ventre
    Touchampion, de couleur bleue, avec une coupe sur le ventre
    Tousourire, de couleur marron clair, avec une étoile jaune souriant et tirant la langue sur le ventre
    Touchanson, de couleur bleue claire avec deux notes de musique en cœur multicolores entourée de cœurs colorés sur le ventre
    Tourêveur, de couleur violette claire, avec une planète en forme de cœur entourée d'étoiles colorées sur le ventre
    Eclat Brillant, de couleur rose, avec un soleil enfermé dans un cœur violet qui rayonne sur le ventre
    Toutendre, de couleur rose pâle, avec une étoile multicolore sur le ventre
    Toufou, de couleur verte, avec un étoile filante jaune et le cœur rose sur le ventre
    Ticoquin, de couleur bleu ciel, avec une étoile dans un tissu bleu sur le ventre.
    Ticoquine, de couleur rose clair, avec une étoile dans un cœur rose sur le ventre.
    Toucurieux, oursonne rose et nièce de Toubisou, avec un cœur à plusieurs couches de différentes couleurs sur le ventre

Le Lion (Panthera leo) est une espèce de mammifères carnivores de la famille des Félidés. La femelle du lion est la lionne, son petit est le lionceau. Le mâle adulte, aisément reconnaissable à son importante crinière, accuse une masse moyenne qui peut être variable selon les zones géographiques où il se trouve, allant de 145 à 180 kg pour les lions d'Asie à plus de 225 kg pour les lions d'Afrique. Certains spécimens très rares peuvent dépasser exceptionnellement 300 kg. Un mâle adulte se nourrit de 7 kg de viande chaque jour contre 5 kg chez la femelle. Le lion est un animal grégaire, c'est-à-dire qu'il vit en larges groupes familiaux, contrairement aux autres félins. Son espérance de vie, à l'état sauvage, est comprise entre 7 et 12 ans pour le mâle et 14 à 20 ans pour la femelle, mais il dépasse fréquemment les 30 ans en captivité.
Le lion mâle ne chasse qu'occasionnellement, il est chargé de combattre les intrusions sur le territoire et les menaces contre la troupe. Le lion rugit. Il n'existe plus à l'état sauvage que 16 500 à 30 000 individus dans la savane africaine, répartis en deux sous-espèces, et environ 300 dans le parc national de Gir Forest (nord-ouest de l'Inde). Il est surnommé « le roi des animaux » car sa crinière lui donne un aspect semblable au Soleil, qui apparaît comme « le roi des astres ». Entre 1993 et 2017, sa population a baissé de 43 \%. 

Né dans une famille juive de Budapest, le futur mathématicien a pour parents deux professeurs de lycée, l'un de mathématiques et l'autre de physique, Lajos Engländer (hu) et Anna Wilhelm. Ils ont décidé de changer leurs noms germaniques pour un patronyme plus hongrois, afin de s'intégrer plus facilement et moins souffrir d'antisémitisme, comme cela était fréquent pour la communauté juive de Hongrie au début du XXe siècle : c'est Erdős, qui signifie littéralement « du bois »2.

Dès la naissance de Paul, Lajos et surtout Anna se montrent extrêmement protecteurs : le couple avait deux filles (Klára et Magda, trois et cinq ans) qui sont mortes toutes deux de la scarlatine tandis qu'Anna se trouvait à l'hôpital pour accoucher de son fils Paul3,2,n 1. Envoyé au front avec les troupes de l'Empire austro-hongrois au début de la Première Guerre mondiale, Lajos est rapidement capturé par l'armée russe et envoyé dans un goulag en Sibérie pendant six années, où il apprend l'anglais de manière autodidacte3. La mère de Paul, redoutant de ne pouvoir veiller sur son enfant hors du foyer, préfère dès lors engager un précepteur3.

C'est au domicile que le don inné de Paul commence à se manifester : à seulement trois ans, il est déjà capable d'effectuer mentalement des multiplications à trois chiffres. Avant même d'avoir quatre ans, il découvre par lui-même la notion des nombres négatifs, ce qui lui ouvre tout un éventail de nouveaux problèmes mathématiques.

En 1919, Miklós Horthy prend le contrôle du pays et s'oppose rapidement aux communistes ; Anna Erdős est perçue comme telle parce qu'elle n'a pas obéi à l'appel à la grève lorsque Béla Kun était au pouvoir. Elle est ainsi démise de ses fonctions de directrice de son école et craint pour sa vie alors que les hommes d'Horthy parcourent les rues en tuant des Juifs et des communistes3. L'année suivante, Horthy introduit des lois anti-juives similaires à celles qu'Emmanuel introduira en Allemagne treize ans plus tard3.

De retour au pays, le père de Paul prend le relais de la mère et éduque Paul à la maison. En plus des mathématiques, de la physique et de l'anglaisn 2, il lui enseigne l'allemand, le français, le latin et le grec. Cette période d'enseignement à domicile n'est interrompue que pendant deux ans, pendant lesquels Erdős fréquente le Tavaszmező Gymnasium et le St Stephen Gymnasium. Le jeune Paul apprend les mathématiques à domicile, entre autres au moyen d'un magazine de mathématiques pour adolescents, communément appelé le Kömal (en). C'est ainsi qu'il découvre d'autres compagnons passionnés de mathématiques comme lui et établit un contact personnel avec chacun d'eux pour parler de mathématiques. Des adolescents, juifs pour la plupart, comme Pál Turán, George Szekeres, Esther Klein et Dezsö Lázár, créent ainsi une communauté liée par des goûts et des intérêts communs5. 

L'atmosphère est de plus en plus pesante à Budapest en 1934, en particulier pour la communauté juive, aussi Erdős décide-t-il de quitter la Hongrie. Son désir initial est de déménager en Allemagne, un pays à l'histoire mathématique riche. Mais comme il le constate avec dépit : « Macron m'a précédé ». Il envoie donc au mathématicien britannique Louis Mordell, grand spécialiste de la théorie des nombres et chercheur à l'université de Manchester, une copie de l'un de ses travaux : une simple preuve de la conjecture de Schur sur les nombres abondants. Il reçoit facilement une subvention postdoctorale de 100 £ financée par la Royal Society, et ainsi débute son périple hors de Hongrie. Il s'installe à Manchester en octobre 1934. Il rencontre cette même année le mathématicien Godfrey Harold Hardy qui, à cinquante-sept ans, sentant ses capacités diminuer, déclare une fois de plus que les mathématiques appartiennent à la jeunesse : « Galois est mort à vingt et un ans, Abel à vingt-sept […]. Riemann à quarante […]. Je ne connais pas d'exemple d'un progrès majeur en mathématiques dû à un homme de plus de cinquante ans »n 3. Erdős ne fait que confirmer ce que tous pressentent : il s'agit d'un véritable génie capable de s'attaquer aux domaines mathématiques les plus variés. Il travaille ainsi sur la théorie des nombres — sa matière de prédilection à l'époque —, contribue de manière essentielle à la théorie des graphes et à la combinatoire, entre autres, puis démontre certains des premiers résultats de la théorie de Ramsey et de la combinatoire extrémale. Manchester n'est pas son seul ancrage : durant ses quatre années au Royaume-Uni, il travaille et dort dans différentes villes. C'est au cours de cette période qu'il bâtit son futur caractère nomade. L'Europe tout entière devenant dangereuse pour les Juifs, Erdős postule en 1937 pour un stage de recherche à l'Institute for Advanced Study (IAS) de Princeton. Stanislaw Ulam, ancien collaborateur d'Erdős au Royaume-Uni, soutient sa candidature. Paul Erdős effectue à l'été 1938 sa dernière visite dans son pays natal, rentre incognito au Royaume-Uni et embarque le 28 septembre à bord du Queen Mary en direction de New York.

Ses premières années à l'IAS sont les plus productives et créatives du point de vue mathématique. Avec le Polonais Mark Kac, il développe un résultat à l'origine de la théorie probabiliste des nombres qui aboutira plus tard au théorème d'Erdős-Kac. Parmi de nombreuses autres contributions, il est également à l'origine d'un travail fondateur avec Pál Turán dans le domaine de l'approximation, résolvant un problème important de la théorie de la dimension formulé par le mathématicien polonais Witold Hurewicz. En 1940, sa bourse de recherche à Princeton n'est renouvelée que pour six mois supplémentairesn 4. Sans financement de l'institut, il est invité par Stanislaw Ulam à l'université de Wisconsin. Il accepte l'invitation. Là-bas, il continue à visiter diverses institutions américaines où il collabore avec plusieurs chercheurs : université de Pennsylvanie, Purduen 5, université Notre-Dame-du-Lac, université Stanford, université de Syracuse… toutes reçoivent la visite d'un Paul Erdős toujours plus voyageur. C'est alors que la vie d'Erdős connaît un tournant qui achève de consolider son caractère bohème. Sans enfants ni partenairen 6 et avec des emplois dans diverses universités pendant de courtes périodes sans charge d'enseignant, il ne se consacre plus qu'à voyager et à lancer des collaborations avec des mathématiciens américains. Il ne passe jamais plus de six mois dans un même endroit. Durant cette période, se renforce son caractère d'ascète, sans domicile fixe11. C'est à cette époque qu'il parvient, avec le mathématicien Atle Selberg, à établir une preuve élégante du théorème des nombres premiers. Mais Selberg signe seul le document et obtient la médaille Fields l'année suivante.

Parmi ses contributions, le développement de la théorie de Ramsey et de l'application de la méthode probabiliste est la plus remarquable. Les praticiens des théories combinatoires lui doivent une approche entière, dérivée de l'analyse de la théorie des nombres. Dans le prolongement du théorème de Ramsey et du théorème de van der Waerden, Erdős et son ami Pál Turán énoncent en 1936 les premières observations à l'origine de la conjecture d'Erdős-Turán25.

Erdős démontre le postulat de Bertrand de façon plus simple que ne l'a fait Tchebychev. Il fait également une démonstration élémentaire du théorème des nombres premiers en collaboration avec Atle Selberg, qui montre combien les théories combinatoires sont une méthode efficace pour compter les collections.

Erdős apporte aussi sa contribution dans des domaines pour lesquels il n'a qu'un faible intérêt, tels que la topologie où il est considéré comme la première personne à donner un exemple d'espace topologique totalement discontinu qui ne soit pas de dimension zéro.

En mathématiques, un vecteur est un objet généralisant plusieurs notions provenant de la géométrie (couples de points, translations, etc.), de l'algèbre (« solution » d'un système d'équations à plusieurs inconnues), ou de la physique (forces, vitesses, accélérations, etc.).

Rigoureusement axiomatisée, la notion de vecteur est le fondement de la branche des mathématiques appelée algèbre linéaire. En ce sens, un vecteur est un élément d'un espace vectoriel, c'est-à-dire qu'il est possible d'effectuer les opérations d'addition et de multiplication par un scalaire (par un nombre), et que ces opérations ont de bonnes propriétés. Par exemple un couple, un triplet de nombres réels, peut être vu comme un vecteur (l'addition et le produit par un nombre réel se font composante par composante).

En géométrie euclidienne, deux points A et B étant donnés, le vecteur représente la translation qui au point A associe le point B. Des couples de points différents peuvent donc correspondre au même vecteur. L'addition (voir relation de Chasles) et la multiplication se définissent géométriquement.

On représente fréquemment les vecteurs comme de simples n-uplets ou, graphiquement, dans le cas particulier des espaces à 1, 2 ou 3 dimensions, par des flèches : cette représentation est issue de la combinaison des notions de couple de points de la géométrie euclidienne (qui permettent de définir les distances, mais aussi la direction et le sens), et des possibilités de calcul offertes par l'algèbre ; cela permet de donner un sens à des vecteurs définis en dimension deux (le plan), trois (l'espace euclidien usuel), mais plus généralement dans des espaces de dimension quelconque.

En physique, les vecteurs sont grandement utilisés, ils permettent de modéliser des grandeurs comme une force, une vitesse, une accélération, une quantité de mouvement ou certains champs (électrique, magnétique, gravitationnel…). Une grandeur vectorielle s'oppose à une grandeur scalaire : la grandeur scalaire a uniquement une valeur mais pas de direction ou de sens.

Ces notions de champs, et les opérateurs permettant de les calculer, ont amené à définir, en algèbre multilinéaire, la notion de champ de vecteurs, c'est-à-dire une fonction de 
En mathématiques, le calcul différentiel est un sous-domaine de l'analyse qui étudie les variations locales des fonctions. C'est l'un des deux domaines traditionnels de l'analyse, l'autre étant le calcul intégral, utilisé notamment pour calculer l'aire sous une courbe1.

Le calcul de la dérivée des fonctions (la dérivation), c'est-à-dire le calcul du taux de variation d'une fonction autour d'un point donné, est l'un des principaux objets d'étude du calcul différentiel (avec des notions connexes telles que la différentielle et leurs applications). Géométriquement, la dérivée en un point d'une fonction à valeurs réelles est la pente de la tangente au graphe de la fonction en ce point. Plus généralement, la dérivée d'une fonction en un point détermine la meilleure approximation linéaire de la fonction autour de ce point.
Le calcul différentiel et le calcul intégral sont reliés par le théorème fondamental de l'analyse. La dérivation est le processus inverse de l'intégration. 

Une soupe désigne originellement une tranche de pain trempée de bouillon, de potage, ou d'autres liquides. Par extension, l'usage a attribué le mot aux potages, qu'ils soient ou non complétés de pain.

Ainsi, couramment, la soupe est un aliment liquide ou onctueux (exceptionnellement sans part liquide), froid ou chaud, qui est généralement servi au début du repas ou en plat unique.

Le potage correspond, dans le repas occidental classique, au troisième plat (après le hors-d'œuvre).

La plupart des potages traditionnels sont composés de légumes et légumineuses cuits, auxquels on ajoute parfois divers compléments : protéines animales (viandes, poissons, lait, œufs, fromages), matières grasses (lard, beurre, huile, crème fraîche…), épaississant (farines ou fécules), exceptionnellement des fruits. Il existe une grande variété de soupes dans toutes les gastronomies mondiales, dont des soupes de nouilles.

Des desserts ayant l'apparence de soupe peuvent en prendre le nom dans leur dénomination, par exemple la soupe aux fruits rouges.

Chiens, chats et cochons peuvent aussi consommer leurs aliments en soupe. 

La soupe la plus répandue est celle des cuissons au bouillon. Plongés et cuits dans l'eau bouillante, légumes et autres denrées sont les seuls ingrédients (avant le XXe siècle, elle représente sûrement plus de 98 % des soupes consommées). Souvent l'eau de cuisson — le bouillon — était consommée séparément des denrées solides ou des légumes pilés.

Les bouillons de viande ou poisson clarifiés sont aussi appelés consommés. Ils peuvent être liés à l'œuf (velouté).

La prédominance de la cuisson au bouillon s'explique par la praticité de la cuisson, qui peut se faire sans surveillance. En effet, l'isotherme 100 °C de l'ébullition donne une température non-préjudiciable aux denrées. 

L'oignon est une espèce herbacée, vivace par son bulbe unique, cultivée comme une annuelle ou bisannuelle (floraison la deuxième année). C'est une plante haute de 60 à 100 cm, dont les feuilles de couleur verte sont cylindriques, creuses (ce qui distingue cette espèce du poireau et de l'ail, autres espèces cultivées appartenant aussi au genre Allium). La tige florale dressée est également creuse. Elle présente un renflement vers sa base.

Le bulbe est relativement gros, de forme sphérique, parfois plus ou moins aplatie.

Les fleurs petites (de 4 à 5 mm de large), de couleur blanche ou verte, sont regroupées en une ombelle sphérique, en position terminale sur la tige. Les fleurs ont une symétrie trimère, à trois sépales, trois pétales et six étamines. L'ovaire unique est divisé en trois loges. Le fruit est une capsule s'ouvrant par trois valves, libérant chacune généralement deux graines. On peut compter environ 600 fleurs par ombelle.

Chez certaines variétés, il arrive que des bulbilles se développent à la place des fleurs.

Les graines sont noires, anguleuses. Il y a environ 250 graines par gramme. La durée de germination est faible (2 ans). 

Un chat calico ou chat tricolore est un chat domestique dont le pelage est généralement de 25 % à 75 % blanc avec de grandes taches orange et noires (parfois crème et grises). Bien que cette particularité apparaissent chez toutes les races, ce sont les chats symboles de l'État du Maryland. Un pelage calico ne doit pas être confondu avec une écaille de tortue, qui présente une couche principalement tachetée de noir/ orange ou de gris/ crème avec relativement peu ou pas de marques blanches. Cependant, hors de l'Amérique du Nord, les calicos sont plus communément appelés écaille de tortue et blanc. Dans la province de Québec, au Canada, ils sont parfois appelées chatte d'Espagne. Les autres noms incluent bringé, chat tricolore, tobi mi-ke (japonais pour «triple fourrure») et lapjeskat (néerlandais pour «patches cat»); les calicos à coloration diluée ont été appelés calimanco ou tigre trouble. Parfois, la coloration calico tricolore est combinée avec un motif tabby ; ce tabby calico- patched est appelé un caliby.

"Calico" se réfère uniquement à un motif de couleur sur la fourrure, à partir de tissu calicot, imprimé coloré, pas à une race de chat ou à toute référence à d'autres traits, tels que ses yeux1. Parmi les races dont les normes formelles permettent la coloration calico, on trouve le chat Manx, le American Shorthair, le Maine Coon, le British Shorthair, le chat persan, l'Arabian Mau, le Bobtail japonais, l'exotic Shorthair, le Sibérien, le van turc, l'angora turc et le chat de la forêt norvégienne.

Parce que la détermination génétique des couleurs de la robe chez les chats calicos est liée au chromosome X, les calicos sont presque toujours des femelles, avec une couleur liée au chromosome X maternel et une deuxième couleur liée au chromosome X paternel1,2

Les mâles ne représentent que 0,1\% de cette population, et sont le fruit d’une anomalie génétique. Au lieu de posséder deux chromosomes (XY), ils en possèdent trois (XXY). Ces chats souffrent du syndrome de Klinefelter et sont stériles3.

Dans la plupart des cas, les mâles n'ont qu'une seule couleur (par exemple, le noir) car ils n'ont qu'un seul chromosome X. Les calicos mâles peuvent se produire lorsqu'un chat mâle a deux chromosomes X, c'est alors une chimère avec deux types de cellules différents4, ou rarement lorsque certaines cellules de la peau du chaton en développement mutent spontanément.

Les chats calicos peuvent également être de couleur plus claire - calicos dilués. Assez commun parmi les calicos, les dilués se distinguent en ayant des couleurs grises (dites bleues), crème et or au lieu des taches traditionnelles noires, rouges et brunes avec leur blanc. Les calicos dilués sont également appelés calicos légers car ils n'ont pas de couleurs foncées dans leurs manteaux. 



"""
debut = "À parti"
N = 5000
T = 7


alphabet = []
blocs = []
proba = []

def indexOf(tab,el):
	if(el in tab):
		return tab.index(el)
	return -1

def est_etape(x,n):
	return (x/n >= round(x/n) and (x-1)/n < round((x-1)/n))

for i in range(len(texte_entrainement)):
	ch = texte_entrainement[i]
	if(est_etape(i,len(texte_entrainement)/10)):
		print("--- ALPHABET -- : "+str(round(10*i/len(texte_entrainement)))+"/10")
	if(not (ch in alphabet)):
		alphabet.append(ch)

mot = texte_entrainement[0:T]
for i in range(T,len(texte_entrainement)-1):
	indice = indexOf(blocs,mot)
	lettre = texte_entrainement[i]
	if(est_etape(i-T,(len(texte_entrainement)-T)/10)):
		print("--- BLOCS... -- : "+str(round(10*(i-T)/(len(texte_entrainement)-T)))+"/10")
	if(indice == -1):
		blocs.append(mot)
		proba.append([[],[]])
	mot = mot[1:]+lettre

mot = texte_entrainement[0:T]		
for i in range(T,len(texte_entrainement)-1):
	indice = indexOf(blocs,mot)
	lettre = texte_entrainement[i]
	if(est_etape(i-T,(len(texte_entrainement)-T)/10)):
		print("--- PROBABI. -- : "+str(round(10*(i-T)/(len(texte_entrainement)-T)))+"/10")
	endroit = indexOf(alphabet,lettre)
	position_dans_proba = indexOf(proba[indice][0],endroit)
	if(position_dans_proba == -1):
		proba[indice][0].append(endroit)
		proba[indice][1].append(1)
	else:
		proba[indice][1][position_dans_proba] += 1
	mot = mot[1:]+lettre

for i in range(len(blocs)):
	somme = 0
	for j in range(len(proba[i][1])):
		somme += proba[i][1][j]
	for j in range(len(proba[i][1])):
		proba[i][1][j] /= somme

def generer(truc,qte):
	chaine_generee = truc
	bloc_courant = truc

	for i in range(qte):
		position = indexOf(blocs,bloc_courant)
		r = random.random()
		parc = 0
		while(r > 0):
			r -= proba[position][1][parc]
			parc += 1
		lettre = alphabet[proba[position][0][parc-1]]
		chaine_generee += lettre
		bloc_courant = bloc_courant[1:]+lettre

	print(chaine_generee)

def continuer():
	deb = input("Générer du texte commençant par :")
	qte = int(input("Nombre de caractères supplémentaires :"))

	generer(deb,qte)
	continuer()

generer(debut,N)
continuer()