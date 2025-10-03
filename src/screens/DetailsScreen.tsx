import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet, Dimensions, ActivityIndicator, Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { Payslip } from "../types/payslip";
import { usePayslips } from "../context/mainContext";
import { downloadPayslip } from "../api/mockApi";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

const DetailsScreen = ({ route }: Props) => {
  const { payslipIndex } = route.params;
  const { payslips } = usePayslips();
  const payslip : Payslip = payslips[payslipIndex]; //we want to get the item from context
  
  const [downloading, setDownloading] = useState(false); 
  const [localUri, setLocalUri] = useState<string>(""); //this is where we store the uri after we "download" the image or pdf. 
                                                                //Normally we'd cache this instead of having to download every time, but I didn't have the time for that now


  const openExternally = async () => {
    if (Platform.OS === 'ios') {
      // iOS can just open the file with default PDF app
      await Linking.openURL(localUri);
    } else {
      // Android: open with intent
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: localUri,
        flags: 1,
        type: 'application/pdf',
      });
    }
  };
const handleDownload = async () => {
  setDownloading(true);
  try {
    const uri = await downloadPayslip(payslip);
    setLocalUri(uri); // we'll want to open it from here later. 
    if (uri) { alert("File downloaded to: " + uri); }
    else { throw new Error();};
  } catch (e) {
    alert("Download failed. " + e); // if there was any thrown error, this is where we catch it and notify the user.
                                    // Normally, we'd have several error types and user-friendly messages in their supported language, but this is just a demo.
  } finally {
    setDownloading(false);
  }
};
  if (!payslip) return <Text>Payslip not found. Index: {payslipIndex}. Payslips number: {payslips.length}.</Text>; //this won't happen here, but still...

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{payslip.id}</Text>

      <Text style={styles.label}>From:</Text>
      <Text style={styles.value}>{payslip.fromDate}</Text>

      <Text style={styles.label}>To:</Text>
      <Text style={styles.value}>{payslip.toDate}</Text>

      <Text style={styles.label}>File type:</Text>
      <Text style={styles.value}>{payslip.file.type.toUpperCase()}</Text>

      <View style={styles.buttonContainer}>
      { 
        !localUri ? 
        (
          <Button 
          title={"Download"} 
          onPress={handleDownload} 
          disabled={downloading}
        />
        )         : 
        ( null )
      }
      </View>
      
      
      {payslip.file.type === "image" ? (
        <View style={styles.previewContainer}>
          { downloading ? 
          ( <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000FF" />
        <Text style={{ marginTop: 15, fontSize: 32 }}>Loading</Text>
      </View>) 
             :
          ( localUri ? (
          <View>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Image
              source={{ uri: localUri }} // must be set after download
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
           )
          : <View/>)
          }
          
        </View>
      ) : payslip.file.type === "pdf" ? 
      (
        downloading ? 
          ( <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000FF" />
        <Text style={{ marginTop: 15, fontSize: 32 }}>Loading</Text>
      </View>) 
              :
          (
            localUri ? (
              <View style={styles.previewContainer}>
            <Text> Open PDF externally </Text>
            <Button 
              title={"Open PDF"} 
              onPress={openExternally} 
            />        
          </View> 
            ) : (<View></View>)
        )
      ) : null}
    </View>
  );
};

const { width, height } = Dimensions.get("window");


export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  value: {
    marginBottom: 4,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
    alignSelf: "flex-start",
  },
  previewContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewImage: {
    width: width - 40,
    height: height * 0.3,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  previewPdf: {
    width: width - 40,
    height: height * 0.3,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#ff0000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
