// Purpose: Shop shell — tabs Personajes/Skins/Vehículos/Pase. Economy via EconomyService only.

using CruzaRD.Core;
using CruzaRD.Economy;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace CruzaRD.UI.Screens
{
    public sealed class ShopView : MonoBehaviour
    {
        [SerializeField] private GameObject _root;
        [SerializeField] private TextMeshProUGUI _papeletasText;
        [SerializeField] private TextMeshProUGUI _trofeosText;
        [SerializeField] private TextMeshProUGUI _statusText;
        [SerializeField] private Button _closeButton;
        [SerializeField] private Button _tabCharacters;
        [SerializeField] private Button _tabSkins;
        [SerializeField] private Button _tabVehicles;
        [SerializeField] private Button _tabPass;
        [SerializeField] private Button _buySampleButton;

        private string _activeTab = "characters";

        private void Awake()
        {
            if (_root == null) _root = gameObject;
            AutoWireIfNeeded();
            if (_closeButton != null) _closeButton.onClick.AddListener(Hide);
            if (_tabCharacters != null) _tabCharacters.onClick.AddListener(() => SetTab("characters"));
            if (_tabSkins != null) _tabSkins.onClick.AddListener(() => SetTab("skins"));
            if (_tabVehicles != null) _tabVehicles.onClick.AddListener(() => SetTab("vehicles"));
            if (_tabPass != null) _tabPass.onClick.AddListener(() => SetTab("pass"));
            if (_buySampleButton != null) _buySampleButton.onClick.AddListener(BuySampleCosmetic);
            SetVisible(false);
        }

        private void AutoWireIfNeeded()
        {
            if (_papeletasText == null)
            {
                foreach (var t in GetComponentsInChildren<TextMeshProUGUI>(true))
                {
                    if (t.name == "Pap") _papeletasText = t;
                    else if (t.name == "Trof") _trofeosText = t;
                    else if (t.name == "Status") _statusText = t;
                }
            }

            foreach (var b in GetComponentsInChildren<Button>(true))
            {
                if (b.name == "Close" && _closeButton == null) _closeButton = b;
                if (b.name == "BuySample" && _buySampleButton == null) _buySampleButton = b;
            }
        }

        private void OnEnable()
        {
            EventBus.Subscribe<CurrencyChangedEvent>(OnCurrency);
        }

        private void OnDisable()
        {
            EventBus.Unsubscribe<CurrencyChangedEvent>(OnCurrency);
        }

        public void Show()
        {
            RefreshBalances();
            SetTab(_activeTab);
            SetVisible(true);
        }

        public void Hide() => SetVisible(false);

        private void SetVisible(bool v)
        {
            if (_root != null) _root.SetActive(v);
        }

        private void SetTab(string tab)
        {
            _activeTab = tab;
            if (_statusText != null)
                _statusText.text = $"Catálogo: {tab} (cosméticos — cero pay-to-win)";
        }

        private void RefreshBalances()
        {
            if (!ServiceLocator.TryGet<IEconomyService>(out var eco)) return;
            if (_papeletasText != null) _papeletasText.text = eco.GetBalance(CurrencyIds.Papeletas).ToString("N0");
            if (_trofeosText != null) _trofeosText.text = eco.GetBalance(CurrencyIds.Trofeos).ToString("N0");
        }

        private void OnCurrency(CurrencyChangedEvent _) => RefreshBalances();

        private void BuySampleCosmetic()
        {
            if (!ServiceLocator.TryGet<IEconomyService>(out var eco)) return;
            var ok = eco.TrySpend(CurrencyIds.Papeletas, 100, "shop_skin_sample");
            if (_statusText != null)
                _statusText.text = ok
                    ? "Compra cosmética OK — sin ventaja de gameplay"
                    : "Papeletas insuficientes";
            RefreshBalances();
        }
    }
}
