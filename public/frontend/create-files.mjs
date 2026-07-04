import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const BASE = join(process.cwd(), 'src');

function touch(relPath, comment) {
  const full = join(BASE, relPath);
  const dir = dirname(full);
  mkdirSync(dir, { recursive: true });
  writeFileSync(full, comment ? `// ${comment}\n// Paste your Base44 code here.\n` : '// Paste your Base44 code here.\n');
  console.log(`  ✅ src/${relPath}`);
}

console.log('\n📁 Creating files from Base44 screenshot...\n');

// ── src/ root files ──────────────────────────────────────────────
touch('App.jsx', 'Main App component with routing - paste from Base44');
touch('index.css', 'Global styles / Tailwind imports - paste from Base44');
touch('main.jsx', 'Vite entry point - paste from Base44');

// ── src/api/ ─────────────────────────────────────────────────────
touch('api/.gitkeep', '');

// ── src/components/admin/ ────────────────────────────────────────
touch('components/admin/AdminHeader.jsx', 'AdminHeader - paste from Base44');
touch('components/admin/AdminSidebar.jsx', 'AdminSidebar - paste from Base44');
touch('components/admin/Articles.jsx', 'Articles - paste from Base44');
touch('components/admin/Cottages.jsx', 'Cottages - paste from Base44');
touch('components/admin/Destinations.jsx', 'Destinations - paste from Base44');
touch('components/admin/Homepage.jsx', 'Homepage - paste from Base44');
touch('components/admin/Messages.jsx', 'Messages - paste from Base44');
touch('components/admin/Overview.jsx', 'Overview - paste from Base44');
touch('components/admin/Pages.jsx', 'Pages - paste from Base44');
touch('components/admin/Settings.jsx', 'Settings - paste from Base44');

// ── src/components/ui/ ───────────────────────────────────────────
touch('components/ui/accordion.jsx', 'shadcn Accordion');
touch('components/ui/alert-dialog.jsx', 'shadcn AlertDialog');
touch('components/ui/alert.jsx', 'shadcn Alert');
touch('components/ui/aspect-ratio.jsx', 'shadcn AspectRatio');
touch('components/ui/avatar.jsx', 'shadcn Avatar');
touch('components/ui/badge.jsx', 'shadcn Badge');
touch('components/ui/breadcrumb.jsx', 'shadcn Breadcrumb');
touch('components/ui/button.jsx', 'shadcn Button');
touch('components/ui/calendar.jsx', 'shadcn Calendar');
touch('components/ui/card.jsx', 'shadcn Card');
touch('components/ui/carousel.jsx', 'shadcn Carousel');
touch('components/ui/chart.jsx', 'shadcn Chart');
touch('components/ui/checkbox.jsx', 'shadcn Checkbox');
touch('components/ui/collapsible.jsx', 'shadcn Collapsible');
touch('components/ui/command.jsx', 'shadcn Command');
touch('components/ui/context-menu.jsx', 'shadcn ContextMenu');
touch('components/ui/dialog.jsx', 'shadcn Dialog');
touch('components/ui/drawer.jsx', 'shadcn Drawer');
touch('components/ui/dropdown-menu.jsx', 'shadcn DropdownMenu');
touch('components/ui/form.jsx', 'shadcn Form');
touch('components/ui/hover-card.jsx', 'shadcn HoverCard');
touch('components/ui/input-otp.jsx', 'shadcn InputOTP');
touch('components/ui/input.jsx', 'shadcn Input');
touch('components/ui/label.jsx', 'shadcn Label');
touch('components/ui/menubar.jsx', 'shadcn Menubar');
touch('components/ui/navigation-menu.jsx', 'shadcn NavigationMenu');
touch('components/ui/pagination.jsx', 'shadcn Pagination');
touch('components/ui/popover.jsx', 'shadcn Popover');
touch('components/ui/progress.jsx', 'shadcn Progress');
touch('components/ui/radio-group.jsx', 'shadcn RadioGroup');
touch('components/ui/resizable.jsx', 'shadcn Resizable');
touch('components/ui/scroll-area.jsx', 'shadcn ScrollArea');
touch('components/ui/select.jsx', 'shadcn Select');
touch('components/ui/separator.jsx', 'shadcn Separator');
touch('components/ui/sheet.jsx', 'shadcn Sheet');
touch('components/ui/sidebar.jsx', 'shadcn Sidebar');
touch('components/ui/skeleton.jsx', 'shadcn Skeleton');
touch('components/ui/slider.jsx', 'shadcn Slider');
touch('components/ui/sonner.jsx', 'shadcn Sonner');
touch('components/ui/switch.jsx', 'shadcn Switch');
touch('components/ui/table.jsx', 'shadcn Table');
touch('components/ui/tabs.jsx', 'shadcn Tabs');
touch('components/ui/textarea.jsx', 'shadcn Textarea');
touch('components/ui/toast.jsx', 'shadcn Toast');
touch('components/ui/toaster.jsx', 'shadcn Toaster');
touch('components/ui/toggle-group.jsx', 'shadcn ToggleGroup');
touch('components/ui/toggle.jsx', 'shadcn Toggle');
touch('components/ui/tooltip.jsx', 'shadcn Tooltip');
touch('components/ui/use-toast.js', 'shadcn useToast hook');

