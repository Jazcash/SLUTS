/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const SpringLobbyProtocol = t.iface([], {
  "Request": t.iface([], {
    "PING": t.iface([], {
    }),
    "STLS": t.iface([], {
    }),
    "EXIT": t.iface([], {
      "reason": t.opt("string"),
    }),
    "REGISTER": t.iface([], {
      "userName": "string",
      "password": "string",
      "email": t.opt("string"),
    }),
    "LOGIN": t.iface([], {
      "userName": "string",
      "password": "string",
      "cpu": t.lit(0),
      "localIP": "string",
      "lobbyNameAndVersion": "string",
      "userID": t.opt("number"),
      "compFlags": t.opt(t.array("string")),
    }),
    "CONFIRMAGREEMENT": t.iface([], {
      "verificationCode": "string",
    }),
    "RENAMEACCOUNT": t.iface([], {
      "newUsername": "string",
    }),
    "CHANGEPASSWORD": t.iface([], {
      "oldPassword": "string",
      "newPassword": "string",
    }),
    "CHANGEEMAILREQUEST": t.iface([], {
      "newEmail": "string",
    }),
    "CHANGEEMAIL": t.iface([], {
      "newEmail": "string",
      "verificationCode": "string",
    }),
    "RESENDVERIFICATION": t.iface([], {
      "newEmail": "string",
    }),
    "RESETPASSWORDREQUEST": t.iface([], {
      "email": "string",
    }),
    "RESETPASSWORD": t.iface([], {
      "email": "string",
      "verificationCode": "string",
    }),
    "CHANNELS": t.iface([], {
    }),
    "JOIN": t.iface([], {
      "chanName": "string",
      "key": t.opt("string"),
    }),
    "CHANNELTOPIC": t.iface([], {
      "chanName": "string",
      "topic": "string",
    }),
    "LEAVE": t.iface([], {
      "chanName": "string",
    }),
    "SAY": t.iface([], {
      "chanName": "string",
      "message": "string",
    }),
    "SAYEX": t.iface([], {
      "chanName": "string",
      "message": "string",
    }),
    "SAYPRIVATE": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "SAYPRIVATEEX": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "GETCHANNELMESSAGES": t.iface([], {
      "chanName": "string",
      "lastId": "number",
    }),
    "BRIDGECLIENTFROM": t.iface([], {
      "location": "string",
      "externalId": "number",
      "externalUsername": "string",
    }),
    "UNBRIDGECLIENTFROM": t.iface([], {
      "location": "string",
      "externalId": "number",
    }),
    "JOINFROM": t.iface([], {
      "chan": "string",
      "location": "string",
      "externalId": "number",
    }),
    "LEAVEFROM": t.iface([], {
      "chan": "string",
      "location": "string",
      "externalId": "number",
    }),
    "SAYFROM": t.iface([], {
      "chan": "string",
      "location": "string",
      "externalId": "number",
      "message": "string",
    }),
    "OPENBATTLE": t.iface([], {
      "type": "number",
      "natType": "number",
      "password": "string",
      "port": "number",
      "maxPlayers": "number",
      "gameHash": "number",
      "rank": "number",
      "mapHash": "number",
      "engineName": "string",
      "engineVersion": "string",
      "map": "string",
      "title": "string",
      "gameName": "string",
    }),
    "JOINBATTLE": t.iface([], {
      "battleId": "number",
      "password": "string",
      "scriptPassword": t.opt("string"),
    }),
    "JOINBATTLEACCEPT": t.iface([], {
      "userName": "string",
    }),
    "JOINBATTLEDENY": t.iface([], {
      "userName": "string",
      "reason": t.opt("string"),
    }),
    "LEAVEBATTLE": t.iface([], {
    }),
    "UPDATEBATTLEINFO": t.iface([], {
      "spectatorCount": "number",
      "locked": "boolean",
      "mapHash": "number",
      "mapName": "string",
    }),
    "MYSTATUS": t.iface([], {
      "status": "PlayerStatus",
    }),
    "MYBATTLESTATUS": t.iface([], {
      "battleStatus": "string",
      "myTeamColor": "number",
    }),
    "HANDICAP": t.iface([], {
      "userName": "string",
      "value": "number",
    }),
    "KICKFROMBATTLE": t.iface([], {
      "userName": "string",
    }),
    "FORCETEAMNO": t.iface([], {
      "userName": "string",
      "teamNo": "number",
    }),
    "FORCEALLYNO": t.iface([], {
      "userName": "string",
      "teamNo": "number",
    }),
    "FORCETEAMCOLOR": t.iface([], {
      "userName": "string",
      "color": "number",
    }),
    "FORCESPECTATORMODE": t.iface([], {
      "userName": "string",
    }),
    "DISABLEUNITS": t.iface([], {
      "unitNames": t.array("string"),
    }),
    "ENABLEUNITS": t.iface([], {
      "unitNames": t.array("string"),
    }),
    "ENABLEALLUNITS": t.iface([], {
    }),
    "RING": t.iface([], {
      "userName": "string",
    }),
    "ADDBOT": t.iface([], {
      "name": "string",
      "battleStatus": "string",
      "teamColor": "number",
      "aiDll": "string",
    }),
    "REMOVEBOT": t.iface([], {
    }),
    "UPDATEBOT": t.iface([], {
      "name": "string",
      "battleStatus": "string",
      "teamColor": "number",
    }),
    "ADDSTARTRECT": t.iface([], {
      "allyNo": "number",
      "left": "number",
      "top": "number",
      "right": "number",
      "bottom": "number",
    }),
    "REMOVESTARTRECT": t.iface([], {
      "allyNo": "number",
    }),
    "SETSCRIPTTAGS": t.iface([], {
      "pairs": t.array("string"),
    }),
    "REMOVESCRIPTTAGS": t.iface([], {
      "keys": t.array("string"),
    }),
    "IGNORE": t.iface([], {
      "userName": "string",
      "reason": t.opt("string"),
    }),
    "UNIGNORE": t.iface([], {
      "userName": "string",
    }),
    "IGNORELIST": t.iface([], {
    }),
    "LISTCOMPFLAGS": t.iface([], {
    }),
    "PROMOTE": t.iface([], {
    }),
  }),
  "Response": t.iface([], {
    "PONG": t.iface([], {
    }),
    "OK": t.iface([], {
    }),
    "TASSERVER": t.iface([], {
      "protocolVersion": "string",
      "springVersion": "string",
      "udpPort": "number",
      "serverMode": "number",
    }),
    "REGISTRATIONDENIED": t.iface([], {
      "reason": t.opt("string"),
    }),
    "REGISTRATIONACCEPTED": t.iface([], {
    }),
    "ACCEPTED": t.iface([], {
      "userName": "string",
    }),
    "DENIED": t.iface([], {
      "reason": "string",
    }),
    "LOGININFOEND": t.iface([], {
    }),
    "AGREEMENT": t.iface([], {
      "agreement": "string",
    }),
    "AGREEMENTEND": t.iface([], {
    }),
    "MOTD": t.iface([], {
      "message": "string",
    }),
    "CHANGEEMAILREQUESTACCEPTED": t.iface([], {
    }),
    "CHANGEEMAILREQUESTDENIED": t.iface([], {
      "errorMsg": "string",
    }),
    "CHANGEEMAILACCEPTED": t.iface([], {
    }),
    "CHANGEEMAILDENIED": t.iface([], {
      "errorMsg": "string",
    }),
    "RESENDVERIFICATIONACCEPTED": t.iface([], {
    }),
    "RESENDVERIFICATIONDENIED": t.iface([], {
      "errorMsg": "string",
    }),
    "RESETPASSWORDREQUESTACCEPTED": t.iface([], {
    }),
    "RESETPASSWORDREQUESTDENIED": t.iface([], {
      "errorMsg": "string",
    }),
    "RESETPASSWORDACCEPTED": t.iface([], {
    }),
    "RESETPASSWORDDENIED": t.iface([], {
      "errorMsg": "string",
    }),
    "ADDUSER": t.iface([], {
      "userName": "string",
      "country": "string",
      "cpu": t.lit(0),
      "userId": "number",
      "lobbyId": "number",
    }),
    "REMOVEUSER": t.iface([], {
      "userName": "string",
    }),
    "SERVERMSG": t.iface([], {
      "message": "string",
    }),
    "SERVERMSGBOX": t.iface([], {
      "message": "string",
      "url": t.opt("string"),
    }),
    "CHANNEL": t.iface([], {
      "chanName": "string",
      "userCount": "number",
      "topic": t.opt("string"),
    }),
    "ENDOFCHANNELS": t.iface([], {
    }),
    "JOIN": t.iface([], {
      "chanName": "string",
    }),
    "JOINFAILED": t.iface([], {
      "chanName": "string",
      "reason": "string",
    }),
    "CHANNELTOPIC": t.iface([], {
      "chanName": "string",
      "author": "string",
      "topic": "string",
    }),
    "CLIENTS": t.iface([], {
      "chanName": "string",
      "clients": t.array("string"),
    }),
    "JOINED": t.iface([], {
      "chanName": "string",
      "userName": "string",
    }),
    "LEFT": t.iface([], {
      "chanName": "string",
      "userName": "string",
      "reason": t.opt("string"),
    }),
    "CHANNELMESSAGE": t.iface([], {
      "chanName": "string",
      "message": "string",
    }),
    "SAID": t.iface([], {
      "chanName": "string",
      "userName": "string",
      "message": "string",
    }),
    "SAIDEX": t.iface([], {
      "chanName": "string",
      "userName": "string",
      "message": "string",
    }),
    "SAYPRIVATE": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "SAIDPRIVATE": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "SAYPRIVATEEX": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "SAIDPRIVATEEX": t.iface([], {
      "userName": "string",
      "message": "string",
    }),
    "BRIDGEDCLIENTFROM": t.iface([], {
      "location": "string",
      "externalId": "number",
      "externalUsername": "string",
    }),
    "UNBRIDGEDCLIENTFROM": t.iface([], {
      "location": "string",
      "externalId": "number",
      "externalUsername": "string",
    }),
    "JOINEDFROM": t.iface([], {
      "chan": "string",
      "bridge": "string",
      "userName": "string",
    }),
    "LEFTFROM": t.iface([], {
      "chan": "string",
      "userName": "string",
    }),
    "SAIDFROM": t.iface([], {
      "chan": "string",
      "userName": "string",
      "message": t.opt("string"),
    }),
    "CLIENTSFROM": t.iface([], {
      "chan": "string",
      "bridge": "string",
      "clients": t.array("string"),
    }),
    "OPENBATTLEFAILED": t.iface([], {
      "reason": "string",
    }),
    "BATTLEOPENED": t.iface([], {
      "battleId": "number",
      "type": "number",
      "natType": "number",
      "founder": "string",
      "ip": "string",
      "port": "number",
      "maxPlayers": "number",
      "passworded": "boolean",
      "rank": "number",
      "mapHash": "number",
      "engineName": "string",
      "engineVersion": "string",
      "map": "string",
      "title": "string",
      "gameName": "string",
      "channel": t.opt("string"),
    }),
    "OPENBATTLE": t.iface([], {
      "battleId": "number",
    }),
    "JOINBATTLE": t.iface([], {
      "battleId": "number",
      "hashCode": "number",
      "channelName": "string",
    }),
    "JOINBATTLEREQUEST": t.iface([], {
      "userName": "string",
      "ip": "string",
    }),
    "JOINBATTLEFAILED": t.iface([], {
      "reason": "string",
    }),
    "JOINEDBATTLE": t.iface([], {
      "battleId": "number",
      "userName": "string",
      "scriptPassword": t.opt("string"),
    }),
    "LEFTBATTLE": t.iface([], {
      "battleId": "number",
      "userName": "string",
    }),
    "BATTLECLOSED": t.iface([], {
      "battleId": "number",
    }),
    "UDPSOURCEPORT": t.iface([], {
      "port": "number",
    }),
    "CLIENTIPPORT": t.iface([], {
      "userName": "string",
      "ip": "string",
      "port": "number",
    }),
    "HOSTPORT": t.iface([], {
      "port": "number",
    }),
    "UPDATEBATTLEINFO": t.iface([], {
      "battleId": "number",
      "spectatorCount": "number",
      "locked": "boolean",
      "mapHash": "number",
      "mapName": "string",
    }),
    "CLIENTSTATUS": t.iface([], {
      "userName": "string",
      "status": "PlayerStatus",
    }),
    "CLIENTBATTLESTATUS": t.iface([], {
      "userName": "string",
      "battleStatus": "string",
      "teamColor": "number",
    }),
    "REQUESTBATTLESTATUS": t.iface([], {
    }),
    "KICKFROMBATTLE": t.iface([], {
      "battleId": "number",
      "userName": "string",
    }),
    "FORCEQUITBATTLE": t.iface([], {
    }),
    "DISABLEUNITS": t.iface([], {
      "unitNames": t.array("string"),
    }),
    "ENABLEUNITS": t.iface([], {
      "unitNames": t.array("string"),
    }),
    "ENABLEALLUNITS": t.iface([], {
    }),
    "RING": t.iface([], {
      "userName": "string",
    }),
    "ADDBOT": t.iface([], {
      "battleId": "number",
      "name": "string",
      "owner": "string",
      "battleStatus": "string",
      "teamColor": "number",
      "aiDll": "string",
    }),
    "REMOVEBOT": t.iface([], {
      "battleId": "number",
      "name": "string",
    }),
    "UPDATEBOT": t.iface([], {
      "battleId": "number",
      "name": "string",
      "battleStatus": "string",
      "teamColor": "number",
    }),
    "ADDSTARTRECT": t.iface([], {
      "allyNo": "number",
      "left": "number",
      "top": "number",
      "right": "number",
      "bottom": "number",
    }),
    "REMOVESTARTRECT": t.iface([], {
      "allyNo": "number",
    }),
    "SETSCRIPTTAGS": t.iface([], {
      "pairs": t.array("string"),
    }),
    "REMOVESCRIPTTAGS": t.iface([], {
      "keys": t.array("string"),
    }),
    "IGNORE": t.iface([], {
      "userName": "string",
      "reason": t.opt("string"),
    }),
    "UNIGNORE": t.iface([], {
      "userName": "string",
    }),
    "IGNORELISTBEGIN": t.iface([], {
    }),
    "IGNORELIST": t.iface([], {
      "userName": "string",
      "reason": t.opt("string"),
    }),
    "IGNORELISTEND": t.iface([], {
    }),
    "COMPFLAGS": t.iface([], {
      "compFlags": t.array("string"),
    }),
    "REDIRECT": t.iface([], {
      "ip": "string",
      "port": "number",
    }),
    "FAILED": t.iface([], {
    }),
    "JSON": t.iface([], {
    }),
  }),
});

export const PlayerStatus = t.iface([], {
  "ingame": "boolean",
  "away": "boolean",
  "rank": "number",
  "moderator": "boolean",
  "bot": "boolean",
});

export const SLPTypes = t.union("string", "number", "boolean", t.array("string"), "PlayerStatus", "undefined");

const exportedTypeSuite: t.ITypeSuite = {
  SpringLobbyProtocol,
  PlayerStatus,
  SLPTypes,
};
export default exportedTypeSuite;
