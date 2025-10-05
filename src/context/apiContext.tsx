import React, { createContext, useContext } from "react";
import { IApi } from "../api/IApi";

interface ApiProviderProps {
  api: IApi;
  children: React.ReactNode;
}

const ApiContext = createContext<IApi | null>(null);

export const ApiProvider: React.FC<ApiProviderProps> = ({ api, children }) => {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
};

export const useApi = (): IApi => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("no ApiProvider");
  }
  return context;
};
