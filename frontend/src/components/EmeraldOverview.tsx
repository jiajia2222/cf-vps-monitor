import { useEffect, useMemo, useRef, useState } from 'react';
import createGlobe, { type Arc, type Globe, type Marker } from 'cobe';
import { MapChart, ScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent } from 'echarts/components';
import { init, registerMap, use, type EChartsType } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { Flex, Text } from '@radix-ui/themes';
import { Globe2, Map as MapIcon, PanelsTopLeft, Pause, Play } from 'lucide-react';
import type { ClientInfo, LiveDataMap } from '../types';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/browserStorage';
import { getEmeraldCountryCode, getEmeraldCountryName, getEmeraldCoordinate, type GeoCoordinate } from '../utils/emeraldGeo';
import { formatBytes, formatSpeed } from '../utils/format';

use([MapChart, ScatterChart, GeoComponent, TooltipComponent, CanvasRenderer]);

type EmeraldEarthViewMode = 'earth' | 'earth-stop' | 'maps' | 'cards' | 'hide';

interface RegionCluster {
  code: string;
  name: string;
  coord: GeoCoordinate;
  total: number;
  online: number;
  offline: number;
  upload: number;
  download: number;
}

interface EmeraldOverviewProps {
  nodes: ClientInfo[];
  liveData: LiveDataMap;
  defaultMode?: string;
  visitorEnabled?: boolean;
}

interface OverviewMetrics {
  memoryUsed: number;
  memoryTotal: number;
  diskUsed: number;
  diskTotal: number;
  trafficUp: number;
  trafficDown: number;
  speedUp: number;
  speedDown: number;
  monthlyCosts: Array<{ currency: string; amount: number }>;
}

const WORLD_MAP_NAME = 'cf-vps-monitor-emerald-world';
const WORLD_MAP_URLS = [
  '/api/world-map',
  'https://cdn.jsdelivr.net/gh/apache/echarts-www@master/asset/map/json/world.json',
  'https://fastly.jsdelivr.net/gh/apache/echarts-www@master/asset/map/json/world.json',
  'https://gcore.jsdelivr.net/gh/apache/echarts-www@master/asset/map/json/world.json',
  'https://raw.githubusercontent.com/apache/echarts-www/master/asset/map/json/world.json',
];
let worldMapPromise: Promise<unknown> | null = null;

function loadWorldMap(): Promise<unknown> {
  if (worldMapPromise) return worldMapPromise;
  worldMapPromise = (async () => {
    for (const url of WORLD_MAP_URLS) {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) continue;
        const value = await response.json();
        if (value && typeof value === 'object' && (value as { type?: unknown }).type === 'FeatureCollection') return value;
      } catch {
        // Try the next CDN mirror.
      }
    }
    throw new Error('世界地图资源加载失败');
  })();
  return worldMapPromise;
}

function normalizeMode(value: string | undefined): EmeraldEarthViewMode {
  return value === 'earth' || value === 'earth-stop' || value === 'maps' || value === 'cards' || value === 'hide'
    ? value
    : 'maps';
}

function readMode(defaultMode: string | undefined): EmeraldEarthViewMode {
  return normalizeMode(getLocalStorageItem('emeraldEarthViewMode') || defaultMode);
}

function formatRate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let index = 0;
  let current = value;
  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }
  return `${current >= 10 || index === 0 ? current.toFixed(0) : current.toFixed(1)} ${units[index]}`;
}

function buildClusters(nodes: ClientInfo[], liveData: LiveDataMap): RegionCluster[] {
  const online = new Set(liveData.online || []);
  const clusters = new Map<string, RegionCluster>();
  for (const node of nodes) {
    const code = getEmeraldCountryCode(node.region);
    const coord = code ? getEmeraldCoordinate(code) : null;
    if (!code || !coord) continue;
    const current = clusters.get(code) || {
      code,
      name: getEmeraldCountryName(code),
      coord,
      total: 0,
      online: 0,
      offline: 0,
      upload: 0,
      download: 0,
    };
    const live = liveData.data[node.uuid];
    current.total += 1;
    if (online.has(node.uuid)) current.online += 1;
    else current.offline += 1;
    current.upload += live?.net_out || 0;
    current.download += live?.net_in || 0;
    clusters.set(code, current);
  }
  return [...clusters.values()].sort((a, b) => b.total - a.total || b.online - a.online);
}

