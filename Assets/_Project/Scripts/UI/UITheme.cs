// Purpose: Brand color tokens from GDD §7.2 — single source for UI.

using UnityEngine;

namespace CruzaRD.UI
{
    public static class UITheme
    {
        public static readonly Color FlagBlue = new Color(0f, 0.176f, 0.384f, 1f);      // #002D62
        public static readonly Color FlagRed = new Color(0.808f, 0.067f, 0.149f, 1f);    // #CE1126
        public static readonly Color FlagWhite = Color.white;
        public static readonly Color Gold = new Color(0.961f, 0.651f, 0.137f, 1f);       // #F5A623
        public static readonly Color TropicalGreen = new Color(0.118f, 0.557f, 0.353f);  // #1E8E5A
        public static readonly Color CaribbeanCyan = new Color(0.184f, 0.714f, 0.788f);  // #2FB6C9
        public static readonly Color PanelDark = new Color(0.05f, 0.08f, 0.14f, 0.82f);
        public static readonly Color TextPrimary = Color.white;
        public static readonly Color TextMuted = new Color(1f, 1f, 1f, 0.75f);

        public const float MinTouchDp = 48f;
    }
}
