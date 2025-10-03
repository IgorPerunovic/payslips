import React, { createContext, useContext, useState, ReactNode } from "react";
import { Payslip } from "../types/payslip";

interface MainContextType { //we're only saving Payslips here in the context
  payslips: Payslip[];
  setPayslips: React.Dispatch<React.SetStateAction<Payslip[]>>;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const PayslipsProvider = ({ children }: { children: ReactNode }) => {
  const [payslips, setPayslips] = useState<Payslip[]>([]); // I intentionally left this array empty initially, as we'll use an api call to fill it (it's only mock data, of course but this is how I normally do it)
 
  return (
    <MainContext.Provider value={{ payslips, setPayslips }}>
      {children}
    </MainContext.Provider>
  );
};

export const usePayslips = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("no provider");
  }
  return context;
};
