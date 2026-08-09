class PlayerSaveData {
  PlayerSaveData({
    this.schemaVersion = 1,
    this.bestScore = 0,
    this.totalDistance = 0,
    this.papeletas = 0,
    this.trofeos = 0,
    this.seasonXp = 0,
    this.seasonPremium = false,
    this.equippedCharacterId = 'char_estudiante',
    this.integrityHash = '',
  });

  int schemaVersion;
  int bestScore;
  int totalDistance;
  int papeletas;
  int trofeos;
  int seasonXp;
  bool seasonPremium;
  String equippedCharacterId;
  String integrityHash;

  Map<String, dynamic> toIntegrityPayload() => {
        'schemaVersion': schemaVersion,
        'bestScore': bestScore,
        'totalDistance': totalDistance,
        'papeletas': papeletas,
        'trofeos': trofeos,
        'seasonXp': seasonXp,
        'seasonPremium': seasonPremium,
        'equippedCharacterId': equippedCharacterId,
      };

  Map<String, dynamic> toJson() => {
        ...toIntegrityPayload(),
        'integrityHash': integrityHash,
      };

  factory PlayerSaveData.fromJson(Map<String, dynamic> json) => PlayerSaveData(
        schemaVersion: json['schemaVersion'] as int? ?? 1,
        bestScore: json['bestScore'] as int? ?? 0,
        totalDistance: json['totalDistance'] as int? ?? 0,
        papeletas: json['papeletas'] as int? ?? 0,
        trofeos: json['trofeos'] as int? ?? 0,
        seasonXp: json['seasonXp'] as int? ?? 0,
        seasonPremium: json['seasonPremium'] as bool? ?? false,
        equippedCharacterId:
            json['equippedCharacterId'] as String? ?? 'char_estudiante',
        integrityHash: json['integrityHash'] as String? ?? '',
      );
}
