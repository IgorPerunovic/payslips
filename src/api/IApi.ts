import { Payslip } from "../types/payslip";

export interface IApi {
  fetchPayslips: () => Promise<Payslip[]>;
  downloadFileAsString64: (uri: string) => Promise<string>;
}
