// Purpose: Audio buses + control mode (swipe / D-pad) + privacy entry. Persisted via SaveService.

using CruzaRD.Audio;
using CruzaRD.Core;
using CruzaRD.Services;
using CruzaRD.UI.Components;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Screens
{
    public sealed class SettingsView : MonoBehaviour
    {
        [SerializeField] private GameObject _root;
        [SerializeField] private Slider _musicSlider;
        [SerializeField] private Slider _sfxSlider;
        [SerializeField] private Slider _ambienceSlider;
        [SerializeField] private Slider _voiceSlider;
        [SerializeField] private Toggle _dpadToggle;
        [SerializeField] private Toggle _hapticsToggle;      // GDD v3 §5.2
        [SerializeField] private Toggle _reduceMotionToggle; // GDD v3 §11.4
        [SerializeField] private Button _closeButton;
        [SerializeField] private Button _privacyButton;
        [SerializeField] private TMP_Dropdown _languageDropdown;

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            Wire();
            SetVisible(false);
            LoadFromSave();
        }

        private void Wire()
        {
            if (_closeButton != null) _closeButton.onClick.AddListener(Hide);
            if (_privacyButton != null) _privacyButton.onClick.AddListener(OpenPrivacy);
            if (_musicSlider != null) _musicSlider.onValueChanged.AddListener(v => SetBus(AudioBus.Music, v));
            if (_sfxSlider != null) _sfxSlider.onValueChanged.AddListener(v => SetBus(AudioBus.Sfx, v));
            if (_ambienceSlider != null) _ambienceSlider.onValueChanged.AddListener(v => SetBus(AudioBus.Ambience, v));
            if (_voiceSlider != null) _voiceSlider.onValueChanged.AddListener(v => SetBus(AudioBus.Voice, v));
            if (_dpadToggle != null) _dpadToggle.onValueChanged.AddListener(OnDpadToggle);
            if (_hapticsToggle != null) _hapticsToggle.onValueChanged.AddListener(OnHapticsToggle);
            if (_reduceMotionToggle != null) _reduceMotionToggle.onValueChanged.AddListener(OnReduceMotionToggle);
            if (_languageDropdown != null) _languageDropdown.onValueChanged.AddListener(OnLanguage);
        }

        public void Show()
        {
            LoadFromSave();
            SetVisible(true);
        }

        public void Hide() => SetVisible(false);

        private void SetVisible(bool v)
        {
            if (_root != null) _root.SetActive(v);
        }

        private void LoadFromSave()
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            var s = save.Data.Settings;
            if (_musicSlider != null) _musicSlider.SetValueWithoutNotify(s.MusicVolume);
            if (_sfxSlider != null) _sfxSlider.SetValueWithoutNotify(s.SfxVolume);
            if (_ambienceSlider != null) _ambienceSlider.SetValueWithoutNotify(s.AmbienceVolume);
            if (_voiceSlider != null) _voiceSlider.SetValueWithoutNotify(s.VoiceVolume);
            if (_dpadToggle != null) _dpadToggle.SetIsOnWithoutNotify(s.UseOnScreenDpad);
            if (_hapticsToggle != null) _hapticsToggle.SetIsOnWithoutNotify(s.HapticsEnabled);
            if (_reduceMotionToggle != null) _reduceMotionToggle.SetIsOnWithoutNotify(s.ReduceMotion);

            ApplyDpad(s.UseOnScreenDpad);
            AudioManager.Instance?.ApplyVolumes(s.MusicVolume, s.SfxVolume, s.AmbienceVolume, s.VoiceVolume);
        }

        private void SetBus(AudioBus bus, float value)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            var s = save.Data.Settings;
            switch (bus)
            {
                case AudioBus.Music: s.MusicVolume = value; break;
                case AudioBus.Sfx: s.SfxVolume = value; break;
                case AudioBus.Ambience: s.AmbienceVolume = value; break;
                case AudioBus.Voice: s.VoiceVolume = value; break;
            }
            save.Save();
            AudioManager.Instance?.SetBusVolume(bus, value);
            EventBus.Publish(new SettingsChangedEvent(bus.ToString()));
        }

        private void OnDpadToggle(bool on)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            save.Data.Settings.UseOnScreenDpad = on;
            save.Save();
            ApplyDpad(on);
            EventBus.Publish(new SettingsChangedEvent("dpad"));
        }

        private void OnHapticsToggle(bool on)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            save.Data.Settings.HapticsEnabled = on;
            save.Save();
            EventBus.Publish(new SettingsChangedEvent("haptics"));
        }

        private void OnReduceMotionToggle(bool on)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            save.Data.Settings.ReduceMotion = on;
            save.Save();
            EventBus.Publish(new SettingsChangedEvent("reduce_motion"));
        }

        private static void ApplyDpad(bool on)
        {
            var dpad = Object.FindFirstObjectByType<OnScreenDpad>(FindObjectsInactive.Include);
            if (dpad != null) dpad.SetEnabled(on);
        }

        private void OnLanguage(int index)
        {
            if (!ServiceLocator.TryGet<ISaveService>(out var save)) return;
            save.Data.Settings.Language = index == 1 ? "en" : "es";
            save.Save();
            EventBus.Publish(new SettingsChangedEvent("language"));
        }

        private void OpenPrivacy()
        {
            Application.OpenURL("https://logiccodespot.com/cruzard/privacy");
        }

        public void Bind(GameObject root, Slider music, Slider sfx, Slider ambience, Slider voice,
            Toggle dpad, Button close, Button privacy, TMP_Dropdown language,
            Toggle haptics = null, Toggle reduceMotion = null)
        {
            _root = root;
            _musicSlider = music;
            _sfxSlider = sfx;
            _ambienceSlider = ambience;
            _voiceSlider = voice;
            _dpadToggle = dpad;
            _hapticsToggle = haptics;
            _reduceMotionToggle = reduceMotion;
            _closeButton = close;
            _privacyButton = privacy;
            _languageDropdown = language;
            Wire();
        }
    }
}
