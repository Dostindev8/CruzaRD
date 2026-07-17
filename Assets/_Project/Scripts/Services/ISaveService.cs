// Purpose: Contracts for persistence — single door for all durable state.

namespace CruzaRD.Services
{
    public interface ISaveService
    {
        PlayerSaveData Data { get; }
        void Load();
        void Save();
        void ResetProgress();
    }

    [System.Serializable]
    public sealed class PlayerSaveData
    {
        public int SchemaVersion = 1;
        public int BestScore;
        public int TotalDistance;
        public int Papeletas;
        public int Trofeos;
        public int SeasonXp;
        public bool SeasonPremium;
        public string EquippedCharacterId = "char_estudiante";
        public SettingsSaveData Settings = new();
        public string IntegrityHash;
    }

    [System.Serializable]
    public sealed class SettingsSaveData
    {
        public float MusicVolume = 0.8f;
        public float SfxVolume = 1f;
        public float AmbienceVolume = 0.7f;
        public float VoiceVolume = 0.9f;
        public bool UseOnScreenDpad;
        public string Language = "es";
        public int QualityTier = -1; // -1 = auto
    }
}
