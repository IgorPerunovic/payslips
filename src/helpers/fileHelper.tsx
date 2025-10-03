import { Payslip, FileType } from "../types/payslip";
import * as ExpoFileSystem from "expo-file-system/legacy";
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import {downloadFileAsString64} from "../api/mockApi";


export const downloadPayslip = async (payslip: Payslip): Promise<string> => { //this downloads the file from the API (mock in this case) and saves it to the device
    const fileAsString = await downloadFileAsString64(payslip.file.uri);
    if (payslip.file.type === "pdf") return await saveFileToDevice(fileAsString, 'paySlip.pdf', 'application/pdf');
    return await saveFileToDevice(fileAsString, 'paySlip.jpeg',  'image/jpeg');
  };


  async function saveFileToDevice(fileAsString: string, fileName: string, mimeType: string): Promise<string> { //helper function
    if (Platform.OS === 'android') {
      const permissions = await ExpoFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(); //we select a folder to save the pdf to. This also handles the storage permissions. 
      if (!permissions.granted) {
        throw new Error("storage permission denied"); // if we don't select anything or cancel, we throw an error to display to the user later. This is caught in the UI that calls it.
      }
      const fileUri = await ExpoFileSystem.StorageAccessFramework.createFileAsync( //the user creates the file in the chosen directory
        permissions.directoryUri,
        fileName,
        mimeType
      );
      await ExpoFileSystem.writeAsStringAsync(fileUri, fileAsString, {
        encoding: ExpoFileSystem.EncodingType.Base64,
      });
      return fileUri;
    } else { // if it's not Android, it's iOS
        // DISCLAIMER: I didn't test this part, as I don't have an iPhone and I couldn't test it. this might not really work.
        const fileUri = `${ExpoFileSystem.cacheDirectory}${fileName}`; //we first need to save it locally (iOS restrictions)
        await ExpoFileSystem.writeAsStringAsync(fileUri, fileAsString, {
        encoding: ExpoFileSystem.EncodingType.Base64,
        });
        if (await Sharing.isAvailableAsync()) { //the user can select the shared location
        await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: "Save payslip",
            UTI: mimeType === "application/pdf" ? "com.adobe.pdf" : "public.jpeg",
        });
        } else {
        throw new Error("Sharing not available on this iOS device");
        }
        return "selected location"; //when using Sharing, iOS won't give us the path, but the user just selected the location manually, so this is good enough.
                                    //or we could return fileUri, but that would return the internal location instead of what the user selected, so it might be confusing.
    }
};

