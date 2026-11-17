// Diagrammes de conception (syntaxe Mermaid), rendus en SVG par rendre.mjs.
export const DIAGRAMMES = {
  architecture: `flowchart TB
  subgraph C["Poste client — navigateur"]
    direction LR
    UI["Application React 19 (SPA)<br/>pages : connexion, tableau de bord,<br/>clubs, événements, salles,<br/>équipements, réservations"]
    AC["AuthContext<br/>session : jeton + profil<br/>(localStorage)"]
    AX["Client HTTP Axios<br/>en-tête Authorization: Bearer"]
    UI --> AC --> AX
  end
  subgraph S["Serveur Spring Boot 4 — Java 17"]
    direction LR
    F["TokenAuthenticationFilter<br/>vérifie le jeton"]
    SC["SecurityConfig<br/>règles d'accès par rôle, CORS"]
    CT["Contrôleurs REST<br/>Auth, Club, Event, Room,<br/>Equipment, Reservation"]
    RP["Repositories<br/>Spring Data JPA"]
    F --> SC --> CT --> RP
  end
  DB[("MySQL 8<br/>base enicar_clubs")]
  AX -- "HTTP/JSON :9090/api" --> F
  RP -- "JDBC / Hibernate" --> DB`,

  deploiement: `flowchart LR
  subgraph P["Poste utilisateur"]
    N["Navigateur web<br/>(Edge, Firefox, Chrome)"]
  end
  subgraph D["Serveur de développement"]
    V["Vite<br/>sert le frontend React<br/>port 5173"]
    J["JVM 17<br/>backend-0.0.1-SNAPSHOT.jar<br/>port 9090"]
    M[("MySQL 8<br/>conteneur Docker ou XAMPP<br/>port 3306")]
  end
  N -- "HTTP : pages et scripts" --> V
  N -- "HTTP/JSON + jeton" --> J
  J -- "JDBC" --> M`,

  casUtilisation: `flowchart LR
  V(["👤 Visiteur"])
  MB(["👤 Membre"])
  PR(["👤 Président de club"])
  AD(["👤 Administration"])
  subgraph SYS["Plateforme de gestion des clubs"]
    U1(["S'inscrire"])
    U2(["Se connecter"])
    U3(["Consulter les clubs<br/>et les événements"])
    U4(["Réserver une salle<br/>ou un équipement"])
    U5(["Suivre ses réservations"])
    U6(["Consulter son profil"])
    U13(["Consulter le<br/>tableau de bord"])
    U7(["Créer un événement<br/>pour son club"])
    U8(["Supprimer un événement<br/>de son club"])
    U9(["Créer un club et<br/>le compte du président"])
    U10(["Supprimer un club"])
    U11(["Gérer les salles<br/>et les équipements"])
    U12(["Approuver ou rejeter<br/>une réservation"])
  end
  V --- U1
  V --- U2
  MB --- U3
  MB --- U4
  MB --- U5
  MB --- U6
  MB --- U13
  PR -. "hérite de Membre" .-> MB
  PR --- U7
  PR --- U8
  AD --- U9
  AD --- U10
  AD --- U11
  AD --- U12
  AD --- U13`,

  classes: `classDiagram
  direction LR
  class User {
    Long id
    String fullName
    String email «unique»
    String password «haché BCrypt»
    String role
  }
  class Club {
    Long id
    String name
    String description
    Long presidentId
    List~Long~ members
  }
  class Event {
    Long id
    String title
    Long clubId
    String date
    String status
    String room
    Integer attendees
  }
  class Room {
    Long id
    String name
    Integer capacity
    String type
  }
  class Equipment {
    Long id
    String name
    String type
    String status
  }
  class Reservation {
    Long id
    Long clubId
    String resourceType
    Long resourceId
    String date
    String status
  }
  class Role {
    <<enumeration>>
    ADMINISTRATOR
    CLUB_PRESIDENT
    CLUB_MEMBER
  }
  User "1" <-- "0..*" Club : président
  User "0..*" <-- "0..*" Club : membres
  Club "1" <-- "0..*" Event : organise
  Room "1" <-- "0..*" Event : accueille
  Club "1" <-- "0..*" Reservation : demande
  Room "0..1" <-- "0..*" Reservation : ressource ROOM
  Equipment "0..1" <-- "0..*" Reservation : ressource EQUIPMENT
  User ..> Role`,

  donnees: `erDiagram
  USERS {
    bigint id PK
    varchar full_name
    varchar email UK
    varchar password
    varchar role
  }
  CLUBS {
    bigint id PK
    varchar name
    varchar description
    bigint president_id
  }
  CLUB_MEMBERS {
    bigint club_id FK
    bigint members
  }
  EVENTS {
    bigint id PK
    varchar title
    bigint club_id
    varchar date
    varchar status
    varchar room
    int attendees
  }
  ROOMS {
    bigint id PK
    varchar name
    int capacity
    varchar type
  }
  EQUIPMENT {
    bigint id PK
    varchar name
    varchar type
    varchar status
  }
  RESERVATIONS {
    bigint id PK
    bigint club_id
    varchar resource_type
    bigint resource_id
    varchar date
    varchar status
  }
  USERS ||--o{ CLUBS : "préside"
  CLUBS ||--o{ CLUB_MEMBERS : "a pour membres"
  CLUBS ||--o{ EVENTS : "organise"
  CLUBS ||--o{ RESERVATIONS : "demande"
  ROOMS ||--o{ RESERVATIONS : "réservée"
  EQUIPMENT ||--o{ RESERVATIONS : "réservé"`,

  sequenceConnexion: `sequenceDiagram
  autonumber
  actor U as Utilisateur
  participant L as LoginPage (React)
  participant C as AuthContext
  participant A as AuthController
  participant R as UserRepository
  participant T as TokenService
  U->>L: saisit e-mail et mot de passe
  L->>C: login(email, motDePasse)
  C->>A: POST /api/auth/login
  A->>R: findByEmail(email)
  R-->>A: utilisateur
  A->>A: BCrypt.matches(motDePasse, hash)
  alt identifiants valides
    A->>T: issue(idUtilisateur)
    T-->>A: jeton aléatoire
    A-->>C: 200 {token, user sans mot de passe}
    C->>C: enregistre la session (localStorage)
    C-->>L: profil
    L-->>U: redirection vers le tableau de bord
  else identifiants invalides
    A-->>C: 401
    C-->>L: « Email ou mot de passe incorrect »
    L-->>U: message affiché
  end`,

  sequenceReservation: `sequenceDiagram
  autonumber
  actor M as Membre
  actor AD as Administration
  participant P as ReservationsPage
  participant F as Filtre de sécurité
  participant RC as ReservationController
  participant DB as Repositories / MySQL
  M->>P: choisit la ressource et la date
  P->>F: POST /api/reservations + jeton
  F->>F: jeton valide → rôle CLUB_MEMBER
  F->>RC: createReservation(…)
  RC->>DB: la ressource existe ?
  RC->>DB: déjà réservée à cette date ?
  alt ressource libre
    RC->>DB: save(statut = PENDING)
    RC-->>P: 200 réservation PENDING
  else déjà réservée
    RC-->>P: 409 « Ressource déjà réservée »
  end
  AD->>P: clique sur « Approuver »
  P->>F: PUT /api/reservations/{id}/status + jeton
  F->>F: rôle ADMINISTRATOR exigé (sinon 403)
  F->>RC: updateReservationStatus(id, APPROVED)
  RC->>DB: save(statut = APPROVED)
  RC-->>P: 200 réservation APPROVED`,

  etatsReservation: `stateDiagram-v2
  direction LR
  [*] --> PENDING : demande d'un membre, ressource existante et libre
  PENDING --> APPROVED : l'administration approuve
  PENDING --> REJECTED : l'administration rejette
  APPROVED --> [*]
  REJECTED --> [*]
  note right of PENDING
    Le statut envoyé par le client est ignoré :
    toute nouvelle réservation commence à PENDING.
  end note`,

  cycleV: `flowchart TB
  subgraph G[" "]
    direction TB
    B["Besoins<br/>EF-01 … EF-10, ENF-01 … ENF-10"] --- S["Spécifications<br/>cas d'utilisation, règles métier"]
    S --- CO["Conception<br/>architecture, classes, API REST"]
    CO --- CD["Codage<br/>Spring Boot, React"]
  end
  subgraph T[" "]
    direction TB
    TA["Tests d'acceptation<br/>TF-04, TNF-05"] --- TS["Tests système<br/>TF-03, TF-05, TNF-01, TNF-03, TNF-04"]
    TS --- TI["Tests d'intégration<br/>API-01 … API-04, TNF-02 (Postman)"]
    TI --- TU["Tests unitaires<br/>TF-01, TF-02 (Jest)"]
  end
  B -. "valide" .- TA
  S -. "vérifie" .- TS
  CO -. "vérifie" .- TI
  CD -. "vérifie" .- TU`,
};
