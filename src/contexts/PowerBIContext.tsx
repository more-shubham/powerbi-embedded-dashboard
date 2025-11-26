"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import * as pbi from "powerbi-client";
import type { EmbedConfig, PageInfo, EditingVisual, PowerBIPage, PowerBIVisual } from "@/types";
import { extractVisualData } from "@/lib/powerbi-data-extraction";
import { asExtendedVisual } from "@/lib/powerbi-type-guards";

type DrawerType = "pages" | "visuals" | "filters" | null;

interface PowerBIState {
  report: pbi.Report | null;
  loading: boolean;
  error: string | null;
  pages: PageInfo[];
  currentPageIndex: number;
  editingVisual: EditingVisual | null;
  isBuilderOpen: boolean;
  visualsRefreshKey: number;
  activeDrawer: DrawerType;
  showSaveConfirm: boolean;
  isSaving: boolean;
}

type PowerBIAction =
  | { type: "SET_REPORT"; payload: pbi.Report }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PAGES"; payload: PageInfo[] }
  | { type: "SET_CURRENT_PAGE_INDEX"; payload: number }
  | { type: "SET_EDITING_VISUAL"; payload: EditingVisual | null }
  | { type: "SET_BUILDER_OPEN"; payload: boolean }
  | { type: "INCREMENT_VISUALS_REFRESH" }
  | { type: "SET_ACTIVE_DRAWER"; payload: DrawerType }
  | { type: "SET_SHOW_SAVE_CONFIRM"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "CLOSE_BUILDER" }
  | { type: "RESET" };

interface PowerBIContextValue {
  state: PowerBIState;
  containerRef: React.RefObject<HTMLDivElement | null>;
  goToPage: (index: number) => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  canGoPrevious: boolean;
  canGoNext: boolean;
  refreshPages: () => Promise<void>;
  openBuilder: (visual?: EditingVisual) => void;
  closeBuilder: () => void;
  refreshVisuals: () => void;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  openSaveConfirm: () => void;
  closeSaveConfirm: () => void;
  setSaving: (saving: boolean) => void;
  dispatch: React.Dispatch<PowerBIAction>;
}

const initialState: PowerBIState = {
  report: null,
  loading: true,
  error: null,
  pages: [],
  currentPageIndex: 0,
  editingVisual: null,
  isBuilderOpen: false,
  visualsRefreshKey: 0,
  activeDrawer: null,
  showSaveConfirm: false,
  isSaving: false,
};

