// Purpose: Builds full responsive UI at runtime (prototype + production bootstrap).
// Canvas Scale With Screen Size, Safe Area, brand colors, TMP texts.

using CruzaRD.UI.Components;
using CruzaRD.UI.Screens;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.UI;

namespace CruzaRD.UI
{
    public sealed class RuntimeUIBuilder : MonoBehaviour
    {
        [SerializeField] private bool _buildOnAwake = true;

        private void Awake()
        {
            if (_buildOnAwake)
                Build();
        }

        [ContextMenu("Rebuild UI")]
        public void Build()
        {
            EnsureEventSystem();

            var canvasGo = new GameObject("UICanvas", typeof(Canvas), typeof(CanvasScaler),
                typeof(GraphicRaycaster), typeof(ResponsiveCanvasScaler));
            DontDestroyOnLoad(canvasGo);
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 100;

            var safeGo = CreateUiObject("SafeArea", canvasGo.transform);
            var safeRt = safeGo.GetComponent<RectTransform>();
            StretchFull(safeRt);
            safeGo.AddComponent<SafeAreaHandler>();

            BuildMainMenu(safeGo.transform);
            BuildHud(safeGo.transform);
            BuildDeath(safeGo.transform);
            BuildSettings(safeGo.transform);
            BuildShop(safeGo.transform);
            BuildDpad(safeGo.transform);
        }

        private static void EnsureEventSystem()
        {
            if (FindFirstObjectByType<EventSystem>() != null) return;
            var es = new GameObject("EventSystem", typeof(EventSystem), typeof(InputSystemUIInputModule));
            DontDestroyOnLoad(es);
        }

        private void BuildMainMenu(Transform parent)
        {
            var root = CreatePanel("MainMenu", parent, UITheme.PanelDark);
            StretchFull(root.GetComponent<RectTransform>());

            var brand = CreateTmp("Brand", root.transform, "CRUZA RD", 72, TextAlignmentOptions.Center);
            Place(brand.rectTransform, 0.5f, 0.72f, 0.9f, 0.12f);
            brand.color = UITheme.FlagWhite;
            brand.fontStyle = FontStyles.Bold;

            var rd = CreateTmp("RD", root.transform, "RD", 96, TextAlignmentOptions.Center);
            Place(rd.rectTransform, 0.5f, 0.62f, 0.5f, 0.1f);
            rd.text = "<color=#002D62>R</color><color=#CE1126>D</color>";
            rd.richText = true;

            var tag = CreateTmp("Tagline", root.transform, "¡Quítate del Medio!", 36, TextAlignmentOptions.Center);
            Place(tag.rectTransform, 0.5f, 0.54f, 0.85f, 0.06f);
            tag.color = UITheme.Gold;

            var play = CreateButton("PlayBtn", root.transform, "JUGAR", UITheme.FlagRed);
            Place(play.GetComponent<RectTransform>(), 0.5f, 0.38f, 0.7f, 0.08f);

            var shop = CreateButton("ShopBtn", root.transform, "Tienda", UITheme.FlagBlue);
            Place(shop.GetComponent<RectTransform>(), 0.5f, 0.28f, 0.7f, 0.07f);

            var settings = CreateButton("SettingsBtn", root.transform, "Ajustes", UITheme.TropicalGreen);
            Place(settings.GetComponent<RectTransform>(), 0.5f, 0.19f, 0.7f, 0.07f);

            var view = root.AddComponent<MainMenuView>();
            view.Bind(root, play, shop, settings, brand, tag);
        }

