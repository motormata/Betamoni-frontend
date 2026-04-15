import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "../api/baseApi";
import appReducer from "./slices/appSlice";
import authReducer, { clearCredentials } from "./slices/authSlice";

const resetApiOnLogoutMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  if (clearCredentials.match(action)) {
    api.dispatch(baseApi.util.resetApiState());
  }

  return result;
};

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    app: appReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, resetApiOnLogoutMiddleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// TypeScript types - for autocomplete throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
