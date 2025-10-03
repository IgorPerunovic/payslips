// types/payslip.ts
export type FileType = "image" | "pdf";

export interface Payslip {
  id: string;
  fromDate: string;
  toDate: string;
  file: {
    type: FileType;
    uri: string; // we'll pretend this is the download uri for the file itself, but in mock data we'll simply use local assets. I know it's beyond what was specifically requested but this is how I normally do it
  };
}