        private void BuildHud(Transform parent)
        {
            var root = CreateUiObject("HUD", parent);
            StretchFull(root.GetComponent<RectTransform>());

            var score = CreateTmp("Score", root.transform, "0", 48, TextAlignmentOptions.TopLeft);
            Place(score.rectTransform, 0.08f, 0.92f, 0.4f, 0.06f);
            score.color = UITheme.FlagWhite;

            var dist = CreateTmp("Distance", root.transform, "0 m", 32, TextAlignmentOptions.TopLeft);
            Place(dist.rectTransform, 0.08f, 0.86f, 0.4f, 0.05f);
            dist.color = UITheme.TextMuted;

            var combo = CreateTmp("Combo", root.transform, "", 36, TextAlignmentOptions.Top);
            Place(combo.rectTransform, 0.5f, 0.9f, 0.4f, 0.05f);
            combo.color = UITheme.Gold;

            var pap = CreateTmp("Papeletas", root.transform, "0", 32, TextAlignmentOptions.TopRight);
            Place(pap.rectTransform, 0.92f, 0.92f, 0.25f, 0.05f);
            pap.color = UITheme.Gold;

            var pause = CreateButton("PauseBtn", root.transform, "II", UITheme.FlagBlue);
            Place(pause.GetComponent<RectTransform>(), 0.92f, 0.84f, 0.12f, 0.055f);

            var hud = root.AddComponent<HudView>();
            hud.Bind(score, dist, combo, pap, pause, root);
            root.SetActive(false);
        }

        private void BuildDeath(Transform parent)
        {
            var root = CreatePanel("DeathScreen", parent, UITheme.PanelDark);
            StretchFull(root.GetComponent<RectTransform>());

            var title = CreateTmp("Title", root.transform, "¡QUÍTATE DEL MEDIO!", 44, TextAlignmentOptions.Center);
            Place(title.rectTransform, 0.5f, 0.75f, 0.9f, 0.08f);
            title.color = UITheme.FlagRed;

            var score = CreateTmp("Score", root.transform, "Puntaje: 0", 40, TextAlignmentOptions.Center);
            Place(score.rectTransform, 0.5f, 0.64f, 0.85f, 0.06f);

            var dist = CreateTmp("Dist", root.transform, "Distancia: 0 m", 32, TextAlignmentOptions.Center);
            Place(dist.rectTransform, 0.5f, 0.58f, 0.85f, 0.05f);

            var best = CreateTmp("Best", root.transform, "Mejor: 0", 28, TextAlignmentOptions.Center);
            Place(best.rectTransform, 0.5f, 0.52f, 0.85f, 0.05f);
            best.color = UITheme.Gold;

            var revive = CreateButton("ReviveBtn", root.transform, "Revivir (anuncio)", UITheme.Gold);
            Place(revive.GetComponent<RectTransform>(), 0.5f, 0.38f, 0.75f, 0.08f);
            var reviveLabel = revive.GetComponentInChildren<TextMeshProUGUI>();

            var retry = CreateButton("RetryBtn", root.transform, "Jugar de nuevo", UITheme.FlagRed);
            Place(retry.GetComponent<RectTransform>(), 0.5f, 0.28f, 0.75f, 0.08f);

            var menu = CreateButton("MenuBtn", root.transform, "Menú", UITheme.FlagBlue);
            Place(menu.GetComponent<RectTransform>(), 0.5f, 0.18f, 0.75f, 0.07f);

            var view = root.AddComponent<DeathScreenView>();
            view.Bind(root, title, score, dist, best, revive, retry, menu, reviveLabel);
            root.SetActive(false);
        }

        private void BuildSettings(Transform parent)
        {
            var root = CreatePanel("Settings", parent, UITheme.PanelDark);
            StretchFull(root.GetComponent<RectTransform>());

            var title = CreateTmp("Title", root.transform, "Ajustes", 48, TextAlignmentOptions.Center);
            Place(title.rectTransform, 0.5f, 0.9f, 0.8f, 0.07f);

            var music = CreateSlider("Music", root.transform, "Música", 0.78f);
            var sfx = CreateSlider("Sfx", root.transform, "SFX", 0.68f);
            var amb = CreateSlider("Amb", root.transform, "Ambiente", 0.58f);
            var voice = CreateSlider("Voice", root.transform, "Voz", 0.48f);

            var dpadGo = CreateUiObject("DpadToggleRow", root.transform);
            Place(dpadGo.GetComponent<RectTransform>(), 0.5f, 0.38f, 0.8f, 0.06f);
            var dpadLabel = CreateTmp("DpadLabel", dpadGo.transform, "D-pad en pantalla", 28, TextAlignmentOptions.Left);
            Place(dpadLabel.rectTransform, 0.35f, 0.5f, 0.6f, 1f);
            var toggleGo = CreateUiObject("Toggle", dpadGo.transform, typeof(Toggle), typeof(Image));
            Place(toggleGo.GetComponent<RectTransform>(), 0.85f, 0.5f, 0.15f, 1f);
            var toggle = toggleGo.GetComponent<Toggle>();
            toggle.targetGraphic = toggleGo.GetComponent<Image>();
            toggleGo.GetComponent<Image>().color = UITheme.FlagBlue;

            var privacy = CreateButton("Privacy", root.transform, "Privacidad", UITheme.CaribbeanCyan);
            Place(privacy.GetComponent<RectTransform>(), 0.5f, 0.26f, 0.7f, 0.07f);

            var close = CreateButton("Close", root.transform, "Cerrar", UITheme.FlagRed);
            Place(close.GetComponent<RectTransform>(), 0.5f, 0.14f, 0.7f, 0.07f);

            var view = root.AddComponent<SettingsView>();
            view.Bind(root, music, sfx, amb, voice, toggle, close, privacy, null);
            root.SetActive(false);
        }