function powerBIReducer(state: PowerBIState, action: PowerBIAction): PowerBIState {
  switch (action.type) {
    case "SET_REPORT":
      return { ...state, report: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_PAGES":
      return { ...state, pages: action.payload };
    case "SET_CURRENT_PAGE_INDEX":
      return { ...state, currentPageIndex: action.payload };
    case "SET_EDITING_VISUAL":
      return { ...state, editingVisual: action.payload };
    case "SET_BUILDER_OPEN":
      return { ...state, isBuilderOpen: action.payload };
    case "INCREMENT_VISUALS_REFRESH":
      return { ...state, visualsRefreshKey: state.visualsRefreshKey + 1 };
    case "SET_ACTIVE_DRAWER":
      return { ...state, activeDrawer: action.payload };
    case "SET_SHOW_SAVE_CONFIRM":
      return { ...state, showSaveConfirm: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "CLOSE_BUILDER":
      return { ...state, isBuilderOpen: false, editingVisual: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const PowerBIContext = createContext<PowerBIContextValue | null>(null);

interface PowerBIProviderProps {
  children: ReactNode;
}

export function PowerBIProvider({ children }: PowerBIProviderProps) {
  const [state, dispatch] = useReducer(powerBIReducer, initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<PageInfo[]>([]);
  const { report, pages, currentPageIndex } = state;

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    const embedReport = async () => {
      try {
        const response = await fetch("/api/powerbi");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch embed config");
        }

        const config: EmbedConfig = await response.json();

        if (!containerRef.current) {
          return;
        }

        const powerbi = await waitForPowerBI();

        const embedConfiguration: pbi.IEmbedConfiguration = {
          type: "report",
          tokenType: pbi.models.TokenType.Embed,
          accessToken: config.embedToken,
          embedUrl: config.embedUrl,
          id: config.reportId,
          permissions: pbi.models.Permissions.All,
          viewMode: pbi.models.ViewMode.View,
          settings: {
            layoutType: pbi.models.LayoutType.Master,
            panes: {
              filters: { visible: false },
              pageNavigation: { visible: false },
              fields: { expanded: false },
              visualizations: { expanded: false },
            },
            bars: {
              actionBar: { visible: true },
            },
            background: pbi.models.BackgroundType.Transparent,
            extensions: createExtensions(),
          },
        };

        const embeddedReport = powerbi.embed(
          containerRef.current,
          embedConfiguration
        ) as pbi.Report;

        dispatch({ type: "SET_REPORT", payload: embeddedReport });

        embeddedReport.on("loaded", async () => {
          dispatch({ type: "SET_LOADING", payload: false });

          try {
            const reportPages = await embeddedReport.getPages();
            const pageList = reportPages.map((p) => ({
              name: p.name,
              displayName: p.displayName,
            }));
            dispatch({ type: "SET_PAGES", payload: pageList });

            const activePage = reportPages.find((p) => p.isActive);
            if (activePage) {
              const activeIndex = pageList.findIndex((p) => p.name === activePage.name);
              dispatch({
                type: "SET_CURRENT_PAGE_INDEX",
                payload: activeIndex >= 0 ? activeIndex : 0,
              });
            }
          } catch {}
        });

        embeddedReport.on("error", (event) => {
          const errorDetail = event.detail as { message?: string };
          const errorMessage = errorDetail?.message || "An error occurred";
          dispatch({ type: "SET_ERROR", payload: errorMessage });
          dispatch({ type: "SET_LOADING", payload: false });
        });

        embeddedReport.on("pageChanged", (event) => {
          const pageEvent = event.detail as { newPage: { name: string } };
          const currentPages = pagesRef.current;
          const newIndex = currentPages.findIndex((p) => p.name === pageEvent.newPage.name);
          if (newIndex >= 0) {
            dispatch({ type: "SET_CURRENT_PAGE_INDEX", payload: newIndex });
          }
        });

        embeddedReport.on("commandTriggered", async (event) => {
          const detail = event.detail as {
            command: string;
            visual: { name: string; type: string };
          };
          await handleCommandTriggered(embeddedReport, detail, dispatch);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    embedReport();
  }, []);

  const goToPage = useCallback(
    async (index: number) => {
      if (!report || pages.length === 0 || index < 0 || index >= pages.length) {
        return;
      }
      try {
        await report.setPage(pages[index].name);
        dispatch({ type: "SET_CURRENT_PAGE_INDEX", payload: index });
      } catch {}
    },
    [report, pages]
  );

  const goToPreviousPage = useCallback(async () => {
    if (currentPageIndex > 0) {
      await goToPage(currentPageIndex - 1);
    }
  }, [currentPageIndex, goToPage]);

  const goToNextPage = useCallback(async () => {
    if (currentPageIndex < pages.length - 1) {
      await goToPage(currentPageIndex + 1);
    }
  }, [currentPageIndex, pages.length, goToPage]);

  const canGoPrevious = currentPageIndex > 0;
  const canGoNext = currentPageIndex < pages.length - 1;

  const refreshPages = useCallback(async () => {
    if (!report) return;

    try {
      const reportPages = await report.getPages();
      const pageList = reportPages.map((p) => ({
        name: p.name,
        displayName: p.displayName,
      }));
      dispatch({ type: "SET_PAGES", payload: pageList });

      const activePage = reportPages.find((p) => p.isActive);
      if (activePage) {
        const activeIndex = pageList.findIndex((p) => p.name === activePage.name);
        if (activeIndex >= 0) {
          dispatch({ type: "SET_CURRENT_PAGE_INDEX", payload: activeIndex });
        }
      }
    } catch {}
  }, [report]);

  const openBuilder = useCallback((visual?: EditingVisual) => {
    if (visual) {
      dispatch({ type: "SET_EDITING_VISUAL", payload: visual });
    }
    dispatch({ type: "SET_BUILDER_OPEN", payload: true });
  }, []);

  const closeBuilder = useCallback(() => {
    dispatch({ type: "CLOSE_BUILDER" });
  }, []);

  const refreshVisuals = useCallback(() => {
    dispatch({ type: "INCREMENT_VISUALS_REFRESH" });
  }, []);

  const openDrawer = useCallback((drawer: DrawerType) => {
    dispatch({ type: "SET_ACTIVE_DRAWER", payload: drawer });
  }, []);

  const closeDrawer = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_DRAWER", payload: null });
  }, []);

  const openSaveConfirm = useCallback(() => {
    dispatch({ type: "SET_SHOW_SAVE_CONFIRM", payload: true });
  }, []);

  const closeSaveConfirm = useCallback(() => {
    dispatch({ type: "SET_SHOW_SAVE_CONFIRM", payload: false });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: "SET_SAVING", payload: saving });
  }, []);

  const value: PowerBIContextValue = {
    state,
    containerRef,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    refreshPages,
    openBuilder,
    closeBuilder,
    refreshVisuals,
    openDrawer,
    closeDrawer,
    openSaveConfirm,
    closeSaveConfirm,
    setSaving,
    dispatch,
  };

  return <PowerBIContext.Provider value={value}>{children}</PowerBIContext.Provider>;
}

export function usePowerBI(): PowerBIContextValue {
  const context = useContext(PowerBIContext);
  if (!context) {
    throw new Error("usePowerBI must be used within a PowerBIProvider");
  }
  return context;
}

async function waitForPowerBI(): Promise<pbi.service.Service> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      if (window.powerbi) {
        clearInterval(interval);
        resolve(window.powerbi);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error("Power BI library failed to load"));
      }
      attempts++;
    }, 100);
  });
}

