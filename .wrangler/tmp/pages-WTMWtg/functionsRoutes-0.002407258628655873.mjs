import { onRequestPost as __api_apify_scrape_js_onRequestPost } from "D:\\AI\\Farley\\functions\\api\\apify-scrape.js"
import { onRequestPost as __api_chat_js_onRequestPost } from "D:\\AI\\Farley\\functions\\api\\chat.js"
import { onRequestPost as __api_submit_estimate_js_onRequestPost } from "D:\\AI\\Farley\\functions\\api\\submit-estimate.js"

export const routes = [
    {
      routePath: "/api/apify-scrape",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_apify_scrape_js_onRequestPost],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/submit-estimate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submit_estimate_js_onRequestPost],
    },
  ]