        private void BuildShop(Transform parent)
        {
            var root = CreatePanel("Shop", parent, UITheme.PanelDark);
            StretchFull(root.GetComponent<RectTransform>());

            var title = CreateTmp("Title", root.transform, "Tienda", 48, TextAlignmentOptions.Center);
            Place(title.rectTransform, 0.5f, 0.9f, 0.8f, 0.07f);

            var pap = CreateTmp("Pap", root.transform, "0", 32, TextAlignmentOptions.Left);
            Place(pap.rectTransform, 0.2f, 0.82f, 0.3f, 0.05f);
            pap.color = UITheme.Gold;

            var trof = CreateTmp("Trof", root.transform, "0", 32, TextAlignmentOptions.Right);
            Place(trof.rectTransform, 0.8f, 0.82f, 0.3f, 0.05f);
            trof.color = UITheme.Gold;

            var status = CreateTmp("Status", root.transform, "Cosméticos only", 28, TextAlignmentOptions.Center);
            Place(status.rectTransform, 0.5f, 0.55f, 0.85f, 0.1f);

            // ShopView uses Find for buttons via serialized — add component and let Awake use null-safe paths
            var close = CreateButton("Close", root.transform, "Cerrar", UITheme.FlagRed);
            Place(close.GetComponent<RectTransform>(), 0.5f, 0.12f, 0.7f, 0.07f);

            var buy = CreateButton("BuySample", root.transform, "Skin demo (100)", UITheme.FlagBlue);
            Place(buy.GetComponent<RectTransform>(), 0.5f, 0.35f, 0.7f, 0.07f);

            var shop = root.AddComponent<ShopView>();
            // ShopView uses SerializeField — assign via reflection-free public show; wire close manually
            close.onClick.AddListener(shop.Hide);
            root.SetActive(false);
        }

        private void BuildDpad(Transform parent)
        {
            var root = CreateUiObject("Dpad", parent);
            var rt = root.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.05f, 0.08f);
            rt.anchorMax = new Vector2(0.45f, 0.32f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;

            var up = CreateButton("Up", root.transform, "▲", new Color(1, 1, 1, 0.35f));
            Place(up.GetComponent<RectTransform>(), 0.5f, 0.82f, 0.32f, 0.28f);
            var down = CreateButton("Down", root.transform, "▼", new Color(1, 1, 1, 0.35f));
            Place(down.GetComponent<RectTransform>(), 0.5f, 0.18f, 0.32f, 0.28f);
            var left = CreateButton("Left", root.transform, "◀", new Color(1, 1, 1, 0.35f));
            Place(left.GetComponent<RectTransform>(), 0.18f, 0.5f, 0.28f, 0.32f);
            var right = CreateButton("Right", root.transform, "▶", new Color(1, 1, 1, 0.35f));
            Place(right.GetComponent<RectTransform>(), 0.82f, 0.5f, 0.28f, 0.32f);

            var dpad = root.AddComponent<OnScreenDpad>();
            dpad.Bind(root, up, down, left, right);
            root.SetActive(false);
        }

        // ── Helpers ────────────────────────────────────────────────────────

