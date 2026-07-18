// Purpose: Main menu — Jugar, Tienda, Ajustes. Brand-first, one CTA group.

using CruzaRD.Core;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Screens
{
    public sealed class MainMenuView : MonoBehaviour
    {
        [SerializeField] private GameObject _root;
        [SerializeField] private Button _playButton;
        [SerializeField] private Button _shopButton;
        [SerializeField] private Button _settingsButton;
        [SerializeField] private TextMeshProUGUI _brandTitle;
        [SerializeField] private TextMeshProUGUI _tagline;

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            if (_playButton != null) _playButton.onClick.AddListener(OnPlay);
            if (_settingsButton != null) _settingsButton.onClick.AddListener(OnSettings);
            if (_shopButton != null) _shopButton.onClick.AddListener(OnShop);

            if (_brandTitle != null) _brandTitle.text = "CRUZA RD";
            if (_tagline != null) _tagline.text = "¡Quítate del Medio!";
        }

        private void OnEnable()
        {
            EventBus.Subscribe<GameStartedEvent>(OnGameStarted);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<GameStartedEvent>(OnGameStarted);
        }

        private void OnGameStarted(GameStartedEvent _) => Hide();

        public void Show()
        {
            if (_root != null) _root.SetActive(true);
            GameManager.Instance?.GoToMenu();
        }

        public void Hide()
        {
            if (_root != null) _root.SetActive(false);
        }

        private void OnPlay()
        {
            Hide();
            GameManager.Instance?.StartRun();
        }

        private void OnSettings()
        {
            FindFirstObjectByType<SettingsView>()?.Show();
        }

        private void OnShop()
        {
            FindFirstObjectByType<ShopView>()?.Show();
        }

        public void Bind(GameObject root, Button play, Button shop, Button settings,
            TextMeshProUGUI brand, TextMeshProUGUI tagline)
        {
            _root = root;
            _playButton = play;
            _shopButton = shop;
            _settingsButton = settings;
            _brandTitle = brand;
            _tagline = tagline;
            if (_playButton != null)
            {
                _playButton.onClick.RemoveAllListeners();
                _playButton.onClick.AddListener(OnPlay);
            }
            if (_settingsButton != null)
            {
                _settingsButton.onClick.RemoveAllListeners();
                _settingsButton.onClick.AddListener(OnSettings);
            }
            if (_shopButton != null)
            {
                _shopButton.onClick.RemoveAllListeners();
                _shopButton.onClick.AddListener(OnShop);
            }
        }
    }
}
