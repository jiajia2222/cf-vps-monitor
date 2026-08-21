set local search_path = public;

-- Emerald-inspired adaptation of Tokinx/cf-server-monitor-theme-emerald for
-- the cf-vps-monitor theme runtime. It intentionally styles the existing
-- dashboard selectors instead of replacing the application frontend.
insert into themes (
  short, name, description, version, author, url, preview_path, style_path,
  manifest_json, config_json, custom_css
) values (
  'emerald',
  'Emerald',
  'Emerald 绿意玻璃主题（适配 cf-vps-monitor）',
  '1.0.0',
  'Adapted from Tokinx/cf-server-monitor-theme-emerald',
  'https://github.com/Tokinx/cf-server-monitor-theme-emerald',
  'preview.svg',
  'emerald.css',
  $manifest${
    "name": "Emerald",
    "short": "emerald",
    "description": "Emerald-inspired glass theme adapted for cf-vps-monitor",
    "version": "1.0.0",
    "author": "Adapted from Tokinx/cf-server-monitor-theme-emerald",
    "url": "https://github.com/Tokinx/cf-server-monitor-theme-emerald",
    "preview": "preview.svg",
    "style": "emerald.css",
    "configuration": {
      "type": "managed",
      "data": [
        { "key": "accent", "name": "Accent color", "type": "color", "default": "#10b981" },
        { "key": "accent_strong", "name": "Strong accent", "type": "color", "default": "#047857" },
        { "key": "card_radius", "name": "Card radius", "type": "range", "min": 8, "max": 28, "step": 1, "default": 18 }
      ]
    }
  }$manifest$,
  '{"accent":"#10b981","accent_strong":"#047857","card_radius":18}',
  ''
)
on conflict (short) do nothing;

