// Purpose: Sole persistence gateway — encrypted local JSON + integrity hash.
// Hook ready for cloud sync (Firestore) without changing call sites.

using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using CruzaRD.Infrastructure;
using UnityEngine;

namespace CruzaRD.Services
{
    public sealed class SaveService : ISaveService
    {
        private const string FileName = "cruzard_save.dat";
        private const int CurrentSchema = 1;

        public PlayerSaveData Data { get; private set; } = new();

        public void Load()
        {
            try
            {
                var path = GetPath();
                if (!File.Exists(path))
                {
                    Data = new PlayerSaveData();
                    Save();
                    return;
                }

                var encrypted = File.ReadAllBytes(path);
                var json = SecurePrefs.DecryptToString(encrypted);
                var loaded = JsonUtility.FromJson<PlayerSaveData>(json);
                if (loaded == null)
                {
                    Data = new PlayerSaveData();
                    return;
                }

                if (!VerifyIntegrity(loaded))
                {
                    Debug.LogWarning("[SaveService] Integrity check failed — resetting soft currencies to safe defaults.");
                    loaded.Papeletas = Mathf.Min(loaded.Papeletas, 500);
                    loaded.Trofeos = Mathf.Min(loaded.Trofeos, 10);
                }

                if (loaded.SchemaVersion < CurrentSchema)
                    Migrate(loaded);

                Data = loaded;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[SaveService] Load failed: {ex.Message}");
                Data = new PlayerSaveData();
            }
        }

        public void Save()
        {
            try
            {
                Data.SchemaVersion = CurrentSchema;
                Data.IntegrityHash = ComputeIntegrity(Data);
                var json = JsonUtility.ToJson(Data);
                var encrypted = SecurePrefs.EncryptString(json);
                File.WriteAllBytes(GetPath(), encrypted);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SaveService] Save failed: {ex.Message}");
            }
        }

        public void ResetProgress()
        {
            var settings = Data.Settings;
            Data = new PlayerSaveData { Settings = settings };
            Save();
        }

        /// <summary>Cloud sync hook — call after Firestore pull; keeps higher progress.</summary>
        public void MergeFromCloud(PlayerSaveData remote)
        {
            if (remote == null) return;
            if (remote.BestScore > Data.BestScore) Data.BestScore = remote.BestScore;
            if (remote.TotalDistance > Data.TotalDistance) Data.TotalDistance = remote.TotalDistance;
            if (remote.SeasonXp > Data.SeasonXp) Data.SeasonXp = remote.SeasonXp;
            Data.Papeletas = Math.Max(Data.Papeletas, remote.Papeletas);
            Data.Trofeos = Math.Max(Data.Trofeos, remote.Trofeos);
            Save();
        }

        private static void Migrate(PlayerSaveData data)
        {
            data.SchemaVersion = CurrentSchema;
        }

        private static string GetPath() => Path.Combine(Application.persistentDataPath, FileName);

        private static string ComputeIntegrity(PlayerSaveData data)
        {
            var payload = $"{data.Papeletas}|{data.Trofeos}|{data.BestScore}|{data.SeasonXp}|{SecurePrefs.DeviceSalt}";
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToBase64String(hash);
        }

        private static bool VerifyIntegrity(PlayerSaveData data)
        {
            if (string.IsNullOrEmpty(data.IntegrityHash)) return true; // first boot
            return data.IntegrityHash == ComputeIntegrity(data);
        }
    }
}
