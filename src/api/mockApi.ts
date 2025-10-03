import { Payslip, FileType } from "../types/payslip";
import * as ExpoFileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import { Platform, Alert, Button, View } from 'react-native';
import * as Sharing from 'expo-sharing';

const pdfPayslip = require("../../assets/Igor Perunovic CV.pdf"); //our bundled files.
const imagePayslip = require("../../assets/payslip.jpeg");  // honestly, it was more difficult to do it this way than just to download it from an API, the libraries are simpler to use for that :D 


export const fetchPayslips = async (): Promise<Payslip[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // a real API will take some time, this delay is to simulate that in the mock.
   
    const result: Payslip[] = new Array(12);
    for (let i = 1; i < 13; i++) //this is intentionally 1-12 to mock "mothly" payslips
    {
        const id = i.toString(); //this could have been random but this seemed easier for the demo
        const fromDate = `01/${i}/2025`; //I hardcoded the date as string, it was faster. Ideally, in a real-life scenario we'd use UTC or something like that and then format it accordingly in the UI.
        const toDate = `28/${i}/2025`; //I really didn't want to add the math to calculate each month's length here for mock data. It would be cool but a waste of time, in the end, this is just a mock demo.
        const fileType: FileType = i % 2 === 0 ? "pdf" : "image";
        const uri = fileType === "pdf" ? pdfPayslip : imagePayslip; //in a real scenario, this would actually be the uri to download the file itself, as it probably wouldn't be batched with the list of payslips
                                                        //since we're using a mock api, it doesn't matter, we'll not really be using this data anyway in the demo. See where we "fetch" the file (it's mocked too)
        const file = {type: fileType, uri: uri};
        result[i-1] = {id, fromDate, toDate, file};
    }
    return result;
};

export const downloadPayslip = async (payslip: Payslip): Promise<string> => {
  await new Promise((r) => setTimeout(r, 1000)); //We pretend some time has passed for the API call
  
  switch (payslip.file.type){
    case "pdf": return await savePdfToDevice(pdfPayslip, 'paySlip.pdf');
    case "image": return await saveJpegToDevice(imagePayslip, 'paySlip.jpeg');
  }
};

async function getBundledFileUri(requirePath: number): Promise<string> {
  const asset = Asset.fromModule(requirePath);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}

export const savePdfToDevice = async (requirePath: number, fileName: string): Promise<string> => {
    const pdfUri = await getBundledFileUri(requirePath);

    if (Platform.OS === 'android') {
      const permissions = await ExpoFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(); //we select a folder to save the pdf to. This also handles the storage permissions. 
      if (!permissions.granted) {
        throw new Error("storage permission denied"); // if we don't select anything or cancel, we throw an error to display to the user later
      }
      const base64Pdf = await ExpoFileSystem.readAsStringAsync(pdfUri, {
        encoding: ExpoFileSystem.EncodingType.Base64,
      });

      // create the file in chosen directory
      const fileUri = await ExpoFileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/pdf'
      );
      await ExpoFileSystem.writeAsStringAsync(fileUri, base64Pdf, {
        encoding: ExpoFileSystem.EncodingType.Base64,
      });
      return fileUri;
    } else {
      // iOS uses share sheet
      await Sharing.shareAsync(pdfUri);
      return "selected location"; // iOS won't give us the path, but the user just selected the location manually, so this is good enough.
    }
};

export const saveJpegToDevice = async (requirePath: number, fileName: string): Promise<string> => { //this is almost the same as above, just specific to jpeg
  const jpegUri = await getBundledFileUri(requirePath);

  if (Platform.OS === 'android') {
    const permissions = await ExpoFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      throw new Error("storage permission denied");
    }
    const base64Image = await ExpoFileSystem.readAsStringAsync(jpegUri, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    });
    const fileUri = await ExpoFileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      fileName,
      'image/jpeg'
    );
    await ExpoFileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: ExpoFileSystem.EncodingType.Base64,
    });
    return fileUri;
  } else {
    // iOS uses share sheet
    await Sharing.shareAsync(jpegUri, { mimeType: 'image/jpeg' });
    return "selected location";
  }
};
