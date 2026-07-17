// Purpose: Four independent buses — Music / SFX / Ambience / Voice — with ducking on risk.

using System.Collections.Generic;
using CruzaRD.Core;
using CruzaRD.Services;
using UnityEngine;

namespace CruzaRD.Audio
{
    public enum AudioBus
    {
        Music,
        Sfx,
        Ambience,
        Voice
    }

    public sealed class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [SerializeField] private float _duckMusicTo = 0.25f;
        [SerializeField] private float _duckFadeSeconds = 0.2f;

        private readonly Dictionary<AudioBus, float> _volumes = new()
        {
            { AudioBus.Music, 0.8f },
            { AudioBus.Sfx, 1f },
            { AudioBus.Ambience, 0.7f },
            { AudioBus.Voice, 0.9f }
        };

        private AudioSource _music;
        private AudioSource _sfx;
        private AudioSource _ambience;
        private AudioSource _voice;
        private float _musicTarget = 0.8f;
        private bool _ducking;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            _music = CreateSource("MusicBus");
            _sfx = CreateSource("SfxBus");
            _ambience = CreateSource("AmbienceBus");
            _voice = CreateSource("VoiceBus");
            _music.loop = true;
            _ambience.loop = true;
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameStartedEvent>(_ => Unduck());
            EventBus.Subscribe<GameOverEvent>(_ => Unduck());
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameStartedEvent>(_ => Unduck());
            EventBus.Unsubscribe<GameOverEvent>(_ => Unduck());
        }

        private void Update()
        {
            var target = _ducking ? _volumes[AudioBus.Music] * _duckMusicTo : _musicTarget;
            if (_music != null)
                _music.volume = Mathf.MoveTowards(_music.volume, target, Time.unscaledDeltaTime / _duckFadeSeconds);
        }

        public void ApplyVolumes(float music, float sfx, float ambience, float voice)
        {
            SetBusVolume(AudioBus.Music, music);
            SetBusVolume(AudioBus.Sfx, sfx);
            SetBusVolume(AudioBus.Ambience, ambience);
            SetBusVolume(AudioBus.Voice, voice);
        }

        public void SetBusVolume(AudioBus bus, float volume)
        {
            volume = Mathf.Clamp01(volume);
            _volumes[bus] = volume;
            switch (bus)
            {
                case AudioBus.Music:
                    _musicTarget = volume;
                    if (!_ducking && _music != null) _music.volume = volume;
                    break;
                case AudioBus.Sfx:
                    if (_sfx != null) _sfx.volume = volume;
                    break;
                case AudioBus.Ambience:
                    if (_ambience != null) _ambience.volume = volume;
                    break;
                case AudioBus.Voice:
                    if (_voice != null) _voice.volume = volume;
                    break;
            }
        }

        public void PlaySfx(string id)
        {
            // Clip library wired when assets land; keep call sites stable.
            if (_sfx == null) return;
            _sfx.pitch = Random.Range(0.95f, 1.05f);
        }

        public void DuckMusicForRisk()
        {
            _ducking = true;
        }

        public void Unduck()
        {
            _ducking = false;
        }

        public void PersistVolumes()
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            save.Data.Settings.MusicVolume = _volumes[AudioBus.Music];
            save.Data.Settings.SfxVolume = _volumes[AudioBus.Sfx];
            save.Data.Settings.AmbienceVolume = _volumes[AudioBus.Ambience];
            save.Data.Settings.VoiceVolume = _volumes[AudioBus.Voice];
            save.Save();
        }

        private AudioSource CreateSource(string name)
        {
            var go = new GameObject(name);
            go.transform.SetParent(transform, false);
            return go.AddComponent<AudioSource>();
        }
    }
}
