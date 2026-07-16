"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";
import { OrderPayload } from "@/types/order";
import FoxpostSelector, { FoxpostAutomataData } from "./FoxpostSelector";
import {
  validateShippingAddress,
  type AddressValidation,
} from "@/utils/validations";
import { loadModelViewer } from "@/utils/loadModelViewer";
import InfoIcon from "../ui/InfoIcon"; // tooltip icon for extra explanations

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "auto-rotate"?: boolean | string;
          "camera-controls"?: boolean | string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "camera-orbit"?: string;
          "camera-target"?: string;
          orientation?: string;
          crossorigin?: string;
        },
        HTMLElement
      >;
    }
  }
}

const formatFoxpostFindme = (value: string) =>
  value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Szenzor típusok
const szenzorok = [
  {
    id: "htu21d",
    name: "HTU21D",
    description: "Hőmérséklet és páratartalom szenzor",
    price: 5000,
    imageUrl: "/images/szenzorok/htu21.png",
  },
  {
    id: "mpu6050",
    name: "MPU-6050",
    description: "6 tengelyes gyorsulásmérő és giroszkóp",
    price: 6000,
    imageUrl: "/images/szenzorok/mpu6050.png",
  },
  {
    id: "gaz",
    name: "Gáz szenzor",
    description: "Általános gáz érzékelő",
    price: 7000,
    imageUrl: "/images/szenzorok/gassensor.png",
  },
  {
    id: "homerseklet",
    name: "Hőmérséklet szenzor",
    description: "Precíz hőmérséklet mérés",
    price: 4500,
    imageUrl: "/images/szenzorok/homersekletsensor.png",
  },
  {
    id: "paratartalom",
    name: "Páratartalom szenzor",
    description: "Páratartalom mérés",
    price: 4500,
    imageUrl: "/images/szenzorok/htu21.png",
  },
  {
    id: "feny",
    name: "Fény szenzor",
    description: "Fényerősség mérő szenzor",
    price: 4000,
    imageUrl: "/images/szenzorok/lightsensor.png",
  },
  {
    id: "hidrogen",
    name: "Hidrogén szenzor",
    description: "Hidrogén gáz érzékelő",
    price: 8000,
    imageUrl: "/images/szenzorok/hidrogensensor.png",
  },
  {
    id: "metan",
    name: "Metán szenzor",
    description: "Metán gáz érzékelő",
    price: 7500,
    imageUrl: "/images/szenzorok/metan.png",
  },
  {
    id: "sensorion",
    name: "SENSORION hőmérséklet szenzor",
    description: "SENSORION precíziós hőmérséklet szenzor",
    price: 9000,
    imageUrl: "/images/szenzorok/levegominoseg.png",
  },
  {
    id: "o2",
    name: "O2 szenzor",
    description: "Oldott oxigén mérés",
    price: 8000,
    imageUrl: "/images/szenzorok/gassensor.png",
  },
  {
    id: "co2",
    name: "CO2 szenzor",
    description: "CO2 szint mérés",
    price: 8500,
    imageUrl: "/images/szenzorok/gassensor.png",
  },
];

// Eszköz típusok
const eszkozok = [
  {
    id: "basic",
    name: "Basic Modul",
    description: "1 szenzor csatlakoztatható, WiFi kapcsolat",
    price: 8000,
    maxSzenzorok: 1,
    icon: "📡",
  },
  {
    id: "standard",
    name: "Standard Modul",
    description: "Akár 4 szenzor csatlakoztatható, WiFi + GSM",
    price: 15000,
    maxSzenzorok: 4,
    icon: "📶",
  },
  {
    id: "pro",
    name: "Pro Modul",
    description: "Akár 8 szenzor, WiFi + GSM + LoRa, ipari kivitel",
    price: 25000,
    maxSzenzorok: 8,
    icon: "🔌",
  },
];

// Doboz típusok
const dobozok = [
  {
    id: "muanyag",
    name: "Műanyag doboz",
    description: "IP54 védettség, beltéri használatra",
    price: 2000,
    icon: "📦",
  },
  {
    id: "fem",
    name: "Fém doboz",
    description: "IP65 védettség, kültéri/ipari használatra",
    price: 4500,
    icon: "🗄️",
  },
  {
    id: "rozsdamentes",
    name: "Rozsdamentes doboz",
    description: "IP67 védettség, élelmiszeripari felhasználásra",
    price: 8000,
    icon: "✨",
  },
];