function buildOverviewMetrics(nodes: ClientInfo[], liveData: LiveDataMap): OverviewMetrics {
  const online = new Set(liveData.online || []);
  let memoryUsed = 0;
  let memoryTotal = 0;
  let diskUsed = 0;
  let diskTotal = 0;
  let trafficUp = 0;
  let trafficDown = 0;
  let speedUp = 0;
  let speedDown = 0;
  const costs = new Map<string, number>();

  for (const node of nodes) {
    const live = liveData.data[node.uuid];
    memoryTotal += node.mem_total || live?.ram_total || 0;
    diskTotal += node.disk_total || live?.disk_total || 0;
    if (online.has(node.uuid) && live) {
      memoryUsed += live.ram || 0;
      diskUsed += live.disk || 0;
    }
    trafficUp += live?.net_total_up || 0;
    trafficDown += live?.net_total_down || 0;
    if (online.has(node.uuid)) {
      speedUp += live?.net_out || 0;
      speedDown += live?.net_in || 0;
    }

    const price = Number(node.price);
    const cycle = Number(node.billing_cycle);
    const currency = node.currency?.trim() || '¥';
    if (Number.isFinite(price) && price >= 0 && Number.isFinite(cycle) && cycle > 0) {
      costs.set(currency, (costs.get(currency) || 0) + price * 30 / cycle);
    }
  }

  return {
    memoryUsed,
    memoryTotal,
    diskUsed,
    diskTotal,
    trafficUp,
    trafficDown,
    speedUp,
    speedDown,
    monthlyCosts: [...costs.entries()]
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

function OverviewMetricsCards({ metrics }: { metrics: OverviewMetrics }) {
  const memoryLabel = `${formatBytes(metrics.memoryUsed)} / ${formatBytes(metrics.memoryTotal)}`;
  const diskLabel = `${formatBytes(metrics.diskUsed)} / ${formatBytes(metrics.diskTotal)}`;
  return (
    <div className="emerald-metric-grid">
      <div className="emerald-metric-card">
        <span className="emerald-metric-label">内存用量</span>
        <strong>{memoryLabel}</strong>
        <span>在线节点实时汇总</span>
      </div>
      <div className="emerald-metric-card">
        <span className="emerald-metric-label">硬盘用量</span>
        <strong>{diskLabel}</strong>
        <span>全部节点容量</span>
      </div>
      <div className="emerald-metric-card">
        <span className="emerald-metric-label">累计流量</span>
        <strong>↑ {formatBytes(metrics.trafficUp)} · ↓ {formatBytes(metrics.trafficDown)}</strong>
        <span>Agent 上报累计值</span>
      </div>
      <div className="emerald-metric-card">
        <span className="emerald-metric-label">当前速率</span>
        <strong>↑ {formatSpeed(metrics.speedUp)} · ↓ {formatSpeed(metrics.speedDown)}</strong>
        <span>在线节点实时速率</span>
      </div>
      {metrics.monthlyCosts.length > 0 && (
        <div className="emerald-metric-card emerald-finance-card">
          <span className="emerald-metric-label">月均支出估算</span>
          <strong>{metrics.monthlyCosts.slice(0, 3).map((item) => `${item.currency}${item.amount.toFixed(2)}`).join(' · ')}</strong>
          <span>按节点账单周期折算，不含汇率换算</span>
        </div>
      )}
    </div>
  );
}

function WorldMap({ clusters }: { clusters: RegionCluster[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let chart: EChartsType | null = null;
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    loadWorldMap()
      .then((geoJson) => {
        if (disposed || !ref.current) return;
        registerMap(WORLD_MAP_NAME, geoJson as Parameters<typeof registerMap>[1]);
        chart = init(ref.current, undefined, { renderer: 'canvas' });
        chart.setOption({
          animationDuration: 300,
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            confine: true,
            backgroundColor: 'rgba(6, 30, 24, .94)',
            borderColor: 'rgba(110, 231, 183, .35)',
            textStyle: { color: '#ecfdf5' },
            formatter: (params: unknown) => {
              const value = params as { seriesType?: string; data?: { name?: string; online?: number; offline?: number; total?: number } };
              if (value.seriesType !== 'scatter' || !value.data) return '';
              return `${value.data.name || ''}<br/>在线 ${value.data.online || 0} · 离线 ${value.data.offline || 0}`;
            },
          },
          geo: {
            map: WORLD_MAP_NAME,
            roam: true,
            zoom: 1.08,
            itemStyle: { areaColor: 'rgba(16, 185, 129, .08)', borderColor: 'rgba(110, 231, 183, .22)', borderWidth: .7 },
            emphasis: { itemStyle: { areaColor: 'rgba(16, 185, 129, .23)' } },
          },
          series: [{
            type: 'scatter',
            coordinateSystem: 'geo',
            symbolSize: (value: unknown) => Math.min(22, 8 + Math.sqrt(Number((value as number[])[2] || 1)) * 3),
            data: clusters.map((cluster) => ({
              name: cluster.name,
              value: [cluster.coord[1], cluster.coord[0], cluster.total],
              online: cluster.online,
              offline: cluster.offline,
              total: cluster.total,
              itemStyle: { color: cluster.offline > 0 ? '#fbbf24' : '#34d399', shadowBlur: 14, shadowColor: '#10b981' },
            })),
          }],
        });
        resizeObserver = new ResizeObserver(() => chart?.resize());
        resizeObserver.observe(ref.current);
      })
      .catch((loadError: unknown) => {
        if (!disposed) setError(loadError instanceof Error ? loadError.message : '地图资源加载失败');
      });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      chart?.dispose();
    };
  }, [clusters]);

  return (
    <div className="emerald-map-wrap">
      <div ref={ref} className="emerald-map-canvas" />
      {error && <div className="emerald-overview-empty">{error}，请检查浏览器是否能访问地图 CDN。</div>}
      {!error && clusters.length === 0 && <div className="emerald-overview-empty">暂无可识别地区的节点</div>}
    </div>
  );
}

