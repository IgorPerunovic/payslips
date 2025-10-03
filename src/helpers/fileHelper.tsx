import { Payslip, FileType } from "../types/payslip";
import * as ExpoFileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import { Platform, Alert, Button, View } from 'react-native';
import * as Sharing from 'expo-sharing';




export const saveAsPdf = async (pdfUri : string): Promise<string>  => {
    {
    
        if (Platform.OS === 'android') {
          
          const base64Pdf = await ExpoFileSystem.readAsStringAsync(pdfUri, {
            encoding: ExpoFileSystem.EncodingType.Base64,
          });
    
          const permissions = await ExpoFileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(); //we select a folder to save the pdf to. This also handles the storage permissions. 
          if (!permissions.granted) {
            throw new Error("storage permission denied"); // if we don't select anything or cancel, we throw an error to display to the user later
          }
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
}

