import { Payslip, FileType } from "../types/payslip";
import * as ExpoFileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import { IApi } from "./IApi";
const pdfPayslip = require("../../assets/Igor Perunovic CV.pdf"); //our bundled files.
const imagePayslip = require("../../assets/payslip.jpeg");  // honestly, it was more difficult to do it this way than just to download it from an API, the libraries are simpler to use for that :D 

export const mockApi: IApi = {
  fetchPayslips: async function (): Promise<Payslip[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // a real API will take some time, this delay is to simulate that in the mock.
   
    const result: Payslip[] = new Array(12);
    for (let i = 1; i < 13; i++) //this is intentionally 1-12 to mock "mothly" payslips
    {
        const id = i.toString(); //this could have been random but this seemed easier for the demo
        const fromDate = `01/${i}/2025`; //I hardcoded the date as string, it was faster. Ideally, in a real-life scenario we'd use UTC or something like that and then format it accordingly in the UI.
        const toDate = `28/${i}/2025`; //I really didn't want to add the math to calculate each month's length here for mock data. It would be cool but a waste of time, in the end, this is just a mock demo.
        const fileType: FileType = i % 2 === 0 ? "pdf" : "image";
        const uri = fileType === "pdf" ? "pdf" : "image"; //in a real scenario, this would actually be the uri to download the file itself, as it probably wouldn't be batched with the list of payslips
                                                        //since we're using a mock api, it doesn't matter, we'll not really be using this data anyway in the demo. See where we "fetch" the file (it's mocked too)
        const file = {type: fileType, uri: uri};
        result[i-1] = {id, fromDate, toDate, file};
    }
    return result;
},
  downloadFileAsString64: async function (uri: string): Promise<string> { //the api "downloads" the file from a uri. If we used a real api that returned a base 64, we could insert it seamlessly into the rest of the app
    await new Promise((r) => setTimeout(r, 1000)); //We pretend some time has passed for the API call
  
    var requirePath: number;
    if (uri==="pdf") { //this is mock api so we are just faking these
      requirePath = pdfPayslip;
    }
    else requirePath = imagePayslip;
  
    const asset = Asset.fromModule(requirePath);
    await asset.downloadAsync();
    const assetUri = asset.localUri ?? asset.uri;
  
    const base64Pdf = await ExpoFileSystem.readAsStringAsync(assetUri, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    });
    return base64Pdf;
  }
}
