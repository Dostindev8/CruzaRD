// Purpose: Headless Android AAB / iOS export entry points for CI and Tools/Build scripts.

using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace CruzaRD.EditorTools
{
    public static class CruzaRDBuildPipeline
    {
        private static string[] EnabledScenes()
        {
            return EditorBuildSettings.scenes
                .Where(s => s.enabled)
                .Select(s => s.path)
                .ToArray();
        }

        public static void BuildAndroidAab()
        {
            var version = GetArg("-buildVersion") ?? Application.version;
            PlayerSettings.bundleVersion = version;
            PlayerSettings.Android.bundleVersionCode = ParseVersionCode(version);

            EditorUserBuildSettings.buildAppBundle = true;
            EditorUserBuildSettings.androidBuildSystem = AndroidBuildSystem.Gradle;

            var outDir = Path.Combine(Directory.GetCurrentDirectory(), "Builds", "Android");
            Directory.CreateDirectory(outDir);
            var aab = Path.Combine(outDir, $"CruzaRD_{version}.aab");

            var scenes = EnabledScenes();
            if (scenes.Length == 0)
            {
                Debug.LogError("[Build] No scenes in Build Settings. Run Cruza RD → Setup Prototype Scene.");
                EditorApplication.Exit(1);
                return;
            }

            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = aab,
                target = BuildTarget.Android,
                options = BuildOptions.CompressWithLz4HC
            };

            var report = UnityEditor.BuildPipeline.BuildPlayer(options);
            var ok = report.summary.result == BuildResult.Succeeded;
            Debug.Log(ok
                ? $"[Build] Android AAB OK → {aab}"
                : $"[Build] Android FAILED: {report.summary.totalErrors} errors");
            EditorApplication.Exit(ok ? 0 : 1);
        }

        private static int ParseVersionCode(string version)
        {
            // 0.9.0-beta.1 → 9001 style fallback
            var digits = new string(version.Where(char.IsDigit).ToArray());
            if (int.TryParse(digits.Length > 6 ? digits[..6] : digits, out var code) && code > 0)
                return code;
            return 1;
        }

        private static string GetArg(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (int i = 0; i < args.Length - 1; i++)
            {
                if (args[i] == name)
                    return args[i + 1];
            }
            return null;
        }
    }
}