function GlobeView({ clusters, visitorCode, autoRotate }: { clusters: RegionCluster[]; visitorCode: string | null; autoRotate: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orientationRef = useRef({ phi: 0.24, theta: 0.14, targetPhi: 0.24, targetTheta: 0.14 });
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;
    let globe: Globe | null = null;
    let frame = 0;
    let width = 320;
    let height = 320;
    const orientation = orientationRef.current;
    const markers: Marker[] = clusters.map((cluster) => ({ location: cluster.coord, size: cluster.total > 1 ? .065 : .045 }));
    const visitorCoord = visitorCode ? getEmeraldCoordinate(visitorCode) : null;
    const arcs: Arc[] = visitorCoord ? clusters.map((cluster) => ({ from: cluster.coord, to: visitorCoord })) : [];

    const resize = () => {
      const size = Math.max(240, Math.min(container.clientWidth || 520, 620));
      width = size;
      height = size;
      globe?.update({ width, height });
    };
    const start = () => {
      resize();
      globe = createGlobe(canvas, {
        width,
        height,
        phi: orientation.phi,
        theta: orientation.theta,
        mapSamples: 9000,
        mapBrightness: 4,
        baseColor: [0.06, 0.34, 0.25],
        markerColor: [0.2, 0.95, 0.65],
        glowColor: [0.1, 0.6, 0.42],
        markers,
        arcs,
        arcColor: [0.45, 1, 0.72],
        arcWidth: .7,
        arcHeight: .35,
        markerElevation: .02,
        diffuse: 1.25,
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        dark: 1,
      });
    };
    const render = () => {
      if (globe) {
        if (autoRotate && !draggingRef.current) orientation.targetPhi += .002;
        orientation.phi += (orientation.targetPhi - orientation.phi) * .14;
        orientation.theta += (orientation.targetTheta - orientation.theta) * .14;
        globe.update({ phi: orientation.phi, theta: orientation.theta, width, height });
      }
      frame = requestAnimationFrame(render);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    start();
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      globe?.destroy();
      globe = null;
    };
  }, [autoRotate, clusters, visitorCode]);

  return (
    <div ref={containerRef} className="emerald-globe-wrap">
      <canvas
        ref={canvasRef}
        className="emerald-globe-canvas"
        onPointerDown={(event) => {
          draggingRef.current = true;
          lastPointerRef.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current) return;
          const last = lastPointerRef.current;
          orientationRef.current.targetPhi += (event.clientX - last.x) / 220;
          orientationRef.current.targetTheta = Math.max(-.65, Math.min(.65, orientationRef.current.targetTheta + (event.clientY - last.y) / 320));
          lastPointerRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          draggingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { draggingRef.current = false; }}
      />
      {visitorCode && <div className="emerald-globe-visitor">访客位置：{getEmeraldCountryName(visitorCode)}</div>}
    </div>
  );
}

function RegionCards({ clusters }: { clusters: RegionCluster[] }) {
  return (
    <div className="emerald-region-grid">
      {clusters.map((cluster) => (
        <div className="emerald-region-card" key={cluster.code}>
          <Flex justify="between" align="center" gap="2">
            <Text weight="bold">{cluster.name}</Text>
            <span className="emerald-region-code">{cluster.code}</span>
          </Flex>
          <div className="emerald-region-total">{cluster.total}<span> 台</span></div>
          <Flex gap="3" className="emerald-region-meta">
            <span className="is-online">在线 {cluster.online}</span>
            <span className="is-offline">离线 {cluster.offline}</span>
          </Flex>
          <div className="emerald-region-traffic">↑ {formatRate(cluster.upload)} · ↓ {formatRate(cluster.download)}</div>
        </div>
      ))}
    </div>
  );
}

