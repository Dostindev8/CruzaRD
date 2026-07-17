// Purpose: App entry — registers services, applies quality tier, loads first scene flow.

using CruzaRD.Audio;
using CruzaRD.Economy;
using CruzaRD.Infrastructure;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Core
{
    [DefaultExecutionOrder(-1000)]
    public sealed class GameBootstrap : MonoBehaviour
    {
        [SerializeField] private bool _dontDestroy = true;

        private void Awake()
        {
            if (_dontDestroy)
                DontDestroyOnLoad(gameObject);

            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;

            SecurePrefs.EnsureInitialized();

            var save = new SaveService();
            save.Load();
            ServiceLocator.Register<ISaveService>(save);

            DeviceQualityBenchmark.ApplyRecommendedQuality();

            var economy = new EconomyService(save);
            ServiceLocator.Register<IEconomyService>(economy);

            var ads = new AdsServiceStub();
            ServiceLocator.Register<IAdsService>(ads);

            var analytics = new AnalyticsServiceStub();
            ServiceLocator.Register<IAnalyticsService>(analytics);

            var remoteConfig = new RemoteConfigServiceStub();
            ServiceLocator.Register<IRemoteConfigService>(remoteConfig);

            if (AudioManager.Instance == null)
            {
                var audioGo = new GameObject("AudioManager");
                audioGo.AddComponent<AudioManager>();
                DontDestroyOnLoad(audioGo);
            }

            if (GameManager.Instance == null)
            {
                var gmGo = new GameObject("GameManager");
                gmGo.AddComponent<GameManager>();
            }

            if (FindFirstObjectByType<RunRewardsListener>() == null)
                gameObject.AddComponent<RunRewardsListener>();
        }
    }
}
