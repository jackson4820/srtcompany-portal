import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { HeadCollector } from "./components/HeadContext";

export function render(url) {
  const head = { current: null };
  const html = renderToString(
    <HeadCollector.Provider value={head}>
      <StaticRouter location={url}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StaticRouter>
    </HeadCollector.Provider>,
  );
  return { html, head: head.current };
}
