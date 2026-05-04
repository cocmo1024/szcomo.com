// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GOOGLE_TAG_ID?: string;
  readonly PUBLIC_GOOGLE_TAG_MANAGER_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_LEAD_CONVERSION_LABEL?: string;
  readonly PUBLIC_GOOGLE_ADS_PROJECT_CONVERSION_LABEL?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_VALUE?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_CURRENCY?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