// Doboz színek
const dobozSzinek = [
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "zold", name: "Zöld", hex: "#22c55e" },
  { id: "sarga", name: "Sárga", hex: "#eab308" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

// Tető színek
const tetoSzinek = [
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "zold", name: "Zöld", hex: "#22c55e" },
  { id: "sarga", name: "Sárga", hex: "#eab308" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

const bormonitorSzinek = [
  { id: "feher", name: "Fehér", hex: "#f9fafb" },
  { id: "zold", name: "Zöld", hex: "#22c55e" },
  { id: "sarga", name: "Sárga", hex: "#eab308" },
  { id: "piros", name: "Piros", hex: "#ef4444" },
  { id: "kek", name: "Kék", hex: "#3b82f6" },
  { id: "fekete", name: "Fekete", hex: "#1f2937" },
];

const getBormonitorModelSrc = (dobozSzin: string, tetoSzin: string) => {
  const allowed = new Set(bormonitorSzinek.map((szin) => szin.id));
  const doboz = allowed.has(dobozSzin) ? dobozSzin : "fekete";
  const teto = allowed.has(tetoSzin) ? tetoSzin : "fekete";

  if (doboz === teto) {
    return `/images/hero/bormonitor/${doboz}.glb`;
  }

  return `/images/hero/bormonitor/${teto}-${doboz}.glb`;
};

const getPresetColorModelSrc = (
  presetFolder: string,
  dobozSzin: string,
  tetoSzin: string,
) => {
  const allowed = new Set(dobozSzinek.map((szin) => szin.id));
  const doboz = allowed.has(dobozSzin) ? dobozSzin : "feher";
  const teto = allowed.has(tetoSzin) ? tetoSzin : "feher";

  if (doboz === teto) {
    return `/images/hero/${presetFolder}/${doboz}.glb`;
  }

  return `/images/hero/${presetFolder}/${teto}-${doboz}.glb`;
};

// Tápellátás típusok
const tapellatasok = [
  {
    id: "akkus",
    name: "Akkumulátoros",
    description: "Beépített Li-Ion akku, ~6 hónap üzemidő",
    price: 5000,
    icon: "🔋",
  },
  {
    id: "vezetekes",
    name: "Vezetékes",
    description: "230V AC adapter, folyamatos üzem",
    price: 2500,
    icon: "🔌",
  },
];

// Szállítási módok
const szallitasiModok = [
  {
    id: "foxpost",
    name: "Foxpost automata",
    description: "Csomagautomata átvétel",
  },
  {
    id: "hazhoz",
    name: "Házhozszállítás",
    description: "Kézbesítés a megadott címre",
  },
] as const;

// PLACEHOLDER - allitsd be a vegleges szallitasi dijakat (HUF)
const SZALLITASI_ARAK = {
  foxpost: 0,
  hazhoz: 0,
} as const;

const VAT_PERCENT = 27;

// Fizetési módok
const fizetesiModok = [
  {
    id: "utalas",
    name: "Utalás",
    description: "Díjbekérő / előre utalás",
  },
] as const;

const elofizetesek = [
  {
    id: "ingyenes",
    name: "Ingyenes",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 30 napos adatmegőrzés \n ❌ Hőmérséklet naplózás \n ❌ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
    price: 0,
  },
  {
    id: "havi",
    name: "Havi",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 90 napos adatmegőrzés \n ✅ Hőmérséklet naplózás \n ✅ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
    price: 1000,
  },
  {
    id: "eves",
    name: "Éves",
    description:
      "✅ Valós idejű adatelérés \n ✅ Webes hozzáférés \n ✅ 90 napos adatmegőrzés \n ✅ Hőmérséklet naplózás \n ✅ Illetéktelen hozzáférés elleni védelem \n ✅ 3 hónap pénzvisszafizetési garancia",
    price: 10000,
  },
] as const;

const normalizeSubscriptionId = (id: unknown) => {
  const value = String(id ?? "").trim().toLowerCase();
  if (["free", "ingyenes"].includes(value)) return "ingyenes";
  if (["monthly", "havi"].includes(value)) return "havi";
  if (["yearly", "eves", "éves"].includes(value)) return "eves";
  return value || "ingyenes";
};

const normalizeSubscriptionPlan = (plan: any) => {
  const normalizedId = normalizeSubscriptionId(plan?.id);
  const fallback = elofizetesek.find((item) => item.id === normalizedId);
  return {
    ...plan,
    id: normalizedId,
    name: plan?.name ?? fallback?.name ?? "Ingyenes",
    price:
      typeof plan?.price === "number"
        ? plan.price
        : fallback?.price ?? 0,
  };
};

// Burok anyag típusok (PLACEHOLDER - árak és típusok később pontosítandók)
const anyagok = [
  {
    id: "normal_burkolat",
    name: "Normál burkolat",
    description: "Alap burkolat (PLACEHOLDER - ár később pontosítandó)",
    price: 0,
    icon: "🧱",
  },
  {
    id: "vizallo_burkolat",
    name: "Vízálló burkolat",
    description: "Nedves környezethez (PLACEHOLDER - ár később pontosítandó)",
    price: 2500,
    icon: "💧",
  },
  {
    id: "sima_pla",
    name: "Sima PLA",
    description: "Alap PLA anyag, beltéri használatra",
    price: 0, // Alap ár, nincs felár
    icon: "🧱",
  },
  {
    id: "uv_allo_pla",
    name: "UV álló PLA",
    description: "UV sugárzásnak ellenálló, kültéri használatra",
    price: 1500,
    icon: "☀️",
  },
  {
    id: "abs",
    name: "ABS",
    description: "Hőálló, ütésálló műanyag",
    price: 2000,
    icon: "🛡️",
  },
  {
    id: "petg",
    name: "PETG",
    description: "Vegyszerálló, erős és rugalmas",
    price: 2500,
    icon: "💪",
  },
];

// Javasolt konfigurációk
// népszerű presetek: a hűtő, akvárium és irodai levegőminőség
interface PresetOption {
  id: string;
  label: string;
  description: string;
  infodescription: string; // hosszabb leírás a tooltiphez
  szenzorok: string[];
  anyagId: string;
  popular?: boolean;
}

const presetOptions: PresetOption[] = [
  // csak a kész csomagok latáthatók
  {
    id: "huto",
    label: "Hűtő",
    description: "Hő + páratartalom szenzor, normál burkolat",
    infodescription: "Élelmiszer és ital frissességének megőrzése",
    szenzorok: ["homerseklet", "paratartalom"],
    anyagId: "normal_burkolat",
    popular: true,
  },
  {
    id: "bor",
    label: "Bormonitor",
    description: "Hő + páratartalom szenzor, normál burkolat",
    infodescription:
      "Bortároló / borospince hőmérséklet- és páratartalom-figyelése",
    szenzorok: ["homerseklet", "paratartalom"],
    anyagId: "normal_burkolat",
    popular: true,
  },
  {
    id: "akvarium",
    label: "Akvárium",
    description: "Hő + O2 + CO2 szenzor, vízálló burkolat",
    infodescription: "Víz-paraméterek folyamatos monitorozása",
    szenzorok: ["homerseklet", "o2", "co2"],
    anyagId: "vizallo_burkolat",
    popular: true,
  },
];

const disabledTapellatasByPreset: Record<string, string> = {
  huto: "akkus",
  bor: "vezetekes",
};

const requiredDobozByPreset: Record<string, string> = {
  huto: "muanyag",
  bor: "muanyag",
};

type StepId =
  | "mod"
  | "szenzor"
  | "anyag"
  | "doboz"
  | "szin"
  | "tapellatas"
  | "elofizetes"
  | "szallitas"
  | "fizetes"
  | "osszesites";
type ConfigMode = "preset" | "custom";

const MAX_SZENZOROK = 2;

interface Selection {
  szenzorok: string[]; // Custom max 2, preset limit
  anyag: string | null;
  doboz: string | null;
  dobozSzin: string;
  tetoSzin: string;
  tapellatas: string | null;
  elofizetes: "ingyenes" | "havi" | "eves" | null;
  elofizetesekPerUnit: (string | null)[];
  quantity: number; // Megrendelt darabszám
  shippingMode: "foxpost" | "hazhoz" | null;
  paymentMode: "utalas" | "stripe" | null;
  shippingAddress: {
    zip: string;
    city: string;
    street: string;
  };
  billingSame: boolean;
  billingAddress: {
    zip: string;
    city: string;
    street: string;
  };
  foxpostAutomata: FoxpostAutomataData | null;
  guestContact: {
    name: string;
    email: string;
    phone: string;
    acceptAccountTerms?: boolean;
  };
}

type GuestContactErrors = {
  name?: string;
  email?: string;
  phone?: string;
  acceptAccountTerms?: string;
};

type ProfileData = {
  phone: string | null;
  postcode: number | null;
  city: string | null;
  street: string | null;
};

const ProductConfigurator = () => {
  const { data: session } = useSession();
  const isGuestCheckout = !session?.user;
  const [currentStep, setCurrentStep] = useState<StepId>("mod");
  // default to preset mode with the first popular option selected
  const [configMode, setConfigMode] = useState<ConfigMode | null>("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    "huto",
  );
  const [selection, setSelection] = useState<Selection>(() => ({
    szenzorok: [],
    anyag: null,
    doboz: null,
    dobozSzin: "",
    tetoSzin: "",
    tapellatas: null,
    elofizetes: null,
    elofizetesekPerUnit: [],
    quantity: 1,
    shippingMode: null,
    paymentMode: null,
    shippingAddress: {
      zip: "",
      city: "",
      street: "",
    },
    billingSame: true,
    billingAddress: {
      zip: "",
      city: "",
      street: "",
    },
    foxpostAutomata: null,
    guestContact: {
      name: "",
      email: "",
      phone: "",
    },
  }));
  type Catalog = {
    szenzorok: ReadonlyArray<(typeof szenzorok)[number]>;
    eszkozok: ReadonlyArray<(typeof eszkozok)[number]>;
    dobozok: ReadonlyArray<(typeof dobozok)[number]>;
    dobozSzinek: ReadonlyArray<(typeof dobozSzinek)[number]>;
    tetoSzinek: ReadonlyArray<(typeof tetoSzinek)[number]>;
    tapellatasok: ReadonlyArray<(typeof tapellatasok)[number]>;
    elofizetesek: ReadonlyArray<(typeof elofizetesek)[number]>;
    anyagok: ReadonlyArray<(typeof anyagok)[number]>;
    presetOptions: ReadonlyArray<(typeof presetOptions)[number]>;
    szallitasiArak: typeof SZALLITASI_ARAK;
    szallitasiModok: ReadonlyArray<(typeof szallitasiModok)[number]>;
    fizetesiModok: ReadonlyArray<(typeof fizetesiModok)[number]>;
  };

  const [catalog, setCatalog] = useState<Catalog>({
    szenzorok,
    eszkozok,
    dobozok,
    dobozSzinek,
    tetoSzinek,
    tapellatasok,
    elofizetesek,
    anyagok,
    presetOptions,
    szallitasiArak: SZALLITASI_ARAK,
    szallitasiModok,
    fizetesiModok,
  });

  // Folytatás vendégként?
  const [hasChosenGuest, setHasChosenGuest] = useState(false);

  const [shippingAddressErrors, setShippingAddressErrors] = useState<
    AddressValidation["errors"]
  >({});
  const [billingAddressErrors, setBillingAddressErrors] = useState<
    AddressValidation["errors"]
  >({});
  const [guestContactErrors, setGuestContactErrors] =
    useState<GuestContactErrors>({});
  const [profilePhone, setProfilePhone] = useState("");

  const isAkkus = selection.tapellatas === "akkus";
  const isHutoPreset = selectedPresetId === "huto";
  const akkusDobozSzinek = dobozSzinek.filter(
    (szin) => szin.id === "feher" || szin.id === "fekete",
  );
  const akkusTetoSzinek = tetoSzinek.filter(
    (szin) => szin.id === "feher" || szin.id === "fekete",
  );
  const isBormonitor = selectedPresetId === "bor";
  const visibleDobozSzinek = isBormonitor
    ? bormonitorSzinek
    : isHutoPreset && selection.tetoSzin === "zold"
      ? dobozSzinek.filter((szin) => szin.id === "zold")
      : isAkkus
        ? akkusDobozSzinek
        : dobozSzinek;
  const visibleTetoSzinek = isBormonitor
    ? bormonitorSzinek
    : isHutoPreset && selection.dobozSzin !== "zold"
      ? tetoSzinek.filter((szin) => szin.id !== "zold")
      : isAkkus
        ? akkusTetoSzinek
        : tetoSzinek;
  const orderDobozSzinek = isBormonitor
    ? bormonitorSzinek
    : catalog.dobozSzinek;
  const orderTetoSzinek = isBormonitor ? bormonitorSzinek : catalog.tetoSzinek;
  const shouldClampAkkusColors = isAkkus && !isBormonitor;

  useEffect(() => {
    void loadModelViewer().catch((error) => {
      console.warn("model-viewer betöltése sikertelen:", error);
    });
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch("/api/catalog");
        const data = await res.json();

        setCatalog((prev) => ({
          ...prev,
          szenzorok: mergeCatalogList(prev.szenzorok, data.sensors),
          dobozok: mergeCatalogList(prev.dobozok, data.boxes),
          dobozSzinek: mergeCatalogList(
            prev.dobozSzinek,
            (data.colors ?? []).filter((c: any) => c.kind === "box"),
          ),
          tetoSzinek: mergeCatalogList(
            prev.tetoSzinek,
            (data.colors ?? []).filter((c: any) => c.kind === "top"),
          ),
          tapellatasok: mergeCatalogList(prev.tapellatasok, data.powerOptions),
          anyagok: mergeCatalogList(prev.anyagok, data.materials),
          szallitasiArak: Object.fromEntries(
            (data.shippingPrices ?? []).map((p: any) => [
              String(p.id),
              p.price,
            ]),
          ) as typeof SZALLITASI_ARAK,
          elofizetesek: mergeCatalogList(
            prev.elofizetesek,
            (data.subscriptions ?? []).map(normalizeSubscriptionPlan),
          ),
        }));
      } catch (err) {
        console.error("Catalog betöltése sikertelen:", err);
      }
    };

    loadCatalog();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) return;

        const profile: ProfileData = await response.json();
        setProfilePhone(profile.phone || "");

        const savedAddress = {
          zip: profile.postcode ? String(profile.postcode) : "",
          city: profile.city || "",
          street: profile.street || "",
        };

        setSelection((current) => {
          const fillEmptyAddress = (address: Selection["shippingAddress"]) =>
            Object.fromEntries(
              Object.entries(address).map(([key, value]) => [
                key,
                value || savedAddress[key as keyof typeof savedAddress],
              ]),
            ) as Selection["shippingAddress"];

          return {
            ...current,
            shippingAddress: fillEmptyAddress(current.shippingAddress),
            billingAddress: fillEmptyAddress(current.billingAddress),
          };
        });
      } catch (error) {
        console.error("Profiladatok betöltése sikertelen:", error);
      }
    };

    void loadProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!shouldClampAkkusColors) return;

    const allowed = new Set(["feher", "fekete"]);
    if (!allowed.has(selection.dobozSzin) || !allowed.has(selection.tetoSzin)) {
      setSelection((prev) => ({
        ...prev,
        dobozSzin: allowed.has(prev.dobozSzin) ? prev.dobozSzin : "feher",
        tetoSzin: allowed.has(prev.tetoSzin) ? prev.tetoSzin : "feher",
      }));
    }
  }, [shouldClampAkkusColors, selection.dobozSzin, selection.tetoSzin]);

  // when component mounts, if we already have a preset selected by default, apply
  useEffect(() => {
    if (configMode === "preset" && selectedPresetId) {
      applyPreset(selectedPresetId);
    }
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync per-unit subscriptions when entering the summary step
  useEffect(() => {
    if (currentStep === "osszesites") {
      setSelection((prev) => {
        if (prev.elofizetesekPerUnit.length === prev.quantity) return prev;
        const perUnit = Array.from({ length: prev.quantity }, (_, i) =>
          i < prev.elofizetesekPerUnit.length
            ? prev.elofizetesekPerUnit[i]
            : prev.elofizetes,
        );
        return { ...prev, elofizetesekPerUnit: perUnit };
      });
    }
  }, [currentStep]);

  // Bejelentkezés nélküli vásárlás esetén, ha van mentett konfiguráció a localStorage-ban, töltsük be és ugorjunk a szállítási lépésre
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedConfig = localStorage.getItem("pending_config");

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);

        setSelection(parsedConfig);

        setCurrentStep("szallitas");

        setHasChosenGuest(true);

        if (parsedConfig.anyag !== null || parsedConfig.szenzorok.length > 0) {
        }

        localStorage.removeItem("pending_config");

        toast.success("Konfiguráció visszaállítva!");
      } catch (e) {
        console.error("Hiba a mentett konfiguráció betöltésekor", e);
        localStorage.removeItem("pending_config");
      }
    }
  }, []);

  const steps: { id: StepId; title: string; icon: string }[] = [
    { id: "mod", title: "Csomag", icon: "1" },
    { id: "tapellatas", title: "Tápellátás", icon: "2" },
    { id: "doboz", title: "Doboz", icon: "3" },
    { id: "szin", title: "Szín", icon: "4" },
    { id: "elofizetes", title: "Előfizetés", icon: "5" },
    { id: "szallitas", title: "Szállítás", icon: "6" },
    { id: "fizetes", title: "Fizetés", icon: "7" },
    { id: "osszesites", title: "Összesítés", icon: "✓" },
  ];

  const selectedPreset =
    presetOptions.find((preset) => preset.id === selectedPresetId) ?? null;
  const isPresetLocked = configMode === "preset" && Boolean(selectedPreset);
  const hiddenSteps = isPresetLocked
    ? new Set<StepId>(["szenzor", "anyag"])
    : null;
  const visibleSteps = steps.filter((step) => !hiddenSteps?.has(step.id));
  const maxSzenzorok =
    configMode === "preset"
      ? (selectedPreset?.szenzorok.length ?? MAX_SZENZOROK)
      : MAX_SZENZOROK;
  const visibleSzenzorok =
    isPresetLocked && selectedPreset
      ? catalog.szenzorok.filter((szenzor) =>
          selectedPreset.szenzorok.includes(
            // match by old_id slug when available, otherwise by id/string
            (szenzor as any).old_id
              ? (szenzor as any).old_id
              : String((szenzor as any).id),
          ),
        )
      : catalog.szenzorok;
  const previewModelSrc = isBormonitor
    ? getBormonitorModelSrc(selection.dobozSzin, selection.tetoSzin)
    : selectedPresetId === "huto"
      ? getPresetColorModelSrc("huto", selection.dobozSzin, selection.tetoSzin)
      : `/images/hero/${selection.dobozSzin || "feher"}/${selection.dobozSzin || "feher"}_${selection.tetoSzin || "feher"}.glb`;

  const isTapellatasDisabled = (tapellatasId: string) =>
    configMode === "preset" &&
    selectedPresetId !== null &&
    disabledTapellatasByPreset[selectedPresetId] === tapellatasId;
  const isDobozDisabled = (dobozId: string) =>
    configMode === "preset" &&
    selectedPresetId !== null &&
    requiredDobozByPreset[selectedPresetId] !== undefined &&
    requiredDobozByPreset[selectedPresetId] !== dobozId;

  // Helper: match selection value against item's old_id (slug) or id
  const findBySelection = (list: readonly any[], sel: any) => {
    if (sel === null || sel === undefined) return undefined;
    return list.find((item) => {
      const oldId = (item as any).old_id;
      if (oldId != null && String(oldId) === String(sel)) return true;
      return String((item as any).id) === String(sel);
    });
  };
  const matchSelection = (item: any, sel: any) => {
    if (sel === null || sel === undefined) return false;
    const oldId = item?.old_id;
    if (oldId != null && String(oldId) === String(sel)) return true;
    return String(item?.id) === String(sel);
  };

  const mergeCatalogList = <T extends { id: string | number }>(
    fallback: readonly T[],
    remoteItems: any[] | undefined,
  ): T[] =>
    fallback.map((fallbackItem) => {
      const fallbackOldId = (fallbackItem as any).old_id;
      const remoteItem = remoteItems?.find((item) => {
        return (
          String(item.id) === String(fallbackItem.id) ||
          (fallbackOldId != null &&
            String(item.old_id) === String(fallbackOldId))
        );
      });

      if (!remoteItem) {
        return fallbackItem;
      }

      return {
        ...fallbackItem,
        id: String(remoteItem.id ?? fallbackItem.id),
        old_id: remoteItem.old_id ?? fallbackOldId ?? null,
        price:
          typeof remoteItem.price === "number"
            ? remoteItem.price
            : (fallbackItem as any).price,
        sort:
          typeof remoteItem.sort === "number"
            ? remoteItem.sort
            : (fallbackItem as any).sort,
        isActive:
          typeof remoteItem.isActive === "boolean"
            ? remoteItem.isActive
            : (fallbackItem as any).isActive,
        hex:
          typeof remoteItem.hex === "string"
            ? remoteItem.hex
            : (fallbackItem as any).hex,
        kind:
          typeof remoteItem.kind === "string"
            ? remoteItem.kind
            : (fallbackItem as any).kind,
      } as T;
    });

  const calculateSubtotal = () => {
    let total = 0;
    // Több szenzor összege
    for (const szenzorId of selection.szenzorok) {
      const szenzor = findBySelection(catalog.szenzorok, szenzorId);
      if (szenzor) total += szenzor.price;
    }

    // Anyag (burok) ár
    if (selection.anyag) {
      const anyag = findBySelection(anyagok, selection.anyag);
      if (anyag) total += anyag.price;
    }
    if (selection.doboz) {
      const doboz = findBySelection(dobozok, selection.doboz);
      if (doboz) total += doboz.price;
    }
    if (selection.tapellatas) {
      const tap = findBySelection(tapellatasok, selection.tapellatas);
      if (tap) total += tap.price;
    }
    // Szorzunk a darabszámmal
    return total * selection.quantity;
  };

  const calculateSubscriptionFee = () => {
    if (selection.elofizetesekPerUnit.length > 0) {
      return selection.elofizetesekPerUnit.reduce((sum, id) => {
        if (!id) return sum;
        const plan = findBySelection(catalog.elofizetesek, id);
        return sum + (plan ? plan.price : 0);
      }, 0);
    }
    // Fallback before summary is reached
    if (!selection.elofizetes) return 0;
    const elofizetes = findBySelection(
      catalog.elofizetesek,
      selection.elofizetes,
    );
    return elofizetes ? elofizetes.price * selection.quantity : 0;
  };

  const getShippingFee = () =>
    selection.shippingMode ? SZALLITASI_ARAK[selection.shippingMode] : 0;

  const calculateVatAmount = (subtotal: number) =>
    Math.round(subtotal * (VAT_PERCENT / 100));

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const vatAmount = calculateVatAmount(subtotal);
    return subtotal + vatAmount + getShippingFee() + calculateSubscriptionFee();
  };

  const isAddressComplete = (address: Selection["shippingAddress"]) =>
    Boolean(
      address.zip.trim() &&
        address.city.trim() &&
        address.street.trim(),
    );

  const validateGuestContact = (contact: Selection["guestContact"]) => {
    const errors: GuestContactErrors = {};

    if (!contact.name.trim()) {
      errors.name = "Add meg a teljes nevedet.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contact.email.trim()) {
      errors.email = "Add meg az email címedet.";
    } else if (!emailRegex.test(contact.email.trim())) {
      errors.email = "Érvényes email címet adj meg.";
    }

    const phoneDigits = contact.phone.replace(/\D/g, "");
    if (!contact.phone.trim()) {
      errors.phone = "Telefonszám pl.: +36 xx 1234567";
    } else if (phoneDigits.length < 9) {
      errors.phone = "Telefonszám pl.: +36 xx 1234567";
    }

    if (!contact.acceptAccountTerms) {
      errors.acceptAccountTerms =
        "A rendelés folytatásához el kell fogadnia a fiók létrehozását.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email || !email.includes("@")) return false;
    try {
      const res = await axios.post("/api/check-email", { email });
      return res.data.exists;
    } catch (err) {
      console.error("Email ellenőrzési hiba:", err);
      return false;
    }
  };

  const isShippingValid = () => {
    if (isGuestCheckout) {
      const guestValidation = validateGuestContact(selection.guestContact);
      if (!guestValidation.isValid) return false;
    }

    if (!selection.shippingMode) return false;

    if (selection.shippingMode === "foxpost") {
      if (!selection.foxpostAutomata) return false;
      return true;
    }

    if (!isAddressComplete(selection.shippingAddress)) return false;
    const shippingValidation = validateShippingAddress(
      selection.shippingAddress,
    );
    if (!shippingValidation.isValid) return false;

    if (!selection.billingSame && !isAddressComplete(selection.billingAddress))
      return false;
    if (!selection.billingSame) {
      const billingValidation = validateShippingAddress(
        selection.billingAddress,
      );
      if (!billingValidation.isValid) return false;
    }

    return true;
  };

  const toggleSzenzor = (szenzorId: string) => {
    if (isPresetLocked) {
      toast.error("A preset szenzorok nem módosíthatók.");
      return;
    }
    const isSelected = selection.szenzorok.includes(szenzorId);

    if (isSelected) {
      // Eltávolítás
      setSelection((prev) => ({
        ...prev,
        szenzorok: prev.szenzorok.filter((id) => id !== szenzorId),
      }));
    } else {
      // Hozzáadás (max limit a mód alapján)
      if (selection.szenzorok.length >= maxSzenzorok) {
        toast.error(`Maximum ${maxSzenzorok} szenzort választhatsz!`);
        return;
      }
      setSelection((prev) => ({
        ...prev,
        szenzorok: [...prev.szenzorok, szenzorId],
      }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "mod":
        if (configMode === "preset") return Boolean(selectedPresetId);
        if (configMode === "custom") return true;
        return false;
      case "szenzor":
        return selection.szenzorok.length > 0; // Legalább 1 szenzor kell
      case "anyag":
        return selection.anyag !== null;
      case "doboz":
        return selection.doboz !== null;
      case "szin":
        return true; // Szín mindig van alapértelmezett
      case "tapellatas":
        return selection.tapellatas !== null;
      case "elofizetes":
        return selection.elofizetes !== null;
      case "szallitas":
        return isShippingValid();
      case "fizetes":
        return selection.paymentMode !== null;
      case "osszesites":
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    const stepIndex = visibleSteps.findIndex((s) => s.id === currentStep);

    if (currentStep === "szallitas") {
      let hasShippingErrors = false;

      if (isGuestCheckout) {
        const guestValid = validateGuestContact(selection.guestContact);
        setGuestContactErrors(guestValid.errors);
        if (!guestValid.isValid) {
          hasShippingErrors = true;
        }
      }

      if (!selection.shippingMode) {
        toast.error("Válassz szállítási módot!");
        return;
      }

      if (selection.shippingMode === "foxpost") {
        if (!selection.foxpostAutomata) {
          toast.error("Válassz Foxpost automatát!");
          return;
        }
      } else {
        const shippingValidation = validateShippingAddress(
          selection.shippingAddress,
        );
        setShippingAddressErrors(shippingValidation.errors);
        if (!shippingValidation.isValid) {
          hasShippingErrors = true;
        }

        if (!selection.billingSame) {
          const billingValidation = validateShippingAddress(
            selection.billingAddress,
          );
          setBillingAddressErrors(billingValidation.errors);
          if (!billingValidation.isValid) {
            hasShippingErrors = true;
          }
        }
      }

      if (hasShippingErrors) {
        toast.error("Kérlek, javítsd a megjelölt adatokat.");
        return;
      }

      if (isGuestCheckout) {
        if (selection.guestContact.acceptAccountTerms) {
          const emailExists = await checkEmailExists(
            selection.guestContact.email,
          );
          if (emailExists) {
            setGuestContactErrors((prev) => ({
              ...prev,
              email:
                "Ezzel az e-mail címmel már létezik fiók. Kérjük, jelentkezzen be!",
            }));
            return;
          }
        }
      }
    }

    if (stepIndex === -1) {
      if (visibleSteps.length > 0) {
        setCurrentStep(visibleSteps[0].id);
      }
      return;
    }
    if (
      stepIndex < visibleSteps.length - 1 &&
      (currentStep === "szallitas" || canProceed())
    ) {
      setCurrentStep(visibleSteps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = visibleSteps.findIndex((s) => s.id === currentStep);
    if (stepIndex === -1) {
      if (visibleSteps.length > 0) {
        setCurrentStep(visibleSteps[0].id);
      }
      return;
    }
    if (stepIndex > 0) {
      setCurrentStep(visibleSteps[stepIndex - 1].id);
    }
  };

  const handleOrder = async () => {
    if (isGuestCheckout) {
      const guestValidation = validateGuestContact(selection.guestContact);
      setGuestContactErrors(guestValidation.errors);
      if (!guestValidation.isValid) {
        toast.error(
          "Vendég rendeléshez add meg a nevet, email címet és telefonszámot!",
        );
        return;
      }
    }

    // Kiválasztott szenzorok (több is lehet)
    const selectedSzenzorok = selection.szenzorok
      .map((id) => findBySelection(catalog.szenzorok, id))
      .filter(Boolean as any);

    const selectedAnyag = findBySelection(catalog.anyagok, selection.anyag);
    const selectedDoboz = findBySelection(catalog.dobozok, selection.doboz);
    const selectedTap = findBySelection(
      catalog.tapellatasok,
      selection.tapellatas,
    );
    const selectedElofizetes =
      findBySelection(catalog.elofizetesek, selection.elofizetes) ??
      findBySelection(catalog.elofizetesek, "ingyenes") ??
      null;
    const selectedDobozSzin = findBySelection(
      orderDobozSzinek,
      selection.dobozSzin,
    );
    const selectedTetoSzin = findBySelection(
      orderTetoSzinek,
      selection.tetoSzin,
    );

    if (
      selectedSzenzorok.length === 0 ||
      !selectedAnyag ||
      !selectedDoboz ||
      !selectedTap
    ) {
      toast.error("Hiányzó termék választás!");
      return;
    }

    if (
      selection.elofizetesekPerUnit.length < selection.quantity ||
      selection.elofizetesekPerUnit.some((id) => !id)
    ) {
      toast.error("Minden eszközhöz kötelező előfizetést választani!");
      return;
    }

    if (!isShippingValid()) {
      // Set validation errors for display
      if (selection.shippingMode === "hazhoz") {
        const shippingVal = validateShippingAddress(selection.shippingAddress);
        setShippingAddressErrors(shippingVal.errors);
        if (!selection.billingSame) {
          const billingVal = validateShippingAddress(selection.billingAddress);
          setBillingAddressErrors(billingVal.errors);
        }
      }
      if (isGuestCheckout) {
        const guestValidation = validateGuestContact(selection.guestContact);
        setGuestContactErrors(guestValidation.errors);
      }
      toast.error("Hiányzó vagy érvénytelen szállítási adatok!");
      return;
    }

    if (!selection.paymentMode) {
      toast.error("Hiányzó fizetési mód!");
      return;
    }

    const subtotal = calculateSubtotal();
    const subscriptionFee = calculateSubscriptionFee();
    const vatPercent = VAT_PERCENT;
    const vatAmount = calculateVatAmount(subtotal);
    const shippingFee = getShippingFee();
    const total = subtotal + vatAmount + shippingFee + subscriptionFee;

    const resolvedUserName = isGuestCheckout
      ? selection.guestContact.name.trim()
      : session?.user?.name || "Ismeretlen";
    const resolvedUserEmail = isGuestCheckout
      ? selection.guestContact.email.trim()
      : session?.user?.email || "";
    const resolvedUserPhone = isGuestCheckout
      ? selection.guestContact.phone.trim()
      : profilePhone.trim();

    const orderPayload: OrderPayload = {
      userId: isGuestCheckout
        ? "guest"
        : (session?.user as any)?.id || "unknown",
      userEmail: resolvedUserEmail,
      userName: resolvedUserName,
      userPhone: resolvedUserPhone,

      szenzorok: selectedSzenzorok.map((sz) => ({
        id: sz!.id,
        name: sz!.name,
        price: sz!.price,
        quantity: selection.quantity,
      })),
      anyag: {
        id: selectedAnyag.id,
        name: selectedAnyag.name,
        price: selectedAnyag.price,
        quantity: selection.quantity,
      },
      doboz: {
        id: selectedDoboz.id,
        name: selectedDoboz.name,
        price: selectedDoboz.price,
        quantity: selection.quantity,
      },
      tapellatas: {
        id: selectedTap.id,
        name: selectedTap.name,
        price: selectedTap.price,
        quantity: selection.quantity,
      },
      elofizetes: selectedElofizetes
        ? {
            id: normalizeSubscriptionId(selectedElofizetes.id),
            name: selectedElofizetes.name,
            price: selectedElofizetes.price,
            quantity: selection.quantity,
          }
        : {
            id: "ingyenes",
            name: "Ingyenes",
            price: 0,
            quantity: selection.quantity,
          },

      elofizetesekPerUnit: selection.elofizetesekPerUnit.map((id) => {
        const plan = findBySelection(catalog.elofizetesek, id);
        return {
          id: normalizeSubscriptionId(plan?.id ?? "ingyenes"),
          name: plan?.name ?? "Ingyenes",
          price: plan?.price ?? 0,
          quantity: 1,
        };
      }),

      colors: {
        dobozSzin: {
          id: selectedDobozSzin?.id || "zold",
          name: selectedDobozSzin?.name || "Zöld",
        },
        tetoSzin: {
          id: selectedTetoSzin?.id || "feher",
          name: selectedTetoSzin?.name || "Fehér",
        },
      },

      shipping: {
        mode: selection.shippingMode!,
        shippingAddress:
          selection.shippingMode === "hazhoz"
            ? {
                zip: selection.shippingAddress.zip.trim(),
                city: selection.shippingAddress.city.trim(),
                street: selection.shippingAddress.street.trim(),
              }
            : null,
        billingSame:
          selection.shippingMode === "hazhoz" ? selection.billingSame : true,
        billingAddress:
          selection.shippingMode === "hazhoz" && selection.billingSame
            ? {
                zip: selection.shippingAddress.zip.trim(),
                city: selection.shippingAddress.city.trim(),
                street: selection.shippingAddress.street.trim(),
              }
            : selection.shippingMode === "hazhoz"
              ? {
                  zip: selection.billingAddress.zip.trim(),
                  city: selection.billingAddress.city.trim(),
                  street: selection.billingAddress.street.trim(),
                }
              : null,
        foxpostAutomata:
          selection.shippingMode === "foxpost" && selection.foxpostAutomata
            ? selection.foxpostAutomata.name
            : null,
        foxpostAutomataDetails:
          selection.shippingMode === "foxpost" && selection.foxpostAutomata
            ? {
                place_id: selection.foxpostAutomata.place_id,
                operator_id: selection.foxpostAutomata.operator_id,
                name: selection.foxpostAutomata.name,
                address: selection.foxpostAutomata.address,
                city: selection.foxpostAutomata.city,
                zip: selection.foxpostAutomata.zip,
                geolat: selection.foxpostAutomata.geolat,
                geolng: selection.foxpostAutomata.geolng,
                findme: selection.foxpostAutomata.findme,
              }
            : null,
      },

      payment: {
        mode: selection.paymentMode!,
      },

      subtotal,
      vatPercent,
      vatAmount,
      shippingFee,
      total,

      currency: "HUF",
      createdAt: new Date().toISOString(),
      locale: "hu-HU",
      ...(configMode === "preset" && selectedPreset
        ? {
            presetId: selectedPreset.id,
            presetLabel: selectedPreset.label,
            presetMaxSzenzorok: selectedPreset.szenzorok.length,
          }
        : {}),
    };
    const orderApiUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_ORDER_API_URL_LOCAL || "/api/order"
        : "/api/order";

    try {
      const { data } = await axios.post(orderApiUrl, orderPayload);

      if (data.url) {
        // Redirect to Stripe checkout or success page
        window.location.href = data.url;
      } else if (data.success) {
        // Sikeres rendelés - irányítás a sikeres oldalra
        toast.success("Rendelés sikeresen leadva!");
        window.location.href = "/vasarlas/sikeres";
      } else {
        toast.success(
          "Rendelés elküldve! Hamarosan felvesszük Önnel a kapcsolatot.",
        );
        console.log("Order response:", data);
      }
    } catch (error: any) {
      console.error("Rendelési hiba:", error);
      toast.error(
        error.response?.data?.error || "Hiba történt a rendelés során!",
      );
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = presetOptions.find((item) => item.id === presetId);
    if (!preset) return;

    setConfigMode("preset");
    setSelectedPresetId(presetId);
    const isBorPreset = preset.id === "bor";
    const normalColorIds = new Set(dobozSzinek.map((szin) => szin.id));
    setSelection((prev) => ({
      ...prev,
      szenzorok: preset.szenzorok,
      anyag: preset.anyagId,
      doboz: requiredDobozByPreset[preset.id] ?? prev.doboz,
      tapellatas:
        disabledTapellatasByPreset[preset.id] === prev.tapellatas
          ? null
          : prev.tapellatas,
      dobozSzin: isBorPreset
        ? "fekete"
        : normalColorIds.has(prev.dobozSzin)
          ? prev.dobozSzin
          : "feher",
      tetoSzin: isBorPreset
        ? "fekete"
        : normalColorIds.has(prev.tetoSzin)
          ? prev.tetoSzin
          : "feher",
    }));
  };

  const updateAddressField = (
    target: "shippingAddress" | "billingAddress",
    field: keyof Selection["shippingAddress"],
    value: string,
  ) => {
    setSelection((prev) => ({
      ...prev,
      [target]: {
        ...prev[target],
        [field]: value,
      },
    }));
  };

  const validateAddress = (target: "shippingAddress" | "billingAddress") => {
    const address = selection[target];
    const validation = validateShippingAddress(address);

    if (target === "shippingAddress") {
      setShippingAddressErrors(validation.errors);
    } else {
      setBillingAddressErrors(validation.errors);
    }

    return validation.isValid;
  };

  const renderAddressInput = (
    placeholder: string,
    value: string,
    field: keyof Selection["shippingAddress"],
    target: "shippingAddress" | "billingAddress",
    error?: string,
  ) => (
    <div className="space-y-1">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(ev) => updateAddressField(target, field, ev.target.value)}
        className={`focus:border-primary dark:bg-dark w-full rounded-lg border px-4 py-3 text-sm text-black outline-none dark:text-white ${
          error
            ? "border-red-500 bg-red-50/10 dark:border-red-400"
            : "border-stroke focus:border-primary dark:border-stroke-dark bg-white"
        }`}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "mod":
        return (
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {presetOptions.map((preset) => {
                const isSelected =
                  configMode === "preset" && selectedPresetId === preset.id;
                const isPopular = Boolean(preset.popular);
                let styleClass =
                  "rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg ";

                if (isSelected) {
                  styleClass +=
                  "border-orange-500 bg-orange-500/10 dark:border-orange-400 dark:bg-orange-500/10";
                } else {
                  styleClass +=
                    "border-stroke dark:border-stroke-dark dark:bg-dark bg-white";
                }

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={styleClass}
                  >
                    <h4 className="mb-2 flex items-center text-lg font-semibold text-black dark:text-white">
                      <span>{preset.label}</span>
                      <InfoIcon
                        description={preset.infodescription}
                        position="right"
                        className="ml-2"
                      />
                      {preset.popular && (
                        <span className="ml-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                          népszerű
                        </span>
                      )}
                    </h4>
                    <p className="text-body text-sm">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "szenzor":
        return (
          <div>
            {configMode === "preset" && selectedPreset && (
              <p className="text-body mb-2 text-center text-sm">
                Előre beállított konfiguráció: {selectedPreset.label}
                {selectedPreset.popular && (
                  <span className="ml-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                    népszerű
                  </span>
                )}{" "}
                (a szenzorok és a burkolat nem módosíthatók)
              </p>
            )}
            {configMode !== "preset" && (
              <p className="text-body mb-4 text-center text-sm">
                Válassz max. {maxSzenzorok} szenzort! (
                {selection.szenzorok.length}/{maxSzenzorok} kiválasztva)
              </p>
            )}
            <div
              className={`mx-auto max-w-5xl gap-3 ${
                isPresetLocked
                  ? "flex flex-wrap justify-center"
                  : "grid grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {visibleSzenzorok.map((szenzor) => {
                const isSelected = selection.szenzorok.includes(szenzor.id);
                return (
                  <div
                    key={szenzor.id}
                    onClick={
                      isPresetLocked
                        ? undefined
                        : () => toggleSzenzor(szenzor.id)
                    }
                    className={`rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                    } ${isPresetLocked ? "w-full max-w-[240px] cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-lg"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 p-2 sm:h-24 sm:w-24 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={szenzor.imageUrl}
                          alt={szenzor.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                          isSelected
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <h4 className="mb-1 text-base font-semibold text-black dark:text-white">
                      {szenzor.name}
                    </h4>
                    <p className="text-body mb-2 text-xs break-words">
                      {szenzor.description}
                    </p>
                    <p className="text-orange-500 text-lg font-bold">
                      {szenzor.price.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "anyag":
        return (
          <div>
            {isPresetLocked && selectedPreset && (
              <p className="text-body mb-4 text-center text-sm">
                A burkolat a(z) {selectedPreset.label} konfigurációhoz kötött,
                nem módosítható.
              </p>
            )}
            {!isPresetLocked && (
              <p className="text-body mb-4 text-center text-sm">
                Válassza ki a burok anyagát! (PLACEHOLDER - árak és típusok
                később pontosítandók)
              </p>
            )}
            <div
              className={`gap-4 ${
                isPresetLocked
                  ? "flex justify-center"
                  : "grid grid-cols-1 md:grid-cols-2"
              }`}
            >
              {(isPresetLocked
                ? anyagok.filter((anyag) =>
                    matchSelection(anyag, selection.anyag),
                  )
                : anyagok
              ).map((anyag) => (
                <div
                  key={anyag.id}
                  onClick={
                    isPresetLocked
                      ? undefined
                      : () => setSelection({ ...selection, anyag: anyag.id })
                  }
                  className={`rounded-xl border-2 p-6 transition-all ${
                    matchSelection(anyag, selection.anyag)
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  } ${isPresetLocked ? "w-full max-w-[320px] cursor-not-allowed opacity-80" : "cursor-pointer hover:shadow-lg"}`}
                >
                  <div className="mb-3 text-4xl">{anyag.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {anyag.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{anyag.description}</p>
                  <p className="text-orange-500 text-xl font-bold">
                    {anyag.price === 0
                      ? "Alap ár"
                      : `+${anyag.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "doboz":
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {dobozok.map((doboz) => {
              const isSelected = matchSelection(doboz, selection.doboz);
              const isDisabled = isDobozDisabled(doboz.id);

              return (
                <div
                  key={doboz.id}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => setSelection({ ...selection, doboz: doboz.id })
                  }
                  aria-disabled={isDisabled}
                  className={`rounded-xl border-2 p-6 transition-all ${
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:shadow-lg"
                  } ${
                    isSelected
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <div className="mb-3 text-4xl">{doboz.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {doboz.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{doboz.description}</p>
                  <p className="text-orange-500 text-xl font-bold">
                    {doboz.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>
              );
            })}
          </div>
        );

      case "szin":
        return (
          <div className="space-y-8">
            {/* 3D Modell előnézet */}
            <div className="mx-auto max-w-md">
              <model-viewer
                key={previewModelSrc}
                src={previewModelSrc}
                alt="3D előnézet"
                auto-rotate
                camera-controls
                orientation={isHutoPreset ? "180deg 180deg 0deg" : undefined}
                crossorigin="anonymous"
                style={{ width: "100%", height: "300px" }}
              />
            </div>

            {/* Doboz szín */}
            <div>
              <h4 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                Doboz színe
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {visibleDobozSzinek.map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() =>
                      setSelection((prev) => ({
                        ...prev,
                        dobozSzin: szin.id,
                        tetoSzin:
                          isHutoPreset &&
                          prev.tetoSzin === "zold" &&
                          szin.id !== "zold"
                            ? "feher"
                            : prev.tetoSzin,
                      }))
                    }
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 transition-all ${
                      selection.dobozSzin === szin.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-stroke dark:border-stroke-dark"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: szin.hex }}
                    />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {szin.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tető szín */}
            <div>
              <h4 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                Tető színe
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {visibleTetoSzinek.map((szin) => (
                  <button
                    key={szin.id}
                    onClick={() =>
                      setSelection((prev) => ({
                        ...prev,
                        tetoSzin: szin.id,
                        dobozSzin:
                          isHutoPreset &&
                          szin.id === "zold" &&
                          prev.dobozSzin !== "zold"
                            ? "zold"
                            : prev.dobozSzin,
                      }))
                    }
                    className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 transition-all ${
                      selection.tetoSzin === szin.id
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-stroke dark:border-stroke-dark"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: szin.hex }}
                    />
                    <span className="text-sm font-medium text-black dark:text-white">
                      {szin.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "tapellatas":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {tapellatasok.map((tap) => {
                const isSelected = selection.tapellatas === tap.id;
                const isDisabled = isTapellatasDisabled(tap.id);

                return (
                  <div
                    key={tap.id}
                    onClick={
                      isDisabled
                        ? undefined
                        : () =>
                            setSelection({
                              ...selection,
                              tapellatas: tap.id,
                            })
                    }
                    aria-disabled={isDisabled}
                    className={`rounded-xl border-2 p-6 transition-all ${
                      isDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:shadow-lg"
                    } ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                    }`}
                  >
                    <div className="mb-3 text-4xl">{tap.icon}</div>
                    <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                      {tap.name}
                    </h4>
                    <p className="text-body mb-3 text-sm">{tap.description}</p>
                    <p className="text-orange-500 text-xl font-bold">
                      {tap.price.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "elofizetes":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 whitespace-pre-line md:grid-cols-3">
              {elofizetesek.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() =>
                    setSelection({ ...selection, elofizetes: plan.id })
                  }
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    matchSelection(plan, selection.elofizetes)
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <h4 className="mb-2 text-center text-lg font-semibold text-black dark:text-white">
                    {plan.name}
                  </h4>
                  <p className="text-body mb-3 text-sm">{plan.description}</p>
                  <p className="text-orange-500 text-xl font-bold">
                    {plan.price === 0
                      ? "0 Ft"
                      : `${plan.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );

      case "szallitas":
        return (
          <div className="mx-auto max-w-4xl space-y-6">
            {isGuestCheckout && (
              <div className="border-stroke dark:border-stroke-dark dark:bg-dark space-y-4 rounded-xl border bg-white p-4">
                <p className="text-body text-sm font-medium">
                  Személyes adatok (vendég rendelés)
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <input
                      type="text"
                      placeholder="Teljes név"
                      value={selection.guestContact.name}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            name: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }}
                      className={`focus:border-primary dark:bg-dark w-full rounded-lg border px-4 py-3 text-sm text-black outline-none dark:text-white ${
                        guestContactErrors.name
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke dark:border-stroke-dark bg-white"
                      }`}
                    />
                    {guestContactErrors.name && (
                      <p className="text-xs font-medium text-red-500">
                        {guestContactErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="email"
                      placeholder="Email cím"
                      value={selection.guestContact.email}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            email: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }}
                      className={`focus:border-primary dark:bg-dark w-full rounded-lg border px-4 py-3 text-sm text-black outline-none dark:text-white ${
                        guestContactErrors.email
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke dark:border-stroke-dark bg-white"
                      }`}
                    />
                    {guestContactErrors.email && (
                      <p className="text-xs font-medium text-red-500">
                        {guestContactErrors.email}
                      </p>
                    )}
                    {guestContactErrors.email && (
                      <div className="mt-1 flex flex-col items-start">
                        {guestContactErrors.email.includes("fiók") && (
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem(
                                "pending_config",
                                JSON.stringify(selection),
                              );
                              window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(
                                window.location.pathname,
                              )}`;
                            }}
                            className="text-primary hover:text-primary/80 mt-1 cursor-pointer text-xs font-semibold underline"
                          >
                            Bejelentkezés és folytatás →
                          </button>
                        )}
                      </div>
                    )}

                    <div className="pt-4 md:col-span-2">
                      <label className="group flex cursor-pointer items-center gap-3">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selection.guestContact.acceptAccountTerms || false
                            }
                            onChange={(ev) => {
                              setSelection((prev) => ({
                                ...prev,
                                guestContact: {
                                  ...prev.guestContact,
                                  acceptAccountTerms: ev.target.checked,
                                },
                              }));
                              setGuestContactErrors((prev) => ({
                                ...prev,
                                acceptAccountTerms: undefined,
                              }));
                            }}
                            className={`accent-primary focus:ring-primary h-5 w-5 rounded border-2 transition-all ${
                              guestContactErrors.acceptAccountTerms
                                ? "border-red-500 bg-red-50"
                                : "border-stroke dark:border-stroke-dark"
                            }`}
                          />
                        </div>

                        <span
                          className={`text-sm font-semibold whitespace-nowrap transition-colors ${
                            guestContactErrors.acceptAccountTerms
                              ? "text-red-500"
                              : "text-black dark:text-white"
                          }`}
                        >
                          Elfogadom, hogy a megadott e-mail címmel létrejöjjön
                          egy fiók a szenzor24.hu és rendszer.szenzor24.hu
                          oldalon.
                        </span>
                      </label>
                      {guestContactErrors.acceptAccountTerms && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                          {guestContactErrors.acceptAccountTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="tel"
                      placeholder="Telefonszám pl.: +36 xx 1234567"
                      value={selection.guestContact.phone}
                      onChange={(ev) => {
                        const value = ev.target.value;
                        setSelection((prev) => ({
                          ...prev,
                          guestContact: {
                            ...prev.guestContact,
                            phone: value,
                          },
                        }));
                        setGuestContactErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }}
                      className={`focus:border-primary dark:bg-dark w-full rounded-lg border px-4 py-3 text-sm text-black outline-none dark:text-white ${
                        guestContactErrors.phone
                          ? "border-red-500 bg-red-50/10 dark:border-red-400"
                          : "border-stroke dark:border-stroke-dark bg-white"
                      }`}
                    />
                    {guestContactErrors.phone && (
                      <p className="text-xs font-medium text-red-500">
                        {guestContactErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {szallitasiModok.map((mod) => (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => {
                    setSelection((prev) => ({
                      ...prev,
                      shippingMode: mod.id,
                      billingSame:
                        mod.id === "hazhoz" ? prev.billingSame : true,
                    }));
                    setShippingAddressErrors({});
                    setBillingAddressErrors({});
                  }}
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg ${
                    selection.shippingMode === mod.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <h4 className="mb-2 text-base font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-body text-sm">{mod.description}</p>
                </button>
              ))}
            </div>

            {selection.shippingMode === "foxpost" && (
              <div className="space-y-4">
                <div className="border-stroke dark:border-stroke-dark dark:bg-dark rounded-xl border bg-white p-4">
                  <p className="text-body mb-3 text-sm">
                    Válassza ki a csomagautomatát a térképes keresőből:
                  </p>
                  <FoxpostSelector
                    selected={selection.foxpostAutomata}
                    onSelect={(automata) =>
                      setSelection((prev) => ({
                        ...prev,
                        foxpostAutomata: automata,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {selection.shippingMode === "hazhoz" && (
              <div className="space-y-4">
                <p className="text-body text-sm">Szállítási cím</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {renderAddressInput(
                    "Irányítószám",
                    selection.shippingAddress.zip,
                    "zip",
                    "shippingAddress",
                    shippingAddressErrors.zip,
                  )}
                  {renderAddressInput(
                    "Város",
                    selection.shippingAddress.city,
                    "city",
                    "shippingAddress",
                    shippingAddressErrors.city,
                  )}
                  {renderAddressInput(
                    "Közterület neve",
                    selection.shippingAddress.street,
                    "street",
                    "shippingAddress",
                    shippingAddressErrors.street,
                  )}
                </div>

                <label className="text-body flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selection.billingSame}
                    onChange={(ev) =>
                      setSelection({
                        ...selection,
                        billingSame: ev.target.checked,
                      })
                    }
                  />
                  Számlázási cím megegyezik a szállítási címmel
                </label>

                {!selection.billingSame && (
                  <div className="space-y-4">
                    <p className="text-body text-sm">Számlázási cím</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Irányítószám"
                        value={selection.billingAddress.zip}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "zip",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Város"
                        value={selection.billingAddress.city}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "city",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Közterület neve"
                        value={selection.billingAddress.street}
                        onChange={(ev) =>
                          updateAddressField(
                            "billingAddress",
                            "street",
                            ev.target.value,
                          )
                        }
                        className="border-stroke focus:border-primary dark:border-stroke-dark dark:bg-dark w-full rounded-lg border bg-white px-4 py-3 text-sm text-black outline-none dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "fizetes":
        return (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fizetesiModok.map((mod) => (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() =>
                    setSelection({
                      ...selection,
                      paymentMode: mod.id,
                    })
                  }
                  className={`rounded-xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                    selection.paymentMode === mod.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-stroke dark:border-stroke-dark dark:bg-dark bg-white"
                  }`}
                >
                  <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                    {mod.name}
                  </h4>
                  <p className="text-body text-sm">{mod.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "osszesites":
        const selectedSzenzorokList = selection.szenzorok
          .map((id) => findBySelection(catalog.szenzorok, id))
          .filter(Boolean as any);
        const selectedAnyagOssz = findBySelection(anyagok, selection.anyag);
        const selectedDoboz = findBySelection(dobozok, selection.doboz);
        const selectedTap = findBySelection(tapellatasok, selection.tapellatas);
        const selectedElofizetes = findBySelection(
          elofizetesek,
          selection.elofizetes,
        );
        const selectedDobozSzin = findBySelection(
          visibleDobozSzinek,
          selection.dobozSzin,
        );
        const selectedTetoSzin = findBySelection(
          visibleTetoSzinek,
          selection.tetoSzin,
        );
        const szenzorokTotal = selectedSzenzorokList.reduce(
          (sum, sz) => sum + (sz?.price || 0),
          0,
        );
        const subtotal = calculateSubtotal();
        const vatAmount = calculateVatAmount(subtotal);
        const shippingFee = getShippingFee();
        const subscriptionFee = calculateSubscriptionFee();
        const total = subtotal + vatAmount + shippingFee + subscriptionFee;

        return (
          <div className="mx-auto max-w-2xl">
            <div className="border-stroke dark:border-stroke-dark dark:bg-dark rounded-xl border-2 bg-white p-6">
              <h4 className="mb-6 text-center text-xl font-bold text-black dark:text-white">
                Rendelés összesítése
              </h4>

              <div className="space-y-4">
                {/* Szenzorok - több is lehet */}
                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">
                    Szenzorok ({selectedSzenzorokList.length} db)
                  </p>
                  {selectedSzenzorokList.map((sz) => (
                    <div
                      key={sz?.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        {sz?.imageUrl && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sz.imageUrl}
                              alt={sz.name}
                              className="h-6 w-6 object-contain"
                            />
                          </>
                        )}
                        <p className="font-medium text-black dark:text-white">
                          {sz?.name}
                        </p>
                      </div>
                      <p className="font-semibold text-black dark:text-white">
                        {sz?.price.toLocaleString("hu-HU")} Ft
                      </p>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-300 pt-2 dark:border-gray-600">
                    <p className="text-body text-sm">Szenzorok összesen:</p>
                    <p className="text-orange-500 font-semibold">
                      {szenzorokTotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>

                {/* Anyag */}
                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-body text-sm">Burok anyaga</p>
                    <p className="font-medium text-black dark:text-white">
                      {selectedAnyagOssz?.icon} {selectedAnyagOssz?.name}
                    </p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedAnyagOssz?.price === 0
                      ? "Alap ár"
                      : `+${selectedAnyagOssz?.price.toLocaleString("hu-HU")} Ft`}
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-body text-sm">Doboz</p>
                    <p className="font-medium text-black dark:text-white">
                      {selectedDoboz?.icon} {selectedDoboz?.name}
                    </p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedDoboz?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-body text-sm">Színek</p>
                    <p className="font-medium text-black dark:text-white">
                      🎨
                      {selectedDobozSzin?.name} doboz / {selectedTetoSzin?.name}{" "}
                      tető
                    </p>
                  </div>
                </div>

                <div className="border-stroke dark:border-stroke-dark flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="text-body text-sm">Tápellátás</p>
                    <p className="font-medium text-black dark:text-white">
                      {selectedTap?.icon} {selectedTap?.name}
                    </p>
                  </div>
                  <p className="font-semibold text-black dark:text-white">
                    {selectedTap?.price.toLocaleString("hu-HU")} Ft
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-3 text-sm font-medium">
                    Előfizetés eszközönként
                  </p>
                  <div className="space-y-4">
                    {Array.from({ length: selection.quantity }, (_, i) => {
                      const unitEloId =
                        selection.elofizetesekPerUnit[i] ?? null;
                      return (
                        <div key={i}>
                          <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                            {i + 1}. eszköz
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {catalog.elofizetesek.map((plan) => {
                              const isSelected = matchSelection(
                                plan,
                                unitEloId,
                              );
                              return (
                                <button
                                  key={String(plan.id)}
                                  type="button"
                                  onClick={() => {
                                    setSelection((prev) => {
                                      const newPerUnit = [
                                        ...prev.elofizetesekPerUnit,
                                      ];
                                      newPerUnit[i] = String(plan.id);
                                      return {
                                        ...prev,
                                        elofizetesekPerUnit: newPerUnit,
                                      };
                                    });
                                  }}
                                  className={`rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                                    isSelected
                                    ? "border-orange-500 bg-orange-500/10 text-black dark:text-white"
                                      : "border-stroke dark:border-stroke-dark text-body hover:border-orange-500/50"
                                  }`}
                                >
                                  {plan.name}{" "}
                                  <span className="opacity-70">
                                    {plan.price === 0
                                      ? "(0 Ft)"
                                      : `(${plan.price.toLocaleString("hu-HU")} Ft)`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {!unitEloId && (
                            <p className="mt-1 text-xs font-medium text-red-500">
                              Kötelező!
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-300 pt-2 dark:border-gray-600">
                    <p className="text-body text-sm">
                      Előfizetési díj összesen:
                    </p>
                    <p className="text-orange-500 font-semibold">
                      {calculateSubscriptionFee().toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>

                {/* Darabszám */}
                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      Darabszám (db)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setSelection((prev) => {
                            const newQty = Math.max(1, prev.quantity - 1);
                            return {
                              ...prev,
                              quantity: newQty,
                              elofizetesekPerUnit:
                                prev.elofizetesekPerUnit.slice(0, newQty),
                            };
                          })
                        }
                        className="dark:bg-dark rounded border border-gray-300 bg-white px-3 py-2 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={selection.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= 999) {
                            setSelection((prev) => {
                              const perUnit = Array.from(
                                { length: value },
                                (_, i) =>
                                  i < prev.elofizetesekPerUnit.length
                                    ? prev.elofizetesekPerUnit[i]
                                    : prev.elofizetes,
                              );
                              return {
                                ...prev,
                                quantity: value,
                                elofizetesekPerUnit: perUnit,
                              };
                            });
                          }
                        }}
                        className="dark:bg-dark w-20 rounded border border-gray-300 bg-white px-3 py-2 text-center text-black placeholder-gray-400 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        onClick={() =>
                          setSelection((prev) => {
                            const newQty = Math.min(999, prev.quantity + 1);
                            return {
                              ...prev,
                              quantity: newQty,
                              elofizetesekPerUnit: [
                                ...prev.elofizetesekPerUnit,
                                prev.elofizetes,
                              ],
                            };
                          })
                        }
                        className="dark:bg-dark rounded border border-gray-300 bg-white px-3 py-2 text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">
                    Szállítás
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.shippingMode === "foxpost"
                      ? "Foxpost automata"
                      : "Házhozszállítás"}
                  </p>
                  <p className="text-body text-sm">
                    Szállítási díj (ÁFA-mentes):{" "}
                    {shippingFee.toLocaleString("hu-HU")} Ft
                  </p>

                  {selection.shippingMode === "hazhoz" && (
                    <p className="text-body text-sm">
                      Szállítási cím: {selection.shippingAddress.zip}{" "}
                      {selection.shippingAddress.city},{" "}
                      {selection.shippingAddress.street}
                    </p>
                  )}

                  {selection.shippingMode === "hazhoz" &&
                    !selection.billingSame && (
                      <p className="text-body text-sm">
                        Számlázási cím: {selection.billingAddress.zip}{" "}
                        {selection.billingAddress.city},{" "}
                        {selection.billingAddress.street}
                      </p>
                    )}

                  {selection.shippingMode === "foxpost" && (
                    <>
                      {selection.foxpostAutomata && (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-black dark:text-white">
                            Automata: {selection.foxpostAutomata.name}
                          </p>
                          <p className="text-body text-xs">
                            {selection.foxpostAutomata.zip}{" "}
                            {selection.foxpostAutomata.city},{" "}
                            {selection.foxpostAutomata.address}
                          </p>
                          {selection.foxpostAutomata.findme && (
                            <p className="text-body text-xs whitespace-pre-line italic">
                              📍{" "}
                              {formatFoxpostFindme(
                                selection.foxpostAutomata.findme,
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-stroke dark:border-stroke-dark border-b pb-3">
                  <p className="text-body mb-2 text-sm font-medium">Fizetés</p>
                  <p className="font-medium text-black dark:text-white">
                    {selection.paymentMode === "utalas" ? "Utalás" : "Stripe"}
                  </p>
                </div>

                <div className="border-stroke dark:border-stroke-dark space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">Nettó összeg:</p>
                    <p className="font-semibold text-black dark:text-white">
                      {subtotal.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">ÁFA ({VAT_PERCENT}%):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {vatAmount.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">Szállítás (ÁFA-mentes):</p>
                    <p className="font-semibold text-black dark:text-white">
                      {shippingFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-body text-sm">
                      Előfizetés (ÁFA-t tartalmaz):
                    </p>
                    <p className="font-semibold text-black dark:text-white">
                      {subscriptionFee.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xl font-bold text-black dark:text-white">
                      Bruttó összeg:
                    </p>
                <p className="text-orange-500 text-2xl font-bold">
                      {total.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOrder}
                className="bg-orange-500 hover:bg-orange-600 mt-6 w-full rounded-lg py-4 text-lg font-semibold text-white transition-all"
              >
                Megrendelés
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "mod":
        return "Válasszon csomagot!";
      case "szenzor":
        return "Válasszon szenzort!";
      case "anyag":
        return "Válasszon anyagot!";
      case "doboz":
        return "Válasszon dobozt!";
      case "szin":
        return "Válasszon színt!";
      case "tapellatas":
        return "Akkumulátoros vagy vezetékes?";
      case "elofizetes":
        return "Válasszon előfizetést!";
      case "szallitas":
        return "Adja meg a szállítási módot!";
      case "fizetes":
        return "Válasszon fizetési módot!";
      case "osszesites":
        return "Ellenőrizze a rendelését!";
      default:
        return "";
    }
  };

  const selectedSzenzorNames = selection.szenzorok
    .map((id) => findBySelection(catalog.szenzorok, id)?.name)
    .filter(Boolean) as string[];

  const selectedAnyagName =
    anyagok.find((a) => matchSelection(a, selection.anyag))?.name ?? "-";
  const selectedDobozName =
    findBySelection(dobozok, selection.doboz)?.name ?? "-";
  const selectedTapName =
    findBySelection(tapellatasok, selection.tapellatas)?.name ?? "-";
  const selectedElofizetesName =
    findBySelection(elofizetesek, selection.elofizetes)?.name ?? "-";
  const selectedDobozSzinName =
    findBySelection(visibleDobozSzinek, selection.dobozSzin)?.name ?? "-";
  const selectedTetoSzinName =
    findBySelection(visibleTetoSzinek, selection.tetoSzin)?.name ?? "-";
  const shippingLabel =
    selection.shippingMode === "foxpost"
      ? "Foxpost automata"
      : selection.shippingMode === "hazhoz"
        ? "Házhozszállítás"
        : "-";
  const paymentLabel =
    selection.paymentMode === "utalas"
      ? "Utalás"
      : selection.paymentMode === "stripe"
        ? "Stripe"
        : "-";

  if (isGuestCheckout && !hasChosenGuest) {
    return (
      <section className="relative z-10 pt-20 pb-32">
        <div className="container">
          <div
            className="wow fadeInUp border-stroke dark:border-stroke-dark dark:bg-dark mx-auto max-w-2xl rounded-2xl border-2 bg-white p-10 text-center shadow-lg"
            data-wow-delay=".2s"
          >
            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl dark:text-white">
              Üdvözöljük!
            </h2>
            <p className="text-body mb-8 text-base">
              Kérjük, amennyiben rendelkezik fiókkal, jelentkezzen be a rendelés
              folytatásához.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => {
                  window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
                }}
                className="bg-orange-500 hover:bg-orange-600 w-full rounded-lg px-8 py-4 font-semibold text-white transition-all sm:w-auto"
              >
                Bejelentkezés
              </button>
              <button
                onClick={() => setHasChosenGuest(true)}
                className="border-stroke dark:border-stroke-dark w-full rounded-lg border bg-gray-50 px-8 py-4 font-semibold text-black transition-all hover:bg-gray-200 sm:w-auto dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Folytatás vendégként
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10">
      <div className="container">
        {/* Fejléc */}
        <div
          className="wow fadeInUp mx-auto mb-10 max-w-[690px] text-center"
          data-wow-delay=".2s"
        >
          <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl md:text-[44px] md:leading-tight dark:text-white">
            Termék konfigurátor
          </h2>
          <p className="text-body text-base">
            Állítsa össze a saját szenzor csomagját lépésről lépésre!
          </p>
        </div>

        {/* Lépés indikátor */}
        <div className="mb-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {visibleSteps.map((step, index) => {
              const stepIndex = visibleSteps.findIndex(
                (s) => s.id === currentStep,
              );
              const isActive = step.id === currentStep;
              const isCompleted = index < stepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div
                    onClick={() => {
                      if (index < stepIndex) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex flex-col items-center ${
                      index < stepIndex ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {isCompleted ? "✓" : step.icon}
                    </div>
                    <span
                      className={`mt-2 hidden text-xs font-medium sm:block ${
                        isActive
                          ? "text-orange-500"
                          : isCompleted
                            ? "text-green-500"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < visibleSteps.length - 1 && (
                    <div
                      className={`mx-2 h-1 flex-1 rounded ${
                        index < stepIndex
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Navigációs fejléc: Vissza - Cím - Tovább */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <button
              onClick={prevStep}
              disabled={currentStep === "mod"}
              className={`rounded-lg px-6 py-3 font-medium transition-all ${
                currentStep === "mod"
                  ? "invisible"
                  : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              }`}
            >
              ← Vissza
            </button>
          </div>

          <h3 className="shrink-0 text-center text-xl font-semibold text-black sm:text-2xl dark:text-white">
            {getStepTitle()}
          </h3>

          <div className="flex-1 text-right">
            {currentStep !== "osszesites" ? (
              <button
                onClick={nextStep}
                disabled={currentStep !== "szallitas" && !canProceed()}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  currentStep === "szallitas" || canProceed()
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}
              >
                Tovább →
              </button>
            ) : (
              <div className="inline-block px-6 py-3" />
            )}
          </div>
        </div>

        {/* Lépés tartalma + oldalsó összegzés */}
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>{renderStepContent()}</div>
          <aside className="border-stroke dark:border-stroke-dark dark:bg-dark h-fit rounded-xl border-2 bg-white p-5 lg:sticky lg:top-24">
            {/* <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Folyamatkövető
            </h4> */}
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-black dark:text-white">Csomag</p>
                <p className="text-body">{selectedPreset?.label ?? "-"}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Szenzorok
                </p>
                {selectedSzenzorNames.length > 0 ? (
                  <ul className="text-body mt-1 list-disc pl-5">
                    {selectedSzenzorNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body">-</p>
                )}
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Burok anyaga
                </p>
                <p className="text-body">{selectedAnyagName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Doboz</p>
                <p className="text-body">{selectedDobozName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">Színek</p>
                <p className="text-body">
                  {selectedDobozSzinName} doboz / {selectedTetoSzinName} tető
                </p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Tápellátás
                </p>
                <p className="text-body">{selectedTapName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Előfizetés
                </p>
                <p className="text-body">{selectedElofizetesName}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Szállítás
                </p>
                <p className="text-body">{shippingLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Fizetés
                </p>
                <p className="text-body">{paymentLabel}</p>
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">
                  Bruttó végösszeg
                </p>
                <p className="text-orange-500 text-lg font-semibold">
                  {calculateGrandTotal().toLocaleString("hu-HU")} Ft
                </p>
                <p className="text-[13px] text-gray-500 italic dark:text-gray-400">
                  Az ár tartalmazza a 27% ÁFA-t.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ProductConfigurator;