function detectVisitorDevice(): string {
  const ua = navigator.userAgent;
  if (/ipad|tablet/i.test(ua)) return '平板设备';
  if (/android/i.test(ua)) return 'Android 手机';
  if (/iphone|ipod/i.test(ua)) return 'iPhone';
  return '桌面设备';
}

function detectVisitorBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua)) return 'Opera';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua)) return 'Safari';
  return '未知浏览器';
}

export default function EmeraldOverview({ nodes, liveData, defaultMode, visitorEnabled = true }: EmeraldOverviewProps) {
  const [mode, setMode] = useState<EmeraldEarthViewMode>(() => readMode(defaultMode));
  const [visitorCode, setVisitorCode] = useState<string | null>(null);
  const clusters = useMemo(() => buildClusters(nodes, liveData), [liveData, nodes]);
  const metrics = useMemo(() => buildOverviewMetrics(nodes, liveData), [liveData, nodes]);
  const visitorDevice = useMemo(detectVisitorDevice, []);
  const visitorBrowser = useMemo(detectVisitorBrowser, []);

  useEffect(() => {
    if (!getLocalStorageItem('emeraldEarthViewMode')) setMode(normalizeMode(defaultMode));
  }, [defaultMode]);

  useEffect(() => {
    if (!visitorEnabled) return undefined;
    let cancelled = false;
    fetch('/api/visitor', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(value => {
        const code = typeof value?.country === 'string' ? value.country.toUpperCase() : null;
        if (!cancelled && code && getEmeraldCoordinate(code)) setVisitorCode(code);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [visitorEnabled]);

  const updateMode = (next: EmeraldEarthViewMode) => {
    setMode(next);
    setLocalStorageItem('emeraldEarthViewMode', next);
  };
  if (mode === 'hide') return null;

  const onlineTotal = clusters.reduce((sum, cluster) => sum + cluster.online, 0);
  const offlineTotal = clusters.reduce((sum, cluster) => sum + cluster.offline, 0);

  return (
    <section className="emerald-overview">
      <Flex className="emerald-overview-header" justify="between" align="center" gap="3" wrap="wrap">
        <div>
          <div className="emerald-overview-kicker">EMERALD NETWORK</div>
          <Text size="5" weight="bold">全球节点分布</Text>
          <div className="emerald-overview-summary"><span className="is-online">在线 {onlineTotal}</span><span className="is-offline">离线 {offlineTotal}</span><span>地区 {clusters.length}</span></div>
        </div>
        <div className="emerald-overview-modes" role="group" aria-label="地图显示模式">
          <button className={mode === 'maps' ? 'active' : ''} onClick={() => updateMode('maps')} title="世界地图"><MapIcon size={15} />地图</button>
          <button className={mode === 'earth' ? 'active' : ''} onClick={() => updateMode('earth')} title="自转地球"><Globe2 size={15} />地球</button>
          <button className={mode === 'earth-stop' ? 'active' : ''} onClick={() => updateMode('earth-stop')} title="静止地球"><Pause size={15} />静止</button>
          <button className={mode === 'cards' ? 'active' : ''} onClick={() => updateMode('cards')} title="地区卡片"><PanelsTopLeft size={15} />卡片</button>
        </div>
      </Flex>
      <OverviewMetricsCards metrics={metrics} />
      <div className="emerald-overview-content">
        {mode === 'maps' && <WorldMap clusters={clusters} />}
        {(mode === 'earth' || mode === 'earth-stop') && <GlobeView clusters={clusters} visitorCode={visitorCode} autoRotate={mode === 'earth'} />}
        {mode === 'cards' && <RegionCards clusters={clusters} />}
      </div>
      {visitorCode && mode === 'maps' && <div className="emerald-visitor-note"><Play size={13} /> 访客位置：{getEmeraldCountryName(visitorCode)}，地球视图将显示节点到访客的连线</div>}
      {visitorEnabled && (
        <div className="emerald-visitor-card">
          <div>
            <span className="emerald-metric-label">访客信息</span>
            <strong>{visitorCode ? getEmeraldCountryName(visitorCode) : '网络访客'}</strong>
          </div>
          <span>{visitorDevice} · {visitorBrowser}</span>
          <span>{new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}</span>
        </div>
      )}
    </section>
  );
}
