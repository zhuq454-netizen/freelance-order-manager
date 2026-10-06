import { shallowRef, type Ref } from 'vue';

export type RouterMode = 'hash' | 'history';
export type ShellName = 'public' | 'admin';

export interface RouteLocation {
  fullPath: string;
  hash: string;
  name: string;
  path: string;
  query: string;
  shell: ShellName;
}

export interface AppRouter {
  currentRoute: Readonly<Ref<RouteLocation>>;
  destroy: () => void;
  install: () => () => void;
  mode: RouterMode;
  push: (to: string) => void;
}

interface RouteRecord {
  name: string;
  path: string;
  shell: ShellName;
}

const routeRecords: RouteRecord[] = [
  { name: 'home', path: '/', shell: 'public' },
  { name: 'services', path: '/services', shell: 'public' },
  { name: 'service-detail', path: '/services/:slug', shell: 'public' },
  { name: 'projects', path: '/projects', shell: 'public' },
  { name: 'project-detail', path: '/projects/:slug', shell: 'public' },
  { name: 'contact', path: '/contact', shell: 'public' },
  { name: 'admin-login', path: '/admin/login', shell: 'admin' },
  { name: 'admin', path: '/admin', shell: 'admin' },
  { name: 'admin-inquiries', path: '/admin/inquiries', shell: 'admin' },
  { name: 'admin-content', path: '/admin/content', shell: 'admin' },
];

const normalizePath = (value: string): string => {
  const path = value.trim() || '/';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const splitLocation = (value: string): Pick<RouteLocation, 'hash' | 'path' | 'query'> => {
  const [withoutHash = '', hashPart = ''] = value.split('#', 2);
  const [pathPart = '/', queryPart = ''] = withoutHash.split('?', 2);

  return {
    hash: hashPart ? `#${hashPart}` : '',
    path: normalizePath(pathPart),
    query: queryPart ? `?${queryPart}` : '',
  };
};

export const resolveRoute = (location: string): RouteLocation => {
  const parts = splitLocation(location);
  const record = routeRecords.find((candidate) => candidate.path === parts.path)
    ?? (parts.path.startsWith('/services/')
      ? { name: 'service-detail', path: parts.path, shell: 'public' as const }
      : parts.path.startsWith('/projects/')
        ? { name: 'project-detail', path: parts.path, shell: 'public' as const }
        : undefined)
    ?? (parts.path.startsWith('/admin/inquiries/')
      ? { name: 'admin-inquiry-detail', path: parts.path, shell: 'admin' as const }
      : routeRecords[0]);

  if (!record) {
    throw new Error('The router requires a home route record.');
  }

  return {
    ...parts,
    fullPath: `${parts.path}${parts.query}${parts.hash}`,
    name: record.name,
    path: record.path,
    shell: record.shell,
  };
};

const readLocation = (mode: RouterMode): string => {
  if (typeof window === 'undefined') return '/';

  if (mode === 'hash') {
    return window.location.hash.slice(1) || '/';
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

const writeLocation = (mode: RouterMode, target: string): void => {
  if (typeof window === 'undefined') return;

  if (mode === 'hash') {
    window.location.hash = target;
    return;
  }

  window.history.pushState({}, '', target);
};

export const createRouter = (options: { mode?: RouterMode } = {}): AppRouter => {
  const mode = options.mode ?? 'history';
  const currentRoute = shallowRef(resolveRoute(readLocation(mode)));
  let removeListener = (): void => undefined;

  const syncRoute = (): void => {
    currentRoute.value = resolveRoute(readLocation(mode));
  };

  const install = (): (() => void) => {
    if (typeof window === 'undefined') return removeListener;

    const eventName = mode === 'hash' ? 'hashchange' : 'popstate';
    window.addEventListener(eventName, syncRoute);
    removeListener = (): void => window.removeEventListener(eventName, syncRoute);

    return removeListener;
  };

  const push = (to: string): void => {
    const nextRoute = resolveRoute(to);
    writeLocation(mode, nextRoute.fullPath);
    currentRoute.value = nextRoute;
  };

  const destroy = (): void => {
    removeListener();
    removeListener = (): void => undefined;
  };

  return {
    currentRoute,
    destroy,
    install,
    mode,
    push,
  };
};
