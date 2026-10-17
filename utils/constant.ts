import {
  Apple,
  Monitor,
  Terminal,
  Bookmark,
  PanelsTopLeft,
  AtSign,
  CodeXml,
  LinkIcon,
  MessageCircle,
  Play,
  Home,
  Download,
  UserRound,
  LogIn,
  Archive,
  Globe,
  Zap,
  Layers,
  ShieldCheck,
  Sparkles,
} from "@gorth/primitive/cores/lucide";

export const downloadPlatformIcons = {
  macos: Apple,
  windows: Monitor,
  linux: Terminal,
};

export const ProductIcon = Zap;
export const dashboardNavigation = [
  { title: "Profile", url: "/account", icon: UserRound },
  { title: "Bookmark", url: "/account/bookmark", icon: Bookmark },
  { title: "Tab group", url: "/account/group", icon: Layers },
  { title: "Workspace", url: "/account/workspace", icon: PanelsTopLeft },
  { title: "Backup", url: "/account/sync", icon: Archive },
];
export const accountNavigation = [
  { title: "Overview", url: "/account" },
  { title: "Browser backups", url: "/account/sync" },
];
export const headerNavigation = {
  main: [
    { title: "Account", url: "/account", icon: UserRound },
    { title: "Browser backups", url: "/account/sync", icon: Archive },
  ],
  secondary: [{ title: "Sign in", url: "/auth/sign-in", icon: LogIn }],
  navigation: [
    { title: "Home", url: "/", icon: Home },
    { title: "Features", url: "/#features", icon: Globe },
    { title: "Download", url: "/download", icon: Download },
  ],
};
export const footerSocials = [
  {
    title: "Gorth on X",
    url: "https://www.twitter.com/gorth.org",
    icon: AtSign,
  },
  {
    title: "Gorth on LinkedIn",
    url: "https://www.linkedin.com/company/gorth",
    icon: LinkIcon,
  },
  {
    title: "Gorth on Discord",
    url: "https://discord.gg/gorth",
    icon: MessageCircle,
  },
  {
    title: "Gorth on GitHub",
    url: "https://www.github.com/gorth.org",
    icon: CodeXml,
  },
  {
    title: "Gorth on YouTube",
    url: "https://www.youtube.com/gorth.org",
    icon: Play,
  },
];
export const product = {
  name: "Gorth Browser",
  eyebrow: "Your next browser",
  headline: "A calmer space for the web.",
  description:
    "Organize your tabs, make room for focus, and browse in a workspace that feels like yours.",
};
export const features = [
  {
    title: "Tabs, your way",
    description:
      "Separate or compact layouts, vertical tabs and pinned pages keep your everyday browsing organized.",
    icon: Layers,
  },
  {
    title: "Less noise",
    description:
      "Built-in ad and tracker blocking gives you more room for the content you came to see.",
    icon: ShieldCheck,
  },
  {
    title: "Make it yours",
    description:
      "Switch themes, customize shortcuts and pick a layout that fits your desktop.",
    icon: Sparkles,
  },
];
