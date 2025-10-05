import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Payslip } from "../types/payslip";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePayslips } from "../context/mainContext"
import { useApi } from "../context/apiContext";

interface Props {
  navigation: any; 
}

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const { payslips, setPayslips } = usePayslips();
  const { fetchPayslips } = useApi(); //dependency injection, we use mock api


  useEffect(() => { // we populate the initial list when we open the app
    const loadPayslips = async () => {
      setLoading(true);
      const data = await fetchPayslips(); // I thought this mock api call is more of what a real app would do I. It fills the context instead of the context being pre-filled. 
      setPayslips(data);
      setLoading(false);
    };
    loadPayslips();
  }, []);

  const renderItem = ({ item, index }: { item: Payslip, index: number }) => {
    const iconName = item.file.type === "pdf" ? "file-pdf-box" : "file-image"; // see comment below for icon
  
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate("Details", { payslipIndex: index })}
      > 
        <View style={styles.row}>
          <Text style={styles.dates}>
            {item.fromDate} - {item.toDate}
          </Text>
          <View style={styles.fileTypeContainer}>
            <MaterialCommunityIcons //this falls outside the required scope a bit but I thought it would look nice. It's easy to remove and didn't take me long to add.
              name={iconName}
              size={25}
              color="#ffffff"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) { // we pretend we're "loading" the list initially.
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000FF" />
        <Text style={{ marginTop: 15, fontSize: 32 }}>Loading</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList // better than scrollview, especially for performance (though in this small app it's really irrelevant)
        data={payslips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: "#fff",
          },
    itemContainer: {
      padding: 16,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: "#f0f0f0",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dates: {
      fontSize: 16,
    },
    fileTypeContainer: {
      backgroundColor: "#0000FF",
      borderRadius: 8,
      padding: 4
    },
    loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
    fileTypeText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 12,
    },
  });
