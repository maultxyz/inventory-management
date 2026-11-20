import auth from "@/locales/en/auth.json";
import common from "@/locales/en/common.json";
import inventory from "@/locales/en/inventory.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { common, inventory, auth } },
  ns: ["common", "inventory", "auth"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
