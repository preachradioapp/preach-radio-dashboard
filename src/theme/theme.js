/**
 * Design tokens shared by Ant Design (via ConfigProvider) and Tailwind.
 * Keep colours here in sync with `tailwind.config.cjs`.
 */
export const palette = {
  brand: "#E63946",
  brandHover: "#D62839",
  ink: "#0F0F12",
  sidebar: "#0B0B0E",
  surface: "#FFFFFF",
  canvas: "#F6F6F8",
  border: "#E9E9EE",
  muted: "#6B6B76",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

export const antdTheme = {
  token: {
    colorPrimary: palette.brand,
    colorLink: palette.brand,
    colorSuccess: palette.success,
    colorWarning: palette.warning,
    colorError: palette.danger,
    colorTextBase: palette.ink,
    colorBorder: palette.border,
    colorBorderSecondary: "#F0F0F3",
    colorBgLayout: palette.canvas,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    controlHeight: 40,
    controlHeightLG: 46,
    fontFamily:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    boxShadowSecondary:
      "0 12px 32px -8px rgba(15, 15, 18, 0.18), 0 2px 6px rgba(15, 15, 18, 0.06)",
  },
  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: "0 4px 14px -4px rgba(230, 57, 70, 0.55)",
      defaultShadow: "none",
    },
    Table: {
      headerBg: "#FAFAFB",
      headerColor: palette.muted,
      headerSplitColor: "transparent",
      rowHoverBg: "#FBFBFC",
      borderColor: "#F0F0F3",
      cellPaddingBlock: 14,
    },
    Card: { paddingLG: 24 },
    Modal: { titleFontSize: 18 },
    Input: { activeShadow: "0 0 0 3px rgba(230, 57, 70, 0.12)" },
    Select: { optionSelectedBg: "#FDECEE" },
    Segmented: { itemSelectedBg: "#FFFFFF" },
    Tabs: { inkBarColor: palette.brand, itemSelectedColor: palette.brand },
  },
};
