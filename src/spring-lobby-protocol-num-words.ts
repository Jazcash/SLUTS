import { SpringLobbyProtocol } from "./spring-lobby-protocol";

// Every command in prococol is collection of words separated
// by spaces, followed by collection of sentences separated
// by tabs. So, to correctly encode tab or space we need to know
// when to switch to tabs.
export const requestNumWords: {
  [request in keyof SpringLobbyProtocol["Request"]]: number;
} = {
    PING: 0,
    STLS: 0,
    EXIT: 0,
    REGISTER: 3,
    LOGIN: 4,
    CONFIRMAGREEMENT: 1,
    RENAMEACCOUNT: 1,
    CHANGEPASSWORD: 2,
    CHANGEEMAILREQUEST: 1,
    CHANGEEMAIL: 2,
    RESENDVERIFICATION: 1,
    RESETPASSWORDREQUEST: 1,
    RESETPASSWORD: 2,
    CHANNELS: 0,
    JOIN: 2,
    CHANNELTOPIC: 2,
    LEAVE: 1,
    SAY: 1,
    SAYEX: 1,
    SAYPRIVATE: 1,
    SAYPRIVATEEX: 1,
    GETCHANNELMESSAGES: 2,
    BRIDGECLIENTFROM: 3,
    UNBRIDGECLIENTFROM: 2,
    JOINFROM: 3,
    LEAVEFROM: 3,
    SAYFROM: 3,
    OPENBATTLE: 8,
    JOINBATTLE: 3,
    JOINBATTLEACCEPT: 1,
    JOINBATTLEDENY: 1,
    LEAVEBATTLE: 0,
    UPDATEBATTLEINFO: 3,
    MYSTATUS: 1,
    MYBATTLESTATUS: 2,
    HANDICAP: 2,
    KICKFROMBATTLE: 1,
    FORCETEAMNO: 2,
    FORCEALLYNO: 2,
    FORCETEAMCOLOR: 2,
    FORCESPECTATORMODE: 1,
    DISABLEUNITS: 1000000000,
    ENABLEUNITS: 1000000000,
    ENABLEALLUNITS: 0,
    RING: 1,
    ADDBOT: 3,
    REMOVEBOT: 1,
    UPDATEBOT: 3,
    ADDSTARTRECT: 5,
    REMOVESTARTRECT: 1,
    SETSCRIPTTAGS: 0,
    REMOVESCRIPTTAGS: 1000000000,
    IGNORE: 1,
    UNIGNORE: 1,
    IGNORELIST: 0,
    LISTCOMPFLAGS: 0,
    PROMOTE: 0,
} as const;
