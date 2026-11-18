import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { App as AntApp, ConfigProvider } from "antd";
import enGB from "antd/locale/en_GB";
import { persistor, store } from "./store";
import { router } from "./routes";
import { antdTheme } from "./theme/theme";
import { PageLoader } from "./components/ui/States";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<PageLoader fullScreen />} persistor={persistor}>
        <ConfigProvider theme={antdTheme} locale={enGB}>
          {/* AntApp provides context-aware message/modal/notification (via App.useApp) */}
          <AntApp message={{ maxCount: 3 }}>
            <Suspense fallback={<PageLoader fullScreen />}>
              <RouterProvider router={router} />
            </Suspense>
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
