// Purpose: AES encryption for save payloads. Key derived from device + app salt.
// Secrets never hardcoded in plaintext; no PlayerPrefs for economy.

using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;

namespace CruzaRD.Infrastructure
{
    public static class SecurePrefs
    {
        private const string PrefKeyInstalled = "cruzard_install_id";
        private static byte[] _key;
        private static byte[] _iv;

        public static string DeviceSalt { get; private set; } = "pending";

        public static void EnsureInitialized()
        {
            if (_key != null) return;

            var installId = PlayerPrefs.GetString(PrefKeyInstalled, string.Empty);
            if (string.IsNullOrEmpty(installId))
            {
                installId = Guid.NewGuid().ToString("N");
                PlayerPrefs.SetString(PrefKeyInstalled, installId);
                PlayerPrefs.Save();
            }

            DeviceSalt = installId;
            // App-specific pepper (not a cloud secret — obfuscation + device binding)
            var material = $"CruzaRD|{Application.identifier}|{installId}|LogicCodeSpot";
            using var sha = SHA256.Create();
            _key = sha.ComputeHash(Encoding.UTF8.GetBytes(material));
            _iv = sha.ComputeHash(Encoding.UTF8.GetBytes(installId + "|iv"));
            Array.Resize(ref _iv, 16);
        }

        public static byte[] EncryptString(string plain)
        {
            EnsureInitialized();
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var ms = new MemoryStream();
            using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs, Encoding.UTF8))
            {
                sw.Write(plain);
            }
            return ms.ToArray();
        }

        public static string DecryptToString(byte[] cipher)
        {
            EnsureInitialized();
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var ms = new MemoryStream(cipher);
            using var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
            using var sr = new StreamReader(cs, Encoding.UTF8);
            return sr.ReadToEnd();
        }
    }
}
