import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

export function render(url: string) {
  const helmetContext: Record<string, unknown> = {}
  const html = renderToString(
    <StaticRouter location={url}>
      <App helmetContext={helmetContext} />
    </StaticRouter>
  )
  return { html, helmet: helmetContext.helmet }
}