insert into theme_assets (theme_short, path, content_type, content_base64, size_bytes)
select
  'emerald',
  'emerald.css',
  'text/css; charset=utf-8',
  encode(convert_to($emerald_css$
:root {
  --emerald-accent: var(--cf-theme-accent, #10b981);
  --emerald-accent-strong: var(--cf-theme-accent_strong, #047857);
  --emerald-radius: calc(var(--cf-theme-card_radius, 18) * 1px);
  --emerald-ink: #12332b;
  --emerald-muted: #52746a;
  --emerald-surface: rgba(255, 255, 255, 0.78);
  --emerald-surface-strong: rgba(255, 255, 255, 0.92);
  --emerald-line: rgba(16, 185, 129, 0.18);
  --emerald-shadow: 0 18px 55px rgba(6, 78, 59, 0.12);
  --accent-9: var(--emerald-accent);
  --accent-10: var(--emerald-accent-strong);
}

html[data-theme-appearance='dark'] {
  --emerald-ink: #e7fff5;
  --emerald-muted: #9cc9b9;
  --emerald-surface: rgba(10, 35, 29, 0.72);
  --emerald-surface-strong: rgba(14, 48, 39, 0.88);
  --emerald-line: rgba(110, 231, 183, 0.18);
  --emerald-shadow: 0 20px 65px rgba(0, 0, 0, 0.34);
}

body {
  background:
    radial-gradient(circle at 8% 0%, rgba(52, 211, 153, 0.20), transparent 35%),
    radial-gradient(circle at 92% 18%, rgba(20, 184, 166, 0.14), transparent 34%),
    linear-gradient(145deg, #f0fdf7 0%, #ecfdf5 48%, #f0fdfa 100%);
  color: var(--emerald-ink);
}

html[data-theme-appearance='dark'] body {
  background:
    radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.20), transparent 34%),
    radial-gradient(circle at 90% 14%, rgba(20, 184, 166, 0.14), transparent 32%),
    linear-gradient(155deg, #061b16 0%, #071f1a 52%, #08151a 100%);
}

.layout,
.main-content {
  background: transparent;
}

.nav-bar {
  background: color-mix(in srgb, var(--emerald-surface-strong) 82%, transparent);
  border-bottom-color: var(--emerald-line);
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.08);
}

.nav-logo-mark {
  background: linear-gradient(145deg, var(--emerald-accent-strong), var(--emerald-accent));
  box-shadow: 0 10px 26px color-mix(in srgb, var(--emerald-accent) 32%, transparent);
}

.nav-icon-button,
.nav-icon-button:hover {
  border-color: var(--emerald-line) !important;
  color: var(--emerald-ink) !important;
}

.nav-icon-button:hover {
  background: color-mix(in srgb, var(--emerald-accent) 12%, var(--emerald-surface-strong)) !important;
}

.monitor-dashboard-page {
  max-width: 1920px;
  gap: 12px;
}

.monitor-dashboard-hero,
.monitor-stat-card,
.node-card,
.node-filter-panel,
.website-monitor-shell,
.summary-card {
  border: 1px solid var(--emerald-line) !important;
  border-radius: var(--emerald-radius) !important;
  background: var(--emerald-surface) !important;
  box-shadow: var(--emerald-shadow) !important;
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  backdrop-filter: blur(18px) saturate(135%);
}

.monitor-stat-card:hover,
.node-card:hover,
.summary-card:hover {
  border-color: color-mix(in srgb, var(--emerald-accent) 42%, var(--emerald-line)) !important;
  box-shadow: 0 24px 70px color-mix(in srgb, var(--emerald-accent) 18%, transparent) !important;
  transform: translateY(-2px);
}

.monitor-stat-card-inner,
.node-card .rt-CardInner {
  background: transparent !important;
}

.monitor-stat-title,
.monitor-stat-detail,
.node-metric-label,
.node-metric-detail,
.node-network-summary-label,
.node-card-region-text {
  color: var(--emerald-muted) !important;
}

.monitor-stat-value,
.node-metric-value,
.node-network-value strong,
.node-card-title-row {
  color: var(--emerald-ink) !important;
}

.monitor-stat-icon {
  color: var(--emerald-accent-strong) !important;
  background: color-mix(in srgb, var(--emerald-accent) 15%, transparent) !important;
  border-color: color-mix(in srgb, var(--emerald-accent) 22%, transparent) !important;
}

.node-card-system-line,
.node-metric-tile,
.node-network-panel,
.node-os-chip {
  background: color-mix(in srgb, var(--emerald-accent) 6%, var(--emerald-surface-strong)) !important;
  border-color: var(--emerald-line) !important;
}

.node-metric-bar,
.usage-bar {
  background: color-mix(in srgb, var(--emerald-accent) 12%, transparent) !important;
}

.node-metric-bar span,
.usage-bar-fill {
  background: linear-gradient(90deg, var(--emerald-accent), var(--emerald-accent-strong)) !important;
  box-shadow: 0 0 14px color-mix(in srgb, var(--emerald-accent) 34%, transparent);
}

.node-resource-ring-chart {
  stroke: var(--emerald-accent) !important;
}

.node-network-value.is-up {
  color: var(--emerald-accent-strong) !important;
}

.node-card-action:hover,
.node-card-action:focus-visible {
  color: var(--emerald-accent-strong) !important;
  background: color-mix(in srgb, var(--emerald-accent) 12%, transparent) !important;
}

.control-bar,
.node-filter-toolbar,
.node-filter-top-row,
.node-filter-bottom-row {
  border-color: var(--emerald-line);
}

.node-control-search .rt-TextFieldRoot,
.node-status-filter,
.node-group-filter,
.node-view-toggle .rt-IconButton {
  border-color: var(--emerald-line) !important;
  background: color-mix(in srgb, var(--emerald-surface-strong) 84%, transparent) !important;
}

.rt-Button[data-accent-color='indigo'],
.rt-Button[data-accent-color='blue'] {
  --accent-9: var(--emerald-accent);
  --accent-10: var(--emerald-accent-strong);
}

.footer {
  background: color-mix(in srgb, var(--emerald-surface) 82%, transparent);
  border-top-color: var(--emerald-line);
}

.footer-powered a:hover {
  color: var(--emerald-accent-strong);
}

@media (max-width: 700px) {
  .monitor-dashboard-page {
    padding: 8px;
  }

  .monitor-stat-card,
  .node-card,
  .node-filter-panel,
  .website-monitor-shell,
  .summary-card {
    border-radius: 14px !important;
  }
}
$emerald_css$, 'UTF8'), 'base64'),
  octet_length(convert_to($emerald_css$
:root {
  --emerald-accent: var(--cf-theme-accent, #10b981);
  --emerald-accent-strong: var(--cf-theme-accent_strong, #047857);
  --emerald-radius: calc(var(--cf-theme-card_radius, 18) * 1px);
  --emerald-ink: #12332b;
  --emerald-muted: #52746a;
  --emerald-surface: rgba(255, 255, 255, 0.78);
  --emerald-surface-strong: rgba(255, 255, 255, 0.92);
  --emerald-line: rgba(16, 185, 129, 0.18);
  --emerald-shadow: 0 18px 55px rgba(6, 78, 59, 0.12);
  --accent-9: var(--emerald-accent);
  --accent-10: var(--emerald-accent-strong);
}

html[data-theme-appearance='dark'] {
  --emerald-ink: #e7fff5;
  --emerald-muted: #9cc9b9;
  --emerald-surface: rgba(10, 35, 29, 0.72);
  --emerald-surface-strong: rgba(14, 48, 39, 0.88);
  --emerald-line: rgba(110, 231, 183, 0.18);
  --emerald-shadow: 0 20px 65px rgba(0, 0, 0, 0.34);
}

body {
  background:
    radial-gradient(circle at 8% 0%, rgba(52, 211, 153, 0.20), transparent 35%),
    radial-gradient(circle at 92% 18%, rgba(20, 184, 166, 0.14), transparent 34%),
    linear-gradient(145deg, #f0fdf7 0%, #ecfdf5 48%, #f0fdfa 100%);
  color: var(--emerald-ink);
}

html[data-theme-appearance='dark'] body {
  background:
    radial-gradient(circle at 10% 0%, rgba(16, 185, 129, 0.20), transparent 34%),
    radial-gradient(circle at 90% 14%, rgba(20, 184, 166, 0.14), transparent 32%),
    linear-gradient(155deg, #061b16 0%, #071f1a 52%, #08151a 100%);
}

.layout,
.main-content {
  background: transparent;
}

.nav-bar {
  background: color-mix(in srgb, var(--emerald-surface-strong) 82%, transparent);
  border-bottom-color: var(--emerald-line);
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.08);
}

.nav-logo-mark {
  background: linear-gradient(145deg, var(--emerald-accent-strong), var(--emerald-accent));
  box-shadow: 0 10px 26px color-mix(in srgb, var(--emerald-accent) 32%, transparent);
}

.nav-icon-button,
.nav-icon-button:hover {
  border-color: var(--emerald-line) !important;
  color: var(--emerald-ink) !important;
}

.nav-icon-button:hover {
  background: color-mix(in srgb, var(--emerald-accent) 12%, var(--emerald-surface-strong)) !important;
}

.monitor-dashboard-page {
  max-width: 1920px;
  gap: 12px;
}

.monitor-dashboard-hero,
.monitor-stat-card,
.node-card,
.node-filter-panel,
.website-monitor-shell,
.summary-card {
  border: 1px solid var(--emerald-line) !important;
  border-radius: var(--emerald-radius) !important;
  background: var(--emerald-surface) !important;
  box-shadow: var(--emerald-shadow) !important;
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  backdrop-filter: blur(18px) saturate(135%);
}

.monitor-stat-card:hover,
.node-card:hover,
.summary-card:hover {
  border-color: color-mix(in srgb, var(--emerald-accent) 42%, var(--emerald-line)) !important;
  box-shadow: 0 24px 70px color-mix(in srgb, var(--emerald-accent) 18%, transparent) !important;
  transform: translateY(-2px);
}

.monitor-stat-card-inner,
.node-card .rt-CardInner {
  background: transparent !important;
}

.monitor-stat-title,
.monitor-stat-detail,
.node-metric-label,
.node-metric-detail,
.node-network-summary-label,
.node-card-region-text {
  color: var(--emerald-muted) !important;
}

.monitor-stat-value,
.node-metric-value,
.node-network-value strong,
.node-card-title-row {
  color: var(--emerald-ink) !important;
}

.monitor-stat-icon {
  color: var(--emerald-accent-strong) !important;
  background: color-mix(in srgb, var(--emerald-accent) 15%, transparent) !important;
  border-color: color-mix(in srgb, var(--emerald-accent) 22%, transparent) !important;
}

.node-card-system-line,
.node-metric-tile,
.node-network-panel,
.node-os-chip {
  background: color-mix(in srgb, var(--emerald-accent) 6%, var(--emerald-surface-strong)) !important;
  border-color: var(--emerald-line) !important;
}

.node-metric-bar,
.usage-bar {
  background: color-mix(in srgb, var(--emerald-accent) 12%, transparent) !important;
}

.node-metric-bar span,
.usage-bar-fill {
  background: linear-gradient(90deg, var(--emerald-accent), var(--emerald-accent-strong)) !important;
  box-shadow: 0 0 14px color-mix(in srgb, var(--emerald-accent) 34%, transparent);
}

.node-resource-ring-chart {
  stroke: var(--emerald-accent) !important;
}

.node-network-value.is-up {
  color: var(--emerald-accent-strong) !important;
}

.node-card-action:hover,
.node-card-action:focus-visible {
  color: var(--emerald-accent-strong) !important;
  background: color-mix(in srgb, var(--emerald-accent) 12%, transparent) !important;
}

.control-bar,
.node-filter-toolbar,
.node-filter-top-row,
.node-filter-bottom-row {
  border-color: var(--emerald-line);
}

.node-control-search .rt-TextFieldRoot,
.node-status-filter,
.node-group-filter,
.node-view-toggle .rt-IconButton {
  border-color: var(--emerald-line) !important;
  background: color-mix(in srgb, var(--emerald-surface-strong) 84%, transparent) !important;
}

.rt-Button[data-accent-color='indigo'],
.rt-Button[data-accent-color='blue'] {
  --accent-9: var(--emerald-accent);
  --accent-10: var(--emerald-accent-strong);
}

.footer {
  background: color-mix(in srgb, var(--emerald-surface) 82%, transparent);
  border-top-color: var(--emerald-line);
}

.footer-powered a:hover {
  color: var(--emerald-accent-strong);
}

@media (max-width: 700px) {
  .monitor-dashboard-page {
    padding: 8px;
  }

  .monitor-stat-card,
  .node-card,
  .node-filter-panel,
  .website-monitor-shell,
  .summary-card {
    border-radius: 14px !important;
  }
}
$emerald_css$, 'UTF8'))
where not exists (
  select 1 from theme_assets where theme_short = 'emerald' and path = 'emerald.css'
);

insert into theme_assets (theme_short, path, content_type, content_base64, size_bytes)
select
  'emerald',
  'preview.svg',
  'image/svg+xml',
  encode(convert_to($emerald_preview$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#052e25"/><stop offset="1" stop-color="#0f766e"/></linearGradient><linearGradient id="card" x1="0" x2="1"><stop stop-color="#123e32"/><stop offset="1" stop-color="#0b5d49"/></linearGradient></defs><rect width="960" height="540" rx="28" fill="url(#bg)"/><circle cx="820" cy="80" r="190" fill="#34d399" opacity=".16"/><rect x="42" y="34" width="876" height="64" rx="16" fill="#08291f" opacity=".9"/><rect x="64" y="54" width="32" height="24" rx="8" fill="#34d399"/><rect x="116" y="56" width="160" height="18" rx="9" fill="#d1fae5" opacity=".9"/><rect x="42" y="126" width="876" height="92" rx="18" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="66" y="150" width="170" height="12" rx="6" fill="#a7f3d0" opacity=".8"/><rect x="66" y="176" width="280" height="14" rx="7" fill="#ecfdf5" opacity=".55"/><g><rect x="42" y="244" width="278" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="340" y="244" width="278" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="638" y="244" width="280" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/></g><g fill="#d1fae5" opacity=".85"><rect x="68" y="272" width="120" height="12" rx="6"/><rect x="366" y="272" width="120" height="12" rx="6"/><rect x="666" y="272" width="120" height="12" rx="6"/></g><g fill="#34d399"><rect x="68" y="328" width="204" height="12" rx="6"/><rect x="366" y="328" width="204" height="12" rx="6"/><rect x="666" y="328" width="204" height="12" rx="6"/></g><g fill="#6ee7b7" opacity=".65"><rect x="68" y="356" width="168" height="8" rx="4"/><rect x="366" y="356" width="168" height="8" rx="4"/><rect x="666" y="356" width="168" height="8" rx="4"/></g></svg>$emerald_preview$, 'UTF8'), 'base64'),
  octet_length(convert_to($emerald_preview$<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#052e25"/><stop offset="1" stop-color="#0f766e"/></linearGradient><linearGradient id="card" x1="0" x2="1"><stop stop-color="#123e32"/><stop offset="1" stop-color="#0b5d49"/></linearGradient></defs><rect width="960" height="540" rx="28" fill="url(#bg)"/><circle cx="820" cy="80" r="190" fill="#34d399" opacity=".16"/><rect x="42" y="34" width="876" height="64" rx="16" fill="#08291f" opacity=".9"/><rect x="64" y="54" width="32" height="24" rx="8" fill="#34d399"/><rect x="116" y="56" width="160" height="18" rx="9" fill="#d1fae5" opacity=".9"/><rect x="42" y="126" width="876" height="92" rx="18" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="66" y="150" width="170" height="12" rx="6" fill="#a7f3d0" opacity=".8"/><rect x="66" y="176" width="280" height="14" rx="7" fill="#ecfdf5" opacity=".55"/><g><rect x="42" y="244" width="278" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="340" y="244" width="278" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/><rect x="638" y="244" width="280" height="230" rx="20" fill="url(#card)" stroke="#6ee7b7" stroke-opacity=".22"/></g><g fill="#d1fae5" opacity=".85"><rect x="68" y="272" width="120" height="12" rx="6"/><rect x="366" y="272" width="120" height="12" rx="6"/><rect x="666" y="272" width="120" height="12" rx="6"/></g><g fill="#34d399"><rect x="68" y="328" width="204" height="12" rx="6"/><rect x="366" y="328" width="204" height="12" rx="6"/><rect x="666" y="328" width="204" height="12" rx="6"/></g><g fill="#6ee7b7" opacity=".65"><rect x="68" y="356" width="168" height="8" rx="4"/><rect x="366" y="356" width="168" height="8" rx="4"/><rect x="666" y="356" width="168" height="8" rx="4"/></g></svg>$emerald_preview$, 'UTF8'))
where not exists (
  select 1 from theme_assets where theme_short = 'emerald' and path = 'preview.svg'
);

insert into settings (key, value)
values ('emerald_theme_bootstrap_version', '1')
on conflict (key) do nothing;

notify pgrst, 'reload schema';