// ── src/components/ (root level) ─────────────────────────────────
touch('components/AppSidebar.jsx', 'AppSidebar - paste from Base44');
touch('components/AuthLayout.jsx', 'AuthLayout - paste from Base44');
touch('components/CategoryBar.jsx', 'CategoryBar - paste from Base44');
touch('components/Footer.jsx', 'Footer - paste from Base44');
touch('components/GoogleIcon.jsx', 'GoogleIcon - paste from Base44');
touch('components/Header.jsx', 'Header - paste from Base44');
touch('components/Hero.jsx', 'Hero - paste from Base44');
touch('components/PropertyCard.jsx', 'PropertyCard - paste from Base44');
touch('components/PropertyGrid.jsx', 'PropertyGrid - paste from Base44');
touch('components/ProtectedRoute.jsx', 'ProtectedRoute - paste from Base44');
touch('components/ScrollToTop.jsx', 'ScrollToTop - paste from Base44');
touch('components/Sidebar.jsx', 'Sidebar - paste from Base44');
touch('components/UserNotRegisteredError.jsx', 'UserNotRegisteredError - paste from Base44');
touch('components/WeatherWidget.jsx', 'WeatherWidget - paste from Base44');

// ── src/hooks/ ───────────────────────────────────────────────────
touch('hooks/use-mobile.jsx', 'useMobile hook');

// ── src/lib/ ─────────────────────────────────────────────────────
touch('lib/app-params.js', 'App parameters');
touch('lib/AuthContext.jsx', 'Auth context');
touch('lib/data.js', 'Data utilities');
touch('lib/LanguageContext.jsx', 'Language/i18n context');
touch('lib/PageNotFound.jsx', '404 page');
touch('lib/query-client.js', 'React Query client');
touch('lib/translations.js', 'Translations');
touch('lib/utils.js', 'Utility functions');

// ── src/pages/ ───────────────────────────────────────────────────
touch('pages/Admin.jsx', 'Admin page');
touch('pages/ArticleDetail.jsx', 'Article detail page');
touch('pages/Destination.jsx', 'Destination page');
touch('pages/ForgotPassword.jsx', 'Forgot password page');
touch('pages/Guides.jsx', 'Guides page');
touch('pages/Home.jsx', 'Home page');
touch('pages/Login.jsx', 'Login page');
touch('pages/Register.jsx', 'Register page');
touch('pages/ResetPassword.jsx', 'Reset password page');
touch('pages/Terms.jsx', 'Terms page');

// ── src/utils/ ───────────────────────────────────────────────────
touch('utils/index.ts', 'Utils index');

console.log('\n✅ All files created in src/!\n');