        private static GameObject CreateUiObject(string name, Transform parent, params System.Type[] extras)
        {
            var types = new System.Type[1 + extras.Length];
            types[0] = typeof(RectTransform);
            for (int i = 0; i < extras.Length; i++) types[i + 1] = extras[i];
            var go = new GameObject(name, types);
            go.transform.SetParent(parent, false);
            return go;
        }

        private static GameObject CreatePanel(string name, Transform parent, Color color)
        {
            var go = CreateUiObject(name, parent, typeof(Image));
            go.GetComponent<Image>().color = color;
            return go;
        }

        private static TextMeshProUGUI CreateTmp(string name, Transform parent, string text, float size,
            TextAlignmentOptions align)
        {
            var go = CreateUiObject(name, parent, typeof(TextMeshProUGUI));
            var tmp = go.GetComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = size;
            tmp.alignment = align;
            tmp.color = UITheme.TextPrimary;
            tmp.enableAutoSizing = true;
            tmp.fontSizeMin = size * 0.55f;
            tmp.fontSizeMax = size;
            tmp.raycastTarget = false;
            return tmp;
        }

        private static Button CreateButton(string name, Transform parent, string label, Color color)
        {
            var go = CreateUiObject(name, parent, typeof(Image), typeof(Button));
            go.GetComponent<Image>().color = color;
            var btn = go.GetComponent<Button>();
            var colors = btn.colors;
            colors.highlightedColor = Color.Lerp(color, Color.white, 0.15f);
            colors.pressedColor = Color.Lerp(color, Color.black, 0.2f);
            btn.colors = colors;

            var tmp = CreateTmp("Label", go.transform, label, 34, TextAlignmentOptions.Center);
            StretchFull(tmp.rectTransform);
            tmp.raycastTarget = false;

            var rt = go.GetComponent<RectTransform>();
            // Enforce min touch-ish size in reference pixels
            rt.sizeDelta = new Vector2(Mathf.Max(rt.sizeDelta.x, UITheme.MinTouchDp * 2f),
                Mathf.Max(rt.sizeDelta.y, UITheme.MinTouchDp));
            return btn;
        }

        private static Slider CreateSlider(string name, Transform parent, string label, float yAnchor)
        {
            var row = CreateUiObject(name + "Row", parent);
            Place(row.GetComponent<RectTransform>(), 0.5f, yAnchor, 0.85f, 0.07f);
            var lbl = CreateTmp("L", row.transform, label, 26, TextAlignmentOptions.Left);
            Place(lbl.rectTransform, 0.2f, 0.75f, 0.4f, 0.4f);

            var sliderGo = CreateUiObject(name, row.transform, typeof(Slider), typeof(Image));
            Place(sliderGo.GetComponent<RectTransform>(), 0.5f, 0.3f, 1f, 0.45f);
            var bg = sliderGo.GetComponent<Image>();
            bg.color = new Color(1, 1, 1, 0.15f);

            var fillArea = CreateUiObject("Fill Area", sliderGo.transform);
            StretchFull(fillArea.GetComponent<RectTransform>());
            var fill = CreateUiObject("Fill", fillArea.transform, typeof(Image));
            StretchFull(fill.GetComponent<RectTransform>());
            fill.GetComponent<Image>().color = UITheme.Gold;

            var handle = CreateUiObject("Handle", sliderGo.transform, typeof(Image));
            var hrt = handle.GetComponent<RectTransform>();
            hrt.sizeDelta = new Vector2(36, 36);
            handle.GetComponent<Image>().color = UITheme.FlagWhite;

            var slider = sliderGo.GetComponent<Slider>();
            slider.fillRect = fill.GetComponent<RectTransform>();
            slider.handleRect = hrt;
            slider.targetGraphic = handle.GetComponent<Image>();
            slider.direction = Slider.Direction.LeftToRight;
            slider.minValue = 0f;
            slider.maxValue = 1f;
            slider.value = 0.8f;
            return slider;
        }

        private static void Place(RectTransform rt, float ax, float ay, float w, float h)
        {
            rt.anchorMin = new Vector2(ax - w * 0.5f, ay - h * 0.5f);
            rt.anchorMax = new Vector2(ax + w * 0.5f, ay + h * 0.5f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        private static void StretchFull(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }
    }
}