interface EmbedExtension {
  command: {
    name: string;
    title: string;
    extend: {
      visualOptionsMenu?: {
        title: string;
        menuLocation: number;
      };
      visualContextMenu?: {
        title: string;
        menuLocation: number;
      };
    };
  };
}

function createExtensions(): EmbedExtension[] {
  return [
    {
      command: {
        name: "editVisual",
        title: "Edit Visual",
        extend: {
          visualOptionsMenu: {
            title: "Edit Visual",
            menuLocation: pbi.models.MenuLocation.Top,
          },
          visualContextMenu: {
            title: "Edit Visual",
            menuLocation: pbi.models.MenuLocation.Top,
          },
        },
      },
    },
    {
      command: {
        name: "deleteVisual",
        title: "Delete Visual",
        extend: {
          visualOptionsMenu: {
            title: "Delete Visual",
            menuLocation: pbi.models.MenuLocation.Bottom,
          },
          visualContextMenu: {
            title: "Delete Visual",
            menuLocation: pbi.models.MenuLocation.Bottom,
          },
        },
      },
    },
  ];
}

async function handleCommandTriggered(
  report: pbi.Report,
  detail: { command: string; visual: { name: string; type: string } },
  dispatch: React.Dispatch<PowerBIAction>
): Promise<void> {
  if (detail.command === "editVisual") {
    try {
      const pages = await report.getPages();
      const activePage = pages.find((p) => p.isActive) as PowerBIPage | undefined;
      if (!activePage) return;

      const visuals = await activePage.getVisuals();
      const visualDescriptor = visuals.find((v) => v.name === detail.visual.name);

      if (visualDescriptor) {
        const visual = asExtendedVisual(visualDescriptor) as PowerBIVisual;
        const data = await extractVisualData(visual);

        dispatch({
          type: "SET_EDITING_VISUAL",
          payload: {
            visual,
            type: data.type,
            name: data.name,
            title: data.title,
            position: data.position,
            dataRoles: {
              category: data.category,
              values: data.values.length > 0 ? data.values : undefined,
            },
          },
        });
        dispatch({ type: "SET_BUILDER_OPEN", payload: true });
      }
    } catch {}
  }
}